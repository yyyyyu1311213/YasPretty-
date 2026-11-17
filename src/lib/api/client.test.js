import { afterEach, describe, expect, it, vi } from 'vitest'
import { postJson } from './client'
import { createApiError } from './errors'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('共用 POST/JSON client', () => {
  it('sends the same method, headers and JSON body and retains the response and data objects', async () => {
    const payload = Object.freeze({ query: '合成问题', messages: [] })
    const data = { answer: '合成回答', sources: [], plan: { id: 'untouched' } }
    const response = { ok: true, status: 200, json: vi.fn().mockResolvedValue(data) }
    const fetch = vi.fn().mockResolvedValue(response)
    const errorForResponse = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const result = await postJson('/api/assistant', payload, errorForResponse)
    expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/assistant', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    expect(result.response).toBe(response)
    expect(result.data).toBe(data)
    expect(response.json).toHaveBeenCalledOnce()
    expect(errorForResponse).not.toHaveBeenCalled()
  })

  it('reads JSON before HTTP status and throws the exact feature error without retrying', async () => {
    const order = []
    const data = { error: { code: 'UPSTREAM_TIMEOUT', message: '合成上游超时。' }, answer: 'must-not-win' }
    const response = {
      get ok() { order.push('http'); return false },
      status: 504,
      json: vi.fn(async () => { order.push('json'); return data }),
    }
    const error = createApiError(data.error.message, data.error.code)
    const errorForResponse = vi.fn((receivedResponse, receivedData) => {
      order.push('feature-error')
      expect(receivedResponse).toBe(response)
      expect(receivedData).toBe(data)
      return error
    })
    const fetch = vi.fn().mockResolvedValue(response)
    vi.stubGlobal('fetch', fetch)
    await expect(postJson('/api/assistant', {}, errorForResponse)).rejects.toBe(error)
    expect(order).toEqual(['json', 'http', 'feature-error'])
    expect(fetch).toHaveBeenCalledOnce()
    expect(response.json).toHaveBeenCalledOnce()
    expect(errorForResponse).toHaveBeenCalledOnce()
  })

  it.each([true, false])('keeps rejected JSON as null with HTTP ok=%s', async (ok) => {
    const response = { ok, status: ok ? 200 : 502, json: vi.fn().mockRejectedValue(new SyntaxError('invalid JSON')) }
    const error = createApiError('合成 HTTP 错误')
    const errorForResponse = vi.fn(() => error)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
    const pending = postJson('/api/makeup-plans', {}, errorForResponse)
    if (ok) {
      expect((await pending).data).toBeNull()
      expect(errorForResponse).not.toHaveBeenCalled()
    } else {
      await expect(pending).rejects.toBe(error)
      expect(errorForResponse).toHaveBeenCalledExactlyOnceWith(response, null)
    }
  })

  it.each([
    new TypeError('Failed to fetch'),
    new DOMException('合成超时', 'TimeoutError'),
    new DOMException('合成取消', 'AbortError'),
  ])('propagates a fetch $name rejection unchanged without classifying it as HTTP', async (error) => {
    const fetch = vi.fn().mockRejectedValue(error)
    const errorForResponse = vi.fn()
    vi.stubGlobal('fetch', fetch)
    await expect(postJson('/api/assistant', {}, errorForResponse)).rejects.toBe(error)
    expect(fetch).toHaveBeenCalledOnce()
    expect(errorForResponse).not.toHaveBeenCalled()
  })

  it.each(['TimeoutError', 'AbortError'])('retains the original null fallback for a JSON-body %s rejection', async (name) => {
    const errorForResponse = vi.fn()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => { throw new DOMException('合成读取失败', name) },
    }))
    expect((await postJson('/api/assistant', {}, errorForResponse)).data).toBeNull()
    expect(errorForResponse).not.toHaveBeenCalled()
  })

  it.each(['fetch', 'json'])('does not introduce a timer or cancellation while %s is pending', async (stage) => {
    vi.useFakeTimers()
    let release
    const waiting = new Promise((resolve) => { release = resolve })
    const response = { ok: true, status: 200, json: vi.fn(() => stage === 'json' ? waiting : Promise.resolve({})) }
    const fetch = vi.fn(() => stage === 'fetch' ? waiting : Promise.resolve(response))
    vi.stubGlobal('fetch', fetch)
    const settled = vi.fn()
    const pending = postJson('/api/assistant', {}, vi.fn()).then(settled)
    await vi.advanceTimersByTimeAsync(300000)
    expect(settled).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
    expect(Object.hasOwn(fetch.mock.calls[0][1], 'signal')).toBe(false)
    release(stage === 'fetch' ? response : {})
    await pending
    expect(settled).toHaveBeenCalledOnce()
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('propagates a synchronous response.json failure instead of wrapping it', async () => {
    const error = new TypeError('synthetic invalid response')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json() { throw error } }))
    await expect(postJson('/api/assistant', {}, vi.fn())).rejects.toBe(error)
  })

  it('does not issue a request when payload serialization fails', async () => {
    const payload = {}
    payload.self = payload
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    await expect(postJson('/api/makeup-plans', payload, vi.fn())).rejects.toBeInstanceOf(TypeError)
    expect(fetch).not.toHaveBeenCalled()
  })
})
