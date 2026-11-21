const { gzipSync } = require('node:zlib')
const { AppError } = require('../errors.cjs')

function validateResult(result) {
  const finiteArray = (a, size) => Array.isArray(a) && a.length === size && a.every(Number.isFinite)
  const thirds = result?.thirds
  const validThirds = thirds === undefined || (thirds?.status === 'estimated'
    ? finiteArray(thirds.shares, 3) && thirds.shares.every(n => n > 0 && n < 1)
      && Math.abs(thirds.shares.reduce((a,b) => a+b) - 1) < .001
      && (thirds.chinShare === null || Number.isFinite(thirds.chinShare) && thirds.chinShare > 0 && thirds.chinShare < 1)
    : ['unavailable','pose_quality','not_visible'].includes(thirds?.status) && !thirds.shares)
  if (!['3DDFA_V2', 'DECA'].includes(result?.engine) || !Number.isInteger(result.width) || !Number.isInteger(result.height)
    || result.width < 1 || result.height < 1 || result.width > 2048 || result.height > 2048
    || !Array.isArray(result.vertices) || result.vertices.length < 100 || result.vertices.length > 100000
    || !result.vertices.every((p) => finiteArray(p, 3))
    || !Array.isArray(result.triangles) || result.triangles.length > 200000
    || !result.triangles.every((p) => finiteArray(p, 3) && p.every((i) => Number.isInteger(i) && i >= 0 && i < result.vertices.length))
    || !Array.isArray(result.landmarks) || result.landmarks.length !== 68 || !result.landmarks.every((p) => finiteArray(p, 3))
    || !Number.isFinite(result.inferenceMs) || !Number.isFinite(result.detectionScore)
    || !validThirds || !Number.isFinite(result.yaw) || !Array.isArray(result.qualityIssues) || result.qualityIssues.length > 10
    || !result.qualityIssues.every((x) => typeof x === 'string' && x.length < 120)) {
    throw new AppError('FACE_INVALID_RESULT', '重建结果不完整，请重新选择照片。', 502)
  }
  return result
}

async function registerFaceRoutes(app, { provider, researchOnly = true, prefix = '/api/face-reconstruction' }) {
  const local = (request) => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(request.raw.socket.remoteAddress)
  const requireLocal = (request) => {
    if (!researchOnly || !local(request)) throw new AppError('FACE_RESEARCH_ONLY', '此功能当前仅供本机科研验证。', 403)
  }
  app.get(`${prefix}/status`, async (request) => {
    requireLocal(request)
    return { ok: true, available: Boolean(provider.configured), engine: provider.engine || '3DDFA_V2', purpose: 'local-research' }
  })
  await app.register(async (scope) => {
    scope.addContentTypeParser('application/octet-stream', { parseAs: 'buffer', bodyLimit: 8 * 1024 * 1024 }, (request, body, done) => done(null, body))
    scope.post(prefix, {
      bodyLimit: 8 * 1024 * 1024,
      config: { rateLimit: { max: 8, timeWindow: '1 minute' } },
      onRequest: async (request) => {
        requireLocal(request)
        if (request.headers['x-face-consent'] !== 'local-research-v1') throw new AppError('FACE_CONSENT_REQUIRED', '请先同意本次照片处理。', 400)
        if (!provider.configured) throw new AppError('FACE_UNAVAILABLE', '本机重建服务尚未准备好，请稍后重试。', 503)
      },
    }, async (request, reply) => {
      if (!Buffer.isBuffer(request.body) || request.body.length < 16) throw new AppError('INVALID_IMAGE', '请选择 JPG、PNG 或 WebP 照片。', 400)
      const controller = new AbortController()
      const disconnected = () => { if (!reply.raw.writableEnded) controller.abort() }
      reply.raw.on('close', disconnected)
      try {
        const result = validateResult(await provider.reconstruct(request.body, { signal: controller.signal }))
        if (result.engine !== (provider.engine || '3DDFA_V2')) throw new AppError('FACE_INVALID_RESULT', '重建来源不匹配，请重试。', 502)
        const payload = JSON.stringify({ ok: true, result })
        reply.type('application/json; charset=utf-8')
        reply.header('Vary', 'Accept-Encoding')
        if (/\bgzip\b/.test(request.headers['accept-encoding'] || '')) {
          reply.header('Content-Encoding', 'gzip')
          return reply.send(gzipSync(payload))
        }
        return reply.send(payload)
      } finally {
        request.body.fill(0)
        request.body = null
        reply.raw.removeListener('close', disconnected)
      }
    })
  })
}

module.exports = { registerFaceRoutes, validateResult }
