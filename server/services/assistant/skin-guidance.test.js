import { describe, expect, it, vi } from 'vitest'
import service from '../assistant-service.cjs'
import { advanceGuidedIntake, beginGuidedIntake } from './guided-intake.cjs'
import { products as catalogProducts } from '../../../src/data/products.js'

const fixture = [
  ['mixed', '粉底液', ['干皮', '混干皮'], 150, '甲牌'], ['oily', '粉底液', ['油皮'], 120, '甲牌'],
  ['cushion', '气垫', ['干皮'], 180, '甲牌'], ['cushion-oily', '气垫', ['油皮'], 190, '甲牌'],
].map(([id, category, skins, price, brand]) => ({ id, category, skins, price, brand,
  name: `合成商品${id}`, finish: '柔雾', scenes: ['通勤'], shades: [], wear: 8, coverage: '中', recommendationReady: true }))

function conversation(profile = {}, configured = false) {
  const provider = { configured, chat: vi.fn(async () => { throw new Error('unexpected model call') }), search: vi.fn() }
  const api = service.createAssistantService({ products: fixture, zhipuProvider: provider,
    weatherProvider: { forecast: vi.fn(async () => { throw new Error('synthetic weather unavailable') }) } })
  const messages = [{ role: 'assistant', content: '先用一句话告诉我你想解决什么', id: 'welcome' }]
  return { messages, provider, async send(query) {
    const result = await api.answer({ query, messages: messages.slice(-8), profile })
    messages.push({ role: 'user', content: query }, { role: 'assistant', content: result.answer,
      question: result.guidedQuestion, beginnerContext: result.beginnerContext })
    return result
  } }
}

const productIds = (reply) => reply.coverage.flatMap((part) => part.productIds)

