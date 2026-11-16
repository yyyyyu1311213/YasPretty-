import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearLegacyCredentials } from './clearUserData'

describe('旧浏览器凭据清理', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('deletes only the two obsolete config keys without reading their contents', () => {
    const retained = [
      'yaspretty-xiaoy-profile-v1', 'yaspretty-xiaoy-messages-v1',
      'yaspretty-xiaoy-profile', 'yaspretty-xiaoy-messages', 'unrelated-record',
    ]
    const values = new Map([...retained, 'yaspretty-xiaoy-config', 'yaspretty-assistant-config'].map((key) => [key, 'test-only']))
    const storage = {
      getItem: vi.fn(),
      removeItem: vi.fn((key) => values.delete(key)),
      clear: vi.fn(),
    }
    vi.stubGlobal('localStorage', storage)
    clearLegacyCredentials()
    clearLegacyCredentials()
    expect([...values.keys()]).toEqual(retained)
    expect(storage.getItem).not.toHaveBeenCalled()
    expect(storage.clear).not.toHaveBeenCalled()
    expect(storage.removeItem.mock.calls.slice(0, 2)).toEqual([
      ['yaspretty-xiaoy-config'], ['yaspretty-assistant-config'],
    ])
  })

  it('propagates a removal error and stops at the failing key', () => {
    const error = new Error('storage unavailable')
    const removeItem = vi.fn(() => { throw error })
    vi.stubGlobal('localStorage', { removeItem })
    expect(() => clearLegacyCredentials()).toThrow(error)
    expect(removeItem.mock.calls).toEqual([['yaspretty-xiaoy-config']])
  })
})
