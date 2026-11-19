import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { currentNavigationEntry, useAppNavigation } from './useAppNavigation'
import { createNavigationEntry } from '../../../lib/navigation-history'
import { productById } from '../../catalog/catalogService'

// Isolated React lifecycle + browser API boundary, not a DOM/router replacement.
// Real history, focus, scroll and remount behavior is checked in Playwright.
const h = vi.hoisted(() => ({ slots: [], deps: [], cleanup: [], effects: [], cursor: 0 }))
const changed = (before, after) => !before || after.some((v, i) => !Object.is(v, before[i]))
vi.mock('react', async (original) => ({
  ...await original(),
  useState(initial) {
    const i = h.cursor++
    if (!(i in h.slots)) h.slots[i] = typeof initial === 'function' ? initial() : initial
    return [h.slots[i], (next) => { h.slots[i] = typeof next === 'function' ? next(h.slots[i]) : next }]
  },
  useRef(initial) { const i = h.cursor++; return h.slots[i] ||= { current: initial } },
  useCallback(fn, deps) {
    const i = h.cursor++
    if (changed(h.deps[i], deps)) h.slots[i] = fn
    h.deps[i] = deps
    return h.slots[i]
  },
  useEffect(fn, deps) {
    const i = h.cursor++
    if (changed(h.deps[i], deps)) h.effects.push(() => { h.cleanup[i]?.(); h.cleanup[i] = fn() })
    h.deps[i] = deps
  },
}))
let options, stack, index, raf, listeners
const product = productById('nars-light-reflecting')
function render() {
  h.cursor = 0; h.effects = []
  const result = useAppNavigation(options)
  h.effects.forEach((fn) => fn())
  return result
}
function flushScroll() { const pending = raf.splice(0); pending.forEach((fn) => fn()) }
function dispatch(name, event) { for (const fn of [...(listeners[name] || [])]) fn(event) }
function unmount() { h.cleanup.forEach((fn) => fn?.()); h.cleanup = [] }
function locationFor(url) { const value = new URL(url, 'http://localhost'); Object.assign(window.location, { pathname: value.pathname, hash: value.hash }) }
beforeEach(() => {
  Object.assign(h, { slots: [], deps: [], cleanup: [], effects: [], cursor: 0 })
  vi.useFakeTimers()
  const initialEntry = createNavigationEntry({ view: 'library' })
  stack = [{ entry: initialEntry, url: '/' }]; index = 0; raf = []; listeners = {}
  const history = {
    state: initialEntry, scrollRestoration: 'auto',
    replaceState: vi.fn((entry, _, url) => { stack[index] = { entry, url }; history.state = entry; locationFor(url) }),
    pushState: vi.fn((entry, _, url) => { stack.splice(index + 1); stack.push({ entry, url }); index++; history.state = entry; locationFor(url) }),
    back: vi.fn(() => { if (index > 0) { index--; history.state = stack[index].entry; locationFor(stack[index].url); dispatch('popstate', { state: history.state }) } }),
  }
  vi.stubGlobal('window', { history, location: { pathname: '/', hash: '' }, scrollY: 0,
    scrollTo: vi.fn(({ top }) => { window.scrollY = top }),
    requestAnimationFrame: vi.fn((fn) => { raf.push(fn); return raf.length }),
    setTimeout, clearTimeout,
    addEventListener: vi.fn((name, fn) => { (listeners[name] ||= []).push(fn) }),
    removeEventListener: vi.fn((name, fn) => { listeners[name] = listeners[name].filter((item) => item !== fn) }),
  })
  vi.stubGlobal('document', { body: { style: { overflow: 'scroll' } }, documentElement: { style: { overflow: 'clip' } } })
  options = { initialEntry, openingActive: false, view: 'library', setOpeningActive: vi.fn((v) => { options.openingActive = v }), setView: vi.fn((v) => { options.view = v }), setFilterPanelOpen: vi.fn() }
})
afterEach(() => { unmount(); vi.useRealTimers(); vi.unstubAllGlobals() })

