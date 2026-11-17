import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAssistant } from './useAssistant'

// Exercise the real storage wiring at initialization/effect boundaries without a DOM dependency.
// These checks do not replace browser interaction or viewport regression checks.
const lifecycle = vi.hoisted(() => ({ effects: [] }))
vi.mock('react', async (importOriginal) => ({
  ...await importOriginal(),
  useState: (initial) => [typeof initial === 'function' ? initial() : initial, vi.fn()],
  useEffect: (effect) => lifecycle.effects.push(effect),
  useMemo: (create) => create(),
  useRef: () => ({ current: null }),
}))

function initializeAndPersist() {
  lifecycle.effects = []
  useAssistant()
  lifecycle.effects.forEach((effect) => effect())
}

describe('小Y存储调用集成', () => {
  let values
  beforeEach(() => {
    values = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    })
  })
  afterEach(() => vi.unstubAllGlobals())

  it('persists empty-profile and welcome-message defaults with the unchanged keys and version', () => {
    initializeAndPersist()
    expect(JSON.parse(values.get('yaspretty-xiaoy-profile-v1'))).toEqual({ version: 1, value: {} })
    expect(JSON.parse(values.get('yaspretty-xiaoy-messages-v1'))).toMatchObject({
      version: 1, value: [{ id: 'welcome', role: 'assistant', productIds: [] }],
    })
  })

  it('restores and re-persists the full profile and messages at the next initialization', () => {
    const profile = { skin: '混油皮', finish: '柔雾', scene: '通勤', budget: 400, category: '粉底液', coverage: '高', tone: '中性调', city: '' }
    const messages = [
      { id: 'user', role: 'user', content: '测试偏好', productIds: [], sources: [] },
      { id: 'reply', role: 'assistant', content: '测试回复', productIds: [], sources: [{ kind: 'knowledge', title: '测试', url: 'https://example.test/source', publisher: '测试', accessedAt: '2026-11-17T00:00:00.000Z' }] },
    ]
    values.set('yaspretty-xiaoy-profile-v1', JSON.stringify({ version: 1, value: profile }))
    values.set('yaspretty-xiaoy-messages-v1', JSON.stringify({ version: 1, value: messages }))
    initializeAndPersist()
    initializeAndPersist()
    expect(JSON.parse(values.get('yaspretty-xiaoy-profile-v1')).value).toEqual(profile)
    expect(JSON.parse(values.get('yaspretty-xiaoy-messages-v1')).value).toEqual(messages)
  })

  it('migrates old records, persists only the last 20 messages in order, and clears old credentials', () => {
    const messages = Array.from({ length: 25 }, (_, index) => ({ id: String(index), role: 'user', content: `测试 ${index}`, productIds: [] }))
    values.set('yaspretty-xiaoy-profile', JSON.stringify({ skin: '干皮', budget: 300 }))
    values.set('yaspretty-xiaoy-messages', JSON.stringify(messages))
    values.set('yaspretty-xiaoy-config', 'test-only')
    values.set('yaspretty-assistant-config', 'test-only')
    values.set('unrelated-record', 'keep')
    initializeAndPersist()
    expect(JSON.parse(values.get('yaspretty-xiaoy-profile-v1'))).toEqual({ version: 1, value: { skin: '干皮', budget: 300 } })
    expect(JSON.parse(values.get('yaspretty-xiaoy-messages-v1')).value.map(({ id }) => id)).toEqual([
      '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24',
    ])
    expect(messages).toHaveLength(25)
    for (const key of ['yaspretty-xiaoy-profile', 'yaspretty-xiaoy-messages', 'yaspretty-xiaoy-config', 'yaspretty-assistant-config']) {
      expect(values.has(key)).toBe(false)
    }
    initializeAndPersist()
    expect(JSON.parse(values.get('yaspretty-xiaoy-messages-v1')).value).toHaveLength(20)
    expect(values.get('unrelated-record')).toBe('keep')
  })
})
