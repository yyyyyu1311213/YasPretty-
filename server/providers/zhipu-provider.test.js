import { describe, expect, it, vi } from 'vitest'
import providerModule from './zhipu-provider.cjs'

const { createZhipuProvider } = providerModule

function jsonResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body }
}

describe('Zhipu provider', () => {
  it('fails locally when no server key is configured', async () => {
    const fetchImpl = vi.fn()
    const provider = createZhipuProvider({ apiKey: '', model: 'test', timeoutMs: 1000, fetchImpl })

    await expect(provider.chat([{ role: 'user', content: 'hi' }])).rejects.toMatchObject({
      code: 'PROVIDER_NOT_CONFIGURED',
      statusCode: 503,
    })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('retries one transient server error and validates the response', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(jsonResponse(502, {}))
      .mockResolvedValueOnce(jsonResponse(200, { choices: [{ message: { content: 'ok' } }] }))
    const provider = createZhipuProvider({ apiKey: 'x', model: 'test', timeoutMs: 1000, fetchImpl })

    await expect(provider.chat([{ role: 'user', content: 'hi' }])).resolves.toBe('ok')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe('Bearer x')
  })

  it('maps timeout and malformed payloads to stable errors', async () => {
    const timeout = new Error('sensitive upstream detail')
    timeout.name = 'AbortError'
    const timedProvider = createZhipuProvider({
      apiKey: 'x',
      model: 'test',
      timeoutMs: 1000,
      fetchImpl: vi.fn(async () => { throw timeout }),
    })
    await expect(timedProvider.chat([])).rejects.toMatchObject({ code: 'PROVIDER_TIMEOUT' })

    const malformedProvider = createZhipuProvider({
      apiKey: 'x',
      model: 'test',
      timeoutMs: 1000,
      fetchImpl: vi.fn(async () => jsonResponse(200, { choices: [] })),
    })
    await expect(malformedProvider.chat([])).rejects.toMatchObject({ code: 'PROVIDER_INVALID_RESPONSE' })
  })

  it('keeps only usable http search sources', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(200, {
      choices: [{ message: { tool_calls: [{ type: 'search_result', search_result: [
        { title: '官网', link: 'https://example.com/item', content: '有效资料' },
        { title: '危险链接', link: 'javascript:alert(1)', content: '无效资料' },
      ] }] } }],
    }))
    const provider = createZhipuProvider({ apiKey: 'x', model: 'test', timeoutMs: 1000, fetchImpl })
    const results = await provider.search('query')

    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({ title: '官网', publisher: 'example.com' })
  })
})
