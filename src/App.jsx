import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowDownUp,
  Check,
  ChevronDown,
  ChevronRight,
  CircleX,
  ExternalLink,
  FileCheck2,
  Heart,
  Menu,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  X,
} from 'lucide-react'
import { categoryOptions, finishOptions, products, quickFilters, skinOptions } from './data/products'
import { imageRightsContactUrl, productImageNotice } from './data/product-image-sources'
import { buildProductAssessment, evidenceSync, getProductVerification } from './data/product-verification'
import XiaoYAssistant from './components/XiaoYAssistant'

const STORAGE_KEY = 'base-archive-collection'
const emptyFilters = {
  categories: [], skins: [], finishes: [], coverages: [], minWear: '', oxidations: [], regions: [], price: '', keyword: '', scene: '', maxPrice: null,
}

const statusOptions = ['想买', '正在用', '会回购']

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

function productFromPathname(pathname = '') {
  const match = pathname.match(/^\/products\/([^/]+)\/?$/)
  if (!match) return null
  return products.find((product) => product.id === decodeURIComponent(match[1])) || null
}

function App() {
  const initialProfileProduct = typeof window === 'undefined' ? null : productFromPathname(window.location.pathname)
  const [view, setView] = useState(initialProfileProduct ? 'product' : 'home')
  const [filters, setFilters] = useState(emptyFilters)
  const [sort, setSort] = useState('recommended')
  const [collection, setCollection] = useState(getStoredCollection)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [profileProduct, setProfileProduct] = useState(initialProfileProduct)
  const [profileReturnView, setProfileReturnView] = useState('library')
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection))
  }, [collection])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedProduct(null)
        setFilterPanelOpen(false)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  useEffect(() => {
    const syncProfileRoute = () => {
      const product = productFromPathname(window.location.pathname)
      setProfileProduct(product)
      setView(product ? 'product' : 'home')
      setSelectedProduct(null)
    }
    window.addEventListener('popstate', syncProfileRoute)
    return () => window.removeEventListener('popstate', syncProfileRoute)
  }, [])

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
    setView('library')
    setMobileMenuOpen(false)
  }

  function chooseQuickFilter(query) {
    setFilters({ ...emptyFilters, ...query })
    setView('library')
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

  function navigate(nextView) {
    if (window.location.pathname !== '/') window.history.pushState({}, '', '/')
    setProfileProduct(null)
    setView(nextView)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openProductProfile(product) {
    setProfileReturnView(view === 'product' ? 'library' : view)
    setProfileProduct(product)
    setSelectedProduct(null)
    setView('product')
    window.history.pushState({ productId: product.id }, '', `/products/${encodeURIComponent(product.id)}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function closeProductProfile() {
    if (window.location.pathname !== '/') window.history.pushState({}, '', '/')
    setProfileProduct(null)
    setView(profileReturnView === 'product' ? 'library' : profileReturnView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
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
            onSearch={runSearch}
            onQuickFilter={chooseQuickFilter}
            onNavigate={navigate}
            onOpenProduct={setSelectedProduct}
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
            onOpenProduct={setSelectedProduct}
            onFavorite={setStatus}
            onRemoveFavorite={removeFavorite}
          />
        )}
        {view === 'guide' && <GuideView onApplyFilter={chooseQuickFilter} />}
        {view === 'assistant' && <XiaoYAssistant onOpenProduct={setSelectedProduct} />}
        {view === 'culture' && <CultureView onNavigate={navigate} />}
        {view === 'favorites' && (
          <FavoritesView
            collection={collection}
            onOpenProduct={setSelectedProduct}
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
          onClose={() => setSelectedProduct(null)}
          onOpenProduct={setSelectedProduct}
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
          <span className="brand-wordmark">YasPretty</span>
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

function HomeView({ onSearch, onQuickFilter, onNavigate, onOpenProduct, collection, onFavorite, onRemoveFavorite }) {
  const [keyword, setKeyword] = useState('')
  const featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4)
  const heroImage = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1600&q=88'
  return (
    <>
      <section className="home-hero">
        <div className="hero-media" aria-hidden="true"><img src={heroImage} alt="" /><div className="hero-caption"><span>YASPRETTY</span><i>GLOBAL BEAUTY EDIT</i></div></div>
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={14} /> yaspretty 彩妆资料库 / 从妆前到持妆，做自己的底妆编辑</p>
          <h1>不止底妆。<br />是你的彩妆选择。</h1>
          <p className="hero-description">从国际大牌粉底到下一支口红，用肤质、妆效和真实使用体验，建立属于你的彩妆资料库。</p>
          <button className="assistant-entry-button" onClick={() => onNavigate('assistant')}><Sparkles size={17} /> 和小Y聊聊你的需求 <ChevronRight size={16} /></button>
          <form className="hero-search" onSubmit={(event) => { event.preventDefault(); onSearch(keyword) }}>
            <Search size={20} aria-hidden="true" />
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索品牌、产品名或色号" aria-label="搜索品牌、产品名或色号" />
            <button type="submit">搜索</button>
          </form>
          <div className="quick-links" aria-label="快捷筛选">
            {quickFilters.map((filter) => <button key={filter.label} onClick={() => onQuickFilter(filter.query)}>{filter.label}<ChevronRight size={14} /></button>)}
          </div>
        </div>
      </section>
      <section className="content-section home-selection">
        <div className="section-heading">
          <div><p className="eyebrow">编辑精选</p><h2>最近值得翻阅的底妆</h2></div>
          <button className="text-action" onClick={() => onSearch('')}>查看产品库 <ChevronRight size={16} /></button>
        </div>
        <div className="product-grid featured-grid">
          {featured.map((product) => <ProductCard key={product.id} product={product} collection={collection} onOpen={onOpenProduct} onFavorite={onFavorite} onRemoveFavorite={onRemoveFavorite} />)}
        </div>
      </section>
      <section className="story-strip">
        <div><p className="eyebrow">资料库使用方式</p><h2>让彩妆选择有据可循</h2></div>
        <div className="story-points"><span>01 <b>先看肤质</b></span><span>02 <b>再定妆效</b></span><span>03 <b>最后看持妆</b></span></div>
      </section>
    </>
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
  return (
    <article className="product-card">
      <button className="product-photo" onClick={() => onOpen(product)} aria-label={`查看 ${product.brand} ${product.name} 详情`}><img src={product.image} alt={`${product.brand} ${product.name} 产品图（图片授权待核验）`} loading="lazy" /><span className="category-stamp">{product.category}</span><span className="verification-stamp">{product.imageAuthorizationStatus === 'verified' ? '图片已核验' : '图片授权待核验'}</span></button>
      <div className="product-card-body">
        <div className="product-card-top"><p className="product-brand">{product.brand}</p><button className={status ? 'favorite-button saved' : 'favorite-button'} aria-label={status ? '取消收藏' : '收藏'} title={status ? '取消收藏' : '收藏'} onClick={() => status ? onRemoveFavorite(product.id) : onFavorite(product.id, '想买')}><Heart size={18} fill={status ? 'currentColor' : 'none'} /></button></div>
        <button className="product-name" onClick={() => onOpen(product)}>{product.name}</button>
        <p className="shade-line"><span className="shade-dot" /> 代表色号 {product.shades.slice(0, 2).map((shade) => shade.name).join(' / ')}</p>
        <div className="tag-row"><span>{product.skins[0]}</span><span>{product.finish}</span>{product.coverage && <span>{product.coverage}遮瑕</span>}{product.wear ? <span>{product.wear}h+</span> : <span>官网资料</span>}</div>
        <p className="product-note">“{product.note}”</p>
        <div className="rating-row"><span>{product.rating ? <><Star size={15} fill="currentColor" /> 编辑示例 {product.rating}</> : '官网资料，非用户统计'}</span><button onClick={() => onOpen(product)}>查看档案 <ChevronRight size={15} /></button></div>
      </div>
    </article>
  )
}

function ProductProfileView({ product, collection, onBack, onFavorite, onRemoveFavorite }) {
  const verification = getProductVerification(product.id)
  const reviewed = verification?.reviewedFacts
  const assessment = buildProductAssessment(product)
  const status = collection[product.id]
  const evidence = verification?.evidence.publicEvidence || []
  const parameterEvidence = evidence.filter((item) => item.kind === 'parameters')
  const productEvidence = evidence.filter((item) => item.kind === 'product_detail')
  const storeEvidence = evidence.filter((item) => item.kind === 'store_identity')
  const factStatus = product.factVerificationStatus === 'verified' ? '已核验' : '待逐项核验'
  const originStatus = reviewed?.originStatus === 'verified_parameter_screenshot' ? '已核验' : '参数截图未列出'

  return (
    <article className="product-profile-page">
      <div className="product-profile-toolbar">
        <button className="profile-back-button" onClick={onBack}><ArrowLeft size={17} /> 返回</button>
        <span>档案编号 {verification?.evidence.sequence || '--'} · 证据同步于 {evidenceSync.syncedAt}</span>
      </div>

      <header className="product-profile-hero">
        <div className="product-profile-media"><img src={product.image} alt={`${product.brand} ${product.name} 产品图（图片授权待核验）`} /></div>
        <div className="product-profile-heading">
          <p className="eyebrow">{product.category} / VERIFIED PRODUCT FILE</p>
          <p className="product-brand">{product.brand}</p>
          <h1>{product.name}</h1>
          <p className="profile-summary">{assessment.summary}</p>
          <div className="profile-status-row">
            <span className={verification?.nameReviewStatus === 'verified' ? 'status-pill recorded' : 'status-pill pending'}>{verification?.nameReviewStatus === 'verified' ? '名称已核验' : '名称待负责人确认'}</span>
            <span className={product.factVerificationStatus === 'verified' ? 'status-pill recorded' : 'status-pill pending'}>{factStatus}</span>
            <span className="status-pill pending">图片授权待核验</span>
          </div>
          <StatusControl productId={product.id} status={status} onFavorite={onFavorite} onRemoveFavorite={onRemoveFavorite} />
        </div>
      </header>

      <div className="product-profile-content">
        <section className="profile-section commerce-section">
          <div className="profile-section-heading"><div><p className="eyebrow">OFFICIAL CHANNEL</p><h2>淘宝 / 天猫官方商品链接</h2></div><Store size={22} /></div>
          {verification?.commerce.status === 'verified' && verification.commerce.productUrl ? (
            <div className="commerce-ready"><div><strong>{verification.commerce.officialStoreName}</strong><p>{verification.commerce.officialMarkerType} · {verification.commerce.officialStoreFlag} · 链接核验于 {verification.commerce.verifiedAt}</p><p className="commerce-title">{reviewed?.marketplaceTitle}</p></div><a className="official-product-link" href={verification.commerce.productUrl} target="_blank" rel="noopener noreferrer">打开淘宝官方店商品链接 <ExternalLink size={16} /></a></div>
          ) : (
            <div className="commerce-pending"><div><strong>官方商品直达链接待核验</strong><p>{verification?.commerce.note}</p></div><span>{verification?.commerce.officialStoreName ? `现有截图记录：${verification.commerce.officialStoreName}` : '尚无店铺首页证据'}</span></div>
          )}
        </section>

        <section className="profile-section">
          <div className="profile-section-heading"><div><p className="eyebrow">PARAMETERS</p><h2>产品参数与证据状态</h2></div><FileCheck2 size={22} /></div>
          <p className="profile-section-note">商品名称、店铺、经营主体、规格、原价、链接和产地来自人工核验表及对应参数截图。妆效、遮瑕、肤质适配和持妆属于编辑解读或尚无独立实测。</p>
          <dl className="parameter-table">
            <ParameterRow label="产品名称" value={reviewed?.productName || product.name} status={factStatus} />
            <ParameterRow label="产品类别" value={product.category} status={factStatus} />
            <ParameterRow label="官方店商品标题" value={reviewed?.marketplaceTitle || '待补充'} status={reviewed ? '已核验' : '待核验'} />
            <ParameterRow label="商品规格" value={reviewed?.specification || '待补充'} status={reviewed ? '已核验' : '待核验'} />
            <ParameterRow label="核验原价" value={reviewed ? `${reviewed.listPrice} 元 · ${reviewed.priceNote} · ${reviewed.verifiedAt}` : product.priceLabel} status={reviewed ? '已核验' : '待核验'} />
            <ParameterRow label="实际生产地" value={reviewed?.origin || '参数截图未列出'} status={originStatus} />
            <ParameterRow label="经营主体" value={reviewed?.companyName || '待补充'} status={reviewed ? '已核验' : '待核验'} />
            <ParameterRow label="妆效方向" value={product.finish} status="编辑解读" />
            <ParameterRow label="遮瑕方向" value={product.coverage ? `${product.coverage}遮瑕` : '待核验'} status="编辑解读" />
            <ParameterRow label="适用方向" value={product.skins.join(' / ')} status="编辑解读" />
            <ParameterRow label="代表色号" value={product.shades.map((shade) => shade.name).join(' / ')} status="编辑整理" />
            <ParameterRow label="持妆与氧化" value="缺少统一测试方法时不作确定结论" status="待核验" />
          </dl>
        </section>

        <section className="profile-section">
          <div className="profile-section-heading"><div><p className="eyebrow">EDITORIAL ASSESSMENT</p><h2>YasPretty 参数解读</h2></div><ShieldCheck size={22} /></div>
          <p className="profile-section-note">{assessment.sourceLabel}。以下内容用于选购初筛，不构成功效保证或独立实测。</p>
          <div className="assessment-grid">
            {assessment.dimensions.map((dimension) => <div key={dimension.label}><span>{dimension.label}</span><strong>{dimension.value}</strong><small>{assessmentStatusLabel(dimension.status)}</small></div>)}
          </div>
          <div className="assessment-columns">
            <div><h3>可参考的方向</h3><ul>{assessment.strengths.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul></div>
            <div><h3>使用与判断边界</h3><ul>{[...assessment.cautions, ...assessment.limitations].map((item) => <li key={item}><span>•</span>{item}</li>)}</ul></div>
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-section-heading"><div><p className="eyebrow">EVIDENCE</p><h2>商品详情与参数证据</h2></div><span>{evidence.length} 份公开证据</span></div>
          <div className="evidence-groups">
            <EvidenceGroup title="商品详情页截图" items={productEvidence} product={product} />
            <EvidenceGroup title="参数信息截图" items={parameterEvidence} product={product} emptyText="该产品目录未单独保存参数信息截图。" />
            <EvidenceGroup title="店铺身份截图" items={storeEvidence} product={product} emptyText="店铺首页截图缺失，官方身份仍待重新检索。" />
          </div>
          <div className="business-evidence-row"><span>企业资质证据</span><strong>{reviewed?.companyName || '经营主体待补充'} · {verification?.evidence.businessQualification.status === 'archived_internal' ? '人工核验已完成，原图内部留档' : '证据缺失'}</strong><small>{verification?.evidence.businessQualification.fileName || '无对应文件'}</small></div>
        </section>

        {(verification?.issues.length || product.informationSources?.length) > 0 && (
          <section className="profile-section provenance-section">
            <div className="profile-section-heading"><div><p className="eyebrow">TRACEABILITY</p><h2>来源与待处理问题</h2></div></div>
            {verification?.issues.length > 0 && <div className="verification-issues"><h3>当前阻断项</h3><ul>{verification.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul></div>}
            {product.informationSources?.length > 0 && <div className="auxiliary-sources"><h3>辅助资料来源（非购买入口）</h3><ul>{product.informationSources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} <ExternalLink size={13} /></a><span>{source.publisher} · 访问于 {source.accessedAt} · 支持 {source.supports.join('、')}</span></li>)}</ul></div>}
            <p className="profile-source-notice">{productImageNotice}</p>
            <a className="source-contact-link" href={imageRightsContactUrl} target="_blank" rel="noopener noreferrer">权利人联系删除 <ChevronRight size={15} /></a>
          </section>
        )}
      </div>
    </article>
  )
}

function ParameterRow({ label, value, status }) {
  const isRecorded = status === '来源已记录' || status === '已核验'
  return <div><dt>{label}</dt><dd>{value}</dd><span className={isRecorded ? 'parameter-status recorded' : 'parameter-status pending'}>{status}</span></div>
}

function assessmentStatusLabel(status) {
  if (status === 'source_recorded') return '来源字段'
  if (status === 'editorial_interpretation') return '编辑解读'
  return '待核验'
}

function EvidenceGroup({ title, items, product, emptyText = '暂无对应证据。' }) {
  return (
    <div className="evidence-group">
      <h3>{title}</h3>
      {items.length ? <div className="evidence-grid">{items.map((item) => <a key={item.publicPath} className="evidence-item" href={item.publicPath} target="_blank" rel="noopener noreferrer"><img src={item.publicPath} alt={`${product.brand} ${product.name} ${item.label}`} loading="lazy" /><span><strong>{item.label}</strong><small>SHA-256 {item.sha256.slice(0, 12)}… · {Math.round(item.sizeBytes / 1024)} KB</small></span><ExternalLink size={15} /></a>)}</div> : <p className="evidence-empty">{emptyText}</p>}
    </div>
  )
}

function DetailDrawer({ product, collection, onClose, onOpenProduct, onOpenFullProfile, onFavorite, onRemoveFavorite }) {
  const verification = getProductVerification(product.id)
  const reviewed = verification?.reviewedFacts
  const [shade, setShade] = useState(product.shades[0])
  useEffect(() => setShade(product.shades[0]), [product])
  const status = collection[product.id]
  const recommendations = products.filter((item) => item.id !== product.id && (item.category === product.category || item.finish === product.finish)).slice(0, 3)
  const shadeImage = product.image
  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <aside className="detail-drawer" role="dialog" aria-modal="true" aria-label={`${product.brand} ${product.name} 产品详情`} onMouseDown={(event) => event.stopPropagation()}>
        <button className="dialog-close" aria-label="关闭详情" title="关闭详情" onClick={onClose}><X size={20} /></button>
        <div className="detail-hero"><img src={shadeImage} alt={`${product.brand} ${product.name} ${shade.name} 产品图（图片授权待核验）`} /><div className="detail-hero-info"><p className="eyebrow">{product.category} / YASPRETTY FILE</p><p className="product-brand">{product.brand}</p><h2>{product.name}</h2><div className="detail-rating">{product.rating ? <><Star size={17} fill="currentColor" /> 编辑示例 {product.rating} <span>非用户统计</span></> : <span>官网资料，非用户统计</span>}</div><p>{product.note}</p><StatusControl productId={product.id} status={status} onFavorite={onFavorite} onRemoveFavorite={onRemoveFavorite} /></div></div>
        <div className="detail-body">
          <section className="detail-section"><h3>基础信息</h3><p className="data-verification-note">{reviewed ? '名称、淘宝官方店商品、经营主体、规格、原价和链接已按人工核验表记录；妆效与适配属于编辑解读，图片授权仍待核验。' : '价格、产地、色号和产品表现仍待来源核验；产品图片来源已单独披露。'}</p><dl className="facts-grid"><div><dt>品牌所属地区</dt><dd>{product.brandRegion}</dd></div><div><dt>实际生产地</dt><dd>{reviewed?.origin || '参数截图未列出'}</dd></div><div><dt>核验原价</dt><dd>{reviewed ? `${reviewed.listPrice} 元（${reviewed.verifiedAt}）` : `${product.priceLabel}（价格待核验）`}</dd></div><div><dt>商品规格</dt><dd>{reviewed?.specification || '待补充'}</dd></div><div><dt>经营主体</dt><dd>{reviewed?.companyName || '待补充'}</dd></div><div><dt>妆效方向</dt><dd>{product.finish}（编辑解读）</dd></div></dl></section>
          <section className="detail-section shade-section"><h3>代表色号</h3><div className="shade-list">{product.shades.map((item, index) => <button key={item.name} className={shade.name === item.name ? 'shade-choice selected' : 'shade-choice'} onClick={() => setShade(item)}><span className={`shade-swatch shade-${index}`} /><b>{item.name}</b></button>)}</div><div className="shade-description"><span>{shade.tone}</span><span>{shade.lightness}</span><span>适合 {shade.suitable}</span></div></section>
          <section className="detail-section"><h3>分项评价</h3><div className="metric-grid">{Object.entries(product.metrics).map(([label, value]) => <Metric key={label} label={label} value={value} />)}</div></section>
          <section className="detail-section two-columns"><div><h3>喜欢它的理由</h3><ul className="detail-list">{product.pros.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul></div><div><h3>使用时注意</h3><ul className="detail-list caution-list">{product.cautions.map((item) => <li key={item}><span>•</span>{item}</li>)}</ul></div></section>
          <section className="detail-section"><h3>适合场景</h3><div className="scene-row">{product.scenes.map((scene) => <span key={scene}>{scene}</span>)}</div></section>
          <section className="detail-section"><h3>来源与公开状态</h3><p className="data-verification-note">{product.imageSource?.note || productImageNotice}</p>{product.imageSource?.sourcePageUrl && <ul className="detail-list source-list"><li><Check size={15} /><a href={product.imageSource.sourcePageUrl} target="_blank" rel="noreferrer">查看产品图片来源页</a><small>{product.imageSource.rightsholder} · 采集于 {product.imageSource.acquiredAt} · 授权待核验</small></li></ul>}{product.informationSources?.length ? <ul className="detail-list source-list">{product.informationSources.map((source) => <li key={source.url}><Check size={15} /><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a><small>{source.publisher} · 访问于 {source.accessedAt}</small></li>)}</ul> : <p className="data-verification-note">产品事实来源仍待逐项补充；图片来源记录不等于产品事实已经核验。</p>}<button className="full-profile-action" onClick={() => onOpenFullProfile(product)}>查看完整核验档案 <ChevronRight size={16} /></button><a className="source-contact-link" href={imageRightsContactUrl} target="_blank" rel="noreferrer">权利人联系删除 <ChevronRight size={15} /></a></section>
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
      <img className="culture-logo-art" src="/brand/yaspretty-logo.jpg" alt="YasPretty 品牌标识" />
    </div>
    <div className="culture-statement">
      <span>01</span>
      <p>清晰的信息、真实的体验、理性的视角，让每一次选择都更接近你自己。</p>
    </div>
    <div className="culture-principles">
      <article><span>真实</span><h2>真实记录</h2><p>同一款彩妆在不同肤质、气候与上妆方法下都有不同表现。资料保留优点，也写下需要留意的部分。</p></article>
      <article><span>理解</span><h2>理解皮肤</h2><p>油光、毛孔、干纹和肤色都不是需要被纠正的缺点，而是帮助我们找到合适产品的线索。</p></article>
      <article><span>选择</span><h2>做自己的编辑</h2><p>不必被热度和标准答案推着走。翻阅、比较、收藏，建立一份属于自己的彩妆清单。</p></article>
    </div>
    <div className="culture-closing"><div><p className="eyebrow">YASPRETTY BEAUTY ARCHIVE</p><h2>你的样子，不需要被改写。</h2><p>它值得被认真看见，也值得拥有适合它的彩妆。</p></div><button className="primary-action" onClick={() => onNavigate('library')}>浏览产品库 <ChevronRight size={16} /></button></div>
  </section>
}

function EmptyResults({ onClear }) {
  return <div className="empty-results"><Search size={26} /><h2>没有找到对应档案</h2><p>试着减少一个筛选条件，或用更短的关键词搜索。</p><button className="primary-action" onClick={onClear}>清空筛选</button></div>
}

function Footer() {
  return <footer className="site-footer"><div><span className="footer-wordmark">YasPretty</span></div><p>{productImageNotice} 产品信息与编辑评价仍需结合详情页来源状态判断。</p><a className="source-contact-link" href={imageRightsContactUrl} target="_blank" rel="noreferrer">权利人联系删除 <ChevronRight size={15} /></a></footer>
}

export default App
