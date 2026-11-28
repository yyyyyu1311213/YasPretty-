import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createRequire } from 'node:module'
import { performance } from 'node:perf_hooks'
import { useAssistant } from '../../src/features/assistant/hooks/useAssistant'
import { requestAssistant } from '../../src/features/assistant/assistantApi'
import { readVersioned } from '../../src/lib/storage/migrations'
import { MESSAGES_KEY, PROFILE_KEY, LEGACY_MESSAGES_KEY } from '../../src/lib/storage/storageKeys'
import { scenarios } from './xiaoy-scenarios.mjs'

// Both frontend ID filtering/local recommendation and backend use the SAME
// synthetic catalog. Otherwise the UI correctly rejects synthetic IDs as unknown.
const products = vi.hoisted(() => [
  { id: 'a', brand: '合成甲', name: '星光气垫', category: '气垫', skins: ['油皮'], finish: '哑光', price: 300 },
  { id: 'b', brand: '合成乙', name: '月光粉底液', category: '粉底液', skins: ['干皮'], finish: '自然光泽', price: 200 },
  { id: 'c', brand: '合成甲', name: '晨光粉底液', category: '粉底液', skins: ['干皮'], finish: '哑光', price: 100 },
].map((p) => ({ ...p, scenes: ['通勤', '面试'], shades: [], wear: 8, rating: 0, coverage: '中', recommendationReady: true })))
vi.mock('../../src/data/products', () => ({ products }))

// Reuses the lifecycle strategy of useAssistant.test.js. This is not a DOM test.
const lifecycle = vi.hoisted(() => ({ states: [], deps: [], effects: [], cursor: 0, dirty: false }))
vi.mock('react', async (original) => ({
  ...await original(),
  useState(initial) {
    const i = lifecycle.cursor++
    if (!(i in lifecycle.states)) lifecycle.states[i] = typeof initial === 'function' ? initial() : initial
    return [lifecycle.states[i], (value) => {
      const next = typeof value === 'function' ? value(lifecycle.states[i]) : value
      if (!Object.is(next, lifecycle.states[i])) lifecycle.dirty = true
      lifecycle.states[i] = next
    }]
  },
  useRef(initial) { const i = lifecycle.cursor++; return lifecycle.states[i] ||= { current: initial } },
  useMemo(create) { lifecycle.cursor++; return create() },
  useEffect(effect, deps) {
    const i = lifecycle.cursor++, old = lifecycle.deps[i]
    if (!old || deps.some((v, j) => v !== old[j])) lifecycle.effects.push(effect)
    lifecycle.deps[i] = deps
  },
}))
const require = createRequire(import.meta.url)
// Do not load private .env. All providers and config below are synthetic.
const dotenv = require('dotenv'), originalConfig = dotenv.config
dotenv.config = () => ({ parsed: {} })
const { buildApp } = require('../../server/app.cjs')
dotenv.config = originalConfig
const { extractParameters } = require('../../server/services/assistant/parameters.cjs')
const { retrieveKnowledge } = require('../../server/knowledge/beauty-knowledge.cjs')
const { answerKnowledge } = require('../../server/services/assistant/knowledge-answer.cjs')

