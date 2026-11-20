import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { useEffect } from 'react'
import { products } from '../../../data/products'
import * as verification from '../../../data/product-verification'
import { emptyFilters } from '../catalogUtils'
import ProductCard from './ProductCard'
import FilterPanel from './FilterPanel'
import LibraryView from './LibraryView'
import ProductProfile from './ProductProfile'
import ProductDetailDrawer from './ProductDetailDrawer'

// Inspect real event callbacks and markup; real React lifecycle/DOM is covered by Playwright.
const state = vi.hoisted(() => ({ imageFailed: false, set: vi.fn() }))
vi.mock('react', async (original) => ({
  ...await original(),
  useState(initial) { return [typeof initial === 'boolean' ? state.imageFailed : initial, state.set] },
  useEffect: vi.fn(),
}))

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
const byClass = (tree, className) => find(tree, (n) => n.props?.className === className)
const product = products.find((p) => p.id === 'estee-lauder-double-wear')
const callbacks = () => ({ onOpen: vi.fn(), onFavorite: vi.fn(), onRemoveFavorite: vi.fn() })
beforeEach(() => { vi.restoreAllMocks(); state.imageFailed = false; state.set.mockClear(); vi.mocked(useEffect).mockClear() })

describe('catalog product card', () => {
  it('opens the same product from photo, name and detail while favorite uses its stable ID', () => {
    const props = callbacks()
    const tree = ProductCard({ product, collection: {}, ...props })
    byClass(tree, 'product-photo').props.onClick()
    byClass(tree, 'product-name').props.onClick()
    const rating = byClass(tree, 'rating-row')
    find(rating, (n) => n.type === 'button').props.onClick()
    expect(props.onOpen).toHaveBeenCalledTimes(3)
    for (const [opened] of props.onOpen.mock.calls) expect(opened).toBe(product)
    byClass(tree, 'favorite-button').props.onClick()
    expect(props.onFavorite).toHaveBeenCalledExactlyOnceWith(product.id, '想买')
    expect(props.onRemoveFavorite).not.toHaveBeenCalled()
    const markup = renderToStaticMarkup(tree)
    expect(markup).toContain(product.image)
    expect(markup).toContain('编辑示例')
    expect(markup).toContain('loading="lazy"')
    expect(markup).not.toContain('shade-dot')
  })

  it('removes an existing favorite and preserves the original image failure state', () => {
    const props = callbacks()
    const tree = ProductCard({ product, collection: { [product.id]: '正在用' }, ...props })
    byClass(tree, 'favorite-button saved').props.onClick()
    expect(props.onRemoveFavorite).toHaveBeenCalledExactlyOnceWith(product.id)
    find(tree, (n) => n.type === 'img').props.onError()
    expect(state.set).toHaveBeenCalledExactlyOnceWith(true)
    state.imageFailed = true
    const failed = ProductCard({ product, collection: {}, ...props })
    expect(renderToStaticMarkup(failed)).toContain('图片暂不可用')
    expect([...nodes(failed)].some((n) => n.type === 'img')).toBe(false)
  })

  it('keeps color swatches and the non-rating disclosure for the existing expanded categories', () => {
    const item = products.find((p) => p.category === '腮红')
    const markup = renderToStaticMarkup(<ProductCard product={item} collection={{}} {...callbacks()} />)
    expect(markup).toContain('shade-dot')
    expect(markup).toContain('官网资料，非用户统计')
    expect(markup).toContain(item.shades[0].name)
  })
})

describe('catalog filters and results', () => {
  it('delegates multi-select, scalar wear/price, clear, close and backdrop using original values', () => {
    const onChange = vi.fn(), onClear = vi.fn(), onClose = vi.fn()
    const tree = FilterPanel({ filters: emptyFilters, isOpen: true, onChange, onClear, onClose })
    const skin = find(tree, (n) => n.props?.label === '适合肤质')
    skin.props.onClick('油皮')
    expect(onChange).toHaveBeenLastCalledWith('skins', '油皮')
    find(tree, (n) => n.type === 'button' && n.props.children === '8h+').props.onClick()
    expect(onChange).toHaveBeenLastCalledWith('minWear', '8', false)
    find(tree, (n) => n.type === 'button' && n.props.children === '200 - 400').props.onClick()
    expect(onChange).toHaveBeenLastCalledWith('price', '200-400', false)
    byClass(tree, 'clear-button').props.onClick()
    byClass(tree, 'filter-close').props.onClick()
    byClass(tree, 'filter-backdrop').props.onClick()
    expect(onClear).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledTimes(2)
    expect(renderToStaticMarkup(tree)).toContain('filter-panel open')
    const closed = FilterPanel({ filters: emptyFilters, isOpen: false, onChange, onClear, onClose })
    expect(renderToStaticMarkup(closed)).not.toContain('filter-backdrop')
  })

  it('preserves result order and product references, search callbacks, both sort controls and empty recovery', () => {
    const props = { filters: emptyFilters, results: [products[2], products[0]], sort: 'price-asc', isFilterOpen: false, collection: {}, onChangeFilter: vi.fn(), onClear: vi.fn(), onChangeSort: vi.fn() }
    const tree = LibraryView(props)
    const cards = [...nodes(tree)].filter((n) => n.type === ProductCard)
    expect(cards.map((n) => n.props.product)).toEqual(props.results)
    expect(cards[0].props.product).toBe(products[2])
    find(tree, (n) => n.type === 'input').props.onChange({ target: { value: 'nars' } })
    expect(props.onChangeFilter).toHaveBeenCalledExactlyOnceWith('keyword', 'nars', false)
    const sorts = [...nodes(tree)].filter((n) => n.type?.name === 'SortSelect')
    expect(sorts).toHaveLength(2)
    for (const sort of sorts) find(sort.type(sort.props), (n) => n.type === 'select').props.onChange({ target: { value: 'rating' } })
    expect(props.onChangeSort).toHaveBeenCalledTimes(2)
    const empty = LibraryView({ ...props, results: [] })
    const emptyNode = find(empty, (n) => n.type?.name === 'EmptyResults')
    find(emptyNode.type(emptyNode.props), (n) => n.type === 'button').props.onClick()
    expect(props.onClear).toHaveBeenCalledOnce()
    const markup = renderToStaticMarkup(empty)
    expect(markup).toContain('没有找到对应档案')
    expect(markup).toContain('35 条资料')
  })

  it('shows the makeup table return action only for makeup table entries', () => {
    const onBackToMakeupTable = vi.fn()
    const props = { filters: emptyFilters, results: [products[0]], sort: 'recommended', isFilterOpen: false, collection: {}, onChangeFilter: vi.fn(), onClear: vi.fn(), onChangeSort: vi.fn(), onToggleFilterPanel: vi.fn(), onOpenProduct: vi.fn(), onFavorite: vi.fn(), onRemoveFavorite: vi.fn(), showMakeupTableBack: true, onBackToMakeupTable }
    const tree = LibraryView(props)
    const back = find(tree, (n) => n.type === 'button' && n.props.children?.some?.((child) => child === '返回妆台'))
    back.props.onClick()
    expect(onBackToMakeupTable).toHaveBeenCalledOnce()
    expect(renderToStaticMarkup(LibraryView({ ...props, showMakeupTableBack: false }))).not.toContain('返回妆台')
  })
})