describe('app navigation state and lifecycle', () => {
  it('normalizes invalid product IDs and preserves valid direct profile/drawer products', () => {
    window.history.state = null; window.location.pathname = '/products/nars-light-reflecting'
    expect(currentNavigationEntry()).toMatchObject({ view: 'product', productId: product.id })
    options.initialEntry = currentNavigationEntry(); options.view = 'product'
    expect(render().profileProduct).toBe(product)
    window.history.state = createNavigationEntry({ view: 'product', productId: 'missing' })
    expect(currentNavigationEntry()).toEqual(createNavigationEntry())
    window.history.state = createNavigationEntry({ view: 'library', drawerProductId: 'missing' })
    expect(currentNavigationEntry()).toMatchObject({ view: 'library', drawerProductId: null })
  })

  it('mounts once, strips the hash through the original path and restores listeners/history mode on unmount', () => {
    window.location.hash = '#culture'
    render(); render()
    expect(window.history.scrollRestoration).toBe('manual')
    expect(window.history.replaceState).toHaveBeenCalledExactlyOnceWith(options.initialEntry, '', '/')
    expect(window.location.hash).toBe('')
    expect(listeners.popstate).toHaveLength(1)
    expect(listeners.keydown).toHaveLength(1)
    unmount()
    expect(window.history.scrollRestoration).toBe('auto')
    expect(listeners.popstate).toEqual([])
    expect(listeners.keydown).toEqual([])
  })

  it('snapshots scroll and increases depth only for a new page, then scrolls on RAF', () => {
    render().setMobileMenuOpen(true); window.scrollY = 740
    render().navigate('culture')
    expect(stack[0].entry.scrollY).toBe(740)
    expect(window.history.state).toMatchObject({ view: 'culture', depth: 1, scrollY: 0 })
    expect(options.view).toBe('culture')
    expect(render().mobileMenuOpen).toBe(false)
    expect(options.setFilterPanelOpen).toHaveBeenCalledWith(false)
    expect(window.scrollTo).not.toHaveBeenCalled()
    flushScroll()
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'auto' })
  })

  it('same-page navigation closes the menu and uses smooth scrolling without pushing or closing filters', () => {
    render().setMobileMenuOpen(true)
    render().navigate('library')
    expect(render().mobileMenuOpen).toBe(false)
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(options.setFilterPanelOpen).not.toHaveBeenCalled()
    expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 0, behavior: 'smooth' })
  })

  it('replaces an existing drawer at the same depth, Escape goes back and restores source scroll', () => {
    window.scrollY = 520
    render().openProductDrawer(product); render(); flushScroll()
    expect(window.history.state).toMatchObject({ view: 'library', drawerProductId: product.id, depth: 1, scrollY: 520 })
    const second = productById('estee-lauder-double-wear')
    render().openProductDrawer(second); render(); flushScroll()
    expect(stack).toHaveLength(2)
    expect(render().selectedProduct).toBe(second)
    expect(window.history.state).toMatchObject({ drawerProductId: second.id, depth: 1 })
    expect(listeners.keydown).toHaveLength(1)
    dispatch('keydown', { key: 'Escape' }); render(); flushScroll()
    expect(window.history.back).toHaveBeenCalledOnce()
    expect(render().selectedProduct).toBeNull()
    expect(window.scrollY).toBe(520)
  })

  it('root drawer closes by replacement and preserves source scroll; unrelated keys do nothing', () => {
    options.initialEntry = createNavigationEntry({ view: 'culture', drawerProductId: product.id, scrollY: 240 })
    options.view = 'culture'
    render()
    dispatch('keydown', { key: 'Enter' })
    expect(options.setFilterPanelOpen).not.toHaveBeenCalled()
    render().closeProductDrawer(); render(); flushScroll()
    expect(window.history.back).not.toHaveBeenCalled()
    expect(window.history.state).toMatchObject({ view: 'culture', drawerProductId: null, scrollY: 240 })
    expect(window.scrollY).toBe(240)
  })

  it('pushes profile paths and back closes a nested profile, while a direct profile replaces with library', () => {
    render().openProductProfile(product); render()
    expect(window.location.pathname).toBe('/products/nars-light-reflecting')
    expect(render().profileProduct).toBe(product)
    render().closeProductProfile(); render()
    expect(options.view).toBe('library')
    window.history.state = createNavigationEntry({ view: 'product', productId: product.id })
    render().closeProductProfile()
    expect(window.history.state).toMatchObject({ view: 'library', depth: 0 })
    expect(window.history.back).toHaveBeenCalledOnce()
  })

  it('popstate restores selected/profile/menu/filter state and schedules the saved scroll', () => {
    render().setMobileMenuOpen(true)
    dispatch('popstate', { state: createNavigationEntry({ view: 'culture', drawerProductId: product.id, scrollY: 320, depth: 2 }) })
    const value = render()
    expect(options.view).toBe('culture')
    expect(value).toMatchObject({ selectedProduct: product, profileProduct: null, mobileMenuOpen: false })
    flushScroll(); expect(window.scrollY).toBe(320)
    dispatch('popstate', { state: createNavigationEntry({ view: 'product', productId: 'missing' }) })
    render(); expect(options.view).toBe('home')
  })

  it('Escape without a drawer closes filters but leaves the existing mobile menu open', () => {
    render().setMobileMenuOpen(true); render()
    dispatch('keydown', { key: 'Escape' })
    expect(options.setFilterPanelOpen).toHaveBeenCalledExactlyOnceWith(false)
    expect(render().mobileMenuOpen).toBe(true)
    expect(window.history.back).not.toHaveBeenCalled()
  })

  it('preserves opening lock, stable completion, timed home focus, cleanup and one-time behavior', () => {
    options.initialEntry = createNavigationEntry(); options.view = 'home'; options.openingActive = true
    const complete = render().completeOpening
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(render().completeOpening).toBe(complete)
    complete(); render(); flushScroll()
    expect(options.setOpeningActive).toHaveBeenCalledExactlyOnceWith(false)
    expect(document.body.style.overflow).toBe('hidden')
    vi.advanceTimersByTime(2599)
    expect(document.body.style.overflow).toBe('hidden')
    vi.advanceTimersByTime(1)
    expect(document.body.style.overflow).toBe('scroll')
    expect(document.documentElement.style.overflow).toBe('clip')
    options.view = 'culture'; render(); options.view = 'home'; render()
    expect(document.body.style.overflow).toBe('scroll')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('restores the previous overflow and clears the focus timer on early departure', () => {
    options.initialEntry = createNavigationEntry(); options.view = 'home'
    render(); expect(vi.getTimerCount()).toBe(1)
    options.view = 'library'; render()
    expect(vi.getTimerCount()).toBe(0)
    expect(document.body.style.overflow).toBe('scroll')
    expect(document.documentElement.style.overflow).toBe('clip')
  })
})
