import { describe, expect, it } from 'vitest'
const { advanceGuidedIntake, beginGuidedIntake, shouldBeginGuidedIntake } = require('./guided-intake.cjs')

const initial = '我想学男生日常自然修饰'
const answerWith = (question) => ({ role: 'assistant', content: '请继续选择。', question })

describe('小Y首次需求后的点选引导', () => {
  it('does not show a module before the user describes a beauty need', () => {
    expect(beginGuidedIntake('', [{ id: 'welcome', role: 'assistant', content: '先说说需求' }], 'beauty_knowledge')).toBeNull()
    expect(beginGuidedIntake(initial, [{ role: 'assistant', content: '嗨，我是小Y。先用一句话告诉我你想解决什么；我会结合需求继续引导。' }], 'beauty_knowledge'))
      .toMatchObject({ kind: 'ask', question: { step: 1 } })
    expect(shouldBeginGuidedIntake('今天上海天气怎么样', [{ id: 'welcome', role: 'assistant' }], 'external_question')).toBe(false)
    expect(shouldBeginGuidedIntake('我想学怎么遮痘，皮肤还红肿刺痛', [{ id: 'welcome', role: 'assistant' }], 'unsupported_sensitive')).toBe(false)
  })

  it('retains the first request, asks the route after it, and finishes in at most three rounds', () => {
    const first = beginGuidedIntake(initial, [{ id: 'welcome', role: 'assistant' }], 'beauty_knowledge')
    expect(first).toMatchObject({ kind: 'ask', question: { step: 1, initialQuery: initial } })

    const second = advanceGuidedIntake('route-men', [
      { role: 'user', content: initial }, answerWith(first.question),
    ])
    expect(second).toMatchObject({ kind: 'ask', question: { step: 2, route: 'men', initialQuery: initial } })

    const third = advanceGuidedIntake('focus-men-brow', [
      { role: 'user', content: initial }, answerWith(second.question),
    ])
    expect(third).toMatchObject({ kind: 'ask', question: { step: 3, route: 'men', initialQuery: initial } })

    const result = advanceGuidedIntake('finish-natural', [
      { role: 'user', content: initial }, answerWith(third.question),
    ])
    expect(result).toMatchObject({ kind: 'knowledge', route: 'men', query: initial })
    expect(result.knowledgeQuery).toContain('眉毛')
    expect(result.promptContext).toContain('用户本次主动选择的建议路线：男生自然修饰')
  })

  it('asks only about the missing self-reported condition and lets an unknown answer continue', () => {
    const original = '我想选底妆，但不清楚自己的肤质'
    const first = beginGuidedIntake(original, [{ id: 'welcome', role: 'assistant' }], 'beauty_knowledge')
    const second = advanceGuidedIntake('route-women', [
      { role: 'user', content: original }, answerWith(first.question),
    ])
    expect(second).toMatchObject({ kind: 'ask', question: { step: 2, route: 'women' } })
    const result = advanceGuidedIntake('skin-unknown', [
      { role: 'user', content: original }, answerWith(second.question),
    ])
    expect(result).toMatchObject({ kind: 'continue', route: 'women', query: original })
    expect(result.promptContext).toContain('肤质暂不确定')
  })

  it('offers one focus choice when several complexion questions are unknown, within the three-round cap', () => {
    const original = '我想做日常底妆，但不清楚肤质、肤色深浅和冷暖'
    const first = beginGuidedIntake(original, [{ id: 'welcome', role: 'assistant' }], 'beauty_knowledge')
    const second = advanceGuidedIntake('route-general', [
      { role: 'user', content: original }, answerWith(first.question),
    ])
    expect(second.question.step).toBe(2)
    expect(second.question.options.map(({ value }) => value)).toContain('focus-undertone')
    const third = advanceGuidedIntake('focus-undertone', [
      { role: 'user', content: original }, answerWith(second.question),
    ])
    expect(third.question.step).toBe(3)
    const result = advanceGuidedIntake('undertone-warm', [
      { role: 'user', content: original }, answerWith(third.question),
    ])
    expect(result.kind).toBe('knowledge')
    expect(result.promptContext).toContain('偏暖倾向')
  })
})
