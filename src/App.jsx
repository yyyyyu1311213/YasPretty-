import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  CircleX,
  Heart,
  Menu,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { quickFilters } from './data/products'
import { imageRightsContactUrl, productImageNotice } from './data/product-image-sources'
import { createNavigationEntry, navigationPath, resolveNavigationEntry } from './lib/navigation-history'
import BrandOpening from './components/BrandOpening'
const MakeupTableExperience = lazy(() => import('./features/makeup-table/components/MakeupTableExperience'))
const FlexCarousel = lazy(() => import('./components/FlexCarousel'))
import ScrollFloat from './components/ScrollFloat'
import StrokeText from './components/StrokeText'
import XiaoYAssistant from './components/XiaoYAssistant'

import { getCatalogProducts, productById } from './features/catalog/catalogService'
import { useCatalog } from './features/catalog/hooks/useCatalog'
import LibraryView from './features/catalog/components/LibraryView'
import ProductCard from './features/catalog/components/ProductCard'
import ProductProfile from './features/catalog/components/ProductProfile'
import ProductDetailDrawer from './features/catalog/components/ProductDetailDrawer'

const products = getCatalogProducts()
const STORAGE_KEY = 'base-archive-collection'
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
  const [collection, setCollection] = useState(getStoredCollection)
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

  const favoriteCount = Object.keys(collection).length

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
          <ProductProfile
            product={profileProduct}
            statusControl={<StatusControl productId={profileProduct.id} status={collection[profileProduct.id]} onFavorite={setStatus} onRemoveFavorite={removeFavorite} />}
            onBack={closeProductProfile}
          />
        )}
      </main>

      <Footer />
      {selectedProduct && (
        <ProductDetailDrawer
          product={selectedProduct}
          statusControl={<StatusControl productId={selectedProduct.id} status={collection[selectedProduct.id]} onFavorite={setStatus} onRemoveFavorite={removeFavorite} />}
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
        <MakeupTableExperience openingReady={openingReady} onOpenProduct={onOpenProduct} onViewCategory={onViewCategory} />
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

function Footer() {
  return <footer className="site-footer"><div><img className="footer-wordmark-image" src="/assets/logo/yaspretty-wordmark-dark.svg" alt="YasPretty" /></div><p>{productImageNotice} 产品信息与编辑评价仍需结合详情页来源状态判断。</p><a className="source-contact-link" href={imageRightsContactUrl} target="_blank" rel="noreferrer">权利人联系删除 <ChevronRight size={15} /></a></footer>
}

export default App
