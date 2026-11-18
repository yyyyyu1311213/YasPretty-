import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Suspense } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { products, quickFilters } from '../../../data/products'
import ProductCard from '../../catalog/components/ProductCard'
import HomeView from './HomeView'

// Inspect actual React elements/callbacks. Lifecycle and DOM behavior run in Playwright.
const draft = vi.hoisted(() => ({ value: '', set: vi.fn() }))
vi.mock('react', async (original) => ({
  ...await original(),
  useState(initial) { return [typeof initial === 'string' ? draft.value : initial, draft.set] },
}))
vi.mock('../../../components/visual/ScrollFloat', () => ({ default: ({ as: Tag = 'h2', containerClassName, children }) => <Tag className={containerClassName}>{children}</Tag> }))
vi.mock('../../../components/visual/StrokeText', () => ({ default: ({ text, className }) => <span className={className}>{text}</span> }))
vi.mock('../../makeup-table/components/MakeupTableExperience', () => ({ default: () => null }))
vi.mock('../../../components/visual/FlexCarousel', () => ({ default: () => null }))

function* nodes(value) {
  if (Array.isArray(value)) { for (const child of value) yield* nodes(child); return }
  if (!value || typeof value !== 'object') return
  yield value
  yield* nodes(value.props?.children)
}
function find(tree, predicate) {
  const node = [...nodes(tree)].find(predicate)
  expect(node).toBeDefined()
  return node
}
const byClass = (tree, name) => find(tree, (n) => n.props?.className === name)
const Boundary = ({ children }) => children
const props = () => ({
  EnhancementBoundary: Boundary,
  openingReady: false,
  collection: { 'estee-lauder-double-wear': '正在用' },
  onNavigate: vi.fn(), onSearch: vi.fn(), onQuickFilter: vi.fn(),
  onOpenProduct: vi.fn(), onViewCategory: vi.fn(),
  onFavorite: vi.fn(), onRemoveFavorite: vi.fn(),
})
const featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, 12)
beforeEach(() => { draft.value = ''; draft.set.mockClear() })

