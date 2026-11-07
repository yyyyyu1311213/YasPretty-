import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowDownUp,
  Check,
  ChevronDown,
  ChevronRight,
  CircleX,
  ExternalLink,
  Heart,
  Menu,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  X,
} from 'lucide-react'
import { categoryOptions, finishOptions, products, quickFilters, skinOptions } from './data/products'
import { imageRightsContactUrl, productImageNotice } from './data/product-image-sources'
import { buildProductAssessment, getProductVerification } from './data/product-verification'
import { createNavigationEntry, navigationPath, resolveNavigationEntry } from './lib/navigation-history'
import BrandOpening from './components/BrandOpening'
const MakeupTable = lazy(() => import('./components/MakeupTable3D'))
const FlexCarousel = lazy(() => import('./components/FlexCarousel'))
import ScrollFloat from './components/ScrollFloat'
import StrokeText from './components/StrokeText'
import XiaoYAssistant from './components/XiaoYAssistant'

const STORAGE_KEY = 'base-archive-collection'
const emptyFilters = {
  categories: [], skins: [], finishes: [], coverages: [], minWear: '', oxidations: [], regions: [], price: '', keyword: '', scene: '', maxPrice: null,
}

const statusOptions = ['想买', '正在用', '会回购']

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

function getStoredCollection() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function toggleArrayValue(array, value) {
  return array.includes(value) ? array.filter((item) => item !== value) : [...array, value]
}

function containsText(product, keyword) {
  if (!keyword) return true
  const needle = keyword.trim().toLowerCase()
  if (!needle) return true
  const source = [product.brand, product.name, product.category, ...product.shades.flatMap((shade) => Object.values(shade)), ...product.scenes].join(' ').toLowerCase()
  return source.includes(needle)
}

function productMatches(product, filters) {
  if (!containsText(product, filters.keyword)) return false
  if (filters.categories.length && !filters.categories.includes(product.category)) return false
  if (filters.skins.length && !filters.skins.some((skin) => product.skins.includes(skin))) return false
  if (filters.finishes.length && !filters.finishes.includes(product.finish)) return false
  if (filters.coverages.length && !filters.coverages.includes(product.coverage)) return false
  if (filters.minWear && product.wear < Number(filters.minWear)) return false
  if (filters.oxidations.length && !filters.oxidations.includes(product.oxidation)) return false
  if (filters.regions.length && !filters.regions.includes(product.brandRegion)) return false
  if (filters.price) {
    const [min, max] = filters.price.split('-').map(Number)
    if (product.price < min || product.price > max) return false
  }
  if (filters.maxPrice && product.price > filters.maxPrice) return false
  if (filters.scene && !product.scenes.includes(filters.scene)) return false
  return true
}

