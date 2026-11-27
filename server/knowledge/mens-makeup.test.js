import { describe, expect, it, vi } from 'vitest'
import knowledge from './beauty-knowledge.cjs'
import newEntries from './mens-makeup-entries.cjs'
import planKnowledge from './plan-knowledge.cjs'
import appModule from '../app.cjs'
import planModule from '../services/makeup-plan-service.cjs'
import parameters from '../services/assistant/parameters.cjs'
import router from '../services/assistant/intent-router.cjs'
import guided from '../services/assistant/guided-intake.cjs'
import responseModule from '../services/assistant/response.cjs'

const config = { nodeEnv: 'test', host: '127.0.0.1', port: 0, zhipuApiKey: '', zhipuModel: 'synthetic', zhipuMaxTokens: 4096,
  upstreamTimeoutMs: 1000, apiRateLimitMax: 1000, aiRateLimitMax: 1000, aiDailyLimit: 10000, trustProxy: false }
const provider = (mode = 'none') => ({ configured: mode !== 'none', modelName: 'synthetic', search: vi.fn(),
  chat: vi.fn(async (messages) => {
    if (mode === 'timeout') throw new Error('synthetic timeout')
    if (mode === 'invented') return JSON.stringify({ sections: [{ id: 'mens-natural-brows', techniques: ['眉毛必须按黄金比例画，某商品百分百有效。'] }] })
    const selected = knowledge.retrieveKnowledge(messages.at(-1).content, 'beauty_knowledge')
    return JSON.stringify({ sections: selected.map(({ id, techniques }) => ({ id, techniques })) })
  }),
})

