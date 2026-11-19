import { useEffect, useRef } from 'react'
import { ArrowDown, ArrowRight, Heart } from 'lucide-react'
import './FeaturedShowcase.css'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

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
    let frame = 0
    const headerOffset = () => window.matchMedia('(max-width: 680px)').matches ? 60 : 72
    const setPinState = (progress) => {
      pin.classList.toggle('is-pinned', progress > 0 && progress < 1)
      pin.classList.toggle('is-complete', progress >= 1)
    }

    const measure = () => {
      travel = Math.max(0, track.scrollWidth - pin.clientWidth)
      section.style.height = `${pin.offsetHeight + travel}px`
      section.style.setProperty('--featured-travel', `${travel}px`)
      update()
    }

    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const distance = travel
        const progress = distance ? clamp((headerOffset() - section.getBoundingClientRect().top) / distance, 0, 1) : 0
        track.style.transform = `translate3d(${-distance * progress}px, 0, 0)`
        section.style.setProperty('--featured-progress', progress)
        setPinState(progress)
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

  const notes = [
    { eyebrow: 'A MORE CONSIDERED CHOICE', title: '先了解妆效，再决定适不适合。', body: '从品类、肤质到妆面方向，产品档案帮助你按自己的条件慢慢筛选。' },
    { eyebrow: 'DETAILS WITH CONTEXT', title: '资料来源与核验状态，随档案一起查看。', body: '我们把可确认的信息与仍需留意的部分分开呈现，让每个选择都有来处。' },
  ]

  return (
    <section ref={sectionRef} className="featured-showcase" aria-labelledby="featured-showcase-title">
      <div ref={pinRef} className="featured-showcase__pin">
        <div className="featured-showcase__texture" aria-hidden="true" />
        <div ref={trackRef} className="featured-showcase__track">
          <header className="featured-showcase__intro">
            <p className="featured-showcase__eyebrow">YASPRETTY / THE BEAUTY EDIT</p>
            <h2 id="featured-showcase-title">找到适合你的<br />那一件。</h2>
            <p className="featured-showcase__lead">从八个彩妆品类开始，沿着妆效与肤质，发现新的选择方向。</p>
            <div className="featured-showcase__stats"><span><strong>{products.length.toString().padStart(2, '0')}</strong> 件产品档案</span><i /><span><strong>08</strong> 个彩妆品类</span></div>
            <span className="featured-showcase__scroll-hint"><ArrowDown size={15} /> 向下滚动，横向浏览</span>
          </header>

          {products.flatMap((product, index) => [<article className={`featured-piece featured-piece--${index % 2 ? 'high' : 'low'}`} key={product.id}>
            <button className="featured-piece__image" type="button" onClick={() => onOpenProduct(product)} aria-label={`查看 ${product.brand} ${product.name} 详情`}>
              <img src={product.image} alt={`${product.brand} ${product.name} 产品图`} loading={index < 3 ? 'eager' : 'lazy'} />
              <span>{String(index + 1).padStart(2, '0')} / {product.category}</span>
            </button>
            <div className="featured-piece__copy">
              <p className="featured-piece__brand">{product.brand}</p>
              <button className="featured-piece__name" type="button" onClick={() => onOpenProduct(product)}>{product.name}</button>
              <p className="featured-piece__detail">{product.finish} <i /> {product.priceLabel}</p>
              <p className="featured-piece__note">{product.note}</p>
              <div className="featured-piece__actions">
                <button className="featured-piece__open" type="button" onClick={() => onOpenProduct(product)}>查看产品资料 <ArrowRight size={15} /></button>
                <button className={`featured-piece__favorite${collection[product.id] ? ' is-saved' : ''}`} type="button" aria-label={collection[product.id] ? '取消收藏' : '收藏'} title={collection[product.id] ? '取消收藏' : '收藏'} onClick={() => collection[product.id] ? onRemoveFavorite(product.id) : onFavorite(product.id, '想买')}><Heart size={17} fill={collection[product.id] ? 'currentColor' : 'none'} /></button>
              </div>
            </div>
          </article>, ...(index === 2 || index === 5 ? [<aside className="featured-showcase__note" key={notes[index === 2 ? 0 : 1].eyebrow}>
            <p>{notes[index === 2 ? 0 : 1].eyebrow}</p><h3>{notes[index === 2 ? 0 : 1].title}</h3><span>{notes[index === 2 ? 0 : 1].body}</span>
          </aside>] : [])])}

          <footer className="featured-showcase__outro">
            <span className="featured-showcase__outro-mark">YP</span>
            <p>YOUR BEAUTY,<br />YOUR WAY.</p>
            <span>继续向下，开启你的美妆探索</span>
            <ArrowDown size={16} />
          </footer>
        </div>
        <div className="featured-showcase__progress" aria-hidden="true"><span /></div>
      </div>
    </section>
  )
}
