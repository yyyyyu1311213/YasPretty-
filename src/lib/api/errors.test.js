import { describe, expect, it } from 'vitest'
import { createApiError } from './errors'

describe('既有 API 错误分类边界', () => {
  it('keeps message-only business failures as plain Error without an own code', () => {
    const error = createApiError('智能服务没有返回内容')
    expect(Object.getPrototypeOf(error)).toBe(Error.prototype)
    expect(error.name).toBe('Error')
    expect(error.message).toBe('智能服务没有返回内容')
    expect(Object.hasOwn(error, 'code')).toBe(false)
  })

  it.each(['AI_NOT_CONFIGURED', 'WEB_SEARCH_FAILED', 'WEATHER_PROVIDER_UNAVAILABLE', 'UPSTREAM_TIMEOUT', 'REQUEST_FAILED'])(
    'retains %s separately for the existing caller fallback', (code) => {
      const error = createApiError('合成服务错误。', code)
      expect(Object.getPrototypeOf(error)).toBe(Error.prototype)
      expect(error.message).toBe('合成服务错误。')
      expect(error.code).toBe(code)
      expect(Object.keys(error)).toEqual(['code'])
    },
  )
})
