import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCollection } from './useCollection'
import { COLLECTION_KEY } from '../collectionStorage'

// Isolated state/effect boundary; real React and cross-page interactions run in Playwright.
const lifecycle = vi.hoisted(() => ({ states: [], effects: [], cursor: 0, effectCursor: 0, pending: [] }))
vi.mock('react', async (original) => ({
  ...await original(),
  useState(initial) {
    const i = lifecycle.cursor++
    if (!(i in lifecycle.states)) lifecycle.states[i] = typeof initial === 'function' ? initial() : initial
    return [lifecycle.states[i], (next) => { lifecycle.states[i] = typeof next === 'function' ? next(lifecycle.states[i]) : next }]
  },
  useEffect(effect, deps) {
    const i = lifecycle.effectCursor++
    if (!lifecycle.effects[i] || deps.some((value, index) => value !== lifecycle.effects[i][index])) lifecycle.pending.push(effect)
    lifecycle.effects[i] = deps
  },
}))
function render() {
  lifecycle.cursor = 0; lifecycle.effectCursor = 0
  const state = useCollection()
  const effects = lifecycle.pending.splice(0)
  for (const effect of effects) effect()
  return state
}
function remount() { lifecycle.states = []; lifecycle.effects = []; lifecycle.pending = [] }
let values, storage
beforeEach(() => {
  remount()
  values = new Map()
  storage = { getItem: vi.fn((key) => values.get(key) ?? null), setItem: vi.fn((key, value) => values.set(key, value)) }
  vi.stubGlobal('localStorage', storage)
})
afterEach(() => vi.unstubAllGlobals())

describe('shared collection state owner', () => {
  it('initializes once, persists empty state, and does not re-read on each render', () => {
    expect(render()).toMatchObject({ collection: {}, favoriteCount: 0 })
    expect(values.get(COLLECTION_KEY)).toBe('{}')
    render()
    expect(storage.getItem).toHaveBeenCalledTimes(1)
    expect(storage.setItem).toHaveBeenCalledTimes(1)
  })

  it('combines updates from page callbacks against the same latest state and restores after remount', () => {
    const owner = render()
    const home = owner.setStatus, library = owner.setStatus, detail = owner.setStatus
    home('second', '想买'); library('first', '正在用'); detail('second', '会回购')
    const favorites = render()
    expect(favorites).toMatchObject({ favoriteCount: 2, collection: { second: '会回购', first: '正在用' } })
    expect(values.get(COLLECTION_KEY)).toBe('{"second":"会回购","first":"正在用"}')
    favorites.removeFavorite('second')
    expect(render()).toMatchObject({ favoriteCount: 1, collection: { first: '正在用' } })
    remount()
    expect(render()).toMatchObject({ favoriteCount: 1, collection: { first: '正在用' } })
  })

  it('recovers corrupted JSON but does not swallow persistence failure or normalize null', () => {
    values.set(COLLECTION_KEY, '{broken')
    expect(render().collection).toEqual({})
    expect(values.get(COLLECTION_KEY)).toBe('{}')
    remount()
    const error = new Error('write denied')
    storage.setItem.mockImplementation(() => { throw error })
    expect(() => render()).toThrow(error)
    remount()
    values.set(COLLECTION_KEY, 'null')
    expect(() => render()).toThrow(TypeError)
  })
})
