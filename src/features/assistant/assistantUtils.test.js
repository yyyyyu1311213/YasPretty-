import { describe, expect, it } from 'vitest'
import { products } from '../../data/products'
import {
  cleanErrorMessage,
  extractProfile,
  formatProductComparison,
  formatPlanReply,
  localReply,
  localMakeupReply,
  parseAssistantResult,
  planPayloadFromConversation,
  recommendProducts,
} from './assistantUtils'
import { extractRequestConditions, extractSpendingLimit, skinRequestFromChoice } from './profileUtils'
import { assessSkin, readSkinObservation, skinConditions } from './skinObservation'

describe('小Y本地规则', () => {
  it.each([['两百以内', 200], ['气垫200以内', 200], ['50ml以内', undefined], ['SPF50以内', undefined], ['售价200元以内', undefined], ['预算300-500元', 500]])('parses request spending separately from specifications: %s', (text, budget) => {
    expect(extractSpendingLimit(text)).toBe(budget)
  })
  it.each([
    ['skin-dry', []], // The old broad flaking choice alone cannot establish dry skin.
    ['skin-oily', ['油皮', '混油皮']],
    ['skin-combination', ['混油皮', '混干皮']],
  ])('maps a daily-feeling choice to an ephemeral request condition: %s', (choice, values) => {
    expect(skinRequestFromChoice(choice)).toMatchObject({ skinValues: values })
    expect(skinRequestFromChoice(choice)).not.toHaveProperty('skin')
  })

  it('uses request-only skin values in offline filtering and lets skip override a saved skin', () => {
    const profile = { skin: '油皮', budget: 1000 }
    const dry = localReply('我想选底妆，但不清楚自己的肤质', profile, skinConditions(assessSkin(readSkinObservation('不太出油，两颊经常干'))))
    expect(dry.products.length).toBeGreaterThan(0)
    expect(dry.products.every((product) => product.skins.some((skin) => ['干皮', '混干皮'].includes(skin)))).toBe(true)
    expect(dry.text).toContain('本次按你提供的日常感受')

    const skip = localReply('我想选底妆，但不清楚自己的肤质', profile, skinRequestFromChoice('skin-unknown'))
    expect(skip.products.length).toBeGreaterThan(0)
    const unfiltered = recommendProducts({ budget: 1000, category: '粉底液', skin: undefined }, '我想选底妆，但不清楚自己的肤质')
    expect(skip.products.map(({ id }) => id)).toEqual(unfiltered.map(({ id }) => id))
    expect(skip.text).toContain('本次候选未按肤质筛选')
    expect(profile).toEqual({ skin: '油皮', budget: 1000 })
  })

  it('recognizes existing daily observations but not an occasional flake as a skin category', () => {
    expect(extractRequestConditions('我想选底妆，T区油、两颊偏干')).toMatchObject({ skinValues: ['混油皮', '混干皮'] })
    expect(extractRequestConditions('我想选底妆，偶尔起皮')).not.toHaveProperty('skinValues')
  })

  it.each(['我朋友说，预算200元，想要哑光气垫', 'YSL售价300元左右', '假如我是干皮，预算200元', '她喜欢哑光，想买气垫'])('audit: does not persist third-person, hypothetical or product-price statements: %s', (text) => {
    const current = { skin: '油皮', budget: 1000 }
    expect(extractProfile(text, current)).toEqual(current)
  })
  it.each([['我不是油皮，是干皮', { skin: '干皮' }], ['我肤质是干皮', { skin: '干皮' }], ['预算300-500元', { budget: 500 }], ['我朋友是油皮，我是干皮', { skin: '干皮' }]])('audit: accepts explicit corrections: %s', (text, expected) => {
    expect(extractProfile(text)).toMatchObject(expected)
  })
  it('audit: applies offline request skin, category and spending constraints without mutating profile', () => {
    const profile = { skin: '油皮', category: '气垫', budget: 1000 }
    const result = recommendProducts(profile, '推荐适合干皮、不超过600元的粉底液')
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((p) => p.category === '粉底液' && p.skins.includes('干皮') && p.price <= 600)).toBe(true)
    expect(profile).toEqual({ skin: '油皮', category: '气垫', budget: 1000 })
  })
  it('audit: offline explanation uses the same request conditions as the selected products', () => {
    const result = localReply('推荐适合干皮、不超过600元的粉底液', { skin: '油皮', budget: 1000 })
    expect(result.text).toContain('适合干皮')
    expect(result.text).not.toContain('需求（油皮）')
  })
  it('can use the catalog category for eyebrow and contour suggestions without requiring a base-skin profile', () => {
    const brows = localReply('推荐男士眉粉', {})
    expect(brows.products.length).toBeGreaterThan(0)
    expect(brows.products.every((product) => product.category === '眉妆')).toBe(true)
    const contour = localReply('推荐修容粉', {})
    expect(contour.products.length).toBeGreaterThan(0)
    expect(contour.products.every((product) => product.category === '修容')).toBe(true)
  })
  it.each(['YSL适合喜欢哑光的人', '预算15-30g', '预算30-50ml'])('audit: keeps product descriptions and quantity ranges out of self reports: %s', (text) => {
    expect(extractProfile(text, { budget: 400 })).toEqual({ budget: 400 })
  })
  it.each(['这款适合干皮吗', '这款哑光气垫', '朋友是干皮', '我是干皮吗？', '这款300元以内吗？', '我是干皮还是油皮', '我想要不哑光的气垫'])('AI-R01 keeps product questions and other people out of the profile: %s', (text) => {
    const current = { skin: '油皮', finish: '柔雾', budget: 400 }
    expect(extractProfile(text, current)).toEqual(current)
  })
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

  it.each([
    '这个兰芝NEO小方块哑光气垫，15g是正装还是带替换芯？一个大概能用多久？平时放包里补妆方便吗？',
    '30ml 粉底，SPF50，21号色，能带妆12小时吗？',
    '2026年新品，最多用30天吗？',
    '这个气垫价格325元，含替换芯吗？',
    '15',
  ])('does not turn product quantities or quoted prices into a budget: %s', (text) => {
    expect(extractProfile(text)).not.toHaveProperty('budget')
    expect(extractProfile(text, { budget: 400 }).budget).toBe(400)
  })

  it.each([
    ['预算300', 300], ['预算不超过 400 元', 400], ['不超过500元', 500],
    ['300 元以内推荐气垫', 300], ['200块左右', 200], ['预算为299.50元', 299.5],
    ['带妆12小时，预算350元，想要15g气垫', 350],
    ['我是混油皮，想找 500 元内的通勤底妆', 500],
  ])('extracts an explicitly stated spending limit: %s', (text, budget) => {
    expect(extractProfile(text).budget).toBe(budget)
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
    const next = extractProfile('改为大干皮，预算 200 元，我喜欢雾面，我是冷白', current)
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
    expect(recommendProducts(profile, text)).toEqual([])
    const reply = localReply(text, profile)
    expect(reply.products).toEqual(mentioned)
    expect(reply.text).toContain('我按资料库信息比较你提到的产品：')
    for (const product of mentioned) expect(reply.text).toContain(`${product.brand} ${product.name}`)
  })

  it('omits internal product status text and empty facts from comparison answers', () => {
    const first = products.find((product) => product.id === 'catalog-045')
    const second = products.find((product) => product.id === 'catalog-046')
    const result = formatProductComparison(first)
    const reply = localReply(`${first.name} 和 ${second.name} 对比哪个好`, {})

    expect(result).toContain('参考价 365 元（参考原价，最终价格以结算页为准）')
    expect(result).not.toMatch(/待核验|已核验|未核验|待确认|未标注|暂无信息|null 小时/)
    expect(reply.text).not.toMatch(/待核验|已核验|未核验|待确认|未标注|暂无信息|null 小时/)
  })

  it('answers a complete catalog request before asking for optional skin context', () => {
    const initial = localReply('推荐通勤底妆', {})
    expect(initial.products.length).toBeGreaterThan(0)
    expect(initial.products.every((product) => products.includes(product) && product.category === '粉底液')).toBe(true)
    expect(initial.text).toContain('没有提供肤质')
    expect(initial.text).toContain('保守筛选')
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
