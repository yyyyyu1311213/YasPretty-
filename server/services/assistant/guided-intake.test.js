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

  it('retains the first request, asks the route after it, and finishes in at most three rounds', async () => {
    const first = beginGuidedIntake(initial, [{ id: 'welcome', role: 'assistant' }], 'beauty_knowledge')
    expect(first).toMatchObject({ kind: 'ask', question: { step: 1, initialQuery: initial } })
    expect(first.question.options.map(({ value }) => value)).toEqual(expect.arrayContaining([
      'natural_refinement', 'daily_makeup', 'neutral_makeup', 'route-direct',
    ]))

    const second = await advanceGuidedIntake('route-men', [
      { role: 'user', content: initial }, answerWith(first.question),
    ])
    expect(second).toMatchObject({ kind: 'ask', question: { step: 2, route: 'men', initialQuery: initial } })

    const third = await advanceGuidedIntake('focus-men-brow', [
      { role: 'user', content: initial }, answerWith(second.question),
    ])
    expect(third).toMatchObject({ kind: 'ask', question: { step: 3, route: 'men', initialQuery: initial } })

    const result = await advanceGuidedIntake('finish-natural', [
      { role: 'user', content: initial }, answerWith(third.question),
    ])
    expect(result).toMatchObject({ kind: 'beginner', route: 'men', query: expect.stringContaining(initial) })
    expect(result.promptContext).toContain('自然修饰路线')
  })

  it('does not force a route or skin questionnaire for a complete foundation request', async () => {
    const original = '我想选底妆，但不清楚自己的肤质'
    expect(beginGuidedIntake(original, [{ id: 'welcome', role: 'assistant' }], 'catalog_recommendation')).toBeNull()
    expect(shouldBeginGuidedIntake(original, [{ id: 'welcome', role: 'assistant' }], 'catalog_recommendation')).toBe(false)
  })

  it('does not turn multiple missing complexion details into a mandatory survey', async () => {
    const original = '我想做日常底妆，但不清楚肤质、肤色深浅和冷暖'
    expect(beginGuidedIntake(original, [{ id: 'welcome', role: 'assistant' }], 'catalog_recommendation')).toBeNull()
    expect(shouldBeginGuidedIntake(original, [{ id: 'welcome', role: 'assistant' }], 'catalog_recommendation')).toBe(false)
  })
})
