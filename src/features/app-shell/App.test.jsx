import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import AppShell from './components/AppShell'
import HomeView from '../home/components/HomeView'
import LibraryView from '../catalog/components/LibraryView'
import CultureView from '../guide-culture/components/CultureView'
import CollectionView from '../collection/components/CollectionView'
import ProductProfile from '../catalog/components/ProductProfile'
import XiaoYAssistant from '../assistant/components/XiaoYAssistant'
import { useCatalog } from '../catalog/hooks/useCatalog'
import { useCollection } from '../collection/hooks/useCollection'
import { productById } from '../catalog/catalogService'

const h = vi.hoisted(() => ({ cursor: 0, view: 'home', navigation: {}, catalog: {}, collection: {} }))
vi.mock('react', async (original) => ({ ...await original(), useState(initial) {
  const index = h.cursor++
  return [index === 1 ? false : index === 2 ? h.view : typeof initial === 'function' ? initial() : initial, vi.fn()]
} }))
vi.mock('../catalog/hooks/useCatalog', () => ({ useCatalog: vi.fn(() => h.catalog) }))
vi.mock('../collection/hooks/useCollection', () => ({ useCollection: vi.fn(() => h.collection) }))
vi.mock('./hooks/useAppNavigation', () => ({ currentNavigationEntry: () => ({ view: h.view }), useAppNavigation: () => h.navigation }))
function render(view) { h.view = view; h.cursor = 0; return App() }
const page = (tree) => tree.props.children.filter(Boolean)[0]
beforeEach(() => {
  vi.clearAllMocks()
  h.catalog = { filters: {}, sort: 'price-asc', filterPanelOpen: false, filteredProducts: [], searchCatalog: vi.fn(), applyQuickFilter: vi.fn(), setFilterPanelOpen: vi.fn() }
  h.collection = { collection: { 'nars-light-reflecting': '正在用' }, favoriteCount: 1, setStatus: vi.fn(), removeFavorite: vi.fn() }
  h.navigation = { selectedProduct: null, profileProduct: productById('nars-light-reflecting'), mobileMenuOpen: false, setMobileMenuOpen: vi.fn(), navigate: vi.fn(), openProductDrawer: vi.fn(), openProductProfile: vi.fn(), closeProductProfile: vi.fn(), closeProductDrawer: vi.fn() }
})

describe('App domain composition', () => {
  it.each([['home', HomeView], ['library', LibraryView], ['assistant', XiaoYAssistant], ['culture', CultureView], ['favorites', CollectionView], ['product', ProductProfile]])('only supplies the existing %s page', (view, type) => {
    const tree = render(view)
    expect(tree.type).toBe(AppShell)
    expect(tree.props.children.filter(Boolean)).toHaveLength(1)
    expect(page(tree).type).toBe(type)
    expect(tree.props.activeView).toBe(view === 'product' ? 'library' : view)
    expect(useCatalog).toHaveBeenCalledOnce()
    expect(useCollection).toHaveBeenCalledOnce()
  })

  it('shares the same collection object/actions across pages and overlay status slots', () => {
    for (const view of ['home', 'library', 'favorites']) {
      const props = page(render(view)).props
      expect(props.collection).toBe(h.collection.collection)
      expect(props.onFavorite).toBe(h.collection.setStatus)
      expect(props.onRemoveFavorite).toBe(h.collection.removeFavorite)
      expect(props.onOpenProduct).toBe(h.navigation.openProductDrawer)
    }
    const product = h.navigation.profileProduct
    h.navigation.selectedProduct = product
    const tree = render('product')
    expect(tree.props.favoriteCount).toBe(1)
    for (const slot of [page(tree).props.statusControl, tree.props.overlay.props.statusControl]) {
      expect(slot.props).toMatchObject({ productId: product.id, status: '正在用' })
      expect(slot.props.onFavorite).toBe(h.collection.setStatus)
      expect(slot.props.onRemoveFavorite).toBe(h.collection.removeFavorite)
    }
    expect(tree.props.overlay.props.product).toBe(product)
    expect(tree.props.overlay.props.onClose).toBe(h.navigation.closeProductDrawer)
    expect(tree.props.overlay.props.onOpenFullProfile).toBe(h.navigation.openProductProfile)
  })

  it('keeps search/filter/category connections and catalog state in App', () => {
    const home = page(render('home'))
    home.props.onSearch('nArS')
    expect(h.catalog.searchCatalog).toHaveBeenCalledExactlyOnceWith('nArS')
    home.props.onViewCategory('气垫')
    home.props.onApplyGuideFilter({ skins: ['干皮'] })
    expect(h.catalog.applyQuickFilter.mock.calls).toEqual([[{ categories: ['气垫'] }], [{ skins: ['干皮'] }]])
    expect(h.navigation.navigate.mock.calls).toEqual([['library'], ['library', { returnTo: 'makeup-table' }], ['library']])
    const library = page(render('library'))
    expect(library.props.filters).toBe(h.catalog.filters)
    expect(library.props.results).toBe(h.catalog.filteredProducts)
    expect(library.props.sort).toBe('price-asc')
    library.props.onToggleFilterPanel()
    expect(h.catalog.setFilterPanelOpen.mock.calls[0][0](false)).toBe(true)
    const assistant = page(render('assistant'))
    expect(assistant.props.onOpenProduct).toBe(h.navigation.openProductDrawer)
    expect(Object.keys(assistant.props)).toEqual(['onOpenProduct'])
  })

  it('keeps the makeup table mounted but hidden while its catalog is open', () => {
    h.navigation.returnTo = 'makeup-table'
    const views = render('library').props.children.filter(Boolean)
    expect(views.map((item) => item.type)).toEqual([HomeView, LibraryView])
    expect(views[0].props.hidden).toBe(true)
    expect(views[1].props.showMakeupTableBack).toBe(true)
  })
})
