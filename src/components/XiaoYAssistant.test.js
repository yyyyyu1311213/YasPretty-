import { describe, expect, it } from 'vitest'
import { products } from '../data/products'
import {
  cleanErrorMessage,
  extractProfile,
  formatPlanReply,
  localReply,
  localMakeupReply,
  parseAssistantResult,
  planPayloadFromConversation,
  recommendProducts,
} from './XiaoYAssistant'

describe('小Y本地规则', () => {
  it('normalizes upstream punctuation before composing an error message', () => {
    expect(cleanErrorMessage('联网检索没有返回可用来源。。')).toBe('联网检索没有返回可用来源')
  })

  it('extracts the supported profile fields', () => {
    expect(extractProfile('我是混油皮，预算 300 元，想要柔雾通勤粉底')).toMatchObject({
      skin: '混油皮',
      budget: 300,
      finish: '柔雾',
      scene: '通勤',
      category: '粉底液',
    })
  })

  it('treats skin type and budget as hard filters', () => {
    const results = recommendProducts({ skin: '油皮', budget: 400 }, '推荐粉底液')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((product) => product.skins.includes('油皮'))).toBe(true)
    expect(results.every((product) => product.price <= 400)).toBe(true)
  })

  it('explains when no catalog product satisfies all hard filters', () => {
    const result = localReply('推荐粉底液', { skin: '油皮', budget: 1, category: '粉底液' })
    expect(result.products).toEqual([])
    expect(result.text).toContain('没有同时满足')
  })

  it('maps a conversational water-glow request to a structured makeup plan', () => {
    const payload = planPayloadFromConversation('如何画一个韩女水光妆容，想带妆 10 小时', {})
    expect(payload.makeupRequest).toMatchObject({ scene: '日常', style: '清透', wearHours: 10 })
    expect(payload.makeupRequest.priorities).toEqual(expect.arrayContaining(['轻薄', '保湿']))
    expect(payload.userProfile.finishPreferences).toEqual(['自然光泽'])
  })

  it('formats a validated local plan as a useful chat answer', () => {
    const result = formatPlanReply({
      title: '清透妆容方案',
      summary: '先薄涂，再局部调整。',
      sourceMode: 'local',
      recommendedProductIds: [products[0].id, products[0].id],
      steps: [{ category: '底妆', technique: '从面中向外少量铺开。', colorDirection: '自然光泽' }],
    })
    expect(result.text).toContain('1. 底妆')
    expect(result.text).toContain('本地规则')
    expect(result.productIds).toEqual([products[0].id])
  })

  it('keeps a complete local makeup answer when the API is unavailable', () => {
    const result = localMakeupReply('如何画一个韩女水光妆容', {})
    expect(result.text).toContain('1. 妆前')
    expect(result.text).toContain('7. 唇妆')
    expect(result.text).toContain('没有使用照片分析或联网资料')
  })

  it('keeps only known product IDs returned by the model', () => {
    const knownId = products[0].id
    const result = parseAssistantResult(`建议如下。\n[[PRODUCT:${knownId}]]\n[[PRODUCT:not-real]]`)
    expect(result.productIds).toEqual([knownId])
    expect(result.text).not.toContain('PRODUCT')
  })
})