function productById(productId) {
  return products.find((product) => product.id === productId) || null
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
  const [filters, setFilters] = useState(emptyFilters)
  const [sort, setSort] = useState('recommended')
  const [collection, setCollection] = useState(getStoredCollection)
  const [selectedProduct, setSelectedProduct] = useState(productById(initialEntry.drawerProductId))
  const [profileProduct, setProfileProduct] = useState(initialProfileProduct)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection))
  }, [collection])

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

  const filteredProducts = useMemo(() => {
    const list = products.filter((product) => productMatches(product, filters))
    return [...list].sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      return b.rating * 10 + b.wear - (a.rating * 10 + a.wear)
    })
  }, [filters, sort])

  const favoriteCount = Object.keys(collection).length

  function updateFilter(key, value, multiple = true) {
    setFilters((current) => ({ ...current, [key]: multiple ? toggleArrayValue(current[key], value) : value }))
  }

  function clearFilters() {
    setFilters(emptyFilters)
    setSort('recommended')
  }

  function runSearch(keyword) {
    setFilters((current) => ({ ...current, keyword }))
    navigate('library')
  }

  function chooseQuickFilter(query) {
    setFilters({ ...emptyFilters, ...query })
    navigate('library')
  }

  function openCategory(category) {
    chooseQuickFilter({ categories: [category] })
  }

  function setStatus(productId, status) {
    setCollection((current) => ({ ...current, [productId]: status }))
  }

  function removeFavorite(productId) {
    setCollection((current) => {
      const next = { ...current }
      delete next[productId]
      return next
    })
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
          <FavoritesView
            collection={collection}
            onOpenProduct={openProductDrawer}
            onFavorite={setStatus}
            onRemoveFavorite={removeFavorite}
            onNavigate={navigate}
          />
        )}
        {view === 'product' && profileProduct && (
          <ProductProfileView
            product={profileProduct}
            collection={collection}
            onBack={closeProductProfile}
            onFavorite={setStatus}
            onRemoveFavorite={removeFavorite}
          />
        )}
      </main>

      <Footer />
      {selectedProduct && (
        <DetailDrawer
          product={selectedProduct}
          collection={collection}
          onClose={closeProductDrawer}
          onOpenProduct={openProductDrawer}
          onOpenFullProfile={openProductProfile}
          onFavorite={setStatus}
          onRemoveFavorite={removeFavorite}
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

function HomeView({ openingReady, onSearch, onQuickFilter, onViewCategory, onNavigate, onOpenProduct, collection, onFavorite, onRemoveFavorite }) {
  const [keyword, setKeyword] = useState('')
  const featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, 12)
  const featuredItems = featured.map((product) => ({
    id: product.id,
    src: product.image,
    alt: `${product.brand} ${product.name} 产品图`,
    title: product.name,
    subtitle: `${product.brand} · ${product.category}`,
  }))
  const staticFeatured = <div className="product-grid featured-grid">{featured.map((product) => <ProductCard key={product.id} product={product} collection={collection} onOpen={onOpenProduct} onFavorite={onFavorite} onRemoveFavorite={onRemoveFavorite} />)}</div>
  return (
    <div className={`home-motion-stage${openingReady ? ' is-ready' : ''}`}>
      {openingReady && <section className="makeup-table-intro-section content-section" aria-labelledby="makeup-table-intro-title">
        <ScrollFloat as="h2" containerClassName="makeup-table-intro-title" textClassName="makeup-table-intro-text" effect="float" splitBy="chars" distance={56} stretch={1.15} stagger={0.018} animationDuration={1.45} smoothing={0.18} scrollStart="top 90%" scrollEnd="bottom 48%" ease="power3.out">从化妆台开始，整理你的选择</ScrollFloat>
        <p>先从品类和使用场景开始，再打开对应的真实产品档案。</p>
      </section>}
      <Suspense fallback={<div className="makeup-table-lazy-placeholder" aria-label="正在准备交互式化妆桌" />}>
        <MakeupTable openingReady={openingReady} onOpenProduct={onOpenProduct} onViewCategory={onViewCategory} />
      </Suspense>
      <section className={`home-hero${openingReady ? ' home-hero--ready' : ''}`}>
        <div className={`hero-media${openingReady ? ' hero-media--ready' : ''}`} aria-hidden="true">
          <picture>
            <source media="(max-width: 680px)" srcSet="/assets/logo/hero/hero-mobile.jpg" />
            <img src="/assets/logo/hero/hero-desktop.jpg" alt="" />
          </picture>
          <div className="hero-caption"><span>YASPRETTY</span><i>PERSONAL BEAUTY DECISION LIBRARY</i></div>
        </div>
        <div className={`hero-copy${openingReady ? ' hero-copy--ready' : ''}`}>
          {openingReady ? <ScrollFloat as="p" containerClassName="hero-kicker hero-motion-text" effect="float" splitBy="chars" distance={28} stretch={1.02} stagger={0.012} animationDuration={1.35} smoothing={0.16} scrollStart="top 92%" scrollEnd="bottom 58%" ease="power3.out">YASPRETTY / BEAUTY DECISION LIBRARY</ScrollFloat> : <p className="hero-kicker">YASPRETTY / BEAUTY DECISION LIBRARY</p>}
          <p className="eyebrow hero-motion-control"><Sparkles size={14} /> {openingReady ? <ScrollFloat as="span" containerClassName="hero-eyebrow-text" effect="float" splitBy="chars" distance={22} stretch={1.02} stagger={0.012} animationDuration={1.35} smoothing={0.16} scrollStart="top 92%" scrollEnd="bottom 58%" ease="power3.out">个性化妆容规划 / 可信产品决策</ScrollFloat> : '个性化妆容规划 / 可信产品决策'}</p>
          {openingReady ? <ScrollFloat as="h1" containerClassName="hero-slogan" textClassName="hero-slogan-text" effect="float" splitBy="chars" order="start" distance={70} stretch={1.12} stagger={0.025} animationDuration={1.6} smoothing={0.2} scrollStart="top 90%" scrollEnd="bottom 44%" ease="power3.out">{'甄选好物，\n找到适配你的美'}</ScrollFloat> : <h1 className="hero-slogan">{'甄选好物，\n找到适配你的美'}</h1>}
          {openingReady ? <ScrollFloat as="p" containerClassName="hero-description hero-motion-text" effect="float" splitBy="words" distance={24} stretch={1.02} stagger={0.025} animationDuration={1.4} smoothing={0.16} scrollStart="top 90%" scrollEnd="bottom 56%" ease="power3.out">从肤质妆效和预算出发，小Y先记忆你的个人条件和偏好，再为你推荐专属于你的产品</ScrollFloat> : <p className="hero-description">从肤质妆效和预算出发，小Y先记忆你的个人条件和偏好，再为你推荐专属于你的产品</p>}
          <button className="assistant-entry-button hero-motion-control" onClick={() => onNavigate('assistant')}><Sparkles size={17} /> 创建我的妆容方案 <ChevronRight size={16} /></button>
          <form className="hero-search hero-motion-control" onSubmit={(event) => { event.preventDefault(); onSearch(keyword) }}>
            <Search size={20} aria-hidden="true" />
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索品牌、产品名或色号" aria-label="搜索品牌、产品名或色号" />
            <button type="submit">搜索</button>
          </form>
          <div className="quick-links hero-motion-control" aria-label="快捷筛选">
            {quickFilters.map((filter) => <button key={filter.label} onClick={() => onQuickFilter(filter.query)}>{filter.label}<ChevronRight size={14} /></button>)}
          </div>
        </div>
      </section>
      <section className="content-section home-selection">
        <div className="section-heading">
          <div>{openingReady ? <ScrollFloat as="h2" containerClassName="featured-heading" textClassName="featured-heading-text" effect="float" splitBy="chars" distance={45} stretch={1.08} stagger={0.018} animationDuration={1.45} smoothing={0.18} scrollStart="top 90%" scrollEnd="bottom 48%" ease="power3.out">编辑精选</ScrollFloat> : <h2 className="featured-heading">编辑精选</h2>}</div>
          <button className="text-action" onClick={() => onSearch('')}>查看产品库 <ChevronRight size={16} /></button>
        </div>
        {openingReady ? <EnhancementBoundary fallback={staticFeatured}>
          <Suspense fallback={staticFeatured}>
            <FlexCarousel items={featuredItems} preset="ribbon" intro="rise" fit="portrait" cardHeight={0.58} gap={16} squeeze={0.08} focusOnClick captions autoplay interval={3.1} fallback={staticFeatured} onSelect={(_, item) => { const product = productById(item?.id); if (product) onOpenProduct(product) }} />
          </Suspense>
        </EnhancementBoundary> : staticFeatured}
      </section>
      <section className="story-closing" aria-label="You are so pretty">
        <StrokeText
          text="You are so pretty"
          trigger="view"
          strokeColor="var(--yp-rose-deep)"
          fillColor="var(--yp-rose-deep)"
          strokeWidth={1.8}
          drawDuration={1.6}
          fillDelay={0.15}
          stagger={0.04}
          ease="power2.out"
          fontSize={72}
          fontWeight={700}
          fontFamily="'Segoe Script', 'Snell Roundhand', 'Brush Script MT', cursive"
          fontStyle="italic"
          letterSpacing={-1}
          className="story-closing-text"
        />
      </section>
    </div>
  )
}

function LibraryView({ filters, results, sort, isFilterOpen, collection, onChangeFilter, onClear, onChangeSort, onToggleFilterPanel, onOpenProduct, onFavorite, onRemoveFavorite }) {
  return (
    <section className="library-page content-section">
      <div className="library-heading">
        <div><p className="eyebrow">产品库 / 目前收录彩妆 / {products.length} 条资料</p><h1>找到匹配的彩妆</h1></div>
        <label className="library-search"><Search size={17} /><input value={filters.keyword} onChange={(event) => onChangeFilter('keyword', event.target.value, false)} placeholder="搜索品牌、产品名、色号" /></label>
      </div>
      <div className="library-controls-mobile">
        <button className="filter-button" onClick={onToggleFilterPanel}><SlidersHorizontal size={17} /> 筛选条件</button>
        <SortSelect sort={sort} onChange={onChangeSort} />
      </div>
      <div className="library-layout">
        <FilterPanel filters={filters} isOpen={isFilterOpen} onChange={onChangeFilter} onClear={onClear} onClose={onToggleFilterPanel} />
        <div className="library-results">
          <div className="results-toolbar">
            <p>共 <strong>{results.length}</strong> 款符合当前条件</p>
            <div className="desktop-sort"><SortSelect sort={sort} onChange={onChangeSort} /></div>
          </div>
          {results.length > 0 ? <div className="product-grid">{results.map((product) => <ProductCard key={product.id} product={product} collection={collection} onOpen={onOpenProduct} onFavorite={onFavorite} onRemoveFavorite={onRemoveFavorite} />)}</div> : <EmptyResults onClear={onClear} />}
        </div>
      </div>
    </section>
  )
}

function FilterPanel({ filters, isOpen, onChange, onClear, onClose }) {
  const panel = (
    <aside className={isOpen ? 'filter-panel open' : 'filter-panel'}>
      <div className="filter-title"><div><SlidersHorizontal size={17} /><strong>筛选条件</strong></div><button className="clear-button" onClick={onClear}>清空</button><button className="filter-close" aria-label="关闭筛选" title="关闭筛选" onClick={onClose}><X size={18} /></button></div>
      <FilterGroup label="产品类别" values={categoryOptions} selected={filters.categories} onClick={(value) => onChange('categories', value)} />
      <FilterGroup label="适合肤质" values={skinOptions} selected={filters.skins} onClick={(value) => onChange('skins', value)} />
      <FilterGroup label="妆效" values={finishOptions} selected={filters.finishes} onClick={(value) => onChange('finishes', value)} />
      <FilterGroup label="遮瑕度" values={['低', '中', '高']} selected={filters.coverages} onClick={(value) => onChange('coverages', value)} />
      <div className="filter-group"><p>持妆时长</p><div className="segmented-control">{['', '6', '8', '10'].map((value) => <button key={value || 'all'} className={filters.minWear === value ? 'selected' : ''} onClick={() => onChange('minWear', value, false)}>{value ? `${value}h+` : '不限'}</button>)}</div></div>
      <FilterGroup label="氧化程度" values={['低', '中']} selected={filters.oxidations} onClick={(value) => onChange('oxidations', value)} />
      <FilterGroup label="品牌地区" values={['中国', '法国', '美国', '意大利', '韩国']} selected={filters.regions} onClick={(value) => onChange('regions', value)} />
      <div className="filter-group"><p>价格区间</p><div className="price-options">{[['', '不限'], ['0-200', '200 元以下'], ['200-400', '200 - 400'], ['400-800', '400 元以上']].map(([value, label]) => <button key={label} className={filters.price === value ? 'selected' : ''} onClick={() => onChange('price', value, false)}>{label}</button>)}</div></div>
    </aside>
  )
  return <>{panel}{isOpen && <div className="filter-backdrop" onClick={onClose} aria-hidden="true" />}</>
}

function FilterGroup({ label, values, selected, onClick }) {
  return <div className="filter-group"><p>{label}</p><div className="filter-chips">{values.map((value) => <button key={value} className={selected.includes(value) ? 'selected' : ''} onClick={() => onClick(value)}>{value}</button>)}</div></div>
}

function SortSelect({ sort, onChange }) {
  return <label className="sort-select"><ArrowDownUp size={16} /><select value={sort} onChange={(event) => onChange(event.target.value)} aria-label="排序方式"><option value="recommended">综合推荐</option><option value="rating">评分从高到低</option><option value="price-asc">价格从低到高</option><option value="price-desc">价格从高到低</option></select><ChevronDown size={15} /></label>
}

function ProductCard({ product, collection, onOpen, onFavorite, onRemoveFavorite }) {
  const status = collection[product.id]
  const [imageFailed, setImageFailed] = useState(false)
  const showShadeSwatch = !['粉底液', '气垫', '遮瑕'].includes(product.category)
  return (
    <article className="product-card">
      <button className="product-photo" onClick={() => onOpen(product)} aria-label={`查看 ${product.brand} ${product.name} 详情`}>{imageFailed ? <span className="product-photo-fallback">图片暂不可用</span> : <img src={product.image} alt={`${product.brand} ${product.name} 产品图`} onError={() => setImageFailed(true)} loading="lazy" />}<span className="category-stamp">{product.category}</span></button>
      <div className="product-card-body">
        <div className="product-card-top"><p className="product-brand">{product.brand}</p><button className={status ? 'favorite-button saved' : 'favorite-button'} aria-label={status ? '取消收藏' : '收藏'} title={status ? '取消收藏' : '收藏'} onClick={() => status ? onRemoveFavorite(product.id) : onFavorite(product.id, '想买')}><Heart size={18} fill={status ? 'currentColor' : 'none'} /></button></div>
        <button className="product-name" onClick={() => onOpen(product)}>{product.name}</button>
        <p className="shade-line">{showShadeSwatch && <span className="shade-dot" style={product.shades[0]?.swatchColor ? { backgroundColor: product.shades[0].swatchColor } : undefined} />} 颜色/色号 {product.shades.slice(0, 2).map((shade) => shade.name).join(' / ')}</p>
        <div className="tag-row"><span>{product.skins[0]}</span><span>{product.finish}</span>{product.coverage && <span>{product.coverage}遮瑕</span>}{product.wear ? <span>{product.wear}h+</span> : <span>官网资料</span>}</div>
        <p className="product-note">“{product.note}”</p>
        <div className="rating-row"><span>{product.rating ? <><Star size={15} fill="currentColor" /> 编辑示例 {product.rating}</> : '官网资料，非用户统计'}</span><button onClick={() => onOpen(product)}>查看详情 <ChevronRight size={15} /></button></div>
      </div>
    </article>
  )
}

function ProductProfileView({ product, collection, onBack, onFavorite, onRemoveFavorite }) {
  const verification = getProductVerification(product.id)
  const reviewed = verification?.reviewedFacts
  const assessment = buildProductAssessment(product)
  const status = collection[product.id]

  return (
    <article className="product-profile-page">
      <div className="product-profile-toolbar">
        <button className="profile-back-button" onClick={onBack}><ArrowLeft size={17} /> 返回</button>
        <span>产品指南</span>
      </div>

      <header className="product-profile-hero">
        <div className="product-profile-media"><img src={product.image} alt={`${product.brand} ${product.name} 产品图`} /></div>
        <div className="product-profile-heading">
          <p className="eyebrow">{product.category} / PRODUCT GUIDE</p>
          <p className="product-brand">{product.brand}</p>
          <h1>{product.name}</h1>
          <p className="profile-summary">{assessment.summary}</p>
          <StatusControl productId={product.id} status={status} onFavorite={onFavorite} onRemoveFavorite={onRemoveFavorite} />
        </div>
      </header>

      <div className="product-profile-content">
        <section className="profile-section commerce-section">
          <div className="profile-section-heading"><div><p className="eyebrow">OFFICIAL CHANNEL</p><h2>官方购买渠道</h2></div><Store size={22} /></div>
          {verification?.commerce.status === 'verified' && verification.commerce.productUrl ? (
            <div className="commerce-ready"><div><strong>{verification.commerce.officialStoreName}</strong><p>{reviewed?.marketplaceTitle || '官方店商品'}</p></div><a className="official-product-link" href={verification.commerce.productUrl} target="_blank" rel="noopener noreferrer">打开官方商品链接 <ExternalLink size={16} /></a></div>
          ) : (
            <div className="commerce-pending"><div><strong>暂未提供官方购买链接</strong><p>可稍后再回来查看该产品的购买渠道。</p></div></div>
          )}
        </section>

        <section className="profile-section">
          <div className="profile-section-heading"><div><p className="eyebrow">PRODUCT INFORMATION</p><h2>产品信息</h2></div></div>
          <p className="profile-section-note">这里汇总品牌、规格、价格与使用方向，方便你快速比较。价格和妆效会因渠道、批次、光线与个人使用方式而变化。</p>
          <dl className="parameter-table">
            <ParameterRow label="产品名称" value={reviewed?.productName || product.name} />
            <ParameterRow label="产品类别" value={product.category} />
            <ParameterRow label="商品规格" value={reviewed?.specification || '暂无信息'} />
            <ParameterRow label="参考价格" value={reviewed ? `${reviewed.listPrice} 元` : product.priceLabel} />
            <ParameterRow label="实际生产地" value={reviewed?.origin || '暂无信息'} />
            <ParameterRow label="妆效方向" value={product.finish || '暂无信息'} />
            <ParameterRow label="遮瑕方向" value={product.coverage ? `${product.coverage}遮瑕` : '暂无信息'} />
            <ParameterRow label="适用方向" value={product.skins.join(' / ') || '暂无信息'} />
            <ParameterRow label="颜色/色号" value={product.shades.map((shade) => shade.name).join(' / ') || '暂无信息'} />
          </dl>
        </section>

        <section className="profile-section">
          <div className="profile-section-heading"><div><p className="eyebrow">USAGE NOTES</p><h2>使用参考</h2></div></div>
          <p className="profile-section-note">以下内容用于选购初筛，不构成功效保证或独立实测。</p>
          <div className="assessment-grid">
            {assessment.dimensions.map((dimension) => <div key={dimension.label}><span>{dimension.label}</span><strong>{dimension.value}</strong></div>)}
          </div>
          <div className="assessment-columns">
            <div><h3>可参考的方向</h3><ul>{assessment.strengths.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul></div>
            <div><h3>使用与判断边界</h3><ul>{[...assessment.cautions, ...assessment.limitations].map((item) => <li key={item}><span>•</span>{item}</li>)}</ul></div>
          </div>
        </section>

        <section className="profile-section provenance-section">
          <div className="profile-section-heading"><div><p className="eyebrow">SOURCES</p><h2>资料来源</h2></div></div>
          {product.informationSources?.length > 0 && <ul className="auxiliary-sources">{product.informationSources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} <ExternalLink size={13} /></a><span>{source.publisher} · 访问于 {source.accessedAt}</span></li>)}</ul>}
          <p className="profile-source-notice">{productImageNotice}</p>
          <a className="source-contact-link" href={imageRightsContactUrl} target="_blank" rel="noopener noreferrer">权利人联系删除 <ChevronRight size={15} /></a>
        </section>
      </div>
    </article>
  )
}

