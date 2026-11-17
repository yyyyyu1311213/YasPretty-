import { afterEach, describe, expect, it, vi } from 'vitest'
import { products } from '../../data/products'
import * as makeupPlanApi from '../makeup-plan/makeupPlanApi'
import { requestAssistant, requestMakeupPlan } from './assistantApi'

const input = { text: '合成测试问题', messages: [], profile: {} }

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('小Y业务请求', () => {
  it('posts only the last eight role/content messages and adapts real product IDs and sources', async () => {
    const messages = Object.freeze(Array.from({ length: 12 }, (_, index) => Object.freeze({
      id: String(index), role: index % 2 ? 'assistant' : 'user', content: `合成历史 ${index}`,
      productIds: [products[0].id], sources: [],
    })))
    const profile = Object.freeze({ skin: '混油皮', budget: 400, scene: '通勤' })
    const ids = products.slice(0, 4).map(({ id }) => id)
    const sources = [{ kind: 'web', title: '合成来源', url: 'https://example.test/source', publisher: '测试', accessedAt: '2026-11-17T00:00:00.000Z' }]
    const answer = `合成回答。\n${[ids[0], 'not-real', ...ids].map((id) => `[[PRODUCT:${id}]]`).join('\n')}`
    const fetch = vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => ({ answer, sources, answerMode: 'search', model: 'synthetic-model' }),
    })
    vi.stubGlobal('fetch', fetch)

    const result = await requestAssistant({ text: '现在的合成问题', messages, profile })
    expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/assistant', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '现在的合成问题', profile,
        messages: messages.slice(4).map(({ role, content }) => ({ role, content })),
      }),
    })
    expect(result).toEqual({ text: '合成回答。', productIds: ids.slice(0, 3), sources, answerMode: 'search', model: 'synthetic-model' })
    expect(result.sources).toBe(sources)
    expect(messages).toHaveLength(12)
    expect(profile).toEqual({ skin: '混油皮', budget: 400, scene: '通勤' })
  })

  it('keeps response defaults and the existing HTTP-success acceptance boundary', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => ({ ok: false, answer: '合成回答', sources: null, answerMode: '', model: null }),
    }))
    expect(await requestAssistant(input)).toEqual({ text: '合成回答', productIds: [], sources: [], answerMode: 'model', model: '' })
  })

  it.each([
    [503, { error: { code: 'AI_NOT_CONFIGURED', message: '合成无 Key 错误。' } }, '合成无 Key 错误。', 'AI_NOT_CONFIGURED'],
    [504, { error: { code: 'UPSTREAM_TIMEOUT', message: '合成上游超时。' } }, '合成上游超时。', 'UPSTREAM_TIMEOUT'],
    [500, { error: { code: '', message: '' } }, '请求失败（500）', 'REQUEST_FAILED'],
  ])('preserves error message and code for HTTP %s', async (status, body, message, code) => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, status, json: async () => body })
    vi.stubGlobal('fetch', fetch)
    await expect(requestAssistant(input)).rejects.toMatchObject({ message, code })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it.each([
    [200, '智能服务没有返回内容', undefined],
    [502, '请求失败（502）', 'REQUEST_FAILED'],
  ])('keeps the existing invalid-JSON error for HTTP %s', async (status, message, code) => {
    const fetch = vi.fn().mockResolvedValue({
      ok: status < 400, status, json: async () => { throw new SyntaxError('synthetic invalid JSON') },
    })
    vi.stubGlobal('fetch', fetch)
    const error = await requestAssistant(input).catch((error) => error)
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe(message)
    expect(error.code).toBe(code)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it.each([null, {}, { answer: '' }])('rejects an empty answer in response %j', async (body) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => body }))
    await expect(requestAssistant(input)).rejects.toThrow('智能服务没有返回内容')
  })

  it('propagates a network rejection unchanged without retrying', async () => {
    const error = new TypeError('Failed to fetch')
    const fetch = vi.fn().mockRejectedValue(error)
    vi.stubGlobal('fetch', fetch)
    await expect(requestAssistant(input)).rejects.toBe(error)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it.each(['TimeoutError', 'AbortError'])('propagates a native %s unchanged for the existing caller', async (name) => {
    const error = new DOMException('合成请求失败', name)
    const fetch = vi.fn().mockRejectedValue(error)
    vi.stubGlobal('fetch', fetch)
    await expect(requestAssistant(input)).rejects.toBe(error)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('checks HTTP before accepting an answer and preserves the specific business code', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, status: 503,
      json: async () => ({ answer: 'must-not-win', error: { code: 'WEATHER_PROVIDER_UNAVAILABLE', message: '合成天气不可用。' } }),
    }))
    await expect(requestAssistant(input)).rejects.toMatchObject({ code: 'WEATHER_PROVIDER_UNAVAILABLE', message: '合成天气不可用。' })
  })
})

describe('小Y会话方案请求适配', () => {
  it.each(['local', 'model'])('uses the shared makeupPlanApi and preserves %s plan formatting', async (sourceMode) => {
    const sharedRequest = vi.spyOn(makeupPlanApi, 'requestMakeupPlan')
    const ids = products.slice(0, 2).map(({ id }) => id)
    const fetch = vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => ({ plan: {
        title: '合成方案', summary: '合成摘要', sourceMode, recommendedProductIds: [ids[0], ...ids],
        steps: [{ category: '底妆', technique: '分区薄涂。', colorDirection: '自然' }],
      } }),
    })
    vi.stubGlobal('fetch', fetch)
    const profile = Object.freeze({ skin: '干皮', finish: '奶油肌', budget: 300, scene: '拍照' })
    const result = await requestMakeupPlan({ text: '给我完整妆容，精致，带妆 10 小时', profile })
    const payload = {
      userProfile: {
        skinType: '干皮', skinTypeSource: 'self_reported', undertone: 'unknown', finishPreferences: ['奶油肌'],
        concerns: [], budgetTotal: 300, skillLevel: '新手', excludedBrands: [], sensitivities: [], city: '',
      },
      makeupRequest: {
        scene: '拍照', style: '精致', wearHours: 10, timeOfDay: '白天', photoEnabled: false, priorities: ['轻薄'],
      },
    }
    expect(sharedRequest).toHaveBeenCalledExactlyOnceWith(payload)
    expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/makeup-plans', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    expect(result).toEqual({
      text: `合成方案\n\n合成摘要\n\n1. 底妆：分区薄涂。\n颜色方向：自然\n\n${sourceMode === 'local' ? '这是本地规则方案；补充肤质、预算和场景后可以再生成。' : '模型方案已通过结构和产品 ID 校验。'}`,
      productIds: ids, sources: [], sourceMode,
    })
  })

  it('preserves errors from the shared API for the existing UI fallback', async () => {
    const sharedRequest = vi.spyOn(makeupPlanApi, 'requestMakeupPlan')
    const fetch = vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({ error: { message: '合成方案错误。' } }) })
    vi.stubGlobal('fetch', fetch)
    await expect(requestMakeupPlan({ text: '给我完整妆容', profile: {} })).rejects.toThrow('合成方案错误。')
    expect(sharedRequest).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('propagates a shared-API network rejection unchanged without returning local success', async () => {
    const error = new TypeError('Failed to fetch')
    const fetch = vi.fn().mockRejectedValue(error)
    vi.stubGlobal('fetch', fetch)
    await expect(requestMakeupPlan({ text: '给我完整妆容', profile: {} })).rejects.toBe(error)
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