let app, values, mode, calls, requests, active, release
const records = []
const round = (n) => Math.round(n * 1000) / 1000
function mount() { Object.assign(lifecycle, { states: [], deps: [], effects: [], cursor: 0, dirty: false }) }
function render() {
  for (let i = 0; i < 10; i++) {
    Object.assign(lifecycle, { cursor: 0, effects: [], dirty: false })
    const value = useAssistant()
    lifecycle.effects.forEach((effect) => effect())
    if (!lifecycle.dirty) return value
  }
  throw new Error('baseline harness render loop')
}
function start(id, title, profile = {}) {
  values.set(PROFILE_KEY, JSON.stringify({ version: 1, value: profile }))
  active = { id, title, initialContext: { profile, messages: [] }, turns: [], probes: {},
    level: '真实 Hook/API 适配/Fastify inject + 模拟 provider；不是浏览器或真实模型' }
  records.push(active)
}
async function turn(text, selectedValue = '', questionId = '') {
  const before = { requests: requests.length, calls: calls.length }, started = performance.now()
  await render().sendMessage(text, selectedValue, questionId)
  const state = render()
  const latest = state.messages.at(-1)
  const req = requests.slice(before.requests), used = calls.slice(before.calls)
  active.turns.push({ input: text, selectedValue, elapsedMs: round(performance.now() - started),
    profileAfter: state.profile, mode: state.mode, savedMessage: latest,
    requests: req, provider: { chat: used.filter((c) => c.kind === 'chat').length,
      search: used.filter((c) => c.kind === 'search').length, weather: used.filter((c) => c.kind === 'weather').length,
      elapsedMs: round(used.reduce((sum, c) => sum + c.elapsedMs, 0)), calls: used } })
  // Health of the recorder only. No assertion that the observed UX meets future goals.
  expect(latest?.content).toBeTypeOf('string')
  expect(state.busy).toBe(false)
  return latest
}
const measured = (kind, action) => async (...args) => {
  const started = performance.now()
  const prompt = kind === 'chat' ? args[0][0]?.content || '' : ''
  const call = { kind, input: kind === 'chat' ? args[0].at(-1)?.content : args[0],
    options: args[1] || {}, promptConstraints: kind === 'chat' ? {
      negativePreference: prompt.includes('硬限制'), eyelinerVariants: prompt.includes('不能再建议内眼线'),
      concise: prompt.includes('最多两个相关建议'), knowledge: prompt.startsWith('按问题组织受控手法'),
      historyCount: args[0].length - 2,
    } : undefined }
  calls.push(call)
  try { return await action(...args) } catch (error) { call.error = error.code || 'SYNTHETIC_FAILURE'; throw error }
  finally { call.elapsedMs = round(performance.now() - started) }
}
beforeEach(async () => {
  mount(); values = new Map(); mode = 'normal'; calls = []; requests = []; active = null; release = null
  vi.stubGlobal('navigator', { onLine: true })
  vi.stubGlobal('localStorage', { getItem: (k) => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: (k) => values.delete(k) })
  const provider = { get configured() { return mode !== 'unconfigured' }, modelName: 'synthetic-baseline',
    chat: measured('chat', async (messages) => {
      if (mode === 'timeout') throw Object.assign(new Error('synthetic timeout'), { code: 'PROVIDER_TIMEOUT' })
      if (mode === 'failure') throw new Error('synthetic failure')
      if (mode === 'hold') await new Promise((done) => { release = done })
      // Deliberately invalid extractive JSON exercises the existing grounded fallback.
      if (/^按问题组织受控手法|只返回JSON|只返回 JSON/.test(messages[0]?.content || '')) return 'synthetic invalid structured output'
      return '# 合成回应\n\n**仅验证流程**，不代表真实模型质量。[1]'
    }),
    search: measured('search', async () => {
      if (mode !== 'search-success') throw Object.assign(new Error('synthetic search failure'), { code: 'SEARCH_UNAVAILABLE' })
      return [{ title: '合成检索来源', url: 'https://example.test/baseline', publisher: 'Synthetic', content: '仅用于测试来源摘录流程。', accessedAt: '2026-11-28T00:00:00.000Z' }]
    }) }
  app = await buildApp({ logger: false, serveStatic: false, products, verificationRecords: {},
    config: { nodeEnv: 'test', host: '127.0.0.1', port: 8787, zhipuApiKey: '', zhipuModel: 'synthetic', zhipuMaxTokens: 4096,
      upstreamTimeoutMs: 1000, apiRateLimitMax: 10000, aiRateLimitMax: 1000, aiDailyLimit: 100000, trustProxy: false },
    providers: { zhipu: provider, weather: { configured: false, forecast: measured('weather', async () => { throw new Error('synthetic weather failure') }) } } })
  vi.stubGlobal('fetch', async (url, init) => {
    if (url !== '/api/assistant') throw new Error('baseline forbids external fetch')
    const payload = JSON.parse(init.body), started = performance.now()
    const response = await app.inject({ method: 'POST', url, payload })
    requests.push({ payload, status: response.statusCode, body: response.json(), elapsedMs: round(performance.now() - started),
      // Observes the same helper independently. Guided answers may override these conditions.
      directParameters: await extractParameters(payload.query, payload.profile, products, payload.messages) })
    return { ok: response.statusCode >= 200 && response.statusCode < 300, status: response.statusCode, json: async () => response.json() }
  })
})
afterEach(async () => {
  if (active) active.totals = { requests: requests.length, chat: calls.filter((c) => c.kind === 'chat').length,
    search: calls.filter((c) => c.kind === 'search').length, providerElapsedMs: round(calls.reduce((sum, c) => sum + c.elapsedMs, 0)) }
  await app?.close(); vi.unstubAllGlobals()
})
afterAll(() => {
  const output = resolve(process.env.YAS_BASELINE_OUTPUT || '.qa/xiaoy-baseline-0069/results.json')
  mkdirSync(resolve(output, '..'), { recursive: true })
  writeFileSync(output, JSON.stringify({ recordedAt: new Date().toISOString(), limitations: 'Synthetic provider timing is not real latency. Recorder pass is not UX success.', records }, null, 2) + '\n')
})

