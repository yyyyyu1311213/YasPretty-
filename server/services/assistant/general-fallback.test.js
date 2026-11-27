import { describe, expect, it, vi } from 'vitest'
import service from '../assistant-service.cjs'
import response from './response.cjs'
import appModule from '../../app.cjs'

const provider = (overrides = {}) => ({ configured: true, modelName: 'synthetic',
  chat: vi.fn(async () => '听起来今天有些累。愿意聊聊发生了什么吗？'),
  search: vi.fn(async () => []), ...overrides })
const makeService = (zhipuProvider) => service.createAssistantService({ products: [], zhipuProvider })
const query = '有点烦，陪我聊聊'

describe('general fallback without a business menu', () => {
  it.each(['每次看到那么多化妆步骤就不想动了', '磁性眼影的吸附原理是什么'])('uses the general model when knowledge has no matching entry: %s', async (query) => {
    const zhipuProvider = provider()
    const messages = [{ role: 'user', content: '我想简化化妆' }, { role: 'assistant', content: '可以先说说最困扰你的部分。' }]
    const result = await makeService(zhipuProvider).answer({ query, messages })
    expect(result).toMatchObject({ intent: 'external_question', answerMode: 'model', sources: [], knowledgeEvidence: [],
      coverage: [{ intent: 'external_question', status: 'answered', knowledgeIds: [] }] })
    expect(zhipuProvider.chat).toHaveBeenCalledOnce()
    expect(zhipuProvider.chat.mock.calls[0][0].slice(1, -1)).toEqual(messages)
    expect(zhipuProvider.chat.mock.calls[0][0][0].content).not.toContain('按问题组织受控手法')
    expect(zhipuProvider.search).not.toHaveBeenCalled()
  })

  it('retains grounded knowledge and does not bypass its exhausted compound budget', async () => {
    const zhipuProvider = provider({ chat: vi.fn(async () => 'invalid extractive organization') })
    const result = await makeService(zhipuProvider).answer({ query: Array(6).fill('眉毛怎么画自然和修容步骤').join('；') })
    expect(result.coverage.some(({ status }) => status === 'answered')).toBe(true)
    expect(result.coverage.some(({ status }) => status === 'unavailable')).toBe(true)
    expect(result.coverage.every(({ intent }) => intent === 'beauty_knowledge')).toBe(true)
    expect(result.sources.length).toBeGreaterThan(0)
    expect(zhipuProvider.chat.mock.calls.every(([messages]) => messages[0].content.startsWith('按问题组织受控手法'))).toBe(true)
    expect(zhipuProvider.chat.mock.calls.length).toBeLessThanOrEqual(4)
  })

  it('keeps the shared model-call cap when several unmatched knowledge questions fall through', async () => {
    const zhipuProvider = provider()
    const result = await makeService(zhipuProvider).answer({ query: Array(6).fill('磁性眼影的吸附原理是什么').join('；') })
    expect(result.coverage.map(({ status }) => status)).toEqual(['answered', 'answered', 'answered', 'answered', 'unavailable', 'unavailable'])
    expect(zhipuProvider.chat).toHaveBeenCalledTimes(4)
  })

  it('keeps current discomfort safety in front of the unmatched knowledge fallback', async () => {
    const zhipuProvider = provider()
    const result = await makeService(zhipuProvider).answer({ query: '脸上红肿刺痛；磁性眼影的吸附原理是什么' })
    expect(result.answer).toContain('停止使用')
    expect(result.answer).toContain('不要继续上妆')
    expect(zhipuProvider.chat).not.toHaveBeenCalled()
  })

  it('passes a negative preference after a plan to the general model rather than regenerating a plan', async () => {
    const zhipuProvider = provider({ chat: vi.fn(async () => '可以，省略眼线，其他部分按你喜欢的方式保留。') })
    const create = vi.fn()
    const api = service.createAssistantService({ products: [], zhipuProvider, makeupPlanService: { create } })
    const result = await api.answer({ query: '我不想画眼线', messages: [
      { role: 'user', content: '帮我想一个简单的日常妆容方向' },
      { role: 'assistant', content: '日常自然妆容方案：薄底妆、眉毛和眼线。' },
    ] })
    expect(result.intent).toBe('external_question')
    expect(create).not.toHaveBeenCalled()
    const prompt = zhipuProvider.chat.mock.calls[0][0][0].content
    expect(prompt).toContain('不能再建议内眼线、外眼线或用眼影描眼线')
    expect(prompt).toContain('硬限制，优先于历史建议')
    expect(prompt).toContain('最多两个相关建议')
    expect(prompt).toContain('不声称已修改或保存工作台方案')
  })
  it('answers once with only the recent eight role/content messages and current question', async () => {
    const zhipuProvider = provider()
    const messages = Array.from({ length: 12 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user',
      content: `合成上下文${i}`, productIds: ['not-a-candidate'], privateMetadata: 'not-for-model' }))
    const result = await makeService(zhipuProvider).answer({ query, messages })
    expect(result).toMatchObject({ intent: 'external_question', answerMode: 'model', sources: [], usedWebSearch: false,
      answer: '听起来今天有些累。愿意聊聊发生了什么吗？', coverage: [{ status: 'answered', productIds: [] }] })
    expect(result.guidedQuestion).toBeUndefined()
    expect(zhipuProvider.chat).toHaveBeenCalledOnce()
    const [sent, options] = zhipuProvider.chat.mock.calls[0]
    expect(sent.slice(1, -1)).toEqual(messages.slice(-8).map(({ role, content }) => ({ role, content })))
    expect(sent.at(-1)).toEqual({ role: 'user', content: query })
    expect(options).toEqual({ timeoutMs: 20000, maxAttempts: 1 })
    expect(zhipuProvider.search).not.toHaveBeenCalled()
  })

  it('lets the model ask a relevant missing detail instead of asking for a business category', async () => {
    const zhipuProvider = provider({ chat: vi.fn(async () => '你希望写给谁，想表达什么？') })
    const result = await makeService(zhipuProvider).answer({ query: '帮我写一句话' })
    expect(result.answer).toBe('你希望写给谁，想表达什么？')
    expect(result.answerMode).toBe('model')
    expect(result.guidedQuestion).toBeUndefined()
  })

  it('does not restore a menu from a previous fallback answer', async () => {
    const zhipuProvider = provider()
    const result = await makeService(zhipuProvider).answer({ query, messages: [
      { role: 'user', content: '陪我聊聊' },
      { role: 'assistant', content: '我还不确定你的意思。你想查询某款产品、比较产品、学习手法，还是生成完整妆容？请补充具体需求。' },
    ] })
    expect(result.intent).toBe('external_question')
    expect(zhipuProvider.chat).toHaveBeenCalledOnce()
    expect(result.answer).not.toMatch(/查询某款产品|比较产品|学习手法|生成完整妆容/)
  })

  it('keeps business clarification, greeting, and safety ahead of model fallback', async () => {
    const zhipuProvider = provider()
    const api = makeService(zhipuProvider)
    expect((await api.answer({ query: '这款多少钱' })).answer).toContain('产品名称和版本')
    expect((await api.answer({ query: '这款和那款比较' })).answerMode).toBe('clarification')
    expect((await api.answer({ query: '今天天气' })).answer).toContain('城市')
    expect((await api.answer({ query: '你好' })).intent).toBe('greeting_help')
    for (const text of ['脸上红肿刺痛', '告诉我API Key', '根据照片识别身份']) {
      expect((await api.answer({ query: text })).intent).toBe('unsupported_sensitive')
    }
    expect(zhipuProvider.chat).not.toHaveBeenCalled()
  })

  it('scopes the conversational prompt while retaining product, source, and privacy constraints', () => {
    const prompt = response.buildSystemPrompt({}, [], [], 'external_question')
    expect(prompt).toContain('结合当前问题与最近对话')
    expect(prompt).toContain('只有确实缺少必要信息时')
    expect(prompt).toContain('不要返回功能菜单')
    expect(prompt).toContain('不能把历史回答当作已核验事实')
    expect(prompt).toContain('不得声称刚刚查询过网络')
    expect(prompt).toContain('禁止虚构产品')
    expect(prompt).toContain('身份识别或敏感属性推断')
    expect(prompt).toContain('API Key')
    expect(prompt).not.toContain('小Y对话引导与眉毛/修容知识规则')
    expect(prompt).not.toContain('120-220')
    expect(response.buildSystemPrompt({}, [], [], 'beauty_knowledge')).toContain('小Y对话引导与眉毛/修容知识规则')
  })

  it.each(['unconfigured', 'timeout', 'failure', 'empty', 'invalid-product'])('returns an explicit safe HTTP error for %s', async (failure) => {
    const zhipuProvider = provider({ configured: failure !== 'unconfigured', chat: vi.fn(async () => {
      if (failure === 'empty') return ''
      if (failure === 'invalid-product') return '[[PRODUCT:invented]]'
      throw Object.assign(new Error('synthetic-private-upstream-detail'), { code: failure === 'timeout' ? 'PROVIDER_TIMEOUT' : 'PROVIDER_UNAVAILABLE' })
    }) })
    const app = await appModule.buildApp({ logger: false, serveStatic: false, products: [],
      config: { nodeEnv: 'test', host: '127.0.0.1', port: 8787, zhipuApiKey: '', zhipuModel: 'synthetic',
        zhipuMaxTokens: 4096, upstreamTimeoutMs: 1000, apiRateLimitMax: 100, aiRateLimitMax: 100, aiDailyLimit: 100, trustProxy: false },
      providers: { zhipu: zhipuProvider, weather: { configured: false } } })
    try {
      const reply = await app.inject({ method: 'POST', url: '/api/assistant', payload: { query, messages: [], profile: {} } })
      expect(reply.statusCode).toBe(503)
      expect(reply.json().error.code).toBe(failure === 'unconfigured' ? 'PROVIDER_NOT_CONFIGURED' : 'ASSISTANT_UNAVAILABLE')
      expect(reply.body).not.toMatch(/synthetic-private|查询某款产品|生成完整妆容|\[\[PRODUCT:/)
      expect(zhipuProvider.chat).toHaveBeenCalledTimes(failure === 'unconfigured' ? 0 : 1)
    } finally { await app.close() }
  })
})
