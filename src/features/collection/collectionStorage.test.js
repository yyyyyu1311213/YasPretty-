import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { COLLECTION_KEY, getStoredCollection, saveCollection } from './collectionStorage'

let values, storage
beforeEach(() => {
  values = new Map()
  storage = {
    getItem: vi.fn((key) => values.get(key) ?? null),
    setItem: vi.fn((key, value) => values.set(key, value)),
    removeItem: vi.fn((key) => values.delete(key)),
  }
  vi.stubGlobal('localStorage', storage)
})
afterEach(() => vi.unstubAllGlobals())

describe('collection raw storage compatibility', () => {
  it('keeps the only existing key and reads the historical unversioned object without migration', () => {
    expect(COLLECTION_KEY).toBe('base-archive-collection')
    const old = { second: '正在用', first: '想买' }
    values.set(COLLECTION_KEY, JSON.stringify(old))
    expect(getStoredCollection()).toEqual(old)
    expect(storage.getItem).toHaveBeenCalledExactlyOnceWith(COLLECTION_KEY)
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it.each([undefined, '', '{broken', 'undefined'])('uses the original empty fallback for %s', (raw) => {
    if (raw !== undefined) values.set(COLLECTION_KEY, raw)
    expect(getStoredCollection()).toEqual({})
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it.each([null, false, 0, '', [], ['想买'], { version: 1, value: { id: '想买' } }])('preserves the original parsed shape without adding validation: %j', (value) => {
    values.set(COLLECTION_KEY, JSON.stringify(value))
    expect(getStoredCollection()).toEqual(value)
  })

  it('writes exact raw bytes and restores them on the next read, leaving other records untouched', () => {
    const other = { 'yaspretty-xiaoy-profile-v1': '{"version":1,"value":{"skin":"干皮"}}', 'yaspretty-xiaoy-profile': '{"skin":"混油皮"}', unrelated: 'sentinel' }
    for (const [key, value] of Object.entries(other)) values.set(key, value)
    const collection = { second: '会回购', first: '正在用', unknown: '想买' }
    expect(saveCollection(collection)).toBeUndefined()
    expect(storage.setItem).toHaveBeenCalledExactlyOnceWith(COLLECTION_KEY, '{"second":"会回购","first":"正在用","unknown":"想买"}')
    expect(getStoredCollection()).toEqual(collection)
    for (const [key, value] of Object.entries(other)) expect(values.get(key)).toBe(value)
    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it('catches read/access failure as the old collection reader did', () => {
    storage.getItem.mockImplementation(() => { throw new Error('read denied') })
    expect(getStoredCollection()).toEqual({})
    vi.stubGlobal('localStorage', undefined)
    expect(getStoredCollection()).toEqual({})
  })

  it('propagates write and serialization errors without deleting or altering other data', () => {
    values.set('unrelated', 'sentinel')
    const error = new Error('quota exceeded')
    storage.setItem.mockImplementation(() => { throw error })
    expect(() => saveCollection({ id: '想买' })).toThrow(error)
    storage.setItem.mockClear()
    const circular = {}; circular.self = circular
    expect(() => saveCollection(circular)).toThrow(TypeError)
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(storage.removeItem).not.toHaveBeenCalled()
    expect([...values]).toEqual([['unrelated', 'sentinel']])
  })
})