function ParameterRow({ label, value }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>
}

function DetailDrawer({ product, collection, onClose, onOpenProduct, onOpenFullProfile, onFavorite, onRemoveFavorite }) {
  const verification = getProductVerification(product.id)
  const reviewed = verification?.reviewedFacts
  const [shade, setShade] = useState(product.shades[0])
  useEffect(() => setShade(product.shades[0]), [product])
  const status = collection[product.id]
  const showShadeSwatch = !['粉底液', '气垫', '遮瑕'].includes(product.category)
  const recommendations = products.filter((item) => item.id !== product.id && (item.category === product.category || item.finish === product.finish)).slice(0, 3)
  const shadeImage = product.image
  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <aside className="detail-drawer" role="dialog" aria-modal="true" aria-label={`${product.brand} ${product.name} 产品详情`} onMouseDown={(event) => event.stopPropagation()}>
        <button className="drawer-back-button" aria-label="返回上一级" onClick={onClose}><ArrowLeft size={18} /> 返回</button>
        <button className="dialog-close" aria-label="关闭详情" title="关闭详情" onClick={onClose}><X size={20} /></button>
        <div className="detail-hero"><img src={shadeImage} alt={`${product.brand} ${product.name} 产品图`} /><div className="detail-hero-info"><p className="eyebrow">{product.category} / YASPRETTY GUIDE</p><p className="product-brand">{product.brand}</p><h2>{product.name}</h2><div className="detail-rating">{product.rating ? <><Star size={17} fill="currentColor" /> 编辑示例 {product.rating} <span>非用户统计</span></> : <span>官网资料，非用户统计</span>}</div><p>{product.note}</p><StatusControl productId={product.id} status={status} onFavorite={onFavorite} onRemoveFavorite={onRemoveFavorite} /></div></div>
        <div className="detail-body">
          <section className="detail-section"><h3>基础信息</h3><dl className="facts-grid"><div><dt>品牌所属地区</dt><dd>{product.brandRegion || '暂无信息'}</dd></div><div><dt>实际生产地</dt><dd>{reviewed?.origin || '暂无信息'}</dd></div><div><dt>参考价格</dt><dd>{reviewed ? `${reviewed.listPrice} 元` : product.priceLabel}</dd></div><div><dt>商品规格</dt><dd>{reviewed?.specification || '暂无信息'}</dd></div><div><dt>妆效方向</dt><dd>{product.finish || '暂无信息'}</dd></div></dl></section>
          <section className="detail-section shade-section"><h3>颜色/色号</h3><div className="shade-list">{product.shades.map((item, index) => <button key={item.name} className={shade.name === item.name ? 'shade-choice selected' : 'shade-choice'} onClick={() => setShade(item)}>{showShadeSwatch && <span className={`shade-swatch shade-${index}`} style={item.swatchColor ? { backgroundColor: item.swatchColor } : undefined} />}<b>{item.name}</b></button>)}</div><div className="shade-description"><span>{shade.tone}</span><span>{shade.lightness}</span><span>适合 {shade.suitable}</span></div></section>
          <section className="detail-section"><h3>分项评价</h3><div className="metric-grid">{Object.entries(product.metrics).map(([label, value]) => <Metric key={label} label={label} value={value} />)}</div></section>
          <section className="detail-section two-columns"><div><h3>喜欢它的理由</h3><ul className="detail-list">{product.pros.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul></div><div><h3>使用时注意</h3><ul className="detail-list caution-list">{product.cautions.map((item) => <li key={item}><span>•</span>{item}</li>)}</ul></div></section>
          <section className="detail-section"><h3>适合场景</h3><div className="scene-row">{product.scenes.map((scene) => <span key={scene}>{scene}</span>)}</div></section>
          <section className="detail-section"><h3>图片与版权</h3><p className="data-verification-note">{productImageNotice}</p>{product.imageSource?.sourcePageUrl && <ul className="detail-list source-list"><li><Check size={15} /><a href={product.imageSource.sourcePageUrl} target="_blank" rel="noreferrer">查看产品图片来源页</a><small>{product.imageSource.rightsholder} · 采集于 {product.imageSource.acquiredAt}</small></li></ul>}{product.informationSources?.length ? <ul className="detail-list source-list">{product.informationSources.map((source) => <li key={source.url}><Check size={15} /><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a><small>{source.publisher} · 访问于 {source.accessedAt}</small></li>)}</ul> : null}<button className="full-profile-action" onClick={() => onOpenFullProfile(product)}>查看完整产品资料 <ChevronRight size={16} /></button><a className="source-contact-link" href={imageRightsContactUrl} target="_blank" rel="noreferrer">权利人联系删除 <ChevronRight size={15} /></a></section>
          <section className="detail-section recommendations"><div className="detail-section-title"><h3>相似产品</h3><span>继续对比</span></div><div className="recommendation-list">{recommendations.map((item) => <button key={item.id} onClick={() => onOpenProduct(item)}><img src={item.image} alt="" /><span><b>{item.brand}</b>{item.name}<small>{item.finish} · {item.coverage}遮瑕</small></span><ChevronRight size={16} /></button>)}</div></section>
        </div>
      </aside>
    </div>
  )
}

