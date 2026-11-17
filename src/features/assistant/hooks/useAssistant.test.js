import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { products } from '../../../data/products'
import { requestAssistant, requestMakeupPlan } from '../assistantApi'
import { useAssistant } from './useAssistant'

// Exercise state/effect boundaries with real storage and domain functions.
// This harness does not replace the real React DOM and browser interaction suite.
const lifecycle = vi.hoisted(() => ({ states: [], deps: [], effects: [], cursor: 0, dirty: false }))
vi.mock('react', async (importOriginal) => ({
  ...await importOriginal(),
  useState(initial) {
    const index = lifecycle.cursor++
    if (!(index in lifecycle.states)) lifecycle.states[index] = typeof initial === 'function' ? initial() : initial
    return [lifecycle.states[index], (value) => {
      const next = typeof value === 'function' ? value(lifecycle.states[index]) : value
      if (!Object.is(next, lifecycle.states[index])) lifecycle.dirty = true
      lifecycle.states[index] = next
    }]
  },
  useRef(initial) {
    const index = lifecycle.cursor++
    if (!(index in lifecycle.states)) lifecycle.states[index] = { current: initial }
    return lifecycle.states[index]
  },
  useMemo(create) {
    lifecycle.cursor++
    return create()
  },
  useEffect(effect, deps) {
    const index = lifecycle.cursor++
    const previous = lifecycle.deps[index]
    if (!previous || deps.some((value, i) => !Object.is(value, previous[i]))) lifecycle.effects.push(effect)
    lifecycle.deps[index] = deps
  },
}))
vi.mock('../assistantApi', () => ({ requestAssistant: vi.fn(), requestMakeupPlan: vi.fn() }))

function mount() {
  Object.assign(lifecycle, { states: [], deps: [], effects: [], cursor: 0, dirty: false })
}

function render() {
  for (let count = 0; count < 10; count++) {
    Object.assign(lifecycle, { cursor: 0, effects: [], dirty: false })
    const value = useAssistant()
    lifecycle.effects.forEach((effect) => effect())
    if (!lifecycle.dirty) return value
  }
  throw new Error('Unexpected render loop')
}

function deferred() {
  let resolve
  const promise = new Promise((complete) => { resolve = complete })
  return { promise, resolve }
}

const source = (kind) => ({ kind, title: '合成来源', url: 'https://example.test/source', publisher: '测试', accessedAt: '2026-11-17T00:00:00.000Z' })
const answer = (overrides = {}) => ({ text: '合成回答', productIds: [], sources: [], answerMode: 'model', model: 'synthetic-model', ...overrides })
const latest = () => render().messages.at(-1)
let values
const saved = (key) => JSON.parse(values.get(`yaspretty-xiaoy-${key}-v1`)).value

beforeEach(() => {
  mount()
  values = new Map()
  vi.stubGlobal('localStorage', {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  })
  vi.mocked(requestAssistant).mockReset()
  vi.mocked(requestMakeupPlan).mockReset()
})
afterEach(() => vi.unstubAllGlobals())

