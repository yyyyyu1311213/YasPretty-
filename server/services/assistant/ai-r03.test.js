import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import appModule from '../../app.cjs'
import knowledge from '../../knowledge/beauty-knowledge.cjs'
import evaluation from './evaluation-ai-r03.cjs'
import planModule from '../makeup-plan-service.cjs'

const config = { nodeEnv: 'test', host: '127.0.0.1', port: 0, zhipuApiKey: '', zhipuModel: 'synthetic', zhipuMaxTokens: 4096,
  upstreamTimeoutMs: 1000, apiRateLimitMax: 1000, aiRateLimitMax: 1000, aiDailyLimit: 10000, trustProxy: false }
const provider = () => ({ configured: false, modelName: 'synthetic', chat: vi.fn(async () => { throw Error('synthetic unavailable') }), search: vi.fn(async () => { throw Error('synthetic unavailable') }) })
async function app(zhipu = provider()) {
  return appModule.buildApp({ config, logger: false, providers: { zhipu, weather: { configured: false, forecast: vi.fn(async () => { throw Error('synthetic unavailable') }) } } })
}
const ask = (server, query, extras = {}) => server.inject({ method: 'POST', url: '/api/assistant', payload: { query, ...extras } })

describe('AI-R03 actual API evaluation', () => {
  it('records fixed regression and untouched holdout dimensions separately', async () => {
    const zhipu = provider(), server = await app(zhipu)
    const rows = []
    try {
      for (const [group, samples] of [['regression', evaluation.regression], ['promoted-regression', evaluation.promoted], ['holdout', evaluation.holdout]]) {
        for (const sample of samples) {
          const start = performance.now()
          const response = await ask(server, sample.query)
          const latencyMs = performance.now() - start
          const result = response.json()
          const coverage = result.coverage || []
          const ids = coverage.flatMap((item) => item.knowledgeIds)
          const productIds = coverage.flatMap((item) => item.productIds)
          const dimensions = {
            route: JSON.stringify(coverage.map((item) => item.intent)) === JSON.stringify(sample.intents),
            product: sample.products ? JSON.stringify([...new Set(productIds)].sort()) === JSON.stringify([...sample.products].sort()) : null,
            evidence: sample.knowledge || sample.noKnowledge ? (sample.knowledge || []).every((id) => ids.includes(id)) && (!sample.noKnowledge || ids.length === 0) : null,
            omission: coverage.length === sample.intents.length,
            unknownFabrication: !/(?:能用|可用)\s*\d+\s*天|999元|\[\[PRODUCT:invented\]\]/.test(result.answer || ''),
            fallback: sample.contains ? sample.contains.every((text) => result.answer?.includes(text)) : null,
          }
          // Expected no-provider external failure is explicitly unavailable, never a successful answer.
          if (response.statusCode === 503 && sample.intents.length === 1 && sample.intents[0] === 'external_question') {
            dimensions.route = dimensions.omission = null // Error response exposes no intent/coverage; do not score it as a correct route.
            dimensions.fallback = result.error?.code === 'PROVIDER_NOT_CONFIGURED'
          }
          rows.push({ id: sample.id, group, query: sample.query, provider: 'synthetic-no-key', latencyMs, calls: { chat: zhipu.chat.mock.calls.length, search: zhipu.search.mock.calls.length }, dimensions, statusCode: response.statusCode, result })
          zhipu.chat.mockClear(); zhipu.search.mockClear()
        }
      }
      const output = process.env.YAS_AI_R03_EVAL_OUTPUT || '.qa/ai-r03/evaluation-latest.json'
      fs.mkdirSync(path.dirname(output), { recursive: true })
      fs.writeFileSync(output, JSON.stringify({ at: new Date().toISOString(), methodology: evaluation.methodology,
        assessmentLimits: 'null为该样本未设目标或HTTP错误不暴露该维度，不能记通过；未知事实检查只是天数/999元/虚构ID的有限断言，不能证明所有语义。', realProvider: 'not-authorized-not-run', rows }, null, 2))
      // Holdout results are reported honestly and never tuned to force this assertion green.
      expect(rows.filter((row) => row.group !== 'holdout' && Object.values(row.dimensions).some((ok) => ok === false)).map(({ id, dimensions }) => ({ id, dimensions }))).toEqual([])
      expect(rows.every((row) => row.dimensions.unknownFabrication)).toBe(true)
    } finally { await server.close() }
  })

  it('retains all supported knowledge sections when model organization omits or invents content', async () => {
    const zhipu = { ...provider(), configured: true, chat: vi.fn(async () => JSON.stringify({ sections: [{ id: 'skin-reaction-safety', techniques: ['持续使用保证有效'] }] })) }
    const server = await app(zhipu)
    try {
      const result = (await ask(server, '底妆起皮怎么办')).json()
      expect(result.answerMode).toBe('knowledge')
      expect(result.answer).toContain('停止使用')
      expect(result.answer).toContain('专业人员')
      expect(result.answer).not.toContain('持续使用保证有效')
      expect(zhipu.chat).toHaveBeenCalledOnce()
    } finally { await server.close() }
  })

  it('accepts complete extractive model organization and retains every limitation', async () => {
    const entries = knowledge.retrieveKnowledge('粉底怎么涂', 'beauty_knowledge')
    const zhipu = { ...provider(), configured: true, chat: vi.fn(async () => JSON.stringify({ sections: entries.map((entry) => ({ id: entry.id, techniques: entry.techniques })) })) }
    const server = await app(zhipu)
    try {
      const result = (await ask(server, '粉底怎么涂')).json()
      expect(result.answerMode).toBe('model')
      for (const entry of entries) for (const limitation of entry.limitations) expect(result.answer).toContain(limitation)
      expect(zhipu.chat).toHaveBeenCalledOnce()
    } finally { await server.close() }
  })

  it('keeps failed live evidence separate from answered knowledge and renumbers product citations', async () => {
    const zhipu = { ...provider(), configured: true }
    const server = await app(zhipu)
    try {
      const result = (await ask(server, '粉底怎么涂；NEO 小方块气垫（哑光）净含量是多少；小金盒高光修容盘最新价格是多少')).json()
      expect(result.intent).toBe('compound')
      expect(result.coverage.map((item) => item.status)).toEqual(['answered', 'answered', 'partial'])
      expect(result.answer).toContain('仍缺少的信息')
      expect(result.answer).toContain('15g')
      expect(zhipu.search).toHaveBeenCalledOnce()
      const factSource = result.sources.findIndex((source) => source.productId === 'laneige-neo-matte') + 1
      expect(result.answer).toContain(`15g[${factSource}]`)
    } finally { await server.close() }
  })

  it('bounds subquestions and calls while listing unprocessed questions', async () => {
    const zhipu = { ...provider(), configured: true }
    const server = await app(zhipu)
    try {
      const result = (await ask(server, Array.from({ length: 9 }, (_, i) => `解释最近第${i + 1}项新闻`).join('；'))).json()
      expect(result.coverage).toHaveLength(7)
      expect(result.answer).toContain('尚未处理的问题')
      expect(zhipu.search.mock.calls.length).toBeLessThanOrEqual(3)
      expect(zhipu.chat.mock.calls.length).toBeLessThanOrEqual(4)
    } finally { await server.close() }
  })

  it('does not treat timeless knowledge as evidence for a timely question', async () => {
    const zhipu = { ...provider(), configured: true, search: vi.fn(async () => []) }
    const server = await app(zhipu)
    try {
      const result = (await ask(server, '今年最新的粉底上妆技巧是什么；粉底怎么涂')).json()
      expect(result.coverage.map((item) => item.status)).toEqual(['unavailable', 'answered'])
      expect(zhipu.search).toHaveBeenCalledOnce()
      expect(result.answer).toContain('尚未取得可用证据')
    } finally { await server.close() }
  })

  it('maps a timely search citation to its actual source after merging with knowledge', async () => {
    const zhipu = { ...provider(), configured: true,
      search: vi.fn(async () => [{ title: '合成趋势证据', url: 'https://example.test/ai-r03-trend', publisher: '合成测试', accessedAt: '2026-11-21T00:00:00.000Z', content: '合成趋势说明，仅测试。' }]),
      chat: vi.fn(async (messages) => messages[0].content.startsWith('按问题组织') ? 'invalid' : '合成趋势说明。[1]') }
    const server = await app(zhipu)
    try {
      const result = (await ask(server, '粉底怎么涂；今年最新的粉底上妆技巧是什么')).json()
      const number = result.sources.findIndex((source) => source.url === 'https://example.test/ai-r03-trend') + 1
      expect(result.answer).toContain(`合成趋势说明。[${number}]`)
      expect(zhipu.chat.mock.calls[1][0][0].content).not.toContain('受控知识库资料开始')
    } finally { await server.close() }
  })

  it('keeps skin discomfort across subquestions without telling the user to continue applying makeup', async () => {
    const server = await app()
    try {
      const result = (await ask(server, '脸上有破损怎么办；遮瑕怎么用；给我完整妆容方案')).json()
      expect(result.coverage.map((item) => item.status)).toEqual(['answered', 'unavailable', 'unavailable'])
      expect(result.answer).toContain('停止使用并咨询合格专业人员')
      expect(result.answer).not.toContain('先用薄底妆')
      expect(result.answer).not.toContain('先在较小区域试用')
    } finally { await server.close() }
  })

  it('does not resolve a product pronoun across an unrelated subquestion', async () => {
    const server = await app()
    try {
      const result = (await ask(server, 'NEO 小方块气垫（哑光）净含量是多少；粉底怎么涂；它的规格是多少')).json()
      expect(result.coverage.at(-1).status).toBe('clarification')
      expect(result.coverage.at(-1).productIds).toEqual([])
    } finally { await server.close() }
  })

  it('marks oversized external sections incomplete instead of breaking the whole compound response', async () => {
    const zhipu = { ...provider(), configured: true, chat: vi.fn(async () => '合成一般说明。'.repeat(450)) }
    const server = await app(zhipu)
    try {
      const response = await ask(server, '解释量子纠缠；解释引力；解释声波；解释电磁波；解释热传导；解释光合作用')
      expect(response.statusCode).toBe(200)
      expect(response.json().answer).toContain('超过本轮回答预算')
      expect(response.json().coverage.every((item) => item.status === 'unavailable')).toBe(true)
      expect(zhipu.chat).toHaveBeenCalledTimes(4)
    } finally { await server.close() }
  })
})

