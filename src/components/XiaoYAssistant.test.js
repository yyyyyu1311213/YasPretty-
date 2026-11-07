import { describe, expect, it } from 'vitest'
import { products } from '../data/products'
import {
  cleanErrorMessage,
  detectIntent,
  extractProfile,
  formatPlanReply,
  localReply,
  localMakeupReply,
  needsOnlineResearch,
  parseAssistantResult,
  planPayloadFromConversation,
  recommendProducts,
} from './XiaoYAssistant'
import { legacyToForm, toPlanPayload } from './MakeupWorkbench'

describe('小Y本地规则', () => {
  it('routes external questions, catalog, and greeting intents', () => {
    expect(detectIntent('今天上海天气怎么样')).toBe('external_question')
    expect(detectIntent('推荐一款通勤粉底')).toBe('catalog_recommendation')
    expect(detectIntent('我明天要约会，帮我设计一个妆容')).toBe('makeup_plan')
    expect(detectIntent('我想要一个韩女水光妆容的妆教')).toBe('makeup_plan')
    expect(detectIntent('教我如何画一个适合拍照的妆容，场景是秋日落叶阳光')).toBe('makeup_plan')
    expect(detectIntent('我怎么判断我的肤质')).toBe('external_question')
    expect(detectIntent('你好')).toBe('greeting_help')
    expect(detectIntent('给我介绍一下巴黎时装周')).toBe('external_question')
  })

  it('normalizes upstream punctuation before composing an error message', () => {
    expect(cleanErrorMessage('联网检索没有返回可用来源。。')).toBe('联网检索没有返回可用来源')
  })

  it('requires online research for timely or out-of-catalog facts', () => {
    expect(needsOnlineResearch('这款现在官网多少钱', 'catalog_recommendation')).toBe(true)
    expect(needsOnlineResearch('推荐一款油皮粉底', 'catalog_recommendation')).toBe(false)
    expect(needsOnlineResearch('推荐一支口红', 'catalog_recommendation')).toBe(true)
    expect(needsOnlineResearch('给我介绍一下巴黎时装周', 'external_question')).toBe(false)
    expect(needsOnlineResearch('明天上海天气怎么样', 'external_question')).toBe(true)
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

  it('maps structured workbench inputs to the stage 2 API contract', () => {
    const payload = toPlanPayload(legacyToForm({ skin: '混油皮', finish: '柔雾', budget: 500 }))
    expect(payload.userProfile).toMatchObject({
      skinType: '混油皮',
      skinTypeSource: 'self_reported',
      budgetTotal: 500,
      finishPreferences: ['柔雾'],
    })
    expect(payload.makeupRequest).toMatchObject({ photoEnabled: false, scene: '日常', style: '自然' })
  })
})