describe('catalog profile and drawer', () => {
  it('keeps the reviewed fields, commerce gate, source notice, contact link and App-owned status slot', () => {
    const onBack = vi.fn()
    const statusControl = <button data-status-slot="same">原收藏控件</button>
    const tree = ProductProfile({ product, statusControl, onBack })
    byClass(tree, 'profile-back-button').props.onClick()
    expect(onBack).toHaveBeenCalledOnce()
    expect(find(tree, (n) => n.props?.['data-status-slot'])).toBe(statusControl)
    const reviewed = verification.getProductVerification(product.id).reviewedFacts
    const markup = renderToStaticMarkup(tree)
    expect(markup).toContain(`${reviewed.listPrice} 元`)
    expect(markup).toContain(reviewed.specification)
    expect(markup).toContain('权利人联系删除')
    expect(markup).toContain('版权归原权利人所有')
    expect(markup).toContain('不构成功效保证或独立实测')
    vi.spyOn(verification, 'getProductVerification').mockReturnValueOnce({ commerce: { status: 'pending', productUrl: 'https://example.invalid/' } })
    const pending = renderToStaticMarkup(<ProductProfile product={product} statusControl={statusControl} onBack={onBack} />)
    expect(pending).toContain('暂未提供官方购买链接')
    expect(pending).not.toContain('https://example.invalid/')
  })

  it('retains shade initialization/reset, backdrop semantics and original ordered similar-product callbacks', () => {
    const onClose = vi.fn(), onOpenProduct = vi.fn(), onOpenFullProfile = vi.fn()
    const statusControl = <span data-status-slot="same" />
    const tree = ProductDetailDrawer({ product, statusControl, onClose, onOpenProduct, onOpenFullProfile })
    const effect = vi.mocked(useEffect).mock.calls[0]
    expect(effect[1]).toEqual([product])
    effect[0]()
    expect(state.set).toHaveBeenLastCalledWith(product.shades[0])
    const choices = [...nodes(tree)].filter((n) => n.props?.className?.startsWith('shade-choice'))
    choices[1].props.onClick()
    expect(state.set).toHaveBeenLastCalledWith(product.shades[1])
    const stopPropagation = vi.fn()
    byClass(tree, 'detail-drawer').props.onMouseDown({ stopPropagation })
    expect(stopPropagation).toHaveBeenCalledOnce()
    expect(onClose).not.toHaveBeenCalled()
    tree.props.onMouseDown()
    byClass(tree, 'dialog-close').props.onClick()
    byClass(tree, 'drawer-back-button').props.onClick()
    expect(onClose).toHaveBeenCalledTimes(3)
    byClass(tree, 'full-profile-action').props.onClick()
    expect(onOpenFullProfile).toHaveBeenCalledExactlyOnceWith(product)
    const recommended = products.filter((p) => p.id !== product.id && (p.category === product.category || p.finish === product.finish)).slice(0, 3)
    const buttons = [...nodes(byClass(tree, 'recommendation-list'))].filter((n) => n.type === 'button')
    expect(buttons).toHaveLength(recommended.length)
    buttons.forEach((button) => button.props.onClick())
    recommended.forEach((p, index) => expect(onOpenProduct.mock.calls[index][0]).toBe(p))
    expect(find(tree, (n) => n.props?.['data-status-slot'])).toBe(statusControl)
    const markup = renderToStaticMarkup(tree)
    expect(markup).toContain('aria-modal="true"')
    expect(markup).toContain('非用户统计')
    expect(markup).toContain('版权归原权利人所有')
  })
})
