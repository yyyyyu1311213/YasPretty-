import { lazy, Suspense, useState } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { categoryOptions, quickFilters } from '../../../data/products'
import { getCatalogProducts } from '../../catalog/catalogService'
import StrokeText from '../../../components/visual/StrokeText'
import GuideView from '../../guide-culture/components/GuideView'
import './HomeView.css'

const MakeupTableExperience = lazy(() => import('../../makeup-table/components/MakeupTableExperience'))
const FeaturedShowcase = lazy(() => import('./FeaturedShowcase'))
const products = getCatalogProducts()

// App supplies its existing error boundary until the ARCH-10 app migration.
export default function HomeView({ EnhancementBoundary, openingReady, hidden = false, onSearch, onQuickFilter, onViewCategory, onApplyGuideFilter, onNavigate, onOpenProduct, collection, onFavorite, onRemoveFavorite }) {
  const [keyword, setKeyword] = useState('')
  const featured = categoryOptions.map((category) => [...products]
    .filter((product) => product.category === category)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0])
    .filter(Boolean)
  return (
    <div className={`home-motion-stage${openingReady ? ' is-ready' : ''}`} hidden={hidden} inert={hidden}>
      <div className="home-shop">
        <section className="makeup-table-intro-section content-section" aria-labelledby="makeup-table-intro-title">
          <h2 id="makeup-table-intro-title" className="makeup-table-intro-title">YasPretty 美妆店</h2>
        </section>
        <Suspense fallback={<div className="makeup-table-lazy-placeholder" aria-label="正在准备交互式化妆桌" />}>
          <MakeupTableExperience openingReady={openingReady} onOpenProduct={onOpenProduct} onViewCategory={onViewCategory} onSearch={onSearch} />
        </Suspense>
      </div>
      <EnhancementBoundary fallback={<div className="featured-showcase-placeholder" aria-label="编辑精选暂不可用" />}>
        <Suspense fallback={<div className="featured-showcase-placeholder" aria-label="正在准备编辑精选" />}>
          <FeaturedShowcase products={featured} collection={collection} onOpenProduct={onOpenProduct} onFavorite={onFavorite} onRemoveFavorite={onRemoveFavorite} />
        </Suspense>
      </EnhancementBoundary>
      <section className="story-closing" aria-label="You are so pretty">
        <StrokeText
          text="You are so pretty"
          trigger="view"
          strokeColor="#f2d5cf"
          fillColor="#f2d5cf"
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
      <GuideView onApplyFilter={onApplyGuideFilter} />
      <section className={`home-hero${openingReady ? ' home-hero--ready' : ''}`}>
        <div className={`hero-media${openingReady ? ' hero-media--ready' : ''}`} aria-hidden="true">
          <img src="/assets/logo/hero/hero-still-life.svg" alt="" width="600" height="620" loading="lazy" decoding="async" />
          <div className="hero-caption"><span>YASPRETTY</span><i>PERSONAL BEAUTY DECISION LIBRARY</i></div>
        </div>
        <div className={`hero-copy${openingReady ? ' hero-copy--ready' : ''}`}>
          <p className="hero-kicker">YASPRETTY · BEAUTY DECISION LIBRARY</p>
          <p className="eyebrow hero-motion-control">按肤质、妆效与预算，找到适合自己的彩妆</p>
          <h1 className="hero-slogan">{'甄选好物，\n找到适配你的美'}</h1>
          <div className="hero-selection-line" aria-hidden="true"><span>BEAUTY SELECTION</span></div>
          <p className="hero-description">浏览经过整理的产品资料，或让小Y根据你的条件规划妆容。</p>
          <button className="assistant-entry-button hero-motion-control" onClick={() => onNavigate('assistant')}>创建我的妆容方案 <ChevronRight size={16} /></button>
          <form className="hero-search hero-motion-control" onSubmit={(event) => { event.preventDefault(); onSearch(keyword) }}>
            <Search size={20} aria-hidden="true" />
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索品牌、产品名或色号" aria-label="搜索品牌、产品名或色号" />
            <button type="submit">搜索</button>
          </form>
          <div className="quick-links hero-motion-control" aria-label="快捷筛选">
            {quickFilters.map((filter) => <button key={filter.label} onClick={() => onQuickFilter(filter.query)}>{filter.label}</button>)}
          </div>
        </div>
      </section>
    </div>
  )
}
