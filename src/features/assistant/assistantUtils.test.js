import { describe, expect, it } from 'vitest'
import { products } from '../../data/products'
import {
  cleanErrorMessage,
  extractProfile,
  formatPlanReply,
  localReply,
  localMakeupReply,
  parseAssistantResult,
  planPayloadFromConversation,
  recommendProducts,
} from './assistantUtils'

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

  it('updates stated conditions without losing existing preferences or mutating the old profile', () => {
    const current = { skin: '油皮', budget: 400, scene: '通勤', tone: '暖调', city: '杭州' }
    const next = extractProfile('改为大干皮，预算 200 元，雾面，冷白', current)
    expect(next).toEqual({ ...current, skin: '干皮', budget: 200, finish: '柔雾', tone: '冷调' })
    expect(current).toEqual({ skin: '油皮', budget: 400, scene: '通勤', tone: '暖调', city: '杭州' })
    const payload = planPayloadFromConversation('精致约会妆容，带妆 30 小时', next)
    expect(payload.userProfile).toMatchObject({ skinType: '干皮', budgetTotal: 200, finishPreferences: ['柔雾'] })
    expect(payload.makeupRequest).toMatchObject({ scene: '通勤', style: '精致', wearHours: 24 })
  })

  it('retains explicitly mentioned catalog products for comparison despite unrelated filter conditions', () => {
    const mentioned = products.slice(0, 2)
    const text = mentioned.map((product) => product.name).join('和')
    const profile = { skin: '不存在的肤质', budget: 1, category: '不存在的品类' }
    expect(recommendProducts(profile, text).map(({ id }) => id)).toEqual(mentioned.map(({ id }) => id))
    const reply = localReply(text, profile)
    expect(reply.products).toEqual(mentioned)
    expect(reply.text).toContain('我按资料库信息比较你提到的产品：')
    for (const product of mentioned) expect(reply.text).toContain(`${product.brand} ${product.name}`)
  })

  it('asks for skin type before recommending and explains matching conditions after clarification', () => {
    expect(localReply('推荐通勤底妆', {})).toEqual({
      text: '为了避免只凭热度推荐，我需要先确认你的肤质。你是油皮、混油皮、干皮、混干皮，还是敏感肌？',
      products: [],
    })
    const profile = { skin: '油皮', budget: 400, category: '粉底液' }
    const reply = localReply('推荐通勤底妆', profile)
    expect(reply.products.length).toBeGreaterThan(0)
    expect(reply.products.every((product) => products.includes(product) && product.category === '粉底液')).toBe(true)
    expect(reply.text).toContain('适合油皮、在预算内')
    expect(reply.text).toContain('色号仅作为初筛建议')
  })

  it('preserves model-plan message formatting, color omissions and the three-product cap', () => {
    const ids = products.slice(0, 4).map(({ id }) => id)
    expect(formatPlanReply({
      title: '测试方案', summary: '测试摘要', sourceMode: 'model', recommendedProductIds: [ids[0], ...ids],
      steps: [
        { category: '妆前', technique: '薄涂。', colorDirection: '不涉及颜色' },
        { category: '唇妆', technique: '晕开。', colorDirection: '豆沙' },
      ],
    })).toEqual({
      text: '测试方案\n\n测试摘要\n\n1. 妆前：薄涂。\n\n2. 唇妆：晕开。\n颜色方向：豆沙\n\n模型方案已通过结构和产品 ID 校验。',
      productIds: ids.slice(0, 3), sources: [], sourceMode: 'model',
    })
  })

  it('deduplicates and caps real model product IDs in order while removing every marker', () => {
    const ids = products.slice(0, 4).map(({ id }) => id)
    const raw = `回复正文。\n${[ids[0], 'not-real', ...ids].map((id) => `[[PRODUCT: ${id} ]]`).join('\n')}`
    expect(parseAssistantResult(raw)).toEqual({ text: '回复正文。', productIds: ids.slice(0, 3) })
  })
})
