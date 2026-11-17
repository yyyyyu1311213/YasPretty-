import { Component, useCallback, useEffect, useRef, useState } from 'react'
import {
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { imageRightsContactUrl, productImageNotice } from './data/product-image-sources'
import { createNavigationEntry, navigationPath, resolveNavigationEntry } from './lib/navigation-history'
import BrandOpening from './components/BrandOpening'
import XiaoYAssistant from './components/XiaoYAssistant'
import HomeView from './features/home/components/HomeView'
import GuideView from './features/guide-culture/components/GuideView'
import CultureView from './features/guide-culture/components/CultureView'

import { getCatalogProducts, productById } from './features/catalog/catalogService'
import { useCatalog } from './features/catalog/hooks/useCatalog'
import LibraryView from './features/catalog/components/LibraryView'
import ProductProfile from './features/catalog/components/ProductProfile'
import ProductDetailDrawer from './features/catalog/components/ProductDetailDrawer'
import { useCollection } from './features/collection/hooks/useCollection'
import CollectionView from './features/collection/components/CollectionView'
import CollectionStatusControl from './features/collection/components/CollectionStatusControl'

const products = getCatalogProducts()

class EnhancementBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function currentNavigationEntry() {
  const entry = resolveNavigationEntry(window.history.state, window.location.pathname)
  if (entry.view === 'product' && !productById(entry.productId)) return createNavigationEntry()
  if (entry.drawerProductId && !productById(entry.drawerProductId)) return { ...entry, drawerProductId: null }
  return entry
}

function App() {
  const [initialEntry] = useState(currentNavigationEntry)
  const initialProfileProduct = initialEntry.view === 'product' ? productById(initialEntry.productId) : null
  const [openingActive, setOpeningActive] = useState(() => initialEntry.view === 'home')
  const [view, setView] = useState(initialEntry.view)
  const { filters, sort, filterPanelOpen, filteredProducts, setSort, setFilterPanelOpen, updateFilter, clearFilters, searchCatalog, applyQuickFilter } = useCatalog()
  const { collection, favoriteCount, setStatus, removeFavorite } = useCollection()
  const [selectedProduct, setSelectedProduct] = useState(productById(initialEntry.drawerProductId))
  const [profileProduct, setProfileProduct] = useState(initialProfileProduct)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const makeupFocusAppliedRef = useRef(false)
  const completeOpening = useCallback(() => setOpeningActive(false), [])

  useEffect(() => {
    if (!openingActive || view !== 'home') return undefined
    const previousOverflow = document.body.style.overflow
    const previousRootOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    window.scrollTo({ top: 0, behavior: 'auto' })
    return () => {
      document.body.style.overflow = previousOverflow
      document.documentElement.style.overflow = previousRootOverflow
    }
  }, [openingActive, view])

  useEffect(() => {
    if (openingActive || view !== 'home' || makeupFocusAppliedRef.current) return undefined
    makeupFocusAppliedRef.current = true
    const previousOverflow = document.body.style.overflow
    const previousRootOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }))
    const unlockTimer = window.setTimeout(() => {
      document.body.style.overflow = previousOverflow
      document.documentElement.style.overflow = previousRootOverflow
    }, 2600)
    return () => {
      window.clearTimeout(unlockTimer)
      document.body.style.overflow = previousOverflow
      document.documentElement.style.overflow = previousRootOverflow
    }
  }, [openingActive, view])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        if (selectedProduct) closeProductDrawer()
        setFilterPanelOpen(false)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selectedProduct])

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    window.history.replaceState(initialEntry, '', navigationPath(initialEntry))

    const syncNavigation = (event) => {
      applyNavigationEntry(resolveNavigationEntry(event.state, window.location.pathname), true)
    }
    window.addEventListener('popstate', syncNavigation)
    return () => {
      window.history.scrollRestoration = previousScrollRestoration
      window.removeEventListener('popstate', syncNavigation)
    }
  }, [initialEntry])

  function runSearch(keyword) {
    searchCatalog(keyword)
    navigate('library')
  }

  function chooseQuickFilter(query) {
    applyQuickFilter(query)
    navigate('library')
  }

  function openCategory(category) {
    chooseQuickFilter({ categories: [category] })
  }

  function applyNavigationEntry(rawEntry, restoreScroll = false) {
    let entry = rawEntry
    const nextProfileProduct = entry.view === 'product' ? productById(entry.productId) : null
    if (entry.view === 'product' && !nextProfileProduct) entry = createNavigationEntry()
    const nextDrawerProduct = entry.drawerProductId ? productById(entry.drawerProductId) : null

    setView(entry.view)
    setProfileProduct(nextProfileProduct)
    setSelectedProduct(nextDrawerProduct)
    setMobileMenuOpen(false)
    setFilterPanelOpen(false)
    const top = restoreScroll ? entry.scrollY : 0
    window.requestAnimationFrame(() => window.scrollTo({ top, behavior: 'auto' }))
  }

  function snapshotCurrentEntry() {
    const entry = { ...currentNavigationEntry(), scrollY: window.scrollY }
    window.history.replaceState(entry, '', navigationPath(entry))
    return entry
  }

  function pushNavigationEntry(nextEntry) {
    const current = snapshotCurrentEntry()
    const entry = createNavigationEntry({ ...nextEntry, depth: current.depth + 1 })
    window.history.pushState(entry, '', navigationPath(entry))
    applyNavigationEntry(entry)
  }

  function replaceNavigationEntry(nextEntry, restoreScroll = false) {
    const entry = createNavigationEntry(nextEntry)
    window.history.replaceState(entry, '', navigationPath(entry))
    applyNavigationEntry(entry, restoreScroll)
  }

  function navigate(nextView) {
    const current = currentNavigationEntry()
    if (current.view === nextView && !current.drawerProductId) {
      setMobileMenuOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    pushNavigationEntry({ view: nextView })
  }

  function openProductDrawer(product) {
    const current = snapshotCurrentEntry()
    const entry = createNavigationEntry({
      view: current.view === 'product' ? 'library' : current.view,
      drawerProductId: product.id,
      scrollY: current.scrollY,
      depth: current.drawerProductId ? current.depth : current.depth + 1,
    })
    if (current.drawerProductId) window.history.replaceState(entry, '', navigationPath(entry))
    else window.history.pushState(entry, '', navigationPath(entry))
    applyNavigationEntry(entry, true)
  }

  function openProductProfile(product) {
    pushNavigationEntry({ view: 'product', productId: product.id })
  }

  function closeProductProfile() {
    const current = currentNavigationEntry()
    if (current.depth > 0) window.history.back()
    else replaceNavigationEntry({ view: 'library' })
  }

  function closeProductDrawer() {
    const current = currentNavigationEntry()
    if (current.drawerProductId && current.depth > 0) window.history.back()
    else replaceNavigationEntry({ ...current, drawerProductId: null }, true)
  }

  return (
    <div className="app-shell">
      {openingActive && <BrandOpening onComplete={completeOpening} />}
      <Header
        activeView={view === 'product' ? 'library' : view}
        favoriteCount={favoriteCount}
        mobileMenuOpen={mobileMenuOpen}
        onNavigate={navigate}
        onMobileMenu={() => setMobileMenuOpen((open) => !open)}
      />

      <main>
        {view === 'home' && (
          <HomeView
            EnhancementBoundary={EnhancementBoundary}
            openingReady={!openingActive}
            onSearch={runSearch}
            onQuickFilter={chooseQuickFilter}
            onViewCategory={openCategory}
            onNavigate={navigate}
            onOpenProduct={openProductDrawer}
            collection={collection}
            onFavorite={setStatus}
            onRemoveFavorite={removeFavorite}
          />
        )}
        {view === 'library' && (
          <LibraryView
            filters={filters}
            results={filteredProducts}
            sort={sort}
            isFilterOpen={filterPanelOpen}
            collection={collection}
            onChangeFilter={updateFilter}
            onClear={clearFilters}
            onChangeSort={setSort}
            onToggleFilterPanel={() => setFilterPanelOpen((open) => !open)}
            onOpenProduct={openProductDrawer}
            onFavorite={setStatus}
            onRemoveFavorite={removeFavorite}
          />
        )}
        {view === 'guide' && <GuideView onApplyFilter={chooseQuickFilter} />}
        {view === 'assistant' && <XiaoYAssistant onOpenProduct={openProductDrawer} />}
        {view === 'culture' && <CultureView onNavigate={navigate} />}
        {view === 'favorites' && (
          <CollectionView
            products={products}
            collection={collection}
            onOpenProduct={openProductDrawer}
            onFavorite={setStatus}
            onRemoveFavorite={removeFavorite}
            onNavigate={navigate}
          />
        )}
        {view === 'product' && profileProduct && (
          <ProductProfile
            product={profileProduct}
            statusControl={<CollectionStatusControl productId={profileProduct.id} status={collection[profileProduct.id]} onFavorite={setStatus} onRemoveFavorite={removeFavorite} />}
            onBack={closeProductProfile}
          />
        )}
      </main>

      <Footer />
      {selectedProduct && (
        <ProductDetailDrawer
          product={selectedProduct}
          statusControl={<CollectionStatusControl productId={selectedProduct.id} status={collection[selectedProduct.id]} onFavorite={setStatus} onRemoveFavorite={removeFavorite} />}
          onClose={closeProductDrawer}
          onOpenProduct={openProductDrawer}
          onOpenFullProfile={openProductProfile}
        />
      )}
    </div>
  )
}

