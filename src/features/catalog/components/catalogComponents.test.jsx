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
    expect(markup).toContain('品牌官方旗舰店资料 · 人工核对')
    expect(markup).not.toContain('编辑示例')
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
    expect(markup).toContain('品牌官方旗舰店资料 · 人工核对')
    expect(markup).toContain(item.shades[0].name)
  })

  it('uses the same card information rows for expanded products without inventing suitability data', () => {
    const original = renderToStaticMarkup(<ProductCard product={product} collection={{}} {...callbacks()} />)
    const expandedProduct = products.find((item) => item.id === 'catalog-040')
    const expanded = renderToStaticMarkup(<ProductCard product={expandedProduct} collection={{}} {...callbacks()} />)
    for (const className of ['shade-line', 'tag-row', 'product-note', 'rating-row']) {
      expect(original).toContain(`class="${className}"`)
      expect(expanded).toContain(`class="${className}"`)
    }
    expect(expanded).toContain('颜色/色号 单一规格')
    expect(expanded).toContain('素颜提亮')
    expect(expanded).toContain('单一规格')
    expect(expanded).not.toContain('待核验')
    expect(expanded).not.toContain('编辑示例')
  })

  it('renders editorial samples with product-specific copy instead of verification placeholders', () => {
    const sample = products.find((item) => item.id === 'catalog-038')
    const card = renderToStaticMarkup(<ProductCard product={sample} collection={{}} {...callbacks()} />)
    expect(card).toContain('柔光润色')
    expect(card).toContain('适合通勤打底')
    expect(card).not.toContain('人工核验参考资料')
    expect(card).not.toContain('待核验')

    const drawer = renderToStaticMarkup(<ProductDetailDrawer product={sample} statusControl={null} onClose={vi.fn()} onOpenProduct={vi.fn()} onOpenFullProfile={vi.fn()} />)
    expect(drawer).not.toContain('质感与选购方向')
    expect(drawer).toContain('喜欢它的理由')
    expect(drawer).toContain('使用时注意')
    expect(drawer).toContain('柔光乳霜')
    expect(drawer).not.toContain('人工核验资料')
    expect(drawer).not.toContain('暂无统一样本')
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
    expect(markup).toContain('111 条资料')
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
    const recommended = products.filter((p) => p.id !== product.id && p.recommendationReady !== false && (p.category === product.category || p.finish === product.finish)).slice(0, 3)
    const buttons = [...nodes(byClass(tree, 'recommendation-list'))].filter((n) => n.type === 'button')
    expect(buttons).toHaveLength(recommended.length)
    buttons.forEach((button) => button.props.onClick())
    recommended.forEach((p, index) => expect(onOpenProduct.mock.calls[index][0]).toBe(p))
    expect(find(tree, (n) => n.props?.['data-status-slot'])).toBe(statusControl)
    const markup = renderToStaticMarkup(tree)
    expect(markup).toContain('aria-modal="true"')
    expect(markup).toContain('品牌官方旗舰店资料 · 人工核对')
    expect(markup).not.toContain('编辑示例')
    expect(markup).toContain('版权归原权利人所有')
  })

  it('shows the table price and preserves screenshot-version notes for mismatched identities', () => {
    const expansion = products.find((item) => item.id === 'catalog-041')
    const markup = renderToStaticMarkup(<ProductProfile product={expansion} statusControl={null} onBack={() => {}} />)
    expect(markup).toContain('产品身份或版本存在冲突')
    expect(markup).toContain('页面存在多个版本或规格选项，购买前请核对具体版本。')
    expect(markup).toContain('169 元 · 最终价格以结算页为准')
    expect(markup).toContain('打开官方商品链接')
    expect(markup).toContain('参数信息')
    expect(markup).toContain('商品资料记录')
    expect(markup).toContain('权利人联系删除')
  })

  it('keeps the original profile and drawer sections for expanded products while showing evidence boundaries', () => {
    const expandedProduct = products.find((item) => item.id === 'catalog-043')
    const profile = renderToStaticMarkup(<ProductProfile product={expandedProduct} statusControl={null} onBack={() => {}} />)
    const drawer = renderToStaticMarkup(<ProductDetailDrawer product={expandedProduct} statusControl={null} onClose={() => {}} onOpenProduct={() => {}} onOpenFullProfile={() => {}} />)
    expect(profile).not.toContain('class="assessment-grid"')
    expect(profile).toContain('class="assessment-columns"')
    expect(profile).toContain('<dt>参考价格</dt>')
    expect(profile).toContain('<dt>妆效方向</dt>')
    expect(profile).toContain('喜欢它的理由')
    expect(profile).not.toContain('产品信息要点')
    expect(profile).toContain('授权待核验')
    expect(profile).not.toContain('人工核验参考原价')
    expect(profile).not.toContain('暂无已核验的场景标签')
    expect(profile).not.toContain('暂无已记录理由')
    for (const section of ['基础信息', '颜色/色号', '喜欢它的理由', '使用时注意', '适合场景', '图片与版权']) expect(drawer).toContain(section)
    expect(drawer).not.toContain('选购方向')
    expect(drawer).not.toContain('质感与选购方向')
    expect(drawer).toContain('class="detail-section two-columns"')
    expect(drawer).toContain('防晒、保湿（页面宣称，非独立功效验证）')
  })

  it('preserves the original first-35 shade and empty-metric presentation', () => {
    const legacy = products.find((item) => item.id === 'lancome-is-me-liquid-blush')
    const drawer = renderToStaticMarkup(<ProductDetailDrawer product={legacy} statusControl={null} onClose={() => {}} onOpenProduct={() => {}} onOpenFullProfile={() => {}} />)
    expect(drawer).toContain('#50 「是我」粉')
    expect(drawer).toContain('class="shade-description"')
    expect(drawer).toContain('品牌官方旗舰店资料 · 人工核对')
    expect(drawer).toContain('class="metric-grid"')
    expect(drawer).not.toContain('暂无统一样本、环境和测试方法支持的评分')
  })

  it('renders the standard card, drawer and full-profile presentation for all 76 expanded products', () => {
    const expandedProducts = products.filter((item) => item.id.startsWith('catalog-'))
    expect(expandedProducts).toHaveLength(76)

    for (const expandedProduct of expandedProducts) {
      const editorial = Boolean(expandedProduct.editorialProfile)
      const card = renderToStaticMarkup(<ProductCard product={expandedProduct} collection={{}} {...callbacks()} />)
      for (const className of ['shade-line', 'tag-row', 'product-note', 'rating-row']) expect(card).toContain(`class="${className}"`)

      const drawer = renderToStaticMarkup(<ProductDetailDrawer product={expandedProduct} statusControl={null} onClose={() => {}} onOpenProduct={() => {}} onOpenFullProfile={() => {}} />)
      const drawerSections = ['基础信息', '颜色/色号', '喜欢它的理由', '使用时注意', '适合场景', '图片与版权', '相似产品', '查看完整产品资料']
      for (const section of drawerSections) {
        expect(drawer, `${expandedProduct.id} drawer should render ${section}`).toContain(section)
      }
      if (editorial || !expandedProduct.shades.some((shade) => shade.verificationStatus === 'verified_parameter_screenshot')) expect(drawer).toContain('class="detail-editorial-copy"')
      else expect(drawer).toContain('class="shade-list"')
      expect(drawer).not.toContain('<dt>官方商品名称</dt>')
      expect(drawer).not.toContain('截图证据：')

      const profile = renderToStaticMarkup(<ProductProfile product={expandedProduct} statusControl={null} onBack={() => {}} />)
      const profileLabels = editorial ? ['品牌所属地区', '实际生产地', '参考价格', '商品规格', '质感方向', '色彩方向', '适合人群', '颜色/色号'] : ['品牌所属地区', '实际生产地', '参考价格', '商品规格', '妆效方向', '颜色/色号']
      for (const label of profileLabels) {
        expect(profile, `${expandedProduct.id} should render ${label}`).toContain(`<dt>${label}</dt>`)
      }
      const profileSections = ['喜欢它的理由', '使用时注意', '适合场景', '图片与版权', '权利人联系删除']
      for (const section of profileSections) {
        expect(profile, `${expandedProduct.id} should render ${section}`).toContain(section)
      }
      expect(profile).toContain('来源已披露、授权待核验')
      expect(profile).not.toContain('<dd>待核验</dd>')
      expect(profile).not.toContain('人工核验参考原价')
      expect(profile).not.toContain('暂无已核验的场景标签')
      expect(profile).not.toContain('暂无已记录理由')
      expect(profile).not.toContain('<dt>官方商品名称</dt>')
      expect(profile).not.toContain('<dt>商品标题</dt>')
      expect(profile).not.toContain('截图证据：')
    }
  })

  it('uses standard shade controls for screenshot shades without inventing colors or suitability', () => {
    const expandedProduct = products.find((item) => item.id === 'catalog-051')
    const card = renderToStaticMarkup(<ProductCard product={expandedProduct} collection={{}} {...callbacks()} />)
    const drawer = renderToStaticMarkup(<ProductDetailDrawer product={expandedProduct} statusControl={null} onClose={() => {}} onOpenProduct={() => {}} onOpenFullProfile={() => {}} />)
    const profile = renderToStaticMarkup(<ProductProfile product={expandedProduct} statusControl={null} onBack={() => {}} />)
    for (const markup of [card, drawer, profile]) expect(markup).toContain('01 螺黛灰')
    expect(drawer).toContain('class="shade-list"')
    expect(drawer).toContain('background-color:transparent')
    expect(drawer).not.toContain('适配方向待核验')
  })
})