describe('AI-R03 plan API knowledge reuse', () => {
  it.each(['no-key', 'invalid-json', 'timeout'])('keeps hard candidates, knowledge evidence and bounded repair: %s', async (mode) => {
    const zhipu = { ...provider(), configured: mode !== 'no-key', chat: vi.fn(async () => { if (mode === 'timeout') throw Error('synthetic timeout'); return 'bad JSON' }) }
    const server = await app(zhipu)
    try {
      const input = { userProfile: { skinType: '油皮', budgetTotal: 1, excludedBrands: ['NARS'] }, makeupRequest: { style: '清透', scene: '通勤' } }
      const response = await server.inject({ method: 'POST', url: '/api/makeup-plans', payload: input })
      expect(response.statusCode).toBe(200)
      const plan = response.json().plan
      expect(plan.sourceMode).toBe('local')
      expect(plan.recommendedProductIds).toEqual([])
      expect(plan.steps.every((step) => step.primaryProductId === null && step.alternativeProductIds.length === 0)).toBe(true)
      expect(plan.knowledgeEvidence.map((entry) => entry.id)).toContain('oily-skin-base-and-setting')
      expect(plan.steps.find((step) => step.id === 'base').technique).toContain('分区')
      expect(zhipu.chat).toHaveBeenCalledTimes(mode === 'invalid-json' ? 2 : mode === 'timeout' ? 1 : 0)
      if (mode !== 'no-key') expect(zhipu.chat.mock.calls[0][0][0].content).toContain('受控知识库资料开始')
    } finally { await server.close() }
  })

  it('reattaches trusted technique evidence after one structure repair', async () => {
    const draft = planModule.buildLocalPlan(planModule.selectCandidates({}, {}, []))
    const { title, summary, externalContextSummary, steps, recommendedProductIds, confidence, limitations } = draft
    const valid = { title, summary, externalContextSummary, steps, recommendedProductIds, confidence, limitations }
    const zhipu = { ...provider(), configured: true, chat: vi.fn().mockResolvedValueOnce('bad JSON').mockResolvedValueOnce(JSON.stringify(valid)) }
    const server = await app(zhipu)
    try {
      const response = await server.inject({ method: 'POST', url: '/api/makeup-plans', payload: {} })
      expect(response.statusCode).toBe(200)
      expect(response.json().plan.sourceMode).toBe('model')
      expect(response.json().plan.knowledgeEvidence.length).toBeGreaterThan(0)
      expect(zhipu.chat).toHaveBeenCalledTimes(2)
    } finally { await server.close() }
  })
})
