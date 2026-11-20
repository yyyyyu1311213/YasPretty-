import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import AppShell from './AppShell'
import TopHeader from './TopHeader'
import MobileNavigation from './MobileNavigation'
import SiteBackdrop from './SiteBackdrop'
import { imageRightsContactUrl, productImageNotice } from '../../../data/product-image-sources'

// Element/callback + SSR boundaries; real React/navigation lives in Playwright.
function* nodes(value) {
  if (Array.isArray(value)) { for (const child of value) yield* nodes(child); return }
  if (!value || typeof value !== 'object') return
  yield value
  yield* nodes(value.props?.children)
}
const names = ['首页', '小Y智能选妆', '产品库', '品牌文化', '我的收藏']
const ids = ['home', 'assistant', 'library', 'culture', 'favorites']

describe('existing app structure', () => {
  it.each(ids)('keeps desktop navigation order and active item %s', (activeView) => {
    const onNavigate = vi.fn(), onMobileMenu = vi.fn()
    const tree = TopHeader({ activeView, favoriteCount: 2, mobileMenuOpen: false, onNavigate, onMobileMenu })
    const nav = [...nodes(tree)].find((n) => n.props?.className === 'desktop-nav')
    const buttons = [...nodes(nav)].filter((n) => n.type === 'button')
    expect(buttons.map((n) => n.props.children[0])).toEqual(names)
    expect(buttons.map((n) => n.props.className)).toEqual(ids.map((id) => id === activeView ? 'nav-link active' : 'nav-link'))
    buttons.forEach((n) => n.props.onClick())
    expect(onNavigate.mock.calls).toEqual(ids.map((id) => [id]))
    const brand = [...nodes(tree)].find((n) => n.props?.className === 'brand')
    brand.props.onClick()
    expect(onNavigate).toHaveBeenLastCalledWith('home')
    const toggle = [...nodes(tree)].find((n) => n.props?.className === 'mobile-menu-button')
    toggle.props.onClick()
    expect(onMobileMenu).toHaveBeenCalledOnce()
    expect(renderToStaticMarkup(tree)).not.toContain('class="mobile-nav"')
  })

  it('only renders the original mobile dropdown while open and passes actions without another state store', () => {
    const onNavigate = vi.fn()
    const tree = TopHeader({ activeView: 'favorites', favoriteCount: 3, mobileMenuOpen: true, onNavigate })
    const mobile = [...nodes(tree)].find((n) => n.type === MobileNavigation)
    expect(mobile.props.onNavigate).toBe(onNavigate)
    const nav = MobileNavigation(mobile.props)
    expect(nav.type).toBe('nav')
    expect(nav.props['aria-label']).toBe('移动端主导航')
    const buttons = [...nodes(nav)].filter((n) => n.type === 'button')
    expect(buttons.map((n) => n.props.className)).toEqual(['', '', '', '', 'active'])
    expect(renderToStaticMarkup(nav)).toContain('我的收藏 (3)')
    buttons.forEach((n) => n.props.onClick())
    expect(onNavigate.mock.calls).toEqual(ids.map((id) => [id]))
    expect(renderToStaticMarkup(TopHeader({ favoriteCount: 0, mobileMenuOpen: true }))).not.toContain('nav-count')
  })

  it('keeps the fixed backdrop and opening/header/main/footer/overlay sibling order', () => {
    const opening = <div data-opening="true" />, page = <section data-page="true" />, overlay = <aside role="dialog" />
    const navigate = vi.fn()
    const tree = AppShell({ opening, children: page, overlay, activeView: 'library', favoriteCount: 1, onNavigate: navigate })
    expect(tree.type).toBe('div')
    expect(tree.props.className).toBe('app-shell')
    const children = tree.props.children
    expect(children[0].type).toBe(SiteBackdrop)
    expect(children[1]).toBe(opening)
    expect(children[2].type).toBe(TopHeader)
    expect(children[2].props.onNavigate).toBe(navigate)
    expect(children[3].type).toBe('main')
    expect(children[3].props.children).toBe(page)
    expect(children[5]).toBe(overlay)
    const markup = renderToStaticMarkup(tree)
    expect(markup).toContain('class="site-backdrop" aria-hidden="true"')
    expect(markup).toContain(productImageNotice)
    expect(markup).toContain(imageRightsContactUrl)
    expect(markup.indexOf('data-opening')).toBeLessThan(markup.indexOf('site-header'))
    expect(markup.indexOf('</main>')).toBeLessThan(markup.indexOf('site-footer'))
    expect(markup.indexOf('site-footer')).toBeLessThan(markup.indexOf('role="dialog"'))
    expect(renderToStaticMarkup(AppShell({ children: page }))).not.toContain('role="dialog"')
  })
})
