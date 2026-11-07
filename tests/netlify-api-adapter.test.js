import { describe, expect, it } from 'vitest'
import { requestPath } from '../netlify/functions/api.js'

describe('Netlify API adapter', () => {
  it('keeps redirected API paths under the Fastify /api namespace', () => {
    expect(requestPath({ path: '/.netlify/functions/api/health' })).toBe('/api/health')
    expect(requestPath({ path: '/api/assistant' })).toBe('/api/assistant')
  })

  it('preserves query parameters from a Netlify event', () => {
    expect(requestPath({ path: '/.netlify/functions/api/health', rawQuery: 'check=1' }))
      .toBe('/api/health?check=1')
    expect(requestPath({ path: '/.netlify/functions/api/health', queryStringParameters: { check: '1' } }))
      .toBe('/api/health?check=1')
  })
})
