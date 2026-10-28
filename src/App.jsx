import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownUp,
  Check,
  ChevronDown,
  ChevronRight,
  CircleX,
  Heart,
  Menu,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import { categoryOptions, finishOptions, products, quickFilters, skinOptions } from './data/products'
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

function App() {
  const [view, setView] = useState('home')
  const [filters, setFilters] = useState(emptyFilters)
  const [sort, setSort] = useState('recommended')
  const [collection, setCollection] = useState(getStoredCollection)
  const [selectedProduct, setSelectedProduct] = useState(null)
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
    setView(nextView)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <Header
        activeView={view}
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
      </main>

      <Footer />
      {selectedProduct && (
        <DetailDrawer
          product={selectedProduct}
          collection={collection}
          onClose={() => setSelectedProduct(null)}
          onOpenProduct={setSelectedProduct}
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
        <div><p className="eyebrow">产品库 / 目前收录底妆 / {products.length} 条资料</p><h1>找到匹配的底妆</h1></div>
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
      <button className="product-photo" onClick={() => onOpen(product)} aria-label={`查看 ${product.brand} ${product.name} 详情`}><img src={product.image} alt={`${product.brand} ${product.name} 产品图（图片授权待核验）`} loading="lazy" /><span className="category-stamp">{product.category}</span><span className="verification-stamp">图片授权待核验</span></button>
      <div className="product-card-body">
        <div className="product-card-top"><p className="product-brand">{product.brand}</p><button className={status ? 'favorite-button saved' : 'favorite-button'} aria-label={status ? '取消收藏' : '收藏'} title={status ? '取消收藏' : '收藏'} onClick={() => status ? onRemoveFavorite(product.id) : onFavorite(product.id, '想买')}><Heart size={18} fill={status ? 'currentColor' : 'none'} /></button></div>
        <button className="product-name" onClick={() => onOpen(product)}>{product.name}</button>
        <p className="shade-line"><span className="shade-dot" /> 代表色号 {product.shades.slice(0, 2).map((shade) => shade.name).join(' / ')}</p>
        <div className="tag-row"><span>{product.skins[0]}</span><span>{product.finish}</span><span>{product.coverage}遮瑕</span><span>{product.wear}h+</span></div>
        <p className="product-note">“{product.note}”</p>
        <div className="rating-row"><span><Star size={15} fill="currentColor" /> 编辑示例 {product.rating}</span><button onClick={() => onOpen(product)}>查看档案 <ChevronRight size={15} /></button></div>
      </div>
    </article>
  )
}

function DetailDrawer({ product, collection, onClose, onOpenProduct, onFavorite, onRemoveFavorite }) {
  const [shade, setShade] = useState(product.shades[0])
  useEffect(() => setShade(product.shades[0]), [product])
  const status = collection[product.id]
  const recommendations = products.filter((item) => item.id !== product.id && (item.category === product.category || item.finish === product.finish)).slice(0, 3)
  const shadeImage = product.images?.find((item) => item.shade === shade.name)?.url || product.image
  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <aside className="detail-drawer" role="dialog" aria-modal="true" aria-label={`${product.brand} ${product.name} 产品详情`} onMouseDown={(event) => event.stopPropagation()}>
        <button className="dialog-close" aria-label="关闭详情" title="关闭详情" onClick={onClose}><X size={20} /></button>
        <div className="detail-hero"><img src={shadeImage} alt={`${product.brand} ${product.name} ${shade.name} 产品图（图片授权待核验）`} /><div className="detail-hero-info"><p className="eyebrow">{product.category} / YASPRETTY FILE</p><p className="product-brand">{product.brand}</p><h2>{product.name}</h2><div className="detail-rating"><Star size={17} fill="currentColor" /> 编辑示例 {product.rating} <span>非用户统计</span></div><p>{product.note}</p><StatusControl productId={product.id} status={status} onFavorite={onFavorite} onRemoveFavorite={onRemoveFavorite} /></div></div>
        <div className="detail-body">
          <section className="detail-section"><h3>基础信息</h3><p className="data-verification-note">价格、图片、产地、色号和产品表现仍待来源核验；以下仅为当前资料库参考。</p><dl className="facts-grid"><div><dt>品牌所属地区</dt><dd>{product.brandRegion}（待核验）</dd></div><div><dt>实际生产地</dt><dd>{product.madeIn}（待核验）</dd></div><div><dt>参考价格</dt><dd>{product.priceLabel}（价格待核验）</dd></div><div><dt>适合肤质</dt><dd>{product.skins.join(' / ')}（待核验）</dd></div><div><dt>妆效</dt><dd>{product.finish}（待核验）</dd></div><div><dt>持妆参考</dt><dd>{product.wear} 小时+（待核验）</dd></div></dl></section>
          <section className="detail-section shade-section"><h3>代表色号</h3><div className="shade-list">{product.shades.map((item, index) => <button key={item.name} className={shade.name === item.name ? 'shade-choice selected' : 'shade-choice'} onClick={() => setShade(item)}><span className={`shade-swatch shade-${index}`} /><b>{item.name}</b></button>)}</div><div className="shade-description"><span>{shade.tone}</span><span>{shade.lightness}</span><span>适合 {shade.suitable}</span></div></section>
          <section className="detail-section"><h3>分项评价</h3><div className="metric-grid">{Object.entries(product.metrics).map(([label, value]) => <Metric key={label} label={label} value={value} />)}</div></section>
          <section className="detail-section two-columns"><div><h3>喜欢它的理由</h3><ul className="detail-list">{product.pros.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul></div><div><h3>使用时注意</h3><ul className="detail-list caution-list">{product.cautions.map((item) => <li key={item}><span>•</span>{item}</li>)}</ul></div></section>
          <section className="detail-section"><h3>适合场景</h3><div className="scene-row">{product.scenes.map((scene) => <span key={scene}>{scene}</span>)}</div></section>
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
  return <footer className="site-footer"><div><span className="footer-wordmark">YasPretty</span></div><p>产品信息与评价为示例内容，正式发布前需核验产品产地、图片授权及实际使用体验。</p></footer>
}

export default App
