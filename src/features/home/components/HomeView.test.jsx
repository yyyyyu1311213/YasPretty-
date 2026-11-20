import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Suspense } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { categoryOptions, products, quickFilters } from '../../../data/products'
import HomeView from './HomeView'
import GuideView from '../../guide-culture/components/GuideView'

// Inspect actual React elements/callbacks. Lifecycle and DOM behavior run in Playwright.
const draft = vi.hoisted(() => ({ value: '', set: vi.fn() }))
vi.mock('react', async (original) => ({
  ...await original(),
  useState(initial) { return [typeof initial === 'string' ? draft.value : initial, draft.set] },
}))
vi.mock('../../../components/visual/ScrollFloat', () => ({ default: ({ as: Tag = 'h2', containerClassName, children }) => <Tag className={containerClassName}>{children}</Tag> }))
vi.mock('../../../components/visual/StrokeText', () => ({ default: ({ text, className }) => <span className={className}>{text}</span> }))
vi.mock('../../makeup-table/components/MakeupTableExperience', () => ({ default: () => null }))
vi.mock('./FeaturedShowcase', () => ({ default: () => null }))

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
  onOpenProduct: vi.fn(), onViewCategory: vi.fn(), onApplyGuideFilter: vi.fn(),
  onFavorite: vi.fn(), onRemoveFavorite: vi.fn(),
})
const featured = categoryOptions.map((category) => products.filter((product) => product.category === category).sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]).filter(Boolean)
beforeEach(() => { draft.value = ''; draft.set.mockClear() })

describe('home composition', () => {
  it('keeps the CTA target without adding prefill or navigation parameters', () => {
    const p = props(), tree = HomeView(p)
    byClass(tree, 'assistant-entry-button hero-motion-control').props.onClick()
    expect(p.onNavigate).toHaveBeenCalledExactlyOnceWith('assistant')
    expect(byClass(tree, 'home-motion-stage')).toBe(tree)
    expect(find(tree, (n) => n.type === 'input').props.value).toBe('')
    const children = tree.props.children
    expect(children[0].props.className).toBe('home-shop')
    expect(children[0].props.children[0].props.className).toBe('makeup-table-intro-section content-section')
    expect(children[0].props.children[1].type).toBe(Suspense)
    expect(children[1].type).toBe(Boundary)
    expect(children[2].props.className).toBe('story-closing')
    expect(children[3].type).toBe(GuideView)
    expect(children[3].props.onApplyFilter).toBe(p.onApplyGuideFilter)
    expect(children[4].props.className).toContain('home-hero')
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

  it('keeps all six original quick-filter queries', () => {
    const p = props(), tree = HomeView(p)
    const buttons = byClass(tree, 'quick-links hero-motion-control').props.children
    expect(buttons.map((n) => n.props.children)).toEqual(quickFilters.map((f) => f.label))
    buttons.forEach((button, i) => {
      button.props.onClick()
      expect(p.onQuickFilter.mock.calls[i][0]).toBe(quickFilters[i].query)
    })
  })

  it('selects a real, highest-rated product from each available makeup category', () => {
    const p = props(), tree = HomeView(p)
    const boundary = find(tree, (n) => n.type === Boundary)
    const suspense = boundary.props.children
    const showcase = suspense.props.children
    expect(suspense.type).toBe(Suspense)
    expect(showcase.type.$$typeof).toBe(Symbol.for('react.lazy'))
    expect(showcase.props.products).toHaveLength(categoryOptions.length)
    expect(showcase.props.products.map((item) => item.category)).toEqual(categoryOptions)
    showcase.props.products.forEach((product, index) => {
      const candidates = products.filter((item) => item.category === categoryOptions[index]).sort((a, b) => (b.rating || 0) - (a.rating || 0))
      expect(product).toBe(candidates[0])
    })
    expect(showcase.props.collection).toBe(p.collection)
    expect(showcase.props.onOpenProduct).toBe(p.onOpenProduct)
    expect(showcase.props.onFavorite).toBe(p.onFavorite)
    expect(showcase.props.onRemoveFavorite).toBe(p.onRemoveFavorite)
  })

  it('keeps the opening gate, lazy table placeholder and existing category/product connections', () => {
    const p = props(), closed = HomeView(p)
    expect(find(closed, (n) => n.props?.['aria-labelledby'] === 'makeup-table-intro-title')).toBeDefined()
    const suspense = find(closed, (n) => n.type === Suspense)
    expect(suspense.props.fallback.props['aria-label']).toBe('正在准备交互式化妆桌')
    const table = suspense.props.children
    expect(table.type.$$typeof).toBe(Symbol.for('react.lazy'))
    expect(table.props).toEqual({ openingReady: false, onOpenProduct: p.onOpenProduct, onViewCategory: p.onViewCategory, onSearch: p.onSearch })
    const ready = HomeView({ ...p, openingReady: true })
    expect(ready.props.className).toBe('home-motion-stage is-ready')
    expect(find(ready, (n) => n.props?.['aria-labelledby'] === 'makeup-table-intro-title')).toBeDefined()
    expect(find(ready, (n) => n.type === table.type).props.openingReady).toBe(true)
  })

  it('keeps the showcase inside the supplied error boundary and lazy fallback', () => {
    const p = props(), tree = HomeView({ ...p, openingReady: true })
    const boundary = find(tree, (n) => n.type === Boundary)
    const suspense = boundary.props.children, showcase = suspense.props.children
    expect(suspense.type).toBe(Suspense)
    expect(suspense.props.fallback.props['aria-label']).toBe('正在准备编辑精选')
    expect(boundary.props.fallback.props['aria-label']).toBe('编辑精选暂不可用')
    expect(showcase.type.$$typeof).toBe(Symbol.for('react.lazy'))
    expect(showcase.props.products).toEqual(featured)
  })

  it('preserves visible copy, the scalable hero illustration and closing text in static markup', () => {
    const markup = renderToStaticMarkup(HomeView(props()))
    for (const text of ['甄选好物，', '找到适配你的美', '创建我的妆容方案', 'You are so pretty', '正在准备编辑精选']) expect(markup).toContain(text)
    expect(markup).toContain('/assets/logo/hero/hero-still-life.svg')
    expect(markup).toContain('makeup-table-lazy-placeholder')
  })
})