function Metric({ label, value }) {
  const inverse = ['氧化程度', '卡粉风险'].includes(label)
  const visualValue = inverse ? 6 - value : value
  return <div className="metric"><div><span>{label}</span><b>{inverse ? ['很低', '低', '中', '高', '很高'][value - 1] : `${value}/5`}</b></div><div className="metric-track">{[1, 2, 3, 4, 5].map((step) => <i key={step} className={step <= visualValue ? 'filled' : ''} />)}</div></div>
}

function StatusControl({ productId, status, onFavorite, onRemoveFavorite }) {
  return <div className="status-control">{status ? <><span className="saved-status"><Heart size={15} fill="currentColor" /> 已标记：{status}</span><button className="icon-text-button" onClick={() => onRemoveFavorite(productId)}><CircleX size={16} /> 取消</button></> : <button className="primary-action" onClick={() => onFavorite(productId, '想买')}><Heart size={16} /> 收藏这款</button>} {status && <label className="status-select"><select value={status} onChange={(event) => onFavorite(productId, event.target.value)} aria-label="收藏状态">{statusOptions.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} /></label>}</div>
}

function FavoritesView({ collection, onOpenProduct, onFavorite, onRemoveFavorite, onNavigate }) {
  const favorites = products.filter((product) => collection[product.id])
  return <section className="favorites-page content-section"><div className="favorites-heading"><div><p className="eyebrow">MY BEAUTY LIST</p><h1>我的收藏</h1><p>把想试、正在用和愿意回购的彩妆放在同一个清单。</p></div><span className="favorites-count">{favorites.length} 款</span></div>{favorites.length ? <div className="favorite-list">{favorites.map((product) => <article key={product.id} className="favorite-item"><button className="favorite-image" onClick={() => onOpenProduct(product)}><img src={product.image} alt={`${product.name} 产品图`} /></button><div className="favorite-content"><p className="product-brand">{product.brand}</p><button className="favorite-name" onClick={() => onOpenProduct(product)}>{product.name}</button><p>{product.shades[0].name} · {product.skins.join(' / ')} · {product.finish}</p><div className="favorite-bottom"><StatusControl productId={product.id} status={collection[product.id]} onFavorite={onFavorite} onRemoveFavorite={onRemoveFavorite} /><button className="open-link" onClick={() => onOpenProduct(product)}>查看详情 <ChevronRight size={16} /></button></div></div></article>)}</div> : <div className="empty-favorites"><Heart size={28} /><h2>收藏清单还是空的</h2><p>从产品库开始，标记让你想继续了解的彩妆。</p><button className="primary-action" onClick={() => onNavigate('library')}>浏览产品库 <ChevronRight size={16} /></button></div>}</section>
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

function EmptyResults({ onClear }) {
  return <div className="empty-results"><Search size={26} /><h2>没有找到对应档案</h2><p>试着减少一个筛选条件，或用更短的关键词搜索。</p><button className="primary-action" onClick={onClear}>清空筛选</button></div>
}

function Footer() {
  return <footer className="site-footer"><div><img className="footer-wordmark-image" src="/assets/logo/yaspretty-wordmark-dark.svg" alt="YasPretty" /></div><p>{productImageNotice} 产品信息与编辑评价仍需结合详情页来源状态判断。</p><a className="source-contact-link" href={imageRightsContactUrl} target="_blank" rel="noreferrer">权利人联系删除 <ChevronRight size={15} /></a></footer>
}

export default App
