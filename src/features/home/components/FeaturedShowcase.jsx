import { useEffect, useRef } from 'react'
import { ArrowDown, Heart } from 'lucide-react'
import './FeaturedShowcase.css'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const easeOutCubic = (value) => 1 - ((1 - value) ** 3)
const easeInCubic = (value) => value ** 3

const pieceLayouts = [
  { x: 0, y: 48, width: 560, imageWidth: 340, imageHeight: 450, copy: 'side' },
  { x: 600, y: 432, width: 390, imageWidth: 220, imageHeight: 278, copy: 'below' },
  { x: 1010, y: 16, width: 650, imageWidth: 400, imageHeight: 510, copy: 'side' },
  { x: 1690, y: 394, width: 400, imageWidth: 232, imageHeight: 292, copy: 'below' },
  { x: 2110, y: 82, width: 470, imageWidth: 275, imageHeight: 360, copy: 'below' },
  { x: 2600, y: 326, width: 630, imageWidth: 375, imageHeight: 480, copy: 'side' },
  { x: 3270, y: 34, width: 410, imageWidth: 225, imageHeight: 292, copy: 'below' },
  { x: 3700, y: 270, width: 660, imageWidth: 390, imageHeight: 500, copy: 'side' },
]
const galleryWidth = 4380

export default function FeaturedShowcase({ products, collection, onOpenProduct, onFavorite, onRemoveFavorite }) {
  const sectionRef = useRef(null)
  const pinRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const pin = pinRef.current
    const track = trackRef.current
    if (!section || !pin || !track) return undefined

    let travel = 0
    let leadIn = 0
    let leadOut = 0
    let frame = 0
    const headerOffset = () => window.matchMedia('(max-width: 680px)').matches ? 60 : 72
    const measure = () => {
      travel = Math.max(0, track.scrollWidth - pin.clientWidth)
      leadIn = Math.min(180, Math.max(110, pin.clientHeight * 0.2))
      leadOut = leadIn
      section.style.height = `${pin.offsetHeight + travel + leadIn + leadOut}px`
      section.style.setProperty('--featured-travel', `${travel}px`)
      update()
    }

    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const distance = travel
        const scrollDistance = distance + leadIn + leadOut
        const scrollProgress = clamp((headerOffset() - section.getBoundingClientRect().top) / scrollDistance, 0, 1)
        const scrollOffset = scrollProgress * scrollDistance
        const progress = distance ? clamp((scrollOffset - leadIn) / distance, 0, 1) : 0
        let diagonal = 0
        let diagonalX = 0
        if (scrollOffset < leadIn) {
          const entryProgress = clamp(scrollOffset / leadIn, 0, 1)
          const entry = easeOutCubic(entryProgress)
          diagonal = 18 * (1 - entry)
          diagonalX = 24 * (1 - entry)
        } else if (scrollOffset > leadIn + distance) {
          const exitProgress = clamp((scrollOffset - leadIn - distance) / leadOut, 0, 1)
          const exit = easeInCubic(exitProgress)
          diagonal = -18 * exit
          diagonalX = -24 * exit
        }
        track.style.transform = `translate3d(${-distance * progress + diagonalX}px, ${diagonal}px, 0)`
        section.style.setProperty('--featured-progress', progress)
        pin.classList.toggle('is-pinned', scrollOffset > 0 && scrollOffset < scrollDistance)
        pin.classList.toggle('is-complete', scrollOffset >= scrollDistance)
      })
    }

    const observer = new ResizeObserver(measure)
    observer.observe(pin)
    observer.observe(track)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', measure, { passive: true })
    measure()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', measure)
      pin.classList.remove('is-pinned', 'is-complete')
    }
  }, [products.length])

  return (
    <section ref={sectionRef} className="featured-showcase" aria-labelledby="featured-showcase-title">
      <div ref={pinRef} className="featured-showcase__pin">
        <div className="featured-showcase__texture" aria-hidden="true" />
        <div ref={trackRef} className="featured-showcase__track">
          <header className="featured-showcase__intro">
            <p className="featured-showcase__eyebrow">YASPRETTY / THE BEAUTY EDIT</p>
            <h2 id="featured-showcase-title">上百种商品库，<br />总能找到适合你的<br />那一件。</h2>
            <p className="featured-showcase__lead">沿着妆效与肤质，发现新的选择方向。</p>
            <span className="featured-showcase__scroll-hint"><ArrowDown size={15} /> 向下滚动</span>
          </header>

          <div className="featured-showcase__gallery" style={{ '--gallery-width': `${galleryWidth}px` }}>
            {products.map((product, index) => {
              const layout = pieceLayouts[index % pieceLayouts.length]
              return <article
                className={`featured-piece featured-piece--${layout.copy}`}
                key={product.id}
                style={{
                  '--piece-x': `${layout.x}px`,
                  '--piece-y': `${layout.y}px`,
                  '--piece-width': `${layout.width}px`,
                  '--piece-image-width': `${layout.imageWidth}px`,
                  '--piece-image-height': `${layout.imageHeight}px`,
                }}
              >
                <div className="featured-piece__copy">
                  <p className="featured-piece__brand">{product.brand}</p>
                  <button className="featured-piece__name" type="button" onClick={() => onOpenProduct(product)}>{product.name}</button>
                </div>
                <button className="featured-piece__image" type="button" onClick={() => onOpenProduct(product)} aria-label={`查看 ${product.brand} ${product.name} 详情`}>
                  <img src={product.image} alt={`${product.brand} ${product.name} 产品图`} loading={index < 3 ? 'eager' : 'lazy'} />
                </button>
                <div className="featured-piece__footer">
                  <p className="featured-piece__detail">{product.priceLabel}</p>
                  <div className="featured-piece__actions">
                    <button className={`featured-piece__favorite${collection[product.id] ? ' is-saved' : ''}`} type="button" aria-label={collection[product.id] ? '取消收藏' : '收藏'} title={collection[product.id] ? '取消收藏' : '收藏'} onClick={() => collection[product.id] ? onRemoveFavorite(product.id) : onFavorite(product.id, '想买')}><Heart size={17} fill={collection[product.id] ? 'currentColor' : 'none'} /></button>
                  </div>
                </div>
              </article>
            })}
            <aside className="featured-editorial featured-editorial--brand">
              <p className="featured-editorial__eyebrow">BEAUTY, IN YOUR OWN WAY</p>
              <h3>美，不必被一种标准定义。</h3>
              <p>YasPretty 从真实需求出发，整理值得了解的彩妆与护理选择，让每一次尝试都更贴近你自己。</p>
            </aside>
            <aside className="featured-editorial featured-editorial--method">
              <p className="featured-editorial__eyebrow">A THOUGHTFUL BEAUTY EDIT</p>
              <h3>先看妆效，再看适配。</h3>
              <p>从质地、肤感到日常场景，给选择多一点依据，也给探索多一点余地。</p>
            </aside>
          </div>
          <footer className="featured-showcase__outro">
            <p className="featured-showcase__outro-eyebrow">YASPRETTY / YOUR BEAUTY LIBRARY</p>
            <h3>找到喜欢的，<br />也找到适合自己的。</h3>
            <p>让每一份美，都有自己的答案。</p>
          </footer>
        </div>
        <div className="featured-showcase__progress" aria-hidden="true"><span /></div>
      </div>
    </section>
  )
}
