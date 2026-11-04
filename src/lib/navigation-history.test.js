import { describe, expect, it } from 'vitest'
import {
  APP_HISTORY_MARKER,
  createNavigationEntry,
  navigationPath,
  resolveNavigationEntry,
} from './navigation-history'

describe('站内导航历史', () => {
  it('creates a safe root entry for an untracked visit', () => {
    expect(resolveNavigationEntry(null, '/')).toEqual({
      marker: APP_HISTORY_MARKER,
      view: 'home',
      productId: null,
      drawerProductId: null,
      scrollY: 0,
      depth: 0,
    })
  })

  it('restores the source view, drawer, scroll position, and history depth', () => {
    const entry = createNavigationEntry({
      view: 'library',
      drawerProductId: 'nars-light-reflecting',
      scrollY: 860,
      depth: 2,
    })
    expect(resolveNavigationEntry(entry, '/')).toEqual(entry)
    expect(navigationPath(entry)).toBe('/')
  })

  it('resolves and encodes direct product profile paths', () => {
    const entry = resolveNavigationEntry(null, '/products/L%27Or%C3%A9al%20Paris')
    expect(entry).toMatchObject({ view: 'product', productId: "L'Oréal Paris", depth: 0 })
    expect(navigationPath(entry)).toBe("/products/L'Or%C3%A9al%20Paris")
  })

  it('falls back safely when app history state is malformed', () => {
    expect(resolveNavigationEntry({ marker: APP_HISTORY_MARKER, view: 'product' }, '/')).toMatchObject({
      view: 'home',
      productId: null,
    })
    expect(createNavigationEntry({ view: 'unknown', scrollY: -4, depth: -2 })).toMatchObject({
      view: 'home',
      scrollY: 0,
      depth: 0,
    })
  })
})
