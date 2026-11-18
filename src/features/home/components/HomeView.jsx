import { lazy, Suspense, useState } from 'react'
import { ChevronRight, Search, Sparkles } from 'lucide-react'
import { quickFilters } from '../../../data/products'
import { getCatalogProducts, productById } from '../../catalog/catalogService'
import ProductCard from '../../catalog/components/ProductCard'
import ScrollFloat from '../../../components/visual/ScrollFloat'
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
      {openingReady && <section className="makeup-table-intro-section content-section" aria-labelledby="makeup-table-intro-title">
        <ScrollFloat as="h2" containerClassName="makeup-table-intro-title" textClassName="makeup-table-intro-text" effect="float" splitBy="chars" distance={56} stretch={1.15} stagger={0.018} animationDuration={1.45} smoothing={0.18} scrollStart="top 90%" scrollEnd="bottom 48%" ease="power3.out">YasPretty 美妆店</ScrollFloat>
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
