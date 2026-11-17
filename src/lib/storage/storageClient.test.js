import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readJson, readJsonValue, writeJson, writeVersioned } from './storageClient'

describe('存储 JSON 与版本包装', () => {
  let values
  let storage

  beforeEach(() => {
    values = new Map()
    storage = {
      getItem: vi.fn((key) => values.get(key) ?? null),
      setItem: vi.fn((key, value) => values.set(key, value)),
    }
    vi.stubGlobal('localStorage', storage)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('preserves the profile shape inside the version 1 envelope', () => {
    const profile = { skin: '混油皮', finish: '柔雾', budget: 0, city: '', tone: '中性调' }
    writeVersioned('profile', profile)
    expect(JSON.parse(values.get('profile'))).toEqual({ version: 1, value: profile })
    expect(readJson('profile', null).value).toEqual(profile)
  })

  it('preserves message fields and leaves trimming to the caller', () => {
    const messages = Array.from({ length: 25 }, (_, index) => ({
      id: String(index), role: 'assistant', content: `消息 ${index}`, productIds: [],
      sources: [{ kind: 'knowledge', title: '测试来源', url: 'https://example.test/source', publisher: '测试', accessedAt: '2026-11-17T00:00:00.000Z' }],
    }))
    writeVersioned('messages', messages)
    expect(readJson('messages', null)).toEqual({ version: 1, value: messages })
    expect(messages).toHaveLength(25)
  })

  it.each([undefined, '', 'null', '{broken', 'undefined'])('uses the fallback for absent, null, or invalid JSON: %s', (raw) => {
    if (raw !== undefined) values.set('record', raw)
    const fallback = []
    expect(readJson('record', fallback)).toBe(fallback)
  })

  it.each([false, 0, ''])('does not replace a valid falsy value: %s', (value) => {
    values.set('record', JSON.stringify(value))
    expect(readJson('record', 'fallback')).toBe(value)
  })

  it('propagates storage access errors instead of treating them as invalid JSON', () => {
    const error = new Error('storage unavailable')
    storage.getItem.mockImplementation(() => { throw error })
    expect(() => readJson('record', {})).toThrow(error)
    storage.setItem.mockImplementation(() => { throw error })
    expect(() => writeVersioned('record', {})).toThrow(error)
  })

  it('propagates JSON serialization errors without writing a partial record', () => {
    const value = {}
    value.self = value
    expect(() => writeVersioned('record', value)).toThrow(TypeError)
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('allows a raw consumer to preserve null while the existing reader still falls back', () => {
    values.set('raw', 'null')
    expect(readJsonValue('raw', {})).toBeNull()
    expect(readJson('raw', 'fallback')).toBe('fallback')
    expect(readJsonValue('missing', {})).toEqual({})
    values.set('raw', '{broken')
    expect(readJsonValue('raw', {})).toEqual({})
  })

  it('writes raw JSON without a version envelope and propagates access errors', () => {
    writeJson('raw', { id: '想买' })
    expect(values.get('raw')).toBe('{"id":"想买"}')
    const error = new Error('denied')
    storage.getItem.mockImplementation(() => { throw error })
    storage.setItem.mockImplementation(() => { throw error })
    expect(() => readJsonValue('raw', {})).toThrow(error)
    expect(() => writeJson('raw', {})).toThrow(error)
  })
})