describe('小Y状态与发送流程', () => {
  it('keeps welcome, composer, activity and mode defaults and persists through shared storage', () => {
    const value = render()
    expect(value).toMatchObject({ profile: {}, profileTags: 0, input: '', busy: false, mode: 'ready', activeModel: '', activity: '小Y正在识别需求并查询...' })
    expect(value.messages).toEqual([{
      id: 'welcome', role: 'assistant',
      content: '嗨，我是小Y。告诉我你的肤质、喜欢的妆效和使用场景，我会从 YasPretty 产品库里给出有依据的选择。',
      productIds: [],
    }])
    expect(saved('messages')).toEqual(value.messages)
    expect(saved('profile')).toEqual({})
  })

  it('ignores blank sends without clearing a draft or changing the conversation', async () => {
    render().setInput('尚未发送的草稿')
    const before = render().messages
    await render().sendMessage(' \n ')
    expect(render()).toMatchObject({ messages: before, input: '尚未发送的草稿', busy: false, mode: 'ready' })
    expect(requestAssistant).not.toHaveBeenCalled()
    expect(requestMakeupPlan).not.toHaveBeenCalled()
  })

  it.each([
    ['你好', '你好，我是小Y。先告诉我你的肤质吧', false],
    ['推荐通勤底妆', '为了避免只凭热度推荐', false],
    ['我是油皮，预算 400 元，想要柔雾通勤底妆', '根据目前记录的需求', true],
    ['帮我比较 NARS 超方瓶和雅诗兰黛持妆粉底液', '我按资料库信息比较你提到的产品', true],
  ])('keeps the local flow for %s', async (text, expected, hasProducts) => {
    await render().sendMessage(text)
    expect(latest().content).toContain(expected)
    expect(latest().productIds.length > 0).toBe(hasProducts)
    expect(latest().productIds.every((id) => products.some((product) => product.id === id))).toBe(true)
    expect(render()).toMatchObject({ busy: false, mode: 'local', activeModel: '', input: '' })
    expect(render().messages[1]).toMatchObject({ role: 'user', content: text, productIds: [], sources: [] })
    expect(requestAssistant).not.toHaveBeenCalled()
    expect(requestMakeupPlan).not.toHaveBeenCalled()
    expect(saved('messages')).toEqual(render().messages)
    if (text.startsWith('我是油皮')) {
      expect(render().profile).toEqual({ skin: '油皮', budget: 400, finish: '柔雾', scene: '通勤' })
      expect(render().profileTags).toBe(4)
      for (const id of latest().productIds) {
        const product = products.find((item) => item.id === id)
        expect(product.price).toBeLessThanOrEqual(400)
        expect(product.skins).toContain('油皮')
      }
    }
  })

  it('captures pre-send history, persists the user/profile before completion and rejects sends after rendering busy', async () => {
    const history = [{ id: 'old', role: 'assistant', content: '合成旧消息', productIds: [], sources: [] }]
    const profile = { skin: '混油皮', budget: 400, city: '杭州' }
    values.set('yaspretty-xiaoy-messages-v1', JSON.stringify({ version: 1, value: history }))
    values.set('yaspretty-xiaoy-profile-v1', JSON.stringify({ version: 1, value: profile }))
    const waiting = deferred()
    vi.mocked(requestAssistant).mockReturnValue(waiting.promise)
    render().setInput('  解释一下光的折射  ')
    const pending = render().sendMessage(render().input)
    expect(requestAssistant).toHaveBeenCalledExactlyOnceWith({ text: '解释一下光的折射', messages: history, profile })
    expect(render()).toMatchObject({ busy: true, input: '', mode: 'ready', activity: '小Y正在组织回答...', profile, profileTags: 3 })
    expect(saved('messages')).toHaveLength(2)
    expect(saved('messages')[1]).toMatchObject({ role: 'user', content: '解释一下光的折射' })
    expect(saved('profile')).toEqual(profile)
    await render().sendMessage('重复问题')
    expect(requestAssistant).toHaveBeenCalledTimes(1)
    expect(render().messages).toHaveLength(2)
    const result = answer({ productIds: [products[0].id], sources: [source('knowledge')] })
    waiting.resolve(result)
    await pending
    expect(latest()).toMatchObject({ role: 'assistant', content: result.text, productIds: result.productIds, sources: result.sources })
    expect(render()).toMatchObject({ busy: false, mode: 'knowledge', activeModel: 'synthetic-model' })
    expect(saved('messages')).toEqual(render().messages)
  })

  it.each([
    [{ answerMode: 'weather' }, 'weather'],
    [{ sources: [source('web'), source('weather')] }, 'weather'],
    [{ sources: [source('web')], answerMode: 'clarification' }, 'web'],
    [{ sources: [source('knowledge')], answerMode: 'clarification' }, 'ready'],
    [{ sources: [source('knowledge')] }, 'knowledge'],
    [{ sources: [], answerMode: 'model' }, 'ai'],
  ])('retains source and answerMode precedence for %j', async (response, mode) => {
    vi.mocked(requestAssistant).mockResolvedValue(answer(response))
    await render().sendMessage('解释一下光的折射')
    expect(render()).toMatchObject({ mode, activeModel: 'synthetic-model', busy: false })
    expect(latest().sources).toEqual(response.sources || [])
  })

  it('routes catalog research to assistant API with the updated profile and keeps the original web mode', async () => {
    const waiting = deferred()
    vi.mocked(requestAssistant).mockReturnValue(waiting.promise)
    const pending = render().sendMessage('我是干皮，预算 300 元，NARS 最新价格')
    expect(render()).toMatchObject({ busy: true, activity: '正在联网检索相关资料...', profile: { skin: '干皮', budget: 300 } })
    expect(requestAssistant).toHaveBeenCalledWith(expect.objectContaining({ profile: { skin: '干皮', budget: 300 } }))
    expect(requestMakeupPlan).not.toHaveBeenCalled()
    waiting.resolve(answer())
    await pending
    expect(render()).toMatchObject({ mode: 'web', activeModel: 'synthetic-model', busy: false })
  })

  it.each(['local', 'model'])('uses the plan API with current conditions and retains %s mode and message metadata', async (sourceMode) => {
    await render().sendMessage('我是混油皮，预算 500 元，柔雾通勤底妆')
    await render().sendMessage('我是干皮，预算 300 元，奶油肌拍照底妆')
    const profile = render().profile
    const waiting = deferred()
    vi.mocked(requestMakeupPlan).mockReturnValue(waiting.promise)
    const pending = render().sendMessage('给我完整妆容')
    expect(requestMakeupPlan).toHaveBeenCalledExactlyOnceWith({ text: '给我完整妆容', profile })
    expect(render()).toMatchObject({ busy: true, activity: '正在生成可调整的妆容方案...' })
    waiting.resolve({ text: '合成方案', productIds: [products[0].id], sourceMode, sources: [source('web')] })
    await pending
    expect(latest()).toMatchObject({ content: '合成方案', productIds: [products[0].id], sources: [] })
    expect(render()).toMatchObject({ busy: false, mode: sourceMode === 'model' ? 'ai' : 'local', activeModel: sourceMode === 'model' ? 'glm-5.3-flash' : '' })
    expect(profile).toMatchObject({ skin: '干皮', budget: 300, finish: '奶油肌', scene: '拍照' })
    expect(requestAssistant).not.toHaveBeenCalled()
  })

  it('keeps the full original text fallback and valid products when the plan API fails', async () => {
    vi.mocked(requestMakeupPlan).mockRejectedValue(new Error('合成方案失败'))
    await render().sendMessage('我是油皮，预算 400 元，给我完整妆容')
    expect(latest().content).toContain('1. 妆前')
    expect(latest().content).toContain('7. 唇妆')
    expect(latest().content).toContain('这是本地基础方案，没有使用照片分析或联网资料')
    expect(latest().productIds.length).toBeGreaterThan(0)
    expect(latest().productIds.every((id) => products.some((product) => product.id === id))).toBe(true)
    expect(render()).toMatchObject({ busy: false, mode: 'local', activeModel: '' })
    expect(requestAssistant).not.toHaveBeenCalled()
  })

  it.each([
    ['解释一下光的折射', 'AI_NOT_CONFIGURED', '智能服务当前不可用：合成服务错误。站内产品浏览和本地推荐仍可正常使用。'],
    ['今天上海天气怎么样', 'WEATHER_PROVIDER_UNAVAILABLE', '天气数据暂时不可用：合成服务错误。我不会用猜测或旧资料代替实时天气；站内产品浏览和本地推荐仍可正常使用。'],
    ['NARS 最新价格', 'UPSTREAM_TIMEOUT', '联网检索当前不可用：合成服务错误。我不会用未经检索的信息冒充实时结果；你仍可询问不依赖实时信息的站内产品推荐。'],
    ['今天给我完整妆容', 'UPSTREAM_TIMEOUT', '联网检索当前不可用：合成服务错误。我不会用未经检索的信息冒充实时结果；你仍可询问不依赖实时信息的站内产品推荐。'],
  ])('preserves error precedence and recovery for %s', async (text, code, expected) => {
    vi.mocked(requestAssistant).mockResolvedValueOnce(answer())
    await render().sendMessage('解释一下光的折射')
    expect(render().activeModel).toBe('synthetic-model')
    vi.mocked(requestAssistant).mockRejectedValueOnce(Object.assign(new Error(' 合成服务错误。。! '), { code }))
    await render().sendMessage(text)
    expect(latest()).toMatchObject({ content: expected, productIds: [], sources: [] })
    expect(render()).toMatchObject({ mode: 'error', activeModel: '', busy: false })
    expect(requestMakeupPlan).not.toHaveBeenCalled()
    await render().sendMessage('我是油皮，预算 400 元，推荐粉底')
    expect(latest().content).toContain('在预算内')
    expect(render()).toMatchObject({ mode: 'local', activeModel: '', busy: false })
  })

  it('resets messages/profile/mode without clearing a draft or cancelling a pending response', async () => {
    await render().sendMessage('我是干皮，预算 300 元，推荐粉底')
    render().setInput('保留的草稿')
    render().resetConversation()
    expect(render()).toMatchObject({ input: '保留的草稿', profile: {}, profileTags: 0, mode: 'ready', activeModel: '' })
    expect(render().messages.map(({ id }) => id)).toEqual(['welcome'])
    const waiting = deferred()
    vi.mocked(requestAssistant).mockReturnValue(waiting.promise)
    const pending = render().sendMessage('解释一下光的折射')
    const activity = render().activity
    render().resetConversation()
    expect(render()).toMatchObject({ busy: true, mode: 'ready', activity })
    expect(render().messages).toHaveLength(1)
    waiting.resolve(answer())
    await pending
    expect(render()).toMatchObject({ busy: false, mode: 'ai', activeModel: 'synthetic-model' })
    expect(render().messages).toHaveLength(2)
    expect(latest().content).toBe('合成回答')
  })

  it('retains all mounted messages but persists the last twenty and restores that slice on remount', async () => {
    for (let index = 0; index < 11; index++) await render().sendMessage('你好')
    const messages = render().messages
    expect(messages).toHaveLength(23)
    expect(saved('messages')).toEqual(messages.slice(-20))
    mount()
    expect(render().messages).toEqual(messages.slice(-20))
    expect(render().messages).toHaveLength(20)
  })

  it('keeps the same end ref and scrolls only after message or busy changes', async () => {
    const ref = render().messageEndRef
    const scrollIntoView = vi.fn()
    ref.current = { scrollIntoView }
    render().setInput('草稿')
    expect(render().messageEndRef).toBe(ref)
    expect(scrollIntoView).not.toHaveBeenCalled()
    const waiting = deferred()
    vi.mocked(requestAssistant).mockReturnValue(waiting.promise)
    const pending = render().sendMessage('解释一下光的折射')
    render()
    expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({ behavior: 'smooth', block: 'nearest' })
    waiting.resolve(answer())
    await pending
    render()
    expect(scrollIntoView).toHaveBeenCalledTimes(2)
  })

  it.each(['getItem', 'setItem', 'removeItem'])('still propagates %s storage failures at initialization/effect boundaries', (method) => {
    const error = new Error(`synthetic ${method} failure`)
    localStorage[method] = () => { throw error }
    expect(() => render()).toThrow(error)
  })
})