describe('YAS-2026-0069 current capability observations', () => {
  it.each(scenarios)('$id $title', async (sample) => {
    start(sample.id, sample.title, sample.profile); mode = sample.mode
    if (mode === 'offline') vi.stubGlobal('navigator', { onLine: false })
    for (const text of sample.turns) await turn(text)
    // Same question after a greeting isolates welcome-only intake from routing.
    // Keep BOTH observations; the later successful branch never erases the first.
    if (['B18', 'B19', 'B20', 'B21', 'B24', 'B25', 'B27', 'B40'].includes(sample.id)) {
      await turn('你好')
      await turn(sample.turns[0])
    }
    if (sample.id === 'B24') {
      const query = '眉毛怎么画自然'
      active.probes.unboundedKnowledgeIds = retrieveKnowledge(query, 'beauty_knowledge').map((e) => e.id)
      active.probes.zeroKnowledgeBudget = await answerKnowledge({ query, intent: 'beauty_knowledge', provider: { configured: false }, budget: { knowledgeChars: 0, knowledgeEntries: 0 } })
    }
  })
  it('B33 failed direction selection retry after remount', async () => {
    start('B33', '方向选择失败与刷新重试')
    await turn('我想化妆')
    const pending = render().messages.at(-1)
    // Transport failure tests the frontend branch without changing the application.
    const savedFetch = globalThis.fetch
    vi.stubGlobal('fetch', async () => { throw new TypeError('synthetic transport failure') })
    const failed = await turn('自然修饰', 'natural_refinement', pending.id)
    expect(failed.retry).toBeDefined()
    mount(); vi.stubGlobal('fetch', savedFetch)
    await render().retryMessage(failed.id)
    active.probes.afterRetry = render().messages
    active.probes.retryRequests = requests.slice(-1)
    expect(render().messages.some((m) => m.retry)).toBe(false)
  })
  it('B34 duplicate and stale operation protection', async () => {
    start('B34', '重复发送、旧按钮及忙时重置')
    mode = 'hold'
    const state = render(), pending = state.sendMessage('陪我聊聊')
    await vi.waitFor(() => expect(release).toBeTypeOf('function'))
    await state.sendMessage('重复发送')
    render().resetConversation()
    release(); await pending; render()
    active.probes.concurrentRequests = requests.length
    expect(requests).toHaveLength(1)
    mode = 'normal'; render().resetConversation(); render(); await turn('我想化妆')
    const question = render().messages.at(-1)
    expect(question.question).toBeDefined()
    await turn('自然修饰', 'natural_refinement', question.id)
    const count = requests.length
    await turn('自然修饰', 'natural_refinement', question.id)
    active.probes.staleRequestDelta = requests.length - count
    expect(active.probes.staleRequestDelta).toBe(0)
  })
  it('B35 saved progress and refresh', async () => {
    start('B35', '入门进度刷新与消息截断')
    for (const text of ['我想化妆', 'natural_refinement', 'goal-base']) await turn(text)
    active.probes.beforeReload = render().messages.at(-1)
    mount(); await turn('继续')
    expect(render().messages.at(-1).beginnerContext?.lastStep).toBe('brow')
    for (let i = 0; i < 9; i++) await turn('你好')
    active.probes.inMemoryCount = render().messages.length
    active.probes.savedCount = JSON.parse(values.get(MESSAGES_KEY)).value.length
    mount(); active.probes.reloadedCount = render().messages.length
    expect(active.probes.savedCount).toBe(20)
  })
  it('B36 legacy storage and malformed JSON', async () => {
    start('B36', '旧键迁移与损坏JSON读取')
    const old = [{ id: 'old', role: 'assistant', content: '合成旧消息', productIds: ['b'] }]
    values.set(MESSAGES_KEY, '{broken'); values.set(LEGACY_MESSAGES_KEY, JSON.stringify(old))
    active.probes.migrated = readVersioned(MESSAGES_KEY, LEGACY_MESSAGES_KEY, [])
    active.probes.legacyRemoved = !values.has(LEGACY_MESSAGES_KEY)
    expect(active.probes.migrated).toEqual(old)
    values.set(MESSAGES_KEY, '{broken')
    active.probes.corruptFallback = readVersioned(MESSAGES_KEY, LEGACY_MESSAGES_KEY, [])
    expect(active.probes.corruptFallback).toEqual([])
  })
  it('B37 response metadata retained versus dropped', async () => {
    start('B37', '响应到保存的信息损失')
    await turn('你好')
    await turn('粉底怎么涂')
    const wire = requests.at(-1).body, saved = render().messages.at(-1)
    active.probes.wireFields = Object.keys(wire)
    active.probes.savedFields = Object.keys(saved)
    active.probes.droppedFields = Object.keys(wire).filter((key) => !(key in saved))
    // This is a known current limitation, not the desired future contract.
    expect(wire.coverage).toBeDefined(); expect(saved.coverage).toBeUndefined()
  })
  it('B38 request context limits', async () => {
    start('B38', '请求8条4000字与产品ID截断')
    const messages = Array.from({ length: 12 }, (_, i) => ({ role: 'assistant', content: `${i}:` + '合'.repeat(4100), productIds: ['a', 'b', 'c', 'unknown'], sources: [{ title: 'not forwarded' }] }))
    // Record the discovered 64 KiB byte-limit rejection. Do not turn this into
    // an expected successful conversation or shorten the Chinese fixture.
    let failure
    try { await requestAssistant({ text: '陪我聊聊', profile: {}, messages }) }
    catch (error) { failure = { code: error.code, message: error.message } }
    const sent = requests.at(-1).payload.messages
    active.probes = { requests, failure, payloadBytes: Buffer.byteLength(JSON.stringify(requests.at(-1).payload)), sentCount: sent.length, contentLengths: sent.map((m) => m.content.length), sentFields: Object.keys(sent[0]) }
    expect(sent).toHaveLength(8)
    expect(sent.every((m) => m.content.length === 4000 && m.productIds.length === 3)).toBe(true)
    expect(requests.at(-1).status).toBe(413)
  })
  it('B39 future storage version and rollback read semantics', () => {
    start('B39', '未知版本读取、同版本形状与回退风险')
    const future = { version: 2, value: [{ role: 'assistant', content: '合成未来数据' }] }
    values.set(MESSAGES_KEY, JSON.stringify(future))
    active.probes.unknownVersionFallback = readVersioned(MESSAGES_KEY, LEGACY_MESSAGES_KEY, [])
    active.probes.rawBeforeMount = JSON.parse(values.get(MESSAGES_KEY))
    render()
    active.probes.rawAfterMount = JSON.parse(values.get(MESSAGES_KEY))
    values.set(PROFILE_KEY, JSON.stringify({ version: 1, value: 'invalid-shape' }))
    active.probes.sameVersionBadShape = readVersioned(PROFILE_KEY, 'synthetic-legacy-profile', {})
    expect(active.probes.unknownVersionFallback).toEqual([])
    expect(active.probes.rawAfterMount.version).toBe(1)
    expect(active.probes.sameVersionBadShape).toBe('invalid-shape')
  })
})