describe('YAS-2026-0065 answer-first 对话流程', () => {
  it('缺少肤质的底妆选品先询问日常感受，不提前给出产品', async () => {
    const flow = conversation()
    const result = await flow.send('想买一款通勤粉底，预算300，轻薄不显毛孔')
    expect(result.intent).toBe('clarification')
    expect(result.guidedQuestion.options.map(({ value }) => value)).toContain('skin-oily')
    expect(productIds(result)).toEqual([])
    expect(result.answer).toContain('继续选底妆')
    expect(result.answer).not.toContain('甲牌')
  })

  it('用户只说明性别时询问具体需求，不推断为底妆或商品推荐', async () => {
    const flow = conversation({}, true)
    const result = await flow.send('我是男生')
    expect(result.intent).toBe('clarification')
    expect(result.guidedQuestion).toBeUndefined()
    expect(productIds(result)).toEqual([])
    expect(result.answer).toContain('只知道性别还无法判断')
    expect(flow.provider.chat).not.toHaveBeenCalled()
  })

  it('性别回答不会结束肤质追问；自然表达补充肤质后继续原选品', async () => {
    const flow = conversation()
    const first = await flow.send('我是男生，想选粉底液，预算150元')
    expect(first.guidedQuestion.options.map(({ value }) => value)).toContain('skin-oily')
    const identity = await flow.send('我是男生')
    expect(identity.intent).toBe('clarification')
    expect(identity.guidedQuestion).toEqual(first.guidedQuestion)
    expect(productIds(identity)).toEqual([])

    const result = await flow.send('我的肤质偏干，偶尔长痘')
    expect(result.intent).toBe('catalog_recommendation')
    expect(result.guidedQuestion).toBeUndefined()
    expect(productIds(result)).toEqual(['mixed'])
    expect(result.answer).toContain('干性肤质')
    expect(result.answer).not.toContain('平时到下午')
  })

  it('识别“肤质的话是干皮，偶尔长痘”并直接继续底妆推荐', async () => {
    const flow = conversation()
    const first = await flow.send('推荐一款通勤粉底液，预算150元')
    expect(first.guidedQuestion).toBeDefined()

    const result = await flow.send('肤质的话是干皮，偶尔长痘')
    expect(result.intent).toBe('catalog_recommendation')
    expect(result.guidedQuestion).toBeUndefined()
    expect(productIds(result)).toEqual(['mixed'])
    expect(result.answer).toContain('干性肤质')
    expect(result.answer).not.toContain('平时到下午')
  })

  it('回答肤质时顺带追问推荐，不再重复肤质引导', async () => {
    const flow = conversation()
    const first = await flow.send('推荐一款通勤粉底液，预算150元')
    expect(first.guidedQuestion).toBeDefined()

    const result = await flow.send('肤质的话是干皮，偶尔长痘，有什么推荐')
    expect(result.intent).toBe('catalog_recommendation')
    expect(result.guidedQuestion).toBeUndefined()
    expect(productIds(result)).toEqual(['mixed'])
    expect(result.answer).toContain('干性肤质')
    expect(result.answer).not.toMatch(/哪里容易出油|换个好回想/)
  })

  it('截图场景：首轮已自述干皮，随后询问推荐时直接进入商品筛选', async () => {
    const provider = { configured: true, modelName: 'synthetic', chat: vi.fn(async () => '收到。'), search: vi.fn() }
    const api = service.createAssistantService({ products: fixture, zhipuProvider: provider,
      weatherProvider: { forecast: vi.fn() } })
    const messages = [{ role: 'assistant', content: '嗨，我是小Y。先告诉我你想解决什么。', id: 'welcome' }]
    const first = await api.answer({ query: '肤质的话是干皮，偶尔长痘', messages, profile: {} })
    expect(first.guidedQuestion).toBeUndefined()
    expect(first.intent).not.toBe('clarification')
    messages.push({ role: 'user', content: '肤质的话是干皮，偶尔长痘' }, { role: 'assistant', content: first.answer })

    const result = await api.answer({ query: '肤质的话是干皮，偶尔长痘，有什么推荐', messages, profile: {} })
    expect(result.intent).toBe('catalog_recommendation')
    expect(result.guidedQuestion).toBeUndefined()
    expect(productIds(result)).toEqual(expect.arrayContaining(['mixed', 'cushion']))
    expect(productIds(result)).not.toContain('oily')
    expect(productIds(result)).not.toContain('cushion-oily')
    expect(result.answer).not.toMatch(/哪里容易出油|换个好回想/)
  })

  it('真实站内目录：自述干皮后问有什么推荐，直接返回干皮候选商品', async () => {
    const provider = { configured: false, chat: vi.fn(), search: vi.fn() }
    const api = service.createAssistantService({ products: catalogProducts, zhipuProvider: provider,
      weatherProvider: { forecast: vi.fn() } })
    const result = await api.answer({ query: '肤质的话是干皮，偶尔长痘，有什么推荐',
      messages: [{ role: 'user', content: '肤质的话是干皮，偶尔长痘' }, { role: 'assistant', content: '收到。' }], profile: {} })
    const selected = catalogProducts.filter(({ id }) => productIds(result).includes(id))
    expect(result.intent).toBe('catalog_recommendation')
    expect(result.guidedQuestion).toBeUndefined()
    expect(selected.length).toBeGreaterThan(0)
    expect(selected.every(({ skins = [] }) => skins.includes('干皮'))).toBe(true)
    expect(result.answer).not.toMatch(/哪里容易出油|换个好回想/)
    expect(provider.chat).not.toHaveBeenCalled()
  })

  it('明确跳过肤质后按原品类和预算筛选并说明筛选限制', async () => {
    const flow = conversation()
    const first = await flow.send('推荐一款粉底液，预算150元')
    expect(first.guidedQuestion).toBeDefined()
    const result = await flow.send('直接推荐吧')
    expect(result.intent).toBe('catalog_recommendation')
    expect(result.guidedQuestion).toBeUndefined()
    expect(productIds(result)).toEqual(['mixed', 'oily'])
    expect(result.answer).toContain('本次没有按肤质筛选')
  })

  it('等待肤质时改问另一项底妆，会为新需求重新采集并保留新上下文', async () => {
    const flow = conversation()
    const first = await flow.send('怎么看肤质')
    expect(first.guidedQuestion).toBeDefined()
    const changed = await flow.send('换个问题，推荐通勤素颜霜')
    expect(changed.intent).toBe('clarification')
    expect(changed.guidedQuestion.initialQuery).toBe('换个问题，推荐通勤素颜霜')
    expect(productIds(changed)).toEqual([])
    expect(changed.answer).toContain('继续选底妆')
  })

  it('首轮已经明确要求跳过时不弹观察引导', async () => {
    const flow = conversation()
    const result = await flow.send('推荐通勤粉底，预算150元，直接推荐吧')
    expect(result.intent).toBe('catalog_recommendation')
    expect(result.guidedQuestion).toBeUndefined()
    expect(productIds(result)).toEqual(['mixed', 'oily'])
    expect(result.answer).toContain('本次没有按肤质筛选')
  })

  it.each(['不用再问了', '别继续问了', '直接给我建议', '先按这些条件回答', '你先说结论', '不清楚的地方你自己假设'])
    ('直接回答表达 %s 可以退出新手引导', async (query) => {
      const flow = conversation({}, query === '直接给我建议')
      flow.provider.chat.mockResolvedValue('可以围绕刚才想学日常化妆的需求继续，不需要重新选择路线。')
      const first = await flow.send('我想学日常化妆')
      expect(first.guidedQuestion).toBeDefined()
      const result = await flow.send(query)
      expect(result.guidedQuestion).toBeUndefined()
      expect(result.answer.length).toBeGreaterThan(20)
    })

  it('引导中的新产品问题立即重新路由为 product_comparison', async () => {
    const flow = conversation()
    const first = await flow.send('我想学日常化妆')
    expect(first.guidedQuestion).toBeDefined()
    const result = await flow.send('换个问题，帮我比较合成商品mixed和合成商品oily')
    expect(result.intent).toBe('product_comparison')
    expect(result.guidedQuestion).toBeUndefined()
    expect(productIds(result)).toEqual(['mixed', 'oily'])
  })

  it('卡粉问题优先走受控知识回答，不因“我想问的是”触发联网', async () => {
    const flow = conversation()
    const result = await flow.send('我想问的是，妆总是卡粉应该怎么办？')
    expect(result.intent).toBe('beauty_knowledge')
    expect(result.answerMode).toBe('knowledge')
    expect(result.usedWebSearch).toBe(false)
    expect(result.sources.some((source) => source.kind === 'knowledge')).toBe(true)
    expect(result.answer).toContain('少量开始')
  })

  it.each(['我想要自然修饰的妆容。', '我想学一套日常彩妆。'])
    ('明确的妆容方向 %s 不进入路线问卷', async (query) => {
      const flow = conversation()
      const result = await flow.send(query)
      expect(result.intent).toBe('makeup_plan')
      expect(result.guidedQuestion).toBeUndefined()
      expect(result.answer).not.toContain('无法理解')
      expect(result.dialogueDecision.routePreference).not.toBe('unspecified')
    })

  it('肤质引导中的新卡粉问题立即退出引导并重新路由', async () => {
    const flow = conversation()
    const first = await flow.send('怎么看肤质')
    expect(first.guidedQuestion).toBeDefined()
    const result = await flow.send('我想问的是，妆总是卡粉应该怎么办？')
    expect(result.intent).toBe('beauty_knowledge')
    expect(result.guidedQuestion).toBeUndefined()
    expect(result.answerMode).toBe('knowledge')
  })

  it('肤质引导每轮只问一个关键问题，不追问路线、性别或场景', async () => {
    const flow = conversation()
    const first = await flow.send('怎么看肤质')
    expect(first.guidedQuestion.options).toHaveLength(4)
    expect(first.guidedQuestion.options.map(({ label }) => label).join('')).not.toMatch(/男|女|场景/)
    const second = await flow.send('主要是额头和鼻子')
    expect(second.guidedQuestion.options).toHaveLength(4)
    expect(second.answer).toContain('两颊')
    const result = await flow.send('经常会')
    expect(result.guidedQuestion).toBeUndefined()
    expect(result.answer).toContain('混合肤质')
    expect(productIds(result)).toEqual([])
  })

  it('三种推荐方向使用统一值并进入对应方案', async () => {
    const initial = '我想学日常化妆'
    for (const [selection, label] of [['natural_refinement', '自然修饰'], ['daily_makeup', '日常彩妆'], ['neutral_makeup', '按需求搭配、不区分性别']]) {
      const first = beginGuidedIntake(initial, [{ id: 'welcome', role: 'assistant' }], 'beauty_knowledge')
      expect(first.question.options.map(({ value }) => value)).toContain(selection)
      const second = await advanceGuidedIntake(selection, [
        { role: 'user', content: initial }, { role: 'assistant', content: first.answer, question: first.question },
      ])
      expect(second.question.route).toBe(label === '自然修饰' ? 'men' : label === '日常彩妆' ? 'women' : 'general')
      const third = await advanceGuidedIntake('goal-daily', [
        { role: 'user', content: initial }, { role: 'assistant', content: first.answer, question: first.question },
        { role: 'user', content: selection }, { role: 'assistant', content: second.answer, question: second.question },
      ])
      const result = await advanceGuidedIntake('time-five', [
        { role: 'user', content: initial }, { role: 'assistant', content: first.answer, question: first.question },
        { role: 'user', content: selection }, { role: 'assistant', content: second.answer, question: second.question },
        { role: 'user', content: 'goal-daily' }, { role: 'assistant', content: third.answer, question: third.question },
      ])
      expect(result.promptContext).toContain(label)
    }
  })

  it('不主动询问或保存性别', async () => {
    const profile = {}
    const result = await conversation(profile).send('我是干皮，推荐一款通勤粉底，预算300')
    expect(result.answer).not.toMatch(/男生|女生|男性|女性/)
    expect(profile).not.toHaveProperty('gender')
    expect(result.dialogueDecision.routePreference).toBe('unspecified')
  })

  it('最近总觉得妆很脏不触发联网，最新价格和明天天气仍保留联网入口', async () => {
    const provider = { configured: false, chat: vi.fn(), search: vi.fn() }
    const api = service.createAssistantService({ products: fixture, zhipuProvider: provider,
      weatherProvider: { forecast: vi.fn(async () => { throw new Error('weather unavailable') }) } })
    const knowledge = await api.answer({ query: '最近总觉得妆很脏，可能是什么原因' })
    expect(knowledge.intent).toBe('beauty_knowledge')
    expect(provider.search).not.toHaveBeenCalled()
    expect(service.needsOnlineResearch('最新粉底价格', 'external_research')).toBe(true)
    expect(service.needsOnlineResearch('明天上海天气', 'external_question')).toBe(true)
  })

  it('无模型配置时真实降级，不伪装成 AI 成功回答', async () => {
    const flow = conversation({}, false)
    const result = await flow.send('推荐一款通勤粉底，预算300')
    expect(result.answerMode).toBe('clarification')
    expect(result.guidedQuestion).toBeDefined()
    expect(productIds(result)).toEqual([])
    expect(result.model).toBeNull()
    expect(flow.provider.chat).not.toHaveBeenCalled()
  })

  it('DialogueDecision 包含版本、问题编号、北京时间和来源分类', async () => {
    const result = await conversation().send('我是干皮，推荐一款通勤粉底，预算300')
    expect(result.dialogueDecision).toMatchObject({
      schemaVersion: 'xiaoy-dialogue-v2', issueId: 'YAS-2026-0065', flowVersion: 'answer-first-v1',
      timezone: 'Asia/Shanghai', intent: 'catalog_recommendation',
    })
    expect(Number.isNaN(Date.parse(result.dialogueDecision.createdAt))).toBe(false)
    expect(result.dialogueDecision.sources.map(({ kind }) => kind)).toEqual(expect.arrayContaining(['user', 'catalog']))
  })

  it('安全不适会立即中断引导并停止推荐', async () => {
    const flow = conversation()
    await flow.send('我想学日常化妆')
    const result = await flow.send('现在脸红，还刺痛')
    expect(result.intent).toBe('unsupported_sensitive')
    expect(result.answer).toMatch(/停止使用.*咨询合格专业人员/)
    expect(result.guidedQuestion).toBeUndefined()
    expect(productIds(result)).toEqual([])
  })
})
