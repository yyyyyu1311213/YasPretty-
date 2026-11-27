import { describe, expect, it, vi } from 'vitest'
import { products } from '../../../src/data/products.js'
const { createAssistantService, intentRouter } = require('../assistant-service.cjs')
const { assistantRequestSchema } = require('../../schemas.cjs')
const { extractGuidedParameters } = require('./parameters.cjs')
const { createMakeupPlanService } = require('../makeup-plan-service.cjs')

function conversation(profile = {}, provider = { configured: false }, extra = {}) {
  const api = createAssistantService({ products, zhipuProvider: provider, ...extra })
  const messages = [{ role: 'assistant', content: '嗨，我是小Y。先用一句话告诉我你想解决什么；我会继续引导。' }]
  return { messages, async turn(query) {
    const input = assistantRequestSchema.parse({ query, messages: messages.slice(-8), profile })
    const result = await api.answer(input)
    messages.push({ role: 'user', content: query }, { role: 'assistant', content: result.answer,
      ...(result.beginnerContext ? { beginnerContext: result.beginnerContext } : {}),
      ...(result.guidedQuestion ? { question: result.guidedQuestion } : {}) })
    return result
  } }
}
const finished = (result) => {
  expect(result.guidedQuestion).toBeUndefined()
  expect(result.answer).not.toMatch(/我还不确定你的意思|请补充具体需求|没有足够相关|好的，已了解/)
  expect(result.knowledgeEvidence.length).toBeGreaterThan(0)
}

