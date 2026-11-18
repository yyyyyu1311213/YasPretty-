import { lazy, Suspense, useState } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { quickFilters } from '../../../data/products'
import { getCatalogProducts, productById } from '../../catalog/catalogService'
import ProductCard from '../../catalog/components/ProductCard'
import StrokeText from '../../../components/visual/StrokeText'
import './HomeView.css'

const MakeupTableExperience = lazy(() => import('../../makeup-table/components/MakeupTableExperience'))
const FlexCarousel = lazy(() => import('../../../components/visual/FlexCarousel'))
const products = getCatalogProducts()

// App supplies its existing error boundary until the ARCH-10 app migration.
export default function HomeView({ EnhancementBoundary, openingReady, onSearch, onQuickFilter, onViewCategory, onNavigate, onOpenProduct, collection, onFavorite, onRemoveFavorite }) {
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
      <section className="makeup-table-intro-section content-section" aria-labelledby="makeup-table-intro-title">
        <h2 id="makeup-table-intro-title" className="makeup-table-intro-title">YasPretty 美妆店</h2>
      </section>
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
          <p className="hero-kicker">YASPRETTY · BEAUTY DECISION LIBRARY</p>
          <p className="eyebrow hero-motion-control">按肤质、妆效与预算，找到适合自己的彩妆</p>
          <h1 className="hero-slogan">{'甄选好物，\n找到适配你的美'}</h1>
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
      <section className="content-section home-selection">
        <div className="section-heading">
          <div><h2 className="featured-heading">编辑精选</h2></div>
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
