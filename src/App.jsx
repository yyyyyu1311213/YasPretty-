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

function GuideView({ onApplyFilter }) {
  const guides = [
    { title: '油皮 / 混油皮', text: '优先看成膜速度、控油度和 8 小时以上持妆表现。', tags: ['柔雾', '哑光', '8h+'], filter: { skins: ['油皮'], minWear: 8 } },
    { title: '干皮 / 混干皮', text: '在遮瑕度之外，留意保湿度与卡粉风险的评分。', tags: ['奶油肌', '自然光泽', '低卡粉'], filter: { skins: ['干皮'] } },
    { title: '想要镜头感', text: '选毛孔修饰优秀的柔雾底妆，拍照时层次会更干净。', tags: ['高遮瑕', '毛孔修饰', '拍照'], filter: { scene: '拍照' } },
  ]
  return <section className="guide-page content-section"><div className="guide-intro"><p className="eyebrow">肤质指南</p><h1>先读懂皮肤，再挑底妆。</h1><p>这里的建议只帮助你建立筛选方向。上妆习惯、气候与妆前产品，也会改变最后的表现。</p></div><div className="guide-list">{guides.map((guide, index) => <article key={guide.title} className="guide-card"><span>0{index + 1}</span><h2>{guide.title}</h2><p>{guide.text}</p><div>{guide.tags.map((tag) => <i key={tag}>{tag}</i>)}</div><button onClick={() => onApplyFilter(guide.filter)}>按此筛选 <ChevronRight size={16} /></button></article>)}</div></section>
}

function CultureView({ onNavigate }) {
  return <section className="culture-page content-section">
    <div className="culture-lead">
      <div>
        <p className="eyebrow">ABOUT YASPRETTY</p>
        <p className="culture-name">YasPretty / YOU ARE PRETTY</p>
        <h1>让美妆选择，<br />变得更简单。</h1>
        <p>YasPretty 的初衷，是让美妆选择变得更简单。我们希望用清晰的产品信息、真实的使用体验和理性的测评视角，帮你在繁杂的美妆世界里找到真正适合自己的那一款。</p>
      </div>
      <div className="culture-mark-panel" aria-label="YasPretty 品牌标识">
        <img src="/assets/logo/yaspretty-monogram.svg?v=20261104-y-seal-lines" alt="" />
        <span>YASPRETTY / BEAUTY ARCHIVE</span>
      </div>
    </div>
    <div className="culture-statement">
      <span>01</span>
      <p>清晰的信息、真实的体验、理性的视角，让每一次选择都更接近你自己。</p>
    </div>
    <div className="culture-principles">
      <article><h2>真实记录</h2><p>同一款彩妆在不同肤质、气候与上妆方法下都有不同表现。资料保留优点，也写下需要留意的部分。</p></article>
      <article><h2>适配推荐</h2><p>油光、毛孔、干纹和肤色都不是需要被纠正的缺点，而是帮助我们找到合适产品的线索。</p></article>
      <article><h2>做自己的编辑</h2><p>不必被热度和标准答案推着走。翻阅、比较、收藏，建立一份属于自己的彩妆清单。</p></article>
    </div>
    <div className="culture-closing"><div><p className="eyebrow">YASPRETTY BEAUTY ARCHIVE</p><h2>你的样子，不需要被改写。</h2><p>它值得被认真看见，也值得拥有适合它的彩妆。</p></div><button className="primary-action" onClick={() => onNavigate('library')}>浏览产品库 <ChevronRight size={16} /></button></div>
  </section>
}

function Footer() {
  return <footer className="site-footer"><div><img className="footer-wordmark-image" src="/assets/logo/yaspretty-wordmark-dark.svg" alt="YasPretty" /></div><p>{productImageNotice} 产品信息与编辑评价仍需结合详情页来源状态判断。</p><a className="source-contact-link" href={imageRightsContactUrl} target="_blank" rel="noreferrer">权利人联系删除 <ChevronRight size={15} /></a></footer>
}

export default App
