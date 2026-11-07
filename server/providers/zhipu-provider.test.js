import { describe, expect, it, vi } from 'vitest'
import providerModule from './zhipu-provider.cjs'

const { createZhipuProvider } = providerModule

function jsonResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, headers: { get: () => null }, json: async () => body }
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
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body)).toMatchObject({
      temperature: 1,
      top_p: 0.95,
      max_tokens: 4096,
      stream: false,
    })
  })

  it('backs off once for transient rate limiting', async () => {
    const waitImpl = vi.fn(async () => {})
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(jsonResponse(429, { code: 1302 }))
      .mockResolvedValueOnce(jsonResponse(200, { choices: [{ message: { content: 'ok' } }] }))
    const provider = createZhipuProvider({ apiKey: 'x', model: 'test', timeoutMs: 1000, fetchImpl, waitImpl })

    await expect(provider.chat([{ role: 'user', content: 'hi' }])).resolves.toBe('ok')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(waitImpl).toHaveBeenCalledWith(500)
  })

  it('fails fast during a quota cooldown without exposing upstream details', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(429, { code: 1113, msg: 'sensitive detail' }))
    const provider = createZhipuProvider({ apiKey: 'x', model: 'test', timeoutMs: 1000, fetchImpl, now: () => 1000 })

    await expect(provider.search('query')).rejects.toMatchObject({ code: 'PROVIDER_QUOTA_EXHAUSTED' })
    await expect(provider.search('query')).rejects.toMatchObject({ code: 'PROVIDER_QUOTA_EXHAUSTED' })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
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

  it('supports a single short attempt for curated knowledge requests', async () => {
    const timeout = new Error('upstream timeout')
    timeout.name = 'AbortError'
    const fetchImpl = vi.fn(async () => { throw timeout })
    const provider = createZhipuProvider({ apiKey: 'x', model: 'test', timeoutMs: 20000, fetchImpl })

    await expect(provider.chat([], { timeoutMs: 8000, maxAttempts: 1 })).rejects.toMatchObject({ code: 'PROVIDER_TIMEOUT' })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('keeps only usable http search sources', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(200, {
      search_result: [
        { title: '官网', link: 'https://example.com/item', content: '有效资料', media: '示例站' },
        { title: '危险链接', link: 'javascript:alert(1)', content: '无效资料' },
      ],
    }))
    const provider = createZhipuProvider({ apiKey: 'x', model: 'test', timeoutMs: 1000, fetchImpl })
    const results = await provider.search('query')

    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({ title: '官网', publisher: '示例站' })
    expect(fetchImpl.mock.calls[0][0]).toBe('https://open.bigmodel.cn/api/paas/v4/web_search')
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toMatchObject({
      search_query: 'query',
      search_engine: 'search_std',
      search_intent: false,
      count: 5,
      search_recency_filter: 'noLimit',
      content_size: 'medium',
    })
  })

  it('passes controlled recency options to the HTTP Web Search API', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(200, { search_result: [] }))
    const provider = createZhipuProvider({ apiKey: 'x', model: 'test', timeoutMs: 1000, fetchImpl })

    await expect(provider.search('今日天气', { count: 10, recency: 'oneDay', contentSize: 'high' })).rejects.toMatchObject({ code: 'SEARCH_EMPTY' })
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toMatchObject({
      count: 10,
      search_recency_filter: 'oneDay',
      content_size: 'high',
    })
  })
})
