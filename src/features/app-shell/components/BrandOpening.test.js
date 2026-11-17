import { afterEach, describe, expect, it, vi } from 'vitest'
import { EXIT_MS, OPENING_MS, REDUCED_MS, prefersReducedMotion } from './BrandOpening'

describe('品牌开幕', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('keeps the standard and reduced motion durations inside the UI-B limits', () => {
    expect(OPENING_MS).toBeGreaterThanOrEqual(1800)
    expect(OPENING_MS).toBeLessThanOrEqual(5400)
    expect(EXIT_MS).toBeGreaterThanOrEqual(900)
    expect(EXIT_MS).toBeLessThanOrEqual(1800)
    expect(REDUCED_MS).toBeLessThanOrEqual(150)
  })

  it('reads the operating system reduced motion preference', () => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: true }) })
    expect(prefersReducedMotion()).toBe(true)
  })
})
