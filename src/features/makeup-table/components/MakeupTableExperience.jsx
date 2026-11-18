import { useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
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

export default function MakeupTableExperience({ openingReady = false, onOpenProduct, onViewCategory }) {
  const frameRef = useRef(null)
  const [webGLAvailable] = useState(canUseWebGL)
  const [stage, setStage] = useState('loading')
  const [failed, setFailed] = useState(false)

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
    }
    window.addEventListener('message', receive)
    return () => window.removeEventListener('message', receive)
  }, [onViewCategory, stage])

  function send(type) {
    frameRef.current?.contentWindow?.postMessage({ source: 'yaspretty-site', type }, window.location.origin)
  }

  if (!webGLAvailable || failed) {
    return <LegacyMakeupTable openingReady={openingReady} onOpenProduct={onOpenProduct} onViewCategory={onViewCategory} />
  }

  return (
    <section className="beauty-shop-section content-section" aria-label="YasPretty 美妆店">
      <div className="beauty-shop-stage" data-stage={stage}>
        <iframe ref={frameRef} className="beauty-shop-frame" src="/beauty-shop-3d.html" title="YasPretty 交互式美妆店" loading="eager" />
        {stage === 'loading' && <div className="beauty-shop-loading" role="status">正在准备美妆店</div>}
        {stage === 'shop' && <button className="beauty-shop-keyboard-entry" type="button" onClick={() => send('enter')}>进入妆台</button>}
        {stage === 'vanity' && <>
          <button className="beauty-shop-back" type="button" onClick={() => send('return')}><ArrowLeft size={17} />返回店铺</button>
          <nav className="beauty-shop-categories" aria-label="选择彩妆品类">
            {categoryOptions.map((category) => <button key={category} type="button" onClick={() => onViewCategory(category)}>{category}</button>)}
          </nav>
        </>}
      </div>
    </section>
  )
}