function Header({ activeView, favoriteCount, mobileMenuOpen, onNavigate, onMobileMenu }) {
  const navItems = [
    { id: 'assistant', label: '小Y智能选妆' },
    { id: 'library', label: '产品库' },
    { id: 'guide', label: '肤质指南' },
    { id: 'culture', label: '品牌文化' },
    { id: 'favorites', label: '我的收藏' },
  ]
  return (
    <header className="site-header">
      <div className="header-inner">
        <button className="brand" onClick={() => onNavigate('home')} aria-label="回到首页">
          <img className="brand-wordmark-image" src="/assets/logo/yaspretty-wordmark-dark.svg" alt="" />
          <span className="brand-library">BEAUTY LIBRARY</span>
        </button>
        <nav className="desktop-nav" aria-label="主导航">
          {navItems.map((item) => (
            <button key={item.id} className={activeView === item.id ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate(item.id)}>
              {item.label}
              {item.id === 'favorites' && favoriteCount > 0 && <span className="nav-count">{favoriteCount}</span>}
            </button>
          ))}
        </nav>
        <button className="mobile-menu-button" aria-label="打开导航" title="打开导航" onClick={onMobileMenu}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {mobileMenuOpen && (
        <nav className="mobile-nav" aria-label="移动端主导航">
          {navItems.map((item) => (
            <button key={item.id} className={activeView === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)}>
              {item.label}{item.id === 'favorites' && favoriteCount > 0 ? ` (${favoriteCount})` : ''}
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}

function Footer() {
  return <footer className="site-footer"><div><img className="footer-wordmark-image" src="/assets/logo/yaspretty-wordmark-dark.svg" alt="YasPretty" /></div><p>{productImageNotice} 产品信息与编辑评价仍需结合详情页来源状态判断。</p><a className="source-contact-link" href={imageRightsContactUrl} target="_blank" rel="noreferrer">权利人联系删除 <ChevronRight size={15} /></a></footer>
}

export default App
