import { afterEach, describe, expect, it, vi } from 'vitest'
import appModule from '../app.cjs'
import routesModule from './routes.cjs'

const apps = []
const sample = () => ({ engine: '3DDFA_V2', width: 600, height: 800, vertices: Array.from({ length: 100 }, (_, i) => [i, i, i]), triangles: [[0, 1, 2]], landmarks: Array.from({ length: 68 }, () => [100, 200, 30]), inferenceMs: 60, detectionScore: .9, yaw: 0, qualityIssues: [] })
async function app({ environment = 'development', host = '127.0.0.1', provider, deca } = {}) {
  const face = provider || { configured: true, reconstruct: vi.fn(async () => sample()), close: vi.fn() }
  const instance = await appModule.buildApp({ logger: false, serveStatic: false, products: [],
    config: { nodeEnv: environment, host, zhipuApiKey: '', apiRateLimitMax: 100, aiRateLimitMax: 100, aiDailyLimit: 100, upstreamTimeoutMs: 1000 },
    providers: { face, deca },
  })
  apps.push(instance)
  return { instance, face }
}
const request = (extra = {}) => ({ method: 'POST', url: '/api/face-reconstruction', remoteAddress: '127.0.0.1', headers: { 'content-type': 'application/octet-stream', 'x-face-consent': 'local-research-v1' }, payload: Buffer.alloc(100, 42), ...extra })
afterEach(async () => { await Promise.all(apps.splice(0).map((instance) => instance.close())); vi.unstubAllEnvs() })

describe('local reconstruction photo boundary', () => {
  it('requires explicit consent before invoking the provider', async () => {
    const { instance, face } = await app()
    const response = await instance.inject(request({ headers: { 'content-type': 'application/octet-stream' } }))
    expect(response.statusCode).toBe(400)
    expect(response.json().error.code).toBe('FACE_CONSENT_REQUIRED')
    expect(face.reconstruct).not.toHaveBeenCalled()
  })
  it.each([['production', '127.0.0.1', '127.0.0.1'], ['development', '0.0.0.0', '127.0.0.1'], ['development', '127.0.0.1', '192.168.1.8']])('rejects non-local research deployment %s/%s/%s', async (environment, host, address) => {
    const { instance, face } = await app({ environment, host })
    const response = await instance.inject(request({ remoteAddress: address }))
    expect(response.statusCode).toBe(403)
    expect(face.reconstruct).not.toHaveBeenCalled()
  })
  it('returns real provider output and clears the received photo buffer', async () => {
    let photo
    const provider = { configured: true, reconstruct: vi.fn(async (bytes) => { photo = bytes; return sample() }) }
    const { instance } = await app({ provider })
    const response = await instance.inject(request())
    expect(response.statusCode).toBe(200)
    expect(response.json().result.vertices).toHaveLength(100)
    expect(response.headers['cache-control']).toBe('no-store')
    expect(photo.every((x) => x === 0)).toBe(true)
  })
  it('clears the buffer on inference failure without returning private diagnostics', async () => {
    let photo
    const { instance } = await app({ provider: { configured: true, reconstruct: async (bytes) => { photo = bytes; throw new Error('PRIVATE PHOTO DATA') } } })
    const response = await instance.inject(request())
    expect(response.statusCode).toBe(500)
    expect(response.body).not.toContain('PRIVATE')
    expect(photo.every((x) => x === 0)).toBe(true)
  })
  it('rejects oversized photos before model inference', async () => {
    const { instance, face } = await app()
    const response = await instance.inject(request({ payload: Buffer.alloc(8 * 1024 * 1024 + 1) }))
    expect(response.statusCode).toBe(413)
    expect(face.reconstruct).not.toHaveBeenCalled()
  })
  it('does not pretend to reconstruct when models are unavailable', async () => {
    const { instance } = await app({ provider: { configured: false } })
    const response = await instance.inject(request())
    expect(response.statusCode).toBe(503)
    expect(response.json().error.code).toBe('FACE_UNAVAILABLE')
  })
  it('rejects malformed geometry, nonfinite coordinates and invalid topology', () => {
    const invalid = sample(); invalid.vertices[0][0] = NaN
    expect(() => routesModule.validateResult(invalid)).toThrow()
    invalid.vertices[0][0] = 0; invalid.triangles[0][0] = 999
    expect(() => routesModule.validateResult(invalid)).toThrow()
  })
  it('keeps an unavailable DECA separate from the usable baseline without fallback', async () => {
    vi.stubEnv('YAS_FACE_COMPARISON', '1')
    const deca = { engine: 'DECA', configured: false, reconstruct: vi.fn() }
    const { instance, face } = await app({ deca })
    const status = await instance.inject({ url: '/api/face-reconstruction/deca/status', remoteAddress: '127.0.0.1' })
    expect(status.json()).toMatchObject({ engine: 'DECA', available: false })
    const response = await instance.inject(request({ url: '/api/face-reconstruction/deca' }))
    expect(response.statusCode).toBe(503)
    expect(face.reconstruct).not.toHaveBeenCalled()
    expect(deca.reconstruct).not.toHaveBeenCalled()
    expect((await instance.inject(request())).statusCode).toBe(200)
  })
  it('applies consent and local-only restrictions to the DECA endpoint', async () => {
    vi.stubEnv('YAS_FACE_COMPARISON', '1')
    const deca = { engine: 'DECA', configured: true, reconstruct: vi.fn() }
    const { instance } = await app({ deca })
    expect((await instance.inject(request({ url: '/api/face-reconstruction/deca', headers: { 'content-type': 'application/octet-stream' } }))).statusCode).toBe(400)
    expect((await instance.inject(request({ url: '/api/face-reconstruction/deca', remoteAddress: '192.168.1.4' }))).statusCode).toBe(403)
    expect(deca.reconstruct).not.toHaveBeenCalled()
  })
  it('rejects a mislabeled engine and clears the photo on validation failure', async () => {
    vi.stubEnv('YAS_FACE_COMPARISON', '1')
    let photo
    const deca = { engine: 'DECA', configured: true, reconstruct: async (bytes) => { photo = bytes; return sample() } }
    const { instance } = await app({ deca })
    const response = await instance.inject(request({ url: '/api/face-reconstruction/deca' }))
    expect(response.statusCode).toBe(502)
    expect(response.json().error.code).toBe('FACE_INVALID_RESULT')
    expect(photo.every((x) => x === 0)).toBe(true)
  })
  it('does not mount the experimental API without its startup flag', async () => {
    vi.stubEnv('YAS_FACE_COMPARISON', '0')
    const { instance } = await app()
    expect((await instance.inject(request({ url: '/api/face-reconstruction/deca' }))).statusCode).toBe(404)
  })
})
