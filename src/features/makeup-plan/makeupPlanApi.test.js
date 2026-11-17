import { afterEach, describe, expect, it, vi } from 'vitest'
import { requestMakeupPlan } from './makeupPlanApi'
import { legacyToForm, toPlanPayload } from './makeupPlanUtils'

afterEach(() => vi.unstubAllGlobals())

describe('妆容方案业务请求', () => {
  it('posts the unchanged payload and returns the original plan without adapting its fields', async () => {
    const payload = toPlanPayload(legacyToForm({ skin: '混油皮', budget: 400 }))
    const plan = { id: 'test-plan', sourceMode: 'local', recommendedProductIds: [] }
    const fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true, plan }) })
    vi.stubGlobal('fetch', fetch)
    expect(await requestMakeupPlan(payload)).toBe(plan)
    expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/makeup-plans', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    expect(payload.makeupRequest.photoEnabled).toBe(false)
  })

  it.each([
    [503, { error: { message: '方案服务暂时不可用。' } }, '方案服务暂时不可用。'],
    [504, { error: { message: '上游请求超时。' } }, '上游请求超时。'],
    [500, null, '方案生成失败（500）'],
    [200, { ok: true }, '方案生成失败（200）'],
    [200, { plan: null }, '方案生成失败（200）'],
    [200, { error: { message: '合成业务失败' } }, '合成业务失败'],
  ])('keeps the exact error for status %s and body %j', async (status, body, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body }))
    await expect(requestMakeupPlan({})).rejects.toThrow(message)
  })

  it('maps invalid JSON to the same status-based failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => { throw new SyntaxError('invalid JSON') } }))
    await expect(requestMakeupPlan({})).rejects.toThrow('方案生成失败（200）')
  })

  it('propagates network errors unchanged for each caller to handle', async () => {
    const error = new TypeError('Failed to fetch')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error))
    await expect(requestMakeupPlan({})).rejects.toBe(error)
  })

  it.each(['TimeoutError', 'AbortError'])('propagates a native %s unchanged without retrying', async (name) => {
    const error = new DOMException('合成请求失败', name)
    const fetch = vi.fn().mockRejectedValue(error)
    vi.stubGlobal('fetch', fetch)
    await expect(requestMakeupPlan({})).rejects.toBe(error)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it.each([
    [503, { plan: { id: 'must-not-win' }, error: { code: 'AI_NOT_CONFIGURED', message: '合成方案不可用。' } }, '合成方案不可用。'],
    [200, { error: { code: 'UPSTREAM_TIMEOUT', message: '合成方案超时。' } }, '合成方案超时。'],
  ])('preserves the plain message-only error for HTTP %s even when the response carries a code', async (status, body, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body }))
    const error = await requestMakeupPlan({}).catch((error) => error)
    expect(error.message).toBe(message)
    expect(Object.getPrototypeOf(error)).toBe(Error.prototype)
    expect(Object.hasOwn(error, 'code')).toBe(false)
  })

  it('retains the existing response acceptance boundary without adding plan schema checks', async () => {
    const plan = { id: 'synthetic-plan' }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: false, plan }) }))
    expect(await requestMakeupPlan({})).toBe(plan)
  })
})