describe('路线选择承接入门需求', () => {
  it.each(['route-women', 'route-men', 'route-general'])('continues after base advice without repeating intake on %s', async (route) => {
    const chat = conversation()
    await chat.turn('我想化妆，预算400元，不要NARS')
    await chat.turn(route)
    const base = await chat.turn('goal-base')
    expect(base.beginnerContext.lastStep).toBe('base')
    for (const [query, step, phrase] of [['然后呢', 'brow', '短而轻的笔触'], ['接下来呢', 'color', '唇颊'],
      ['下一步', 'finish', '定妆收尾'], ['继续', 'done', '已经讲完'], ['然后呢', 'done', '已经讲完']]) {
      const result = await chat.turn(query)
      finished(result)
      expect(result.beginnerContext).toMatchObject({ lastStep: step, route: route.slice(6), initialQuery: '我想化妆，预算400元，不要NARS' })
      expect(result.answer).toContain(phrase)
      expect(result.answer).toContain('预算400元以内')
      expect(result.answer).toContain('排除NARS')
    }
  })

  it('keeps the five-minute limit but permits optional next steps', async () => {
    const chat = conversation()
    await chat.turn('我想化妆')
    await chat.turn('route-women')
    await chat.turn('goal-daily')
    await chat.turn('time-five')
    const result = await chat.turn('然后呢')
    expect(result.beginnerContext.lastStep).toBe('color')
    expect(result.answer).toContain('5分钟以内')
    expect(result.coverage[0].status).toBe('partial')
    expect(result.answer).toContain('不补造具体画法')
  })

  it.each(['底妆已经画完了，下一步呢', '底妆结束后还有接下来的步骤呀'])('understands the completed-step follow-up %s', async (query) => {
    const chat = conversation()
    await chat.turn('我想化妆')
    await chat.turn('route-men')
    await chat.turn('goal-base')
    expect((await chat.turn(query)).beginnerContext.lastStep).toBe('brow')
  })

  it('corrects one condition without advancing or losing the rest', async () => {
    const chat = conversation()
    await chat.turn('我想化妆，我是干皮，预算500元，想要哑光，用于面试，不要NARS')
    await chat.turn('route-general')
    await chat.turn('底妆怎么上')
    await chat.turn('然后呢')
    const corrected = await chat.turn('预算改为300元')
    expect(corrected.beginnerContext.lastStep).toBe('brow')
    for (const word of ['预算300元以内', '面试', '干皮', '哑光', '排除NARS']) expect(corrected.answer).toContain(word)
    expect(corrected.answer).not.toContain('预算500')
    expect((await chat.turn('然后呢')).beginnerContext.lastStep).toBe('color')
  })

  it.each([false, true])('recovers a legacy answer with no progress metadata, old ambiguous reply=%s', async (ambiguous) => {
    const chat = conversation()
    await chat.turn('我想化妆')
    await chat.turn('route-men')
    await chat.turn('goal-base')
    delete chat.messages.at(-1).beginnerContext
    if (ambiguous) chat.messages.push({ role: 'user', content: '然后呢' }, { role: 'assistant', content: '我还不确定你的意思。请补充具体需求。' })
    const result = await chat.turn('然后呢')
    finished(result)
    expect(result.beginnerContext).toMatchObject({ route: 'men', lastStep: 'brow' })
  })

  it('retains earlier corrections after the raw update history is bounded', async () => {
    const chat = conversation()
    await chat.turn('我想化妆，预算500元')
    await chat.turn('route-general')
    await chat.turn('goal-base')
    for (const query of ['预算改为300元', '我是干皮', '妆效改为哑光', '场景改为面试', '每天10分钟', '时间改为5分钟']) await chat.turn(query)
    const result = await chat.turn('然后呢')
    expect(result.beginnerContext.updates.length).toBeLessThanOrEqual(4)
    expect(result.answer).toContain('预算300元以内')
    expect(result.answer).not.toContain('预算500')
    expect(result.answer).toContain('干皮')
    expect(result.answer).toContain('面试')
    expect(result.answer).toContain('哑光')
    expect(result.answer).toContain('5分钟以内')
  })

  it.each(['换个话题，粉底和气垫有什么区别', '你好', '现在脸上红肿刺痛'])('does not revive progress after %s', async (query) => {
    const chat = conversation()
    await chat.turn('我想化妆')
    await chat.turn('route-women')
    await chat.turn('goal-base')
    const result = await chat.turn(query)
    expect(result.beginnerContext).toBeUndefined()
    expect((await chat.turn('然后呢')).beginnerContext).toBeUndefined()
  })

  it('rejects unbounded or unknown progress fields at the API boundary', () => {
    const context = { version: 1, initialQuery: '我想化妆', route: 'women', goal: 'goal-base', time: null, updates: [], lastStep: 'base' }
    const input = (beginnerContext) => ({ query: '然后呢', messages: [{ role: 'assistant', content: '底妆建议', beginnerContext }] })
    expect(assistantRequestSchema.safeParse(input(context)).success).toBe(true)
    for (const invalid of [{ ...context, lastStep: 'anything' }, { ...context, version: 2 },
      { ...context, initialQuery: 'x'.repeat(1001) }, { ...context, updates: Array(5).fill('修正') }, { ...context, extra: true }]) {
      expect(assistantRequestSchema.safeParse(input(invalid)).success).toBe(false)
    }
  })
  it.each(['我想化妆', '我不会化妆', '想学化妆', '男生怎么化妆'])('recognizes %s before any model classification', (query) => {
    expect(intentRouter(query, products)).toBe('beauty_knowledge')
  })

  it.each(['route-women', 'route-men', 'route-general'])('continues %s through goal and time to actual advice', async (route) => {
    const profile = { budget: 300, skin: '油皮' }
    const provider = { configured: true, chat: vi.fn(), search: vi.fn() }
    const chat = conversation(profile, provider)
    const first = await chat.turn('我想化妆')
    const second = await chat.turn(route)
    expect(second.guidedQuestion).toMatchObject({ step: 2, initialQuery: '我想化妆', route: route.slice(6) })
    expect(second.answer).toContain('最想学什么')
    const third = await chat.turn('goal-daily')
    expect(third.guidedQuestion.step).toBe(3)
    const result = await chat.turn('time-five')
    finished(result)
    expect(result.answer).toMatch(/5分钟以内.*薄底妆和眉毛/s)
    expect(result.answer).toContain('少量开始分区铺开')
    expect(result.answer).toContain('用眉刷梳开眉毛')
    expect(result.answer.includes('胡茬')).toBe(route === 'route-men')
    expect(first.guidedQuestion.initialQuery).toBe('我想化妆')
    expect(profile).toEqual({ budget: 300, skin: '油皮' })
    expect(provider.chat).not.toHaveBeenCalled()
    expect(provider.search).not.toHaveBeenCalled()
  })

  it.each(['我不会化妆', '想学化妆'])('does not fall back to ambiguity after the women route for %s', async (query) => {
    const chat = conversation()
    await chat.turn(query)
    expect((await chat.turn('route-women')).guidedQuestion.options[0].value).toBe('goal-daily')
    await chat.turn('还没想好')
    finished(await chat.turn('跳过'))
  })

  it.each(['不知道', '跳过'])('does not loop on repeated %s', async (text) => {
    const chat = conversation()
    let result = await chat.turn('我想化妆')
    let choices = 0
    while (result.guidedQuestion && choices < 4) { result = await chat.turn(text); choices++ }
    expect(choices).toBeLessThanOrEqual(3)
    finished(result)
  })

  it.each([0, 1, 2])('exits directly at pending round %i', async (round) => {
    const chat = conversation()
    await chat.turn('我想化妆')
    if (round >= 1) await chat.turn('route-women')
    if (round >= 2) await chat.turn('goal-daily')
    finished(await chat.turn('先按原问题直接回答'))
  })

  it('keeps foundation purchasing and known conditions after route/direct answer', async () => {
    const chat = conversation()
    const result = await chat.turn('推荐个粉底，预算400元，不要NARS')
    expect(result.guidedQuestion).toBeUndefined()
    expect(result.intent).toBe('catalog_recommendation')
    expect(result.answer).toContain('你没有提供肤质')
    const ids = [...result.answer.matchAll(/\[\[PRODUCT:([^\]]+)\]\]/g)].map((match) => match[1])
    expect(ids).toContain('mac-studio-fix')
    expect(result.answer).not.toContain('没有找到符合当前条件的站内产品')
  })

  it('uses the existing skin observation for a foundation request without asking a goal', async () => {
    const chat = conversation()
    const result = await chat.turn('推荐个粉底')
    expect(result.guidedQuestion).toBeUndefined()
    expect(result.intent).toBe('catalog_recommendation')
    expect(result.answer).toContain('没有提供肤质')
  })

  it.each(['route-women', 'route-men', 'route-general'])('answers a known brow goal immediately on %s', async (route) => {
    const chat = conversation()
    await chat.turn('眉毛怎么画自然')
    const result = await chat.turn(route)
    finished(result)
    expect(result.answer).toContain('短而轻的笔触')
  })

  it('retains the interview scene and skips both goal and scene questions', async () => {
    const chat = conversation()
    await chat.turn('明天面试怎么化')
    const next = await chat.turn('route-women')
    expect(next.guidedQuestion?.options[0].value).toBe('time-five')
    const result = await chat.turn('time-five')
    finished(result)
    expect(result.answer).toContain('面试场景')
  })

  it('answers immediately when goal and time are already supplied', async () => {
    const chat = conversation()
    await chat.turn('我想学简单日常化妆，每天5分钟以内')
    finished(await chat.turn('route-general'))
  })

  it('keeps an explicitly known skin type without treating it as a separate observation task', async () => {
    const chat = conversation()
    await chat.turn('我不会化妆，我的肤质是油皮')
    const result = await chat.turn('route-women')
    expect(result.guidedQuestion.options[0].value).toBe('goal-daily')
    await chat.turn('goal-daily')
    expect((await chat.turn('time-five')).answer).toContain('油皮')
  })

  it('uses the requested interview scene over a previously saved scene', async () => {
    const chat = conversation({ scene: '约会' })
    await chat.turn('明天面试怎么化，只有5分钟')
    const result = await chat.turn('route-general')
    finished(result)
    expect(result.answer).toContain('面试场景')
    expect(result.answer).not.toContain('约会场景')
  })

  it('accepts free goal/time answers and changes the actual practice for ten minutes', async () => {
    const chat = conversation()
    await chat.turn('我想化妆')
    await chat.turn('route-women')
    await chat.turn('想学简单日常入门')
    const result = await chat.turn('每天十分钟左右')
    finished(result)
    expect(result.answer).toContain('10分钟左右')
    expect(result.answer).toContain('局部遮瑕')
  })

  it('replaces the corrected budget only, preserving initial question, route and other constraints', async () => {
    const original = '我想化妆，我是干皮，预算500元，想要哑光，用于面试，不要NARS'
    const chat = conversation()
    await chat.turn(original)
    await chat.turn('route-women')
    const time = await chat.turn('简单日常入门，预算改成300元')
    expect(time.guidedQuestion).toMatchObject({ initialQuery: original, route: 'women' })
    const result = await chat.turn('time-five')
    finished(result)
    expect(result.answer).toContain('预算300元以内')
    expect(result.answer).not.toContain('预算500')
    for (const word of ['干皮', '哑光', '面试', '排除NARS']) expect(result.answer).toContain(word)
  })

  it('can change the goal during the time question without starting a new intake', async () => {
    const chat = conversation()
    await chat.turn('我想化妆')
    await chat.turn('route-general')
    await chat.turn('goal-daily')
    const result = await chat.turn('改学眉毛怎么画自然')
    finished(result)
    expect(result.answer).toContain('短而轻的笔触')
    expect(result.answer).not.toContain('5分钟')
  })

  it('stops the old flow on a topic change and never restores it from older history', async () => {
    const chat = conversation()
    await chat.turn('我想化妆')
    await chat.turn('route-women')
    const result = await chat.turn('换个话题，粉底和气垫有什么区别')
    finished(result)
    expect(result.answer).toContain('包装')
    const followup = await chat.turn('你好')
    expect(followup.guidedQuestion).toBeUndefined()
    expect(followup.intent).toBe('greeting_help')
  })

  it('states the specific eye/lip knowledge gap and still supplies supported advice', async () => {
    const chat = conversation()
    await chat.turn('我想化妆')
    await chat.turn('route-women')
    const result = await chat.turn('goal-eye-lip')
    finished(result)
    expect(result.coverage[0].status).toBe('partial')
    expect(result.answer).toContain('眼线、眼影分区')
    expect(result.answer).toContain('边缘柔和')
  })

  it('preserves brand exclusion in the existing complete-plan service', async () => {
    const provider = { configured: false }
    const real = createMakeupPlanService({ products, zhipuProvider: provider })
    const create = vi.fn((input) => real.create(input))
    const chat = conversation({}, provider, { makeupPlanService: { create } })
    await chat.turn('我想化妆，预算600元，不要NARS')
    await chat.turn('route-men')
    const result = await chat.turn('goal-full')
    expect(result.guidedQuestion).toBeUndefined()
    expect(create.mock.calls[0][0].userProfile).toMatchObject({ budgetTotal: 600, excludedBrands: ['NARS'] })
    expect(create.mock.calls[0][0].makeupRequest.style).toContain('自然修饰')
  })

  it.each(['现在红肿刺痛', '脸上破损了'])('prioritizes safety during pending intake: %s', async (text) => {
    const chat = conversation()
    await chat.turn('我想化妆')
    await chat.turn('route-women')
    const result = await chat.turn(text)
    expect(result.guidedQuestion).toBeUndefined()
    expect(result.answer).toContain('停止使用')
    expect(result.answer).not.toContain('薄底妆和眉毛')
  })

  it('merges only stated request conditions across follow-ups', async () => {
    const result = await extractGuidedParameters('我想化妆，我是干皮，预算500元，想要哑光，用于面试，不要NARS',
      ['预算改为300元', '我是油皮', '改为通勤，想要水光'], {}, products)
    expect(result.recommendation).toMatchObject({ budget: 300, skin: '油皮', scene: '通勤', finish: '自然光泽', excludedBrands: ['NARS'] })
  })

  it('keeps a budget correction made during a foundation route and the subsequent skin observations', async () => {
    const chat = conversation()
    const original = '推荐个粉底，预算500元，不要NARS'
    const initial = await chat.turn(original)
    expect(initial.guidedQuestion).toBeUndefined()
    const corrected = await chat.turn('预算改为400元')
    expect(corrected.guidedQuestion).toBeUndefined()
    const result = corrected
    const ids = [...result.answer.matchAll(/\[\[PRODUCT:([^\]]+)\]\]/g)].map((match) => match[1])
    expect(ids.length).toBeGreaterThan(0)
    expect(ids.every((id) => { const p = products.find((item) => item.id === id); return p.price <= 400 && p.brand !== 'NARS' })).toBe(true)
  })

  it('does not erase known skin when directly answering the original purchasing request', async () => {
    const chat = conversation()
    await chat.turn('我是干皮，推荐个粉底，预算500元')
    const result = await chat.turn('先按原问题直接回答')
    expect(result.guidedQuestion).toBeUndefined()
    expect(result.answer).not.toContain('没有按肤质筛选')
  })
})
