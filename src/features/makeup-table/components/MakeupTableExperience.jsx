import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import { categoryOptions } from '../../../data/products'
import LegacyMakeupTable from './MakeupTable'
import './MakeupTableExperience.css'

export const SCENE_READY_TIMEOUT_MS = 15000

function canUseWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch {
    return false
  }
}

export default function MakeupTableExperience({ openingReady = false, onOpenProduct, onViewCategory, onSearch }) {
  const frameRef = useRef(null)
  const [webGLAvailable] = useState(canUseWebGL)
  const [stage, setStage] = useState('loading')
  const [failed, setFailed] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const scrollProgressRef = useRef(0)
  const pointerCategoryRef = useRef(null)
  const focusedCategoryRef = useRef(null)

  useEffect(() => {
    if (stage !== 'vanity') {
      pointerCategoryRef.current = null
      focusedCategoryRef.current = null
    }
  }, [stage])

  useEffect(() => {
    if (!openingReady || !webGLAvailable) return undefined
    const timer = window.setTimeout(() => setFailed((current) => current || stage === 'loading'), SCENE_READY_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [openingReady, stage, webGLAvailable])

  useEffect(() => {
    if (openingReady && stage === 'shop') send('start-intro')
  }, [openingReady, stage])

  useEffect(() => {
    function receive(event) {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return
      if (event.data?.source !== 'yaspretty-beauty-shop') return
      if (event.data.type === 'ready' || event.data.type === 'stage') {
        if (['shop', 'vanity', 'transition'].includes(event.data.stage)) setStage(event.data.stage)
      }
      if (event.data.type === 'category' && stage === 'vanity' && categoryOptions.includes(event.data.category)) {
        onViewCategory(event.data.category)
      }
      if (event.data.type === 'scroll-handoff') {
        const deltaY = Number(event.data.deltaY) || 0
        const current = scrollProgressRef.current
        const next = Math.max(0, Math.min(1, current + deltaY / 900))
        scrollProgressRef.current = next
        setScrollProgress(next)
        send('scroll-exit-progress', { progress: next })
        if (event.data.released || (next >= 1 && deltaY > 0)) {
          window.scrollBy({ top: deltaY, left: 0, behavior: 'auto' })
        }
      }
    }
    window.addEventListener('message', receive)
    return () => window.removeEventListener('message', receive)
  }, [onViewCategory, stage])

  function send(type, detail = {}) {
    frameRef.current?.contentWindow?.postMessage({ source: 'yaspretty-site', type, ...detail }, window.location.origin)
  }

  function highlightCategory(source, category) {
    const ref = source === 'pointer' ? pointerCategoryRef : focusedCategoryRef
    ref.current = category
    send('category-hover', { category: pointerCategoryRef.current || focusedCategoryRef.current })
  }

  const transitionStyle = {
    '--scroll-progress': scrollProgress,
    '--scroll-underlay-opacity': 0.04 + scrollProgress * 0.96,
    '--scroll-stage-scale': 1 - scrollProgress * 0.69,
    '--scroll-stage-scale-mobile': 1 - scrollProgress * 0.54,
    '--scroll-inset-y': `${scrollProgress * 3}%`,
    '--scroll-inset-x': `${scrollProgress * 3}%`,
    '--scroll-radius': `${scrollProgress * 22}px`,
    '--scroll-cover-opacity': Math.max(0, (scrollProgress - 0.58) * 2.38),
  }

  if (!webGLAvailable || failed) {
    return <LegacyMakeupTable openingReady={openingReady} onOpenProduct={onOpenProduct} onViewCategory={onViewCategory} />
  }

  return (
    <section className="beauty-shop-section content-section" aria-label="YasPretty 美妆店">
      <div className="beauty-shop-scroll-shell" style={transitionStyle}>
        <div className={`beauty-shop-scroll-underlay${scrollProgress > 0.005 ? ' is-active' : ''}`} aria-hidden="true">
          <img src="/assets/logo/yaspretty-wordmark-light.svg" alt="" />
          <span>PERSONAL BEAUTY DECISION LIBRARY</span>
          <p>向下探索 YasPretty 的产品世界</p>
        </div>
        <div className="beauty-shop-stage" data-stage={stage}>
          <iframe ref={frameRef} className="beauty-shop-frame" src="/beauty-shop-3d.html" title="YasPretty 交互式美妆店" loading="eager" />
          {stage === 'loading' && <div className="beauty-shop-loading" role="status">正在准备美妆店</div>}
          {stage === 'shop' && <button className="beauty-shop-keyboard-entry" type="button" onClick={() => send('enter')}>进入妆台</button>}
          {stage === 'vanity' && <>
            <button className="beauty-shop-back" type="button" onClick={() => send('return')}><ArrowLeft size={17} />返回店铺</button>
            <nav className="beauty-shop-categories" aria-label="选择彩妆品类">
              {categoryOptions.map((category) => <button
                key={category}
                type="button"
                onPointerEnter={(event) => { if (event.pointerType !== 'touch') highlightCategory('pointer', category) }}
                onPointerLeave={() => highlightCategory('pointer', null)}
                onFocus={() => highlightCategory('focus', category)}
                onBlur={() => highlightCategory('focus', null)}
                onClick={() => onViewCategory(category)}
              >{category}</button>)}
            </nav>
          </>}
        </div>
        <div className="beauty-shop-scroll-cover" aria-hidden="true">
          <img src="/assets/logo/yaspretty-wordmark-light.svg" alt="" />
        </div>
        {stage === 'shop' && <form className="beauty-shop-scroll-search" role="search" onSubmit={(event) => { event.preventDefault(); onSearch(searchKeyword) }}>
          <Search size={19} aria-hidden="true" />
          <input value={searchKeyword} onChange={(event) => setSearchKeyword(event.target.value)} placeholder="搜索品牌、产品名或色号" aria-label="搜索品牌、产品名或色号" />
          <button type="submit">搜索</button>
        </form>}
      </div>
    </section>
  )
}
