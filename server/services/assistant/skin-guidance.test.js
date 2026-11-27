import { describe, expect, it, vi } from 'vitest'
import service from '../assistant-service.cjs'
import { advanceGuidedIntake, beginGuidedIntake } from './guided-intake.cjs'

const fixture = [
  ['mixed', '粉底液', ['混干皮'], 150, '甲牌'], ['oily', '粉底液', ['油皮'], 120, '甲牌'],
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
  it('完整粉底请求首轮直接回答，并提供不阻塞的妆容延伸', async () => {
    const flow = conversation()
    const result = await flow.send('想买一款通勤粉底，预算300，轻薄不显毛孔')
    expect(result.intent).toBe('catalog_recommendation')
    expect(result.guidedQuestion).toBeUndefined()
    expect(productIds(result).length).toBeGreaterThan(0)
    expect(result.answer).toContain('如果你还想搭配完整妆容')
    expect(result.answer).not.toMatch(/男生|女生|男性|女性/)
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
    const result = await conversation(profile).send('推荐一款通勤粉底，预算300')
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
    expect(result.answerMode).toBe('local')
    expect(result.answer).toContain('智能服务未配置')
    expect(result.model).toBeNull()
    expect(flow.provider.chat).not.toHaveBeenCalled()
  })

  it('DialogueDecision 包含版本、问题编号、北京时间和来源分类', async () => {
    const result = await conversation().send('推荐一款通勤粉底，预算300')
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