describe('home composition', () => {
  it('keeps the CTA target without adding prefill or navigation parameters', () => {
    const p = props(), tree = HomeView(p)
    byClass(tree, 'assistant-entry-button hero-motion-control').props.onClick()
    expect(p.onNavigate).toHaveBeenCalledExactlyOnceWith('assistant')
    expect(byClass(tree, 'home-motion-stage')).toBe(tree)
    expect(find(tree, (n) => n.type === 'input').props.value).toBe('')
  })

  it('updates the local draft and submits the exact value without normalizing it', () => {
    const p = props()
    const input = find(HomeView(p), (n) => n.type === 'input')
    expect(input.props['aria-label']).toBe('搜索品牌、产品名或色号')
    input.props.onChange({ target: { value: ' nArS ' } })
    expect(draft.set).toHaveBeenCalledExactlyOnceWith(' nArS ')
    draft.value = ' nArS '
    const tree = HomeView(p), preventDefault = vi.fn()
    byClass(tree, 'hero-search hero-motion-control').props.onSubmit({ preventDefault })
    expect(preventDefault).toHaveBeenCalledOnce()
    expect(p.onSearch).toHaveBeenCalledExactlyOnceWith(' nArS ')
    expect(find(tree, (n) => n.type === 'input').props.value).toBe(' nArS ')
  })

  it('passes all six original quick-filter queries and the empty library search', () => {
    const p = props(), tree = HomeView(p)
    const buttons = byClass(tree, 'quick-links hero-motion-control').props.children
    expect(buttons.map((n) => n.props.children[0])).toEqual(quickFilters.map((f) => f.label))
    buttons.forEach((button, i) => {
      button.props.onClick()
      expect(p.onQuickFilter.mock.calls[i][0]).toBe(quickFilters[i].query)
    })
    byClass(tree, 'text-action').props.onClick()
    expect(p.onSearch).toHaveBeenCalledExactlyOnceWith('')
  })

  it('reuses the real ProductCard, original product objects/order and shared collection callbacks', () => {
    const p = props(), tree = HomeView(p)
    const cards = byClass(tree, 'product-grid featured-grid').props.children
    expect(cards).toHaveLength(12)
    expect(cards.map((n) => n.key)).toEqual(featured.map((item) => item.id))
    cards.forEach((card, i) => {
      expect(card.type).toBe(ProductCard)
      expect(card.props.product).toBe(featured[i])
      expect(card.props.collection).toBe(p.collection)
      expect(card.props.onOpen).toBe(p.onOpenProduct)
      expect(card.props.onFavorite).toBe(p.onFavorite)
      expect(card.props.onRemoveFavorite).toBe(p.onRemoveFavorite)
    })
  })

  it('keeps the opening gate, lazy table placeholder and existing category/product connections', () => {
    const p = props(), closed = HomeView(p)
    expect(find(closed, (n) => n.props?.['aria-labelledby'] === 'makeup-table-intro-title')).toBeDefined()
    const suspense = find(closed, (n) => n.type === Suspense)
    expect(suspense.props.fallback.props['aria-label']).toBe('正在准备交互式化妆桌')
    const table = suspense.props.children
    expect(table.type.$$typeof).toBe(Symbol.for('react.lazy'))
    expect(table.props).toEqual({ openingReady: false, onOpenProduct: p.onOpenProduct, onViewCategory: p.onViewCategory })
    const ready = HomeView({ ...p, openingReady: true })
    expect(ready.props.className).toBe('home-motion-stage is-ready')
    expect(find(ready, (n) => n.props?.['aria-labelledby'] === 'makeup-table-intro-title')).toBeDefined()
    expect(find(ready, (n) => n.type === table.type).props.openingReady).toBe(true)
  })

  it('keeps the same static fallback in the supplied error boundary, Suspense and carousel', () => {
    const p = props(), tree = HomeView({ ...p, openingReady: true })
    const boundary = find(tree, (n) => n.type === Boundary)
    const suspense = boundary.props.children, carousel = suspense.props.children
    expect(suspense.type).toBe(Suspense)
    expect(suspense.props.fallback).toBe(boundary.props.fallback)
    expect(carousel.props.fallback).toBe(boundary.props.fallback)
    expect(carousel.type.$$typeof).toBe(Symbol.for('react.lazy'))
    expect(carousel.props.items).toEqual(featured.map((item) => ({ id: item.id, src: item.image, alt: `${item.brand} ${item.name} 产品图`, title: item.name, subtitle: `${item.brand} · ${item.category}` })))
    expect(carousel.props).toMatchObject({ preset: 'ribbon', intro: 'rise', fit: 'portrait', cardHeight: 0.58, gap: 16, squeeze: 0.08, focusOnClick: true, captions: true, autoplay: true, interval: 3.1 })
    carousel.props.onSelect(0, { id: featured[0].id })
    expect(p.onOpenProduct).toHaveBeenCalledExactlyOnceWith(featured[0])
    for (const item of [undefined, {}, { id: 'unknown' }, { id: 123 }]) carousel.props.onSelect(0, item)
    expect(p.onOpenProduct).toHaveBeenCalledOnce()
  })

  it('preserves visible copy, responsive media paths and closing text in static markup', () => {
    const markup = renderToStaticMarkup(HomeView(props()))
    for (const text of ['甄选好物，', '找到适配你的美', '创建我的妆容方案', '编辑精选', 'You are so pretty']) expect(markup).toContain(text)
    expect(markup).toContain('media="(max-width: 680px)"')
    expect(markup).toContain('/assets/logo/hero/hero-mobile.jpg')
    expect(markup).toContain('/assets/logo/hero/hero-desktop.jpg')
    expect(markup).toContain('makeup-table-lazy-placeholder')
  })
})
