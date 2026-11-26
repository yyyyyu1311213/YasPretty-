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
  it('audit: does not persist a friend’s conditions after sending from the chat', async () => {
    vi.mocked(requestAssistant).mockResolvedValue(answer())
    await render().sendMessage('我朋友说，预算200元，想要哑光气垫')
    expect(render().profile).toEqual({})
    expect(requestAssistant).toHaveBeenCalledWith(expect.objectContaining({ profile: {} }))
  })
  it('audit: does not recommend makeup when an external shopping request fails', async () => {
    vi.mocked(requestAssistant).mockRejectedValue(new TypeError('Failed to fetch'))
    await render().sendMessage('给我推荐电脑')
    expect(latest().productIds).toEqual([])
    expect(latest().content).not.toContain('先确认你的肤质')
    expect(render().mode).toBe('error')
  })
  it.each(['PROVIDER_NOT_CONFIGURED', 'UPSTREAM_TIMEOUT', 'network', 'offline'])('does not ask for skin or recommend after category knowledge fails: %s', async (failure) => {
    if (failure === 'offline') vi.stubGlobal('navigator', { onLine: false })
    vi.mocked(requestAssistant).mockRejectedValue(failure === 'network' ? new TypeError('Failed to fetch') : Object.assign(new Error('合成服务不可用'), { code: failure }))
    await render().sendMessage('粉底和气垫有什么区别')
    expect(latest().content).not.toMatch(/需要先确认你的肤质|你是油皮|根据目前记录的需求/)
    expect(latest().productIds).toEqual([])
    expect(render().profile).toEqual({})
    expect(render().mode).toBe('error')
  })

  it('does not infer recommendation fallback from a category word alone', async () => {
    vi.mocked(requestAssistant).mockRejectedValue(new TypeError('Failed to fetch'))
    await render().sendMessage('粉底有哪些质地')
    expect(latest().content).not.toContain('先确认你的肤质')
    expect(latest().productIds).toEqual([])
    expect(render().mode).toBe('error')
  })
  it.each(['粉底怎么涂', '底妆出油怎么办', '我是干皮，推荐粉底', '给我完整妆容'])('AI-R01 sends every online chat through assistant API: %s', async (text) => {
    vi.mocked(requestAssistant).mockResolvedValue(answer())
    await render().sendMessage(text)
    expect(requestAssistant).toHaveBeenCalledOnce()
    expect(requestMakeupPlan).not.toHaveBeenCalled()
    expect(latest().content).toBe('合成回答')
  })
  it('keeps welcome, composer, activity and mode defaults and persists through shared storage', () => {
    const value = render()
    expect(value).toMatchObject({ profile: {}, profileTags: 0, input: '', busy: false, mode: 'ready', activeModel: '', activity: '小Y正在识别需求并查询...' })
    expect(value.messages).toEqual([{
      id: 'welcome', role: 'assistant',
      content: '嗨，我是小Y。先用一句话告诉我你想解决什么；我会结合你的需求继续提问或给出建议。',
      productIds: [],
    }])
    expect(saved('messages')).toEqual(value.messages)
    expect(saved('profile')).toEqual({})
  })

  it('waits for the user’s first request before showing route choices and keeps the first request in the guided turn', async () => {
    const firstQuestion = {
      flowId: 'xiaoy-guided-intake-v1', step: 1, route: null, selections: [], initialQuery: '我想学男生修眉让眉眼看着自然',
      options: [{ label: '我是男生，想看自然修饰', value: 'route-men' }, { label: '我是女生，按日常彩妆建议', value: 'route-women' }],
    }
    vi.mocked(requestAssistant).mockResolvedValue(answer({ text: '收到，我会结合你的问题继续。', question: firstQuestion }))
    expect(render().messages[0].question).toBeUndefined()
    await render().sendMessage('我想学男生修眉让眉眼看着自然')
    expect(latest().question).toEqual(firstQuestion)
    vi.mocked(requestAssistant).mockResolvedValue(answer({ text: '按你的路线给出建议。' }))
    await render().sendMessage('我是男生，想看自然修饰', 'route-men')
    expect(requestAssistant).toHaveBeenLastCalledWith(expect.objectContaining({
      text: 'route-men',
      messages: expect.arrayContaining([expect.objectContaining({
        role: 'assistant', question: firstQuestion,
      })]),
    }))
    expect(latest()).toMatchObject({ role: 'assistant', content: '按你的路线给出建议。' })
    expect(render().profile).toEqual({})
  })

  it('applies a clicked skin option to this request without changing the saved profile', async () => {
    const original = '我想选底妆，但不清楚自己的肤质'
    const routeQuestion = { flowId: 'xiaoy-guided-intake-v1', step: 1, route: null, selections: [], initialQuery: original,
      options: [{ label: '按需求选择，不区分性别', value: 'route-general' }] }
    const skinQuestion = { flowId: 'xiaoy-guided-intake-v1', step: 2, route: 'general', selections: ['route-general'], initialQuery: original,
      options: [{ label: '洗脸后常紧绷或起皮', value: 'skin-dry' }, { label: '不确定，先按原问题继续', value: 'skin-unknown' }] }
    values.set('yaspretty-xiaoy-profile-v1', JSON.stringify({ version: 1, value: { skin: '油皮', budget: 300 } }))
    vi.mocked(requestAssistant)
      .mockResolvedValueOnce(answer({ text: '我会结合你的问题继续。', question: routeQuestion }))
      .mockResolvedValueOnce(answer({ text: '选择日常感受。', question: skinQuestion }))
      .mockResolvedValueOnce(answer({ text: '按这次日常感受筛选。', productIds: ['dry-product'], intent: 'catalog_recommendation' }))

    await render().sendMessage(original)
    render()
    await render().sendMessage('按需求选择，不区分性别', 'route-general')
    render()
    await render().sendMessage('洗脸后常紧绷或起皮', 'skin-dry')

    expect(requestAssistant).toHaveBeenLastCalledWith(expect.objectContaining({
      text: 'skin-dry',
      profile: { skin: '油皮', budget: 300 },
      messages: expect.arrayContaining([expect.objectContaining({ role: 'assistant', question: skinQuestion })]),
    }))
    expect(render().profile).toEqual({ skin: '油皮', budget: 300 })
    expect(saved('profile')).toEqual({ skin: '油皮', budget: 300 })
    expect(latest()).toMatchObject({ content: '按这次日常感受筛选。', productIds: ['dry-product'] })
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
    ['鼻子油两边干', false, ['混油皮', '混干皮']],
    ['我是干皮', false, ['干皮']],
    ['先跳过', false, []],
    ['偶尔会', true, []],
    ['经常会', true, ['干皮', '混干皮']],
    ['现在脸红，还刺痛', false, null],
  ])('keeps offline skin reply %s request-only with original category and budget', async (text, cheeks, allowed) => {
    const profile = { skin: '油皮', budget: 1000, category: '粉底液' }
    const initialQuery = '想买气垫，两百以内'
    const question = { flowId: 'xiaoy-guided-intake-v1', step: cheeks ? 3 : 2, route: 'general',
      selections: cheeks ? ['route-general', 'skin-low-oil'] : ['route-general'], initialQuery,
      options: cheeks ? [{ label: '经常会', value: 'cheek-often' }, { label: '偶尔会', value: 'cheek-sometimes' }]
        : [{ label: '全脸都容易油', value: 'skin-oily' }, { label: '没注意过，先跳过', value: 'skin-unknown' }] }
    values.set('yaspretty-xiaoy-profile-v1', JSON.stringify({ version: 1, value: profile }))
    values.set('yaspretty-xiaoy-messages-v1', JSON.stringify({ version: 1, value: [
      { role: 'user', content: initialQuery }, { role: 'assistant', content: '选择日常感受', question },
    ] }))
    vi.mocked(requestAssistant).mockRejectedValue(new TypeError('Failed to fetch'))
    await render().sendMessage(text)
    expect(saved('profile')).toEqual(profile)
    expect(render().profile).toEqual(profile)
    const candidates = latest().productIds.map((id) => products.find((p) => p.id === id))
    if (allowed === null) {
      expect(candidates).toEqual([])
      expect(latest().content).toContain('停止使用')
    } else {
      expect(candidates.every((p) => p.category === '气垫' && p.price <= 200)).toBe(true)
      if (allowed.length) expect(candidates.every((p) => p.skins.some((skin) => allowed.includes(skin)))).toBe(true)
      else if (text === '偶尔会') {
        expect(candidates).toEqual([])
        expect(latest().question.step).toBe(4)
        expect(latest().content).toContain('大多数日子')
      } else expect(latest().content).toContain('未按肤质筛选')
    }
  })

  it('does not persist an explicit skin answer to an online observation question', async () => {
    const profile = { skin: '油皮', budget: 300 }
    values.set('yaspretty-xiaoy-profile-v1', JSON.stringify({ version: 1, value: profile }))
    values.set('yaspretty-xiaoy-messages-v1', JSON.stringify({ version: 1, value: [
      { role: 'user', content: '推荐个粉底' }, { role: 'assistant', content: '请告诉我你的肤质。' },
    ] }))
    vi.mocked(requestAssistant).mockResolvedValue(answer({ knowledgeEvidence: [{ id: 'self-reported-skin-type' }] }))
    await render().sendMessage('我是干皮')
    expect(saved('profile')).toEqual(profile)
    expect(latest().skinGuidance).toBe(true)
  })

  it('continues unknown answers offline through round five and keeps the original request after remount', async () => {
    const profile = { skin: '油皮', budget: 1000 }
    values.set('yaspretty-xiaoy-profile-v1', JSON.stringify({ version: 1, value: profile }))
    values.set('yaspretty-xiaoy-messages-v1', JSON.stringify({ version: 1, value: [{ role: 'assistant', content: '哪里容易出油？',
      question: { flowId: 'xiaoy-guided-intake-v1', step: 2, route: 'general', selections: ['route-general'],
        initialQuery: '推荐个粉底，预算500元', options: [{ label: '全脸都容易油', value: 'skin-oily' },
          { label: '没注意过，换个问法', value: 'skin-unknown' }] } }] }))
    vi.stubGlobal('navigator', { onLine: false })
    await render().sendMessage('不知道')
    expect(latest().question.step).toBe(3)
    expect(latest().content).toContain('换个好回想的问法')
    await render().sendMessage('还是想不起来', 'skin-clue-unknown')
    expect(latest().question.step).toBe(4)
    await render().sendMessage('经常会', 'cheek-often')
    expect(latest().question.step).toBe(5)
    mount()
    await render().sendMessage('很少出油，两颊经常干', 'skin-pattern-dry')
    expect(latest().question).toBeUndefined()
    expect(latest().content).toContain('偏向干性肤质')
    expect(latest().productIds.length).toBeGreaterThan(0)
    expect(latest().productIds.every((id) => {
      const product = products.find((item) => item.id === id)
      return product.price <= 500 && product.category === '粉底液' && product.skins.some((skin) => ['干皮', '混干皮'].includes(skin))
    })).toBe(true)
    expect(saved('profile')).toEqual(profile)
    expect(requestAssistant).not.toHaveBeenCalled()
  })

  it.each([
    ['你好', '你好，我是小Y。先用一句话告诉我你想解决什么', false],
    ['推荐通勤底妆', '为了避免只凭热度推荐', false],
    ['我是油皮，预算 400 元，想要柔雾通勤底妆', '根据目前记录的需求', true],
  ])('keeps a labeled local fallback after request failure for %s', async (text, expected, hasProducts) => {
    vi.mocked(requestAssistant).mockRejectedValue(new TypeError('Failed to fetch'))
    await render().sendMessage(text)
    expect(latest().content).toContain(expected)
    expect(latest().productIds.length > 0).toBe(hasProducts)
    expect(latest().productIds.every((id) => products.some((product) => product.id === id))).toBe(true)
    expect(render()).toMatchObject({ busy: false, mode: 'local', activeModel: '', input: '' })
    expect(render().messages[1]).toMatchObject({ role: 'user', content: text, productIds: [], sources: [] })
    expect(requestAssistant).toHaveBeenCalledOnce()
    expect(latest().content).toContain('已降级')
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

  it('sends the reported product question to the API and preserves the existing budget', async () => {
    const text = '这个兰芝NEO小方块哑光气垫，15g是正装还是带替换芯？一个大概能用多久？平时放包里补妆方便吗？'
    values.set('yaspretty-xiaoy-profile-v1', JSON.stringify({ version: 1, value: { skin: '油皮', budget: 400 } }))
    vi.mocked(requestAssistant).mockResolvedValue(answer({ text: '合成产品事实回答', sources: [source('web')] }))
    await render().sendMessage(text)
    expect(requestAssistant).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ text, profile: expect.objectContaining({ budget: 400 }) }))
    expect(latest()).toMatchObject({ content: '合成产品事实回答', sources: [source('web')] })
    expect(saved('profile').budget).toBe(400)
    expect(render()).toMatchObject({ mode: 'web', busy: false })
    expect(requestMakeupPlan).not.toHaveBeenCalled()
  })

  it.each(['AI_NOT_CONFIGURED', 'SEARCH_EMPTY', 'UPSTREAM_TIMEOUT'])('does not fall back to unrelated recommendations when product research fails: %s', async (code) => {
    vi.mocked(requestAssistant).mockRejectedValue(Object.assign(new Error('合成产品查询失败'), { code }))
    await render().sendMessage('这个兰芝NEO小方块哑光气垫，15g是正装还是带替换芯？')
    expect(latest().content).toContain('智能服务当前不可用')
    expect(latest().content).not.toContain('没有同时满足')
    expect(latest().productIds).toEqual([])
    expect(saved('profile')).not.toHaveProperty('budget')
    expect(render()).toMatchObject({ mode: 'error', busy: false })
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

  it('sends updated explicit profile without pre-classifying research on the client', async () => {
    const waiting = deferred()
    vi.mocked(requestAssistant).mockReturnValue(waiting.promise)
    const pending = render().sendMessage('我是干皮，预算 300 元，NARS 最新价格')
    expect(render()).toMatchObject({ busy: true, activity: '小Y正在组织回答...', profile: { skin: '干皮', budget: 300 } })
    expect(requestAssistant).toHaveBeenCalledWith(expect.objectContaining({ profile: { skin: '干皮', budget: 300 } }))
    expect(requestMakeupPlan).not.toHaveBeenCalled()
    waiting.resolve(answer({ sources: [source('web')] }))
    await pending
    expect(render()).toMatchObject({ mode: 'web', activeModel: 'synthetic-model', busy: false })
  })

  it.each(['local', 'model'])('uses the assistant API for conversational plans and retains %s mode', async (sourceMode) => {
    vi.mocked(requestAssistant).mockResolvedValue(answer())
    await render().sendMessage('我是混油皮，预算 500 元，想要柔雾通勤底妆')
    await render().sendMessage('我是干皮，预算 300 元，想要奶油肌拍照底妆')
    const profile = render().profile
    const waiting = deferred()
    vi.mocked(requestAssistant).mockClear().mockReturnValue(waiting.promise)
    const pending = render().sendMessage('给我完整妆容')
    expect(requestAssistant).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ text: '给我完整妆容', profile }))
    expect(render()).toMatchObject({ busy: true, activity: '小Y正在组织回答...' })
    waiting.resolve(answer({ text: '合成方案', productIds: [products[0].id], answerMode: sourceMode, model: sourceMode === 'model' ? 'synthetic-model' : '' }))
    await pending
    expect(latest()).toMatchObject({ content: '合成方案', productIds: [products[0].id], sources: [] })
    expect(render()).toMatchObject({ busy: false, mode: sourceMode === 'model' ? 'ai' : 'local', activeModel: sourceMode === 'model' ? 'synthetic-model' : '' })
    expect(profile).toMatchObject({ skin: '干皮', budget: 300, finish: '奶油肌', scene: '拍照' })
    expect(requestMakeupPlan).not.toHaveBeenCalled()
  })

  it('keeps a labeled complete basic plan when the assistant API fails', async () => {
    vi.mocked(requestAssistant).mockRejectedValue(new TypeError('合成网络失败'))
    await render().sendMessage('我是油皮，预算 400 元，给我完整妆容')
    expect(latest().content).toContain('1. 妆前')
    expect(latest().content).toContain('7. 唇妆')
    expect(latest().content).toContain('这是本地基础方案，没有使用照片分析或联网资料')
    expect(latest().productIds.length).toBeGreaterThan(0)
    expect(latest().productIds.every((id) => products.some((product) => product.id === id))).toBe(true)
    expect(render()).toMatchObject({ busy: false, mode: 'local', activeModel: '' })
    expect(requestAssistant).toHaveBeenCalledOnce()
    expect(requestMakeupPlan).not.toHaveBeenCalled()
    expect(latest().content).toContain('已降级')
  })

  it.each([
    ['解释一下光的折射', 'AI_NOT_CONFIGURED', '智能服务当前不可用：合成服务错误。站内产品浏览和本地推荐仍可正常使用。'],
    ['今天上海天气怎么样', 'WEATHER_PROVIDER_UNAVAILABLE', '天气数据暂时不可用：合成服务错误。我不会用猜测或旧资料代替实时天气；站内产品浏览和本地推荐仍可正常使用。'],
    ['NARS 最新价格', 'UPSTREAM_TIMEOUT', '联网检索当前不可用：合成服务错误。我不会用未经检索的信息冒充实时结果；你仍可询问不依赖实时信息的站内产品推荐。'],
  ])('preserves error precedence and recovery for %s', async (text, code, expected) => {
    vi.mocked(requestAssistant).mockResolvedValueOnce(answer())
    await render().sendMessage('解释一下光的折射')
    expect(render().activeModel).toBe('synthetic-model')
    vi.mocked(requestAssistant).mockRejectedValueOnce(Object.assign(new Error(' 合成服务错误。。! '), { code }))
    await render().sendMessage(text)
    expect(latest()).toMatchObject({ content: expected, productIds: [], sources: [] })
    expect(render()).toMatchObject({ mode: 'error', activeModel: '', busy: false })
    expect(requestMakeupPlan).not.toHaveBeenCalled()
    vi.mocked(requestAssistant).mockRejectedValueOnce(new TypeError('Failed to fetch'))
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
