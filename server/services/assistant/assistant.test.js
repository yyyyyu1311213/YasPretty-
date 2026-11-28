import { describe, expect, it, vi } from 'vitest'
import service from '../assistant-service.cjs'
import resolver from './product-resolver.cjs'
import router from './intent-router.cjs'
import parameters from './parameters.cjs'

const products = [
  { id: 'a', brand: '合成品牌', name: '星光气垫（哑光）', category: '气垫', skins: ['油皮'], finish: '哑光', price: 300, scenes: ['通勤'], shades: [], wear: 8, coverage: '中', recommendationReady: true },
  { id: 'b', brand: '合成品牌', name: '月光粉底液', category: '粉底液', skins: ['干皮'], finish: '自然光泽', price: 500, scenes: ['通勤'], shades: [], wear: 8, coverage: '中', recommendationReady: true },
]
// Deterministic assertions exercise provider failure; successful expression has dedicated cases.
const provider = () => ({ configured: true, modelName: 'synthetic', chat: vi.fn(async () => { throw new Error('synthetic unavailable') }), search: vi.fn(async () => []) })

describe('AI-R01 server orchestration', () => {
  it.each(['推荐适合干皮的粉底液', '月光粉底液怎么样'])('audit: a clear route still permits grounded model expression: %s', async (query) => {
    const zhipuProvider = { ...provider(), chat: vi.fn(async () => '合成自然语言解释。[[PRODUCT:b]]') }
    const result = await service.createAssistantService({ products, zhipuProvider }).answer({ query, profile: { skin: '干皮' } })
    expect(result.answerMode).toBe('model')
    expect(zhipuProvider.chat).toHaveBeenCalledOnce()
    expect(zhipuProvider.chat.mock.calls[0][0][0].content).not.toContain('仅分类')
    expect(zhipuProvider.chat.mock.calls[0][0][0].content).toContain('月光粉底液')
    expect(zhipuProvider.chat.mock.calls[0][0][0].content).not.toContain('星光气垫')
  })
  it.each(['', '[[PRODUCT:invented]]', 'timeout'])('audit: catalog expression failure retains a labeled bounded fallback: %s', async (raw) => {
    const zhipuProvider = { ...provider(), chat: vi.fn(async () => { if (raw === 'timeout') throw new Error('synthetic timeout'); return raw }) }
    const result = await service.createAssistantService({ products, zhipuProvider }).answer({ query: '月光粉底液怎么样', profile: { skin: '油皮', budget: 1 } })
    expect(zhipuProvider.chat).toHaveBeenCalledOnce()
    expect(result.answerMode).toBe('local')
    expect(result.answer).toContain('已降级')
    expect(result.answer).toContain('[[PRODUCT:b]]')
    expect(result.answer).not.toContain('[[PRODUCT:invented]]')
  })
  it.each(['气垫怎么用', '口红怎么涂', '我用粉底总起皮', '粉底色号怎么选'])('audit: routes the task, not just catalog nouns: %s', (query) => {
    expect(router.intentRouter(query, products)).toBe('beauty_knowledge')
  })
  it('asks for a route after a beauty request and answers a selected male brow route from the research knowledge base', async () => {
    const api = service.createAssistantService({ products, zhipuProvider: { ...provider(), configured: false } })
    const query = '我想学男生日常自然修饰'
    const first = await api.answer({ query, messages: [{ role: 'assistant', content: '先说说需求', id: 'welcome' }] })
    expect(first.answerMode).toBe('clarification')
    expect(first.guidedQuestion).toMatchObject({ step: 1, initialQuery: query })
    expect(first.guidedQuestion.options.map(({ value }) => value)).toEqual(expect.arrayContaining([
      'natural_refinement', 'daily_makeup', 'neutral_makeup', 'route-direct',
    ]))

    const second = await api.answer({ query: 'route-men', messages: [
      { role: 'user', content: query }, { role: 'assistant', content: first.answer, question: first.guidedQuestion },
    ] })
    expect(second.guidedQuestion).toMatchObject({ step: 2, route: 'men', initialQuery: query })

    const third = await api.answer({ query: 'focus-men-brow', messages: [
      { role: 'user', content: query }, { role: 'assistant', content: second.answer, question: second.guidedQuestion },
    ] })
    expect(third.guidedQuestion).toMatchObject({ step: 3, route: 'men' })

    const result = await api.answer({ query: 'finish-natural', messages: [
      { role: 'user', content: query }, { role: 'assistant', content: third.answer, question: third.guidedQuestion },
    ] })
    expect(result.intent).toBe('beauty_knowledge')
    expect(result.answer).toContain('用眉刷梳开眉毛')
    expect(result.sources.some((source) => source.url.includes('charlottetilbury.com'))).toBe(true)
    expect(result.answer).toContain('停止使用并咨询合格专业人员')
    expect(result.guidedQuestion).toBeUndefined()
  })
  it('continues with catalog candidates after the user explicitly skips skin intake', async () => {
    const api = service.createAssistantService({ products: products.map((product) => ({ ...product, category: '粉底液' })), zhipuProvider: { ...provider(), configured: false } })
    const query = '我想选底妆，但不清楚自己的肤质'
    const first = await api.answer({ query, profile: { skin: '油皮' }, messages: [{ id: 'welcome', role: 'assistant', content: '先说需求' }] })
    expect(first.guidedQuestion).toBeDefined()
    const result = await api.answer({ query: '直接推荐吧', profile: { skin: '油皮' }, messages: [
      { id: 'welcome', role: 'assistant', content: '先说需求' }, { role: 'user', content: query },
      { role: 'assistant', content: first.answer, question: first.guidedQuestion },
    ] })
    expect(result.intent).toBe('catalog_recommendation')
    expect(result.answer).toContain('[[PRODUCT:b]]')
    expect(result.answer).toContain('本次没有按肤质筛选')
    expect(result.answer).not.toContain('先告诉我你的肤质')
    expect(result.answer).toContain('[[PRODUCT:a]]')
  })

  it('uses a supplied daily skin description as a request-only hard filter', async () => {
    const fixture = [
      ['dry', ['干皮']], ['mixed-dry', ['混干皮']], ['oily', ['油皮']],
      ['mixed-oily', ['混油皮']], ['unrelated', ['敏感肌']],
    ].map(([id, skins]) => ({ ...products[0], id, name: `合成底妆-${id}`, category: '粉底液', skins, price: 100, recommendationReady: true }))
    const api = service.createAssistantService({ products: fixture, zhipuProvider: { ...provider(), configured: false } })
    const result = await api.answer({ query: '我想选底妆，T区容易出油、两颊偏干', profile: { skin: '油皮' }, messages: [{ id: 'welcome', role: 'assistant', content: '先说需求' }] })
    const ids = [...result.answer.matchAll(/\[\[PRODUCT:([^\]]+)\]\]/g)].map((match) => match[1])
    expect(result.intent).toBe('catalog_recommendation')
    expect(result.answer).not.toContain('请先告诉我你的肤质')
    expect(result.answer).toContain('本次按你提供的日常感受')
    expect(ids).toEqual(['mixed-dry', 'mixed-oily'])
  })

  it('does not invent a match when no product metadata matches the selected daily skin feeling', async () => {
    const onlyOily = [{ ...products[0], id: 'only-oily', name: '合成油皮底妆', category: '粉底液', skins: ['油皮'], price: 100, recommendationReady: true }]
    const api = service.createAssistantService({ products: onlyOily, zhipuProvider: { ...provider(), configured: false } })
    const result = await api.answer({ query: '我想选底妆，T区容易出油、两颊偏干', messages: [{ id: 'welcome', role: 'assistant', content: '先说需求' }] })
    expect(result.answer).toContain('没有找到适用肤质记录与“混合倾向”相符')
    expect(result.answer).not.toContain('[[PRODUCT:')
    expect(result.answer).not.toContain('先告诉我你的肤质')
  })

  it('uses an existing daily description without asking again and ignores a one-off flake as a skin type', async () => {
    const api = service.createAssistantService({ products, zhipuProvider: { ...provider(), configured: false } })
    const described = '我想选底妆，T区容易出油、两颊偏干'
    const result = await api.answer({ query: described, messages: [{ id: 'welcome', role: 'assistant', content: '先说需求' }] })
    expect(result.guidedQuestion).toBeUndefined()
    expect(result.answer).toContain('本次按你提供的日常感受')
    expect(result.answer).toContain('混合倾向')

    const occasional = '我想选底妆，偶尔起皮'
    const next = await api.answer({ query: occasional, messages: [{ id: 'welcome', role: 'assistant', content: '先说需求' }] })
    expect(next.guidedQuestion).toBeDefined()
    expect(next.intent).toBe('clarification')
  })

  it('does not ask about sex for safety-sensitive skin discomfort', async () => {
    const api = service.createAssistantService({ products, zhipuProvider: { ...provider(), configured: false } })
    const result = await api.answer({ query: '我皮肤红肿刺痛，怎么上妆？', messages: [{ role: 'assistant', id: 'welcome', content: '先说说需求' }] })
    expect(result.guidedQuestion).toBeUndefined()
    expect(result.intent).toBe('unsupported_sensitive')
    expect(result.answer).toMatch(/停止使用|咨询合格专业人员/)
  })
  it('can recommend a brow category from catalog facts without requiring a base-skin profile', async () => {
    const brow = { ...products[0], id: 'brow', name: '自然眉笔', category: '眉妆', skins: [], price: 60 }
    const api = service.createAssistantService({ products: [...products, brow], zhipuProvider: { ...provider(), configured: false } })
    const result = await api.answer({ query: '给我推荐一支男士眉笔' })
    expect(result.intent).toBe('catalog_recommendation')
    expect(result.answer).toContain('[[PRODUCT:brow]]')
    expect(result.answer).not.toContain('先告诉我你的肤质')
  })
  it('recognizes eyebrow and contour item recommendations as catalog tasks', () => {
    expect(router.intentRouter('推荐适合男生的眉粉', products)).toBe('catalog_recommendation')
    expect(router.intentRouter('推荐一款修容粉', products)).toBe('catalog_recommendation')
  })
  it('keeps a male eyebrow product request on the verified catalog path after the user chooses that route', async () => {
    const brow = { ...products[0], id: 'brow', name: '自然眉笔', category: '眉妆', skins: [], price: 60 }
    const api = service.createAssistantService({ products: [...products, brow], zhipuProvider: { ...provider(), configured: false } })
    const query = '推荐适合男生的眉粉'
    const result = await api.answer({ query, messages: [{ id: 'welcome', role: 'assistant', content: '先说需求' }] })
    expect(result.intent).toBe('catalog_recommendation')
    expect(result.answer).toContain('[[PRODUCT:brow]]')
  })
  it.each(['给我推荐电脑', '我想买手机', '推荐一款打印机'])('audit: keeps external shopping out of the catalog: %s', (query) => {
    expect(router.intentRouter(query, products)).toBe('external_question')
  })
  it.each(['多少钱', '适合干皮吗', '有几个色号', '持妆多久'])('audit: resolves an omitted product in a direct follow-up: %s', async (query) => {
    const api = service.createAssistantService({ products, zhipuProvider: { ...provider(), configured: false } })
    const result = await api.answer({ query, messages: [{ role: 'assistant', content: '合成概览', productIds: ['b'] }] })
    expect(result.intent).toBe('product_fact')
    expect(result.answerMode).not.toBe('clarification')
    expect(result.answer).toContain('[[PRODUCT:b]]')
  })
  it('audit: retains the original question after choosing a clarification candidate', async () => {
    const zhipuProvider = provider()
    const api = service.createAssistantService({ products, zhipuProvider })
    const first = await api.answer({ query: '合成品牌多少钱' })
    zhipuProvider.search.mockResolvedValue([{ title: '合成来源', url: 'https://example.test/source', publisher: '测试', accessedAt: '2026-11-21T00:00:00.000Z', content: '仅测试' }])
    await api.answer({ query: '第二款', messages: [{ role: 'user', content: '合成品牌多少钱' }, { role: 'assistant', content: first.answer, productIds: ['a', 'b'] }] })
    expect(zhipuProvider.search).toHaveBeenCalledOnce()
    expect(zhipuProvider.search.mock.calls[0][0]).toContain('月光粉底液')
    expect(zhipuProvider.search.mock.calls[0][0]).toContain('多少钱')
  })
  it('audit: uses request skin and spending limits without rewriting the saved profile', async () => {
    const profile = { skin: '油皮', budget: 1000 }
    const request = await parameters.extractParameters('推荐适合干皮、不超过600元的粉底液', profile, products)
    expect(request.profile).toEqual(profile)
    expect(request.recommendation).toMatchObject({ skin: '干皮', budget: 600 })
    const api = service.createAssistantService({ products, zhipuProvider: provider() })
    const result = await api.answer({ query: '推荐适合干皮、不超过600元的粉底液', profile })
    expect(result.answer).toContain('[[PRODUCT:b]]')
    expect(result.answer).not.toContain('[[PRODUCT:a]]')
  })
  it('audit: enforces brand and embedded price limits for recommendations', async () => {
    const catalog = [...products, { ...products[1], id: 'c', brand: '另一品牌', price: 200 }]
    const api = service.createAssistantService({ products: catalog, zhipuProvider: provider() })
    const result = await api.answer({ query: '推荐一款不超过300元的合成品牌粉底液', profile: { skin: '干皮', budget: 1000 } })
    expect(result.intent).toBe('catalog_recommendation')
    expect(result.answer).toContain('没有同时满足')
    expect(result.answer).not.toContain('[[PRODUCT:')
  })
  it.each([['月光粉底液持妆多久', /持妆.*8.*小时/], ['月光粉底液有哪些色号', /色号.*(?:缺少|无法|未知)/]])('audit: answers the requested field or declares it missing: %s', async (query, expected) => {
    const result = await service.createAssistantService({ products, zhipuProvider: provider() }).answer({ query })
    expect(result.answer).toMatch(expected)
  })
  it.each(['气垫这事我还没弄明白', '再展开说说', '想聊聊上脸的小门道', '帮我看看那个情况'])('routes unmatched wording directly to a natural model reply: %s', async (query) => {
    const zhipuProvider = { ...provider(), chat: vi.fn(async () => '合成的针对性回答。') }
    expect(router.intentRouter(query, products)).toBe('external_question')
    const result = await service.createAssistantService({ products, zhipuProvider }).answer({ query })
    expect(result).toMatchObject({ intent: 'external_question', answerMode: 'model', answer: '合成的针对性回答。' })
    expect(zhipuProvider.chat).toHaveBeenCalledOnce()
    expect(zhipuProvider.search).not.toHaveBeenCalled()
  })
  it('audit: does not mistake words in a product name for a request about those fields', async () => {
    const result = await service.createAssistantService({ products, zhipuProvider: { ...provider(), configured: false } }).answer({ query: '星光气垫（哑光）怎么样' })
    expect(result.answer).toMatch(/品类.*：气垫/)
    expect(result.answer).toMatch(/适合肤质.*：油皮/)
  })
  it('narrows a brand by the explicitly requested category without applying profile filters', async () => {
    const api = service.createAssistantService({ products, zhipuProvider: { ...provider(), configured: false } })
    const result = await api.answer({ query: '合成品牌粉底液怎么样', profile: { skin: '油皮', budget: 1 } })
    expect(result.answerMode).not.toBe('clarification')
    expect(result.answer).toContain('月光粉底液')
    expect(result.answer).toContain('[[PRODUCT:b]]')
    expect(result.answer).not.toContain('[[PRODUCT:a]]')
    expect(result.answer).not.toContain('替换芯')
  })

  it.each(['都可以', '都看看', '粉底液那款', '第二款'])('continues a product clarification when the user says %s', async (query) => {
    const zhipuProvider = { ...provider(), configured: false }
    const api = service.createAssistantService({ products, zhipuProvider })
    const clarification = await api.answer({ query: '合成品牌怎么样' })
    const result = await api.answer({ query, profile: { budget: 1 }, messages: [
      { role: 'user', content: '合成品牌怎么样' },
      { role: 'assistant', content: clarification.answer.replace(/\[\[PRODUCT:[^\]]+\]\]/g, ''), productIds: [...clarification.answer.matchAll(/\[\[PRODUCT:([^\]]+)\]\]/g)].map((match) => match[1]) },
    ] })
    expect(result.answerMode).not.toBe('clarification')
    expect(result.answer).toContain('[[PRODUCT:b]]')
    expect(result.answer.includes('[[PRODUCT:a]]')).toBe(query.startsWith('都'))
    expect(result.answer).not.toContain('请补充具体需求')
    expect(zhipuProvider.chat).not.toHaveBeenCalled()
  })

  it('recognizes the choices in the previous controlled clarification even before IDs were attached', async () => {
    const api = service.createAssistantService({ products, zhipuProvider: { ...provider(), configured: false } })
    const result = await api.answer({ query: '都可以', messages: [
      { role: 'user', content: '合成品牌怎么样' },
      { role: 'assistant', content: '还不能唯一确定你指的是哪款。请补充完整名称或版本：合成品牌 星光气垫（哑光）；合成品牌 月光粉底液。', productIds: [] },
    ] })
    expect(result.answerMode).not.toBe('clarification')
    expect(result.answer).toContain('[[PRODUCT:a]]')
    expect(result.answer).toContain('[[PRODUCT:b]]')
  })

  it('does not expand brand/category queries to another category when there is no match', () => {
    expect(resolver.resolveProducts('合成品牌眼影怎么样', products).products).toEqual([])
  })

  it('does not revive a previous product clarification after an unrelated answer', async () => {
    const api = service.createAssistantService({ products, zhipuProvider: { ...provider(), configured: false } })
    const result = await api.answer({ query: '都可以', messages: [
      { role: 'assistant', content: '候选', productIds: ['a', 'b'] },
      { role: 'user', content: '解释一下光的折射' },
      { role: 'assistant', content: '合成通用回答', productIds: [] },
    ] })
    expect(result.answerMode).toBe('clarification')
    expect(result.answer).not.toContain('[[PRODUCT:')
  })

  it('keeps multiple products of the same category ambiguous and accepts all three explicit choices', async () => {
    const catalog = [...products, { ...products[1], id: 'c', name: '晨光粉底液' }, { ...products[1], id: 'd', name: '暮光粉底液' }]
    const zhipuProvider = provider()
    const api = service.createAssistantService({ products: catalog, zhipuProvider })
    const first = await api.answer({ query: '合成品牌粉底液怎么样' })
    expect(first.answerMode).toBe('clarification')
    expect(first.answer).not.toContain('[[PRODUCT:a]]')
    const result = await api.answer({ query: '都看看', messages: [{ role: 'assistant', content: first.answer, productIds: ['b', 'c', 'd'] }] })
    expect(result.intent).toBe('product_comparison')
    expect([...result.answer.matchAll(/\[\[PRODUCT:([^\]]+)\]\]/g)].map((match) => match[1])).toEqual(['b', 'c', 'd'])
    const selected = await api.answer({ query: '第三款', messages: [{ role: 'assistant', content: first.answer, productIds: ['b', 'c', 'd'] }] })
    expect(selected.answer).toContain('[[PRODUCT:d]]')
    expect(selected.answer).not.toContain('[[PRODUCT:b]]')
    expect(zhipuProvider.chat).toHaveBeenCalledTimes(2)
    expect(zhipuProvider.chat.mock.calls.every(([messages]) => !messages[0].content.includes('仅分类'))).toBe(true)
  })

  it('does not silently select the first three products of an oversized clarification', async () => {
    const catalog = [...products, { ...products[1], id: 'c', name: '晨光粉底液' }, { ...products[1], id: 'd', name: '暮光粉底液' }]
    const api = service.createAssistantService({ products: catalog, zhipuProvider: provider() })
    const first = await api.answer({ query: '合成品牌怎么样' })
    expect(first.answer).not.toContain('[[PRODUCT:')
    const result = await api.answer({ query: '都看看', messages: [{ role: 'assistant', content: first.answer, productIds: [] }] })
    expect(result.answerMode).toBe('clarification')
    expect(result.answer).not.toContain('[[PRODUCT:')
  })

  it.each(['都可以', '都看看'])('asks for context for %s without invoking the classifier', async (query) => {
    const zhipuProvider = provider()
    const result = await service.createAssistantService({ products, zhipuProvider }).answer({ query })
    expect(result.answerMode).toBe('clarification')
    expect(result.answer).not.toContain('[[PRODUCT:')
    expect(zhipuProvider.chat).not.toHaveBeenCalled()
  })

  it.each(['眼影那款', '第三款', '第一款粉底液'])('clarifies an absent or contradictory selection: %s', async (query) => {
    const api = service.createAssistantService({ products, zhipuProvider: provider() })
    const result = await api.answer({ query, messages: [{ role: 'assistant', content: '合成比较', productIds: ['a', 'b'] }] })
    expect(result.answerMode).toBe('clarification')
  })
  it.each(['no-key', 'timeout', 'invalid-output'])('reports model unavailability when an unmatched knowledge request falls through: %s', async (failure) => {
    const zhipuProvider = { ...provider(), configured: failure !== 'no-key', chat: vi.fn(async () => {
      if (failure === 'timeout') throw new Error('synthetic timeout')
      return ''
    }) }
    await expect(service.createAssistantService({ products, zhipuProvider }).answer({ query: '磁性眼影的吸附原理是什么' }))
      .rejects.toMatchObject({ code: failure === 'no-key' ? 'PROVIDER_NOT_CONFIGURED' : 'ASSISTANT_UNAVAILABLE' })
    expect(zhipuProvider.chat).toHaveBeenCalledTimes(failure === 'no-key' ? 0 : 1)
    expect(zhipuProvider.search).not.toHaveBeenCalled()
  })
  it.each(['粉底怎么涂', '底妆出油怎么办', '粉底和气垫有什么区别', '气垫和粉底液有什么差别', '粉底和气垫有什么不同', '什么是底妆', '粉底色号怎么选'])('routes %s to knowledge, not recommendation', (query) => {
    expect(service.intentRouter(query, products)).toBe('beauty_knowledge')
  })
  it('clarifies a brand with multiple products before any tool call', async () => {
    const zhipuProvider = provider()
    const api = service.createAssistantService({ products, zhipuProvider })
    const result = await api.answer({ query: '合成品牌适合干皮吗', profile: {}, messages: [] })
    expect(result.answerMode).toBe('clarification')
    expect(result.answer).toContain('星光')
    expect(result.answer).toContain('月光')
    expect(zhipuProvider.chat).not.toHaveBeenCalled()
  })
  it('resolves the latter product in the recent comparison despite budget/skin filters', async () => {
    const zhipuProvider = provider()
    const api = service.createAssistantService({ products, zhipuProvider })
    const result = await api.answer({ query: '后一款适合干皮吗', profile: { skin: '油皮', budget: 1 }, messages: [
      { role: 'user', content: '比较星光气垫（哑光）和月光粉底液' },
      { role: 'assistant', content: '合成比较', productIds: ['a', 'b'] },
    ] })
    expect(result.answer).toContain('月光粉底液')
    expect(result.answer).toContain('[[PRODUCT:b]]')
    expect(result.answer).not.toContain('[[PRODUCT:a]]')
  })

  it('keeps comparison order rather than catalog order', async () => {
    const zhipuProvider = provider()
    const api = service.createAssistantService({ products, zhipuProvider })
    const result = await api.answer({ query: '比较月光粉底液和星光哑光气垫', messages: [], profile: { budget: 1 } })
    expect(result.intent).toBe('product_comparison')
    expect(result.answer.indexOf('[[PRODUCT:b]]')).toBeLessThan(result.answer.indexOf('[[PRODUCT:a]]'))
    expect(zhipuProvider.chat).toHaveBeenCalledOnce()
    expect(zhipuProvider.chat.mock.calls[0][0][0].content).not.toContain('仅分类')
  })

  it.each(['这个适合干皮吗', '上一款怎么样', '后一款'])('clarifies %s without recent product context', async (query) => {
    const zhipuProvider = provider()
    const result = await service.createAssistantService({ products, zhipuProvider }).answer({ query })
    expect(result.answerMode).toBe('clarification')
    expect(zhipuProvider.chat).not.toHaveBeenCalled()
  })

  it('does not revive stale references or trust user-supplied product metadata', () => {
    const messages = [{ role: 'assistant', content: '旧比较', productIds: ['a', 'b'] }, { role: 'assistant', content: '无关回答', productIds: [] }, { role: 'user', content: '这个', productIds: ['a'] }]
    expect(resolver.resolveProducts('上一款', products, messages).ambiguous).toBe(true)
    expect(resolver.resolveProducts('这个', products, [{ role: 'assistant', content: '合成', productIds: ['unknown'] }]).products).toEqual([])
  })

  it('keeps short names ambiguous until a version or brand distinguishes them', () => {
    const versions = [...products, { ...products[0], id: 'c', name: '星光气垫（水光）' }]
    expect(resolver.namedProducts('星光气垫', versions).map((p) => p.id)).toEqual(['a', 'c'])
    expect(resolver.namedProducts('星光哑光气垫', versions).map((p) => p.id)).toEqual(['a'])
    const duplicates = [{ ...products[0], name: '四色眼影盘', brand: '合成甲' }, { ...products[1], name: '四色眼影盘', brand: '合成乙' }]
    expect(resolver.namedProducts('合成乙四色眼影盘', duplicates).map((p) => p.id)).toEqual(['b'])
  })

  it('applies hard filters only to recommendations', async () => {
    const api = service.createAssistantService({ products, zhipuProvider: provider() })
    const recommend = await api.answer({ query: '我是干皮，预算100元，推荐粉底', profile: {} })
    expect(recommend.answer).toContain('没有同时满足')
    const fact = await api.answer({ query: '月光粉底液适合干皮吗', profile: { skin: '油皮', budget: 1 } })
    expect(fact.answer).toContain('[[PRODUCT:b]]')
    expect(fact.intent).toBe('product_fact')
    const negative = await api.answer({ query: '推荐不哑光的气垫', profile: { skin: '油皮', budget: 400 } })
    expect(negative.answer).not.toContain('[[PRODUCT:a]]')
  })

  it('keeps request categories separate from saved self-reported preferences', async () => {
    const result = await parameters.extractParameters('这款哑光气垫适合干皮吗', { skin: '油皮', budget: 400 })
    expect(result.profile).toEqual({ skin: '油皮', budget: 400 })
    expect(result.recommendation.category).toBe('气垫')
  })

  it.each(['粉底怎么涂', '底妆出油怎么办'])('answers %s from controlled knowledge without a key', async (query) => {
    const zhipuProvider = { ...provider(), configured: false }
    const result = await service.createAssistantService({ products, zhipuProvider }).answer({ query })
    expect(result).toMatchObject({ intent: 'beauty_knowledge', answerMode: 'knowledge', model: null, usedWebSearch: false })
    expect(result.answer).not.toContain('[[PRODUCT:')
    expect(result.sources.length).toBeGreaterThan(0)
    expect(zhipuProvider.chat).not.toHaveBeenCalled()
  })

  it('reuses the plan service and validated input for chat plans', async () => {
    const create = vi.fn(async () => ({ title: '合成方案', summary: '仅测试', steps: [{ category: '底妆', technique: '薄涂' }], recommendedProductIds: ['a'], sourceMode: 'local' }))
    const result = await service.createAssistantService({ products, zhipuProvider: provider(), makeupPlanService: { create } }).answer({ query: '我是干皮，预算300元，完整妆容带妆10小时' })
    expect(create).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ userProfile: expect.objectContaining({ skinType: '干皮', budgetTotal: 300 }), makeupRequest: expect.objectContaining({ wearHours: 10, photoEnabled: false }) }))
    expect(result).toMatchObject({ intent: 'makeup_plan', answerMode: 'local' })
    expect(result.answer).toContain('已降级')
  })

  it.each(['', '[[PRODUCT:invented]]', null])('safely degrades malformed model answers %s', async (answer) => {
    const zhipuProvider = { ...provider(), chat: vi.fn(async () => answer) }
    const result = await service.createAssistantService({ products, zhipuProvider }).answer({ query: '粉底怎么涂' })
    expect(result.answerMode).toBe('knowledge')
    expect(result.answer).toContain('薄')
    expect(result.answer).not.toContain('[[PRODUCT:')
  })

  it('AI-R02 keeps stable packaging gaps local and rejects unqualified sources for current prices', async () => {
    const zhipuProvider = provider()
    const api = service.createAssistantService({ products, zhipuProvider })
    expect((await api.answer({ query: '星光哑光气垫15g含替换芯吗' })).answer).toContain('是否附替换芯目前未知')
    expect(zhipuProvider.search).not.toHaveBeenCalled()
    expect(zhipuProvider.chat).not.toHaveBeenCalled()
    zhipuProvider.search.mockResolvedValue([{ title: '合成来源', url: 'https://example.test/source', publisher: '测试', accessedAt: '2026-11-21T00:00:00.000Z', content: '仅测试，不代表产品事实' }])
    zhipuProvider.chat.mockRejectedValue(new Error('synthetic timeout'))
    const result = await api.answer({ query: '星光哑光气垫最新价格' })
    expect(result).toMatchObject({ answerMode: 'local', model: null, usedWebSearch: false })
    expect(result.answer).toContain('没有找到能确认同一版本信息的官方商品页')
    expect(result.sources.some((source) => source.url === 'https://example.test/source')).toBe(false)
    expect(zhipuProvider.chat).not.toHaveBeenCalled()
  })

  it('blocks sensitive requests before provider invocation', async () => {
    const zhipuProvider = provider()
    const result = await service.createAssistantService({ products, zhipuProvider }).answer({ query: '从照片判断年龄和种族' })
    expect(result.intent).toBe('unsupported_sensitive')
    expect(zhipuProvider.chat).not.toHaveBeenCalled()
    expect(zhipuProvider.search).not.toHaveBeenCalled()
  })
})