describe('男生妆容受控知识接入', () => {
  it.each([
    ['男士底妆怎么涂', 'mens-natural-base'], ['男性眉型怎么画', 'mens-natural-brows'],
    ['男生修容教程', 'mens-subtle-contour'], ['男士化妆入门', 'mens-natural-routine'],
    ['男生皮肤厚所以更耐受吗', 'mens-skin-variation'], ['刮胡子后上妆', 'shaving-and-makeup'],
    ['化妆刷多久洗', 'makeup-hygiene'], ['男生化妆有什么科学证据', 'mens-makeup-evidence'],
    ['黄金比例可靠吗', 'face-proportions-boundary'], ['自拍鼻子大怎么回事', 'selfie-perspective-boundary'],
  ])('recalls practical or research evidence for %s', (query, id) => {
    expect(knowledge.retrieveKnowledge(query, 'beauty_knowledge')[0]?.id).toBe(id)
    expect(router.intentRouter(query)).toBe('beauty_knowledge')
  })

  it('keeps citations, complete boundaries and budgets; excludes unrelated/product-time requests', () => {
    const originalNeed = '男生化妆，我希望面部干净、眉毛有型、五官立体'
    expect(knowledge.retrieveKnowledge(originalNeed).map((e) => e.id)).toContain('mens-natural-routine')
    expect(knowledge.retrieveKnowledge('帮我整理男生皮肤和五官的专业资料').map((e) => e.id)).toEqual(expect.arrayContaining(['mens-skin-variation', 'face-proportions-boundary']))
    for (const entry of newEntries) {
      const refs = knowledge.knowledgeEvidence([entry])[0].sources
      expect(refs.length).toBeGreaterThan(0)
      expect(refs.every((s) => s.url.startsWith('https://') && s.publisher && s.accessedAt && s.supports.length)).toBe(true)
      expect(entry.suggestedProductIds).toBeUndefined()
      const answer = knowledge.localKnowledgeAnswer([entry])
      for (const text of [...entry.limitations, ...entry.safetyBoundaries]) expect(answer).toContain(text)
    }
    const selected = knowledge.retrieveKnowledge('男生眉毛怎么画，男生修容教程', 'beauty_knowledge', { maxChars: 1600 })
    expect(selected.reduce((n, e) => n + knowledge.entryContext(e).length + 2, 0)).toBeLessThanOrEqual(1600)
    expect(knowledge.retrieveKnowledge('男士旅游攻略')).toEqual([])
    expect(router.needsOnlineResearch('男士眉笔最新价格')).toBe(true)
    expect(new Set(knowledge.referenceSites.map((s) => s.id)).size).toBe(knowledge.referenceSites.length)
  })

  it('does not turn an explicit absence of shaving injury into current discomfort', () => {
    expect(router.intentRouter('剃须后没有破损，可以怎么上底妆')).toBe('beauty_knowledge')
    expect(router.hasSkinDiscomfort('没有红肿、刺痛，也没出血')).toBe(false)
    expect(router.hasSkinDiscomfort('没有红肿，但刮破出血了')).toBe(true)
    expect(router.hasSkinDiscomfort('还没有停止出血')).toBe(true)
  })

  it.each(['none', 'valid', 'invented', 'timeout'])('real API retains steps and source limitations with provider %s', async (mode) => {
    const zhipu = provider(mode)
    const app = await appModule.buildApp({ config, logger: false, providers: { zhipu, weather: { configured: false } } })
    try {
      const response = await app.inject({ method: 'POST', url: '/api/assistant', payload: { query: '男生眉毛怎么画' } })
      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.answerMode).toBe(mode === 'valid' ? 'model' : 'knowledge')
      expect(body.answer).toContain('短而轻的笔触')
      expect(body.answer).toContain('不必购买教程中的整套商品')
      expect(body.answer).not.toContain('百分百有效')
      expect(body.answer).not.toContain('[[PRODUCT:')
      expect(body.sources.some((s) => s.url.endsWith('/brow-tutorial-for-men'))).toBe(true)
      expect(body.knowledgeEvidence.find((e) => e.id === 'mens-natural-brows').sources.some((s) => s.supports.join('').includes('商业品牌教程'))).toBe(true)
      expect(zhipu.search).not.toHaveBeenCalled()
    } finally { await app.close() }
  })

  it.each(['剃须刮破了，男生修容怎么画', '刮胡子出血，帮我推荐遮瑕', '脸上渗液，帮我生成完整妆容'])('pauses makeup before routing: %s', async (query) => {
    const zhipu = provider('valid')
    const app = await appModule.buildApp({ config, logger: false, providers: { zhipu, weather: { configured: false } } })
    try {
      const response = await app.inject({ method: 'POST', url: '/api/assistant', payload: { query } })
      expect(response.statusCode).toBe(200)
      expect(response.json().intent).toBe('unsupported_sensitive')
      expect(response.json().answer).toContain('暂不提供继续上妆或产品推荐')
      expect(response.json().answer).not.toContain('[[PRODUCT:')
      expect(zhipu.chat).not.toHaveBeenCalled()
    } finally { await app.close() }
  })

  it('base tutorial focus preserves the question without turning it into a skin questionnaire', async () => {
    const initialQuery = '我想学化妆'
    const question = guided.makeQuestion(2, 'men', ['route-men'], [{ label: '底妆', value: 'focus-men-base' }], initialQuery)
    const result = await guided.advanceGuidedIntake('focus-men-base', [{ role: 'assistant', content: '选择重点', question }])
    expect(result.kind).toBe('knowledge')
    expect(result.knowledgeQuery).toContain(initialQuery)
    expect(knowledge.retrieveKnowledge(result.knowledgeQuery)[0].id).toBe('foundation-application-basics')
  })

  it('explicit neutral route reaches a full plan without inferring gender', async () => {
    const input = parameters.planInput('自然修饰妆容方案', {}, { routePreference: 'natural_refinement' })
    expect(input.userProfile).not.toHaveProperty('gender')
    expect(parameters.planInput('女生自然妆容方案', {}).makeupRequest.style).toBe('自然')
    expect(parameters.planInput('不要男生路线，生成妆容方案', {}).makeupRequest.style).toBe('自然')
    const plan = await planModule.createMakeupPlanService({ products: [], zhipuProvider: { configured: false } }).create(input)
    expect(plan.steps).toHaveLength(7)
    expect(plan.steps.find((s) => s.id === 'eyes-brows').technique).toContain('轻轻填补空隙')
    expect(plan.steps.find((s) => s.id === 'contour')).toBeUndefined()
    expect(plan.knowledgeEvidence.map((e) => e.id)).toEqual(expect.arrayContaining(['foundation-application-basics', 'quick-everyday-makeup']))
    expect(plan.candidateEvidence).toEqual([])
    const text = responseModule.planAnswer(plan)
    for (const entry of plan.knowledgeEvidence) for (const boundary of [...entry.limitations, ...entry.safetyBoundaries]) expect(text).toContain(boundary)
    const draft = Object.fromEntries(['title', 'summary', 'externalContextSummary', 'steps', 'recommendedProductIds', 'confidence', 'limitations'].map((key) => [key, plan[key]]))
    const modelPlan = await planModule.createMakeupPlanService({ products: [], zhipuProvider: { configured: true, chat: async () => JSON.stringify(draft) } }).create(input)
    expect(modelPlan.sourceMode).toBe('model')
    expect(modelPlan.steps).toHaveLength(7)
    expect(modelPlan.steps.find((s) => s.id === 'eyes-brows').technique).toContain('轻轻填补空隙')
    const selected = planKnowledge.selectPlanKnowledge(input.userProfile, input.makeupRequest)
    const before = { ...plan, candidateEvidence: [{ productId: 'synthetic', score: 42 }] }
    expect(planKnowledge.applyPlanKnowledge(before, selected).candidateEvidence).toBe(before.candidateEvidence)
    expect(planKnowledge.selectPlanKnowledge(input.userProfile, { style: '自然' }).some((s) => s.entry.id.startsWith('mens-'))).toBe(false)
  })
})
