import { describe, expect, it } from 'vitest'
import { products } from '../data/products'
import {
  detectIntent,
  extractProfile,
  localReply,
  needsOnlineResearch,
  parseAssistantResult,
  recommendProducts,
} from './XiaoYAssistant'
import { legacyToForm, toPlanPayload } from './MakeupWorkbench'

describe('小Y本地规则', () => {
  it('routes weather, catalog, greeting, and general intents', () => {
    expect(detectIntent('今天上海天气怎么样')).toBe('weather')
    expect(detectIntent('推荐一款通勤粉底')).toBe('catalog')
    expect(detectIntent('你好')).toBe('greeting')
    expect(detectIntent('给我介绍一下巴黎时装周')).toBe('general')
  })

  it('requires online research for timely or out-of-catalog facts', () => {
    expect(needsOnlineResearch('这款现在官网多少钱', 'catalog')).toBe(true)
    expect(needsOnlineResearch('推荐一款油皮粉底', 'catalog')).toBe(false)
    expect(needsOnlineResearch('推荐一支口红', 'catalog')).toBe(true)
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
