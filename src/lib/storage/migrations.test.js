import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readVersioned } from './migrations'
import { LEGACY_MESSAGES_KEY, LEGACY_PROFILE_KEY, MESSAGES_KEY, PROFILE_KEY } from './storageKeys'

describe('小Y旧数据迁移', () => {
  let values
  let storage

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

  it.each([
    [PROFILE_KEY, LEGACY_PROFILE_KEY, { skin: '混油皮', budget: 400 }],
    [MESSAGES_KEY, LEGACY_MESSAGES_KEY, [{ id: 'old', role: 'user', content: '测试消息', productIds: [] }]],
  ])('migrates %s once and restores it on the next read', (key, legacyKey, value) => {
    values.set(legacyKey, JSON.stringify(value))
    expect(readVersioned(key, legacyKey, null)).toEqual(value)
    expect(JSON.parse(values.get(key))).toEqual({ version: 1, value })
    expect(values.has(legacyKey)).toBe(false)
    expect(storage.setItem.mock.invocationCallOrder[0]).toBeLessThan(storage.removeItem.mock.invocationCallOrder[0])
    storage.setItem.mockClear()
    expect(readVersioned(key, legacyKey, null)).toEqual(value)
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it.each([null, false, 0, '', [], {}])('prefers a current version 1 value without reading or deleting legacy data: %j', (value) => {
    values.set(PROFILE_KEY, JSON.stringify({ version: 1, value }))
    values.set(LEGACY_PROFILE_KEY, JSON.stringify({ skin: '干皮' }))
    expect(readVersioned(PROFILE_KEY, LEGACY_PROFILE_KEY, 'fallback')).toEqual(value)
    expect(storage.getItem).toHaveBeenCalledTimes(1)
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it.each(['{broken', 'null', '{"version":2,"value":{}}', '{"version":"1","value":{}}', '{"version":1}'])('tries legacy data when the current envelope is unusable: %s', (raw) => {
    values.set(PROFILE_KEY, raw)
    values.set(LEGACY_PROFILE_KEY, JSON.stringify({ skin: '干皮' }))
    expect(readVersioned(PROFILE_KEY, LEGACY_PROFILE_KEY, {})).toEqual({ skin: '干皮' })
    expect(values.has(LEGACY_PROFILE_KEY)).toBe(false)
  })

  it.each([undefined, 'null', '{broken'])('returns the original fallback without deleting unusable legacy data: %s', (raw) => {
    values.set(MESSAGES_KEY, '{broken')
    if (raw !== undefined) values.set(LEGACY_MESSAGES_KEY, raw)
    const fallback = [{ id: 'welcome' }]
    expect(readVersioned(MESSAGES_KEY, LEGACY_MESSAGES_KEY, fallback)).toBe(fallback)
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it.each([false, 0, '', [], {}])('keeps the existing permissive legacy value semantics: %j', (value) => {
    values.set(LEGACY_PROFILE_KEY, JSON.stringify(value))
    expect(readVersioned(PROFILE_KEY, LEGACY_PROFILE_KEY, 'fallback')).toEqual(value)
    expect(JSON.parse(values.get(PROFILE_KEY))).toEqual({ version: 1, value })
  })

  it('keeps legacy data when writing the new record fails', () => {
    values.set(LEGACY_PROFILE_KEY, '{"skin":"干皮"}')
    const error = new Error('quota exceeded')
    storage.setItem.mockImplementation(() => { throw error })
    expect(() => readVersioned(PROFILE_KEY, LEGACY_PROFILE_KEY, {})).toThrow(error)
    expect(values.has(LEGACY_PROFILE_KEY)).toBe(true)
    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it('propagates deletion failures after writing and prefers the new record on the next read', () => {
    values.set(LEGACY_PROFILE_KEY, '{"skin":"干皮"}')
    const error = new Error('remove unavailable')
    storage.removeItem.mockImplementation(() => { throw error })
    expect(() => readVersioned(PROFILE_KEY, LEGACY_PROFILE_KEY, {})).toThrow(error)
    expect(values.has(LEGACY_PROFILE_KEY)).toBe(true)
    expect(JSON.parse(values.get(PROFILE_KEY))).toEqual({ version: 1, value: { skin: '干皮' } })
    expect(readVersioned(PROFILE_KEY, LEGACY_PROFILE_KEY, {})).toEqual({ skin: '干皮' })
    expect(storage.removeItem).toHaveBeenCalledTimes(1)
  })
})
