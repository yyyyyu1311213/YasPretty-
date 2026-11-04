import { Component, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Info, Maximize2, RotateCcw, Sparkles } from 'lucide-react'
import LegacyMakeupTable from './MakeupTable'
import Scene from './makeup-table-3d/Scene'
import { COSMETIC_ITEMS } from './makeup-table-3d/cosmetics'
import GhostCursor from './makeup-table-3d/GhostCursor'
import { readScenePerformanceProfile } from './makeup-table-3d/performance-profile'
import './MakeupTable3D.css'

const GHOST_LIFETIME_MS = 3200

function canUseWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch {
    return false
  }
}

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.warn('YasPretty 3D scene unavailable; using the accessible table fallback.', error?.message || error)
  }

  render() {
    if (this.state.failed) return this.props.fallback
    return this.props.children
  }
}

function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!media) return undefined
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])
  return reduced
}

function useScenePerformanceProfile() {
  const [profile, setProfile] = useState(readScenePerformanceProfile)
  useEffect(() => {
    const pointer = window.matchMedia?.('(pointer: coarse)')
    const update = () => setProfile(readScenePerformanceProfile())
    window.addEventListener('resize', update, { passive: true })
    pointer?.addEventListener?.('change', update)
    return () => {
      window.removeEventListener('resize', update)
      pointer?.removeEventListener?.('change', update)
    }
  }, [])
  return profile
}

const GHOST_PARTICLES = [
  { x: '24%', y: '34%', size: 2, delay: '-1.4s', duration: '6.8s', drift: '-12px' },
  { x: '39%', y: '23%', size: 2, delay: '-4.2s', duration: '7.4s', drift: '-16px' },
  { x: '55%', y: '31%', size: 3, delay: '-2.5s', duration: '8.2s', drift: '-11px' },
  { x: '68%', y: '46%', size: 2, delay: '-5.1s', duration: '7.1s', drift: '-15px' },
  { x: '43%', y: '63%', size: 2, delay: '-.8s', duration: '7.8s', drift: '-13px' },
  { x: '76%', y: '67%', size: 2, delay: '-3.6s', duration: '8.5s', drift: '-17px' },
]

export default function MakeupTable3D(props) {
  const { openingReady = false, onViewCategory } = props
  const [webGLAvailable] = useState(canUseWebGL)
  const [ready, setReady] = useState(false)
  const [sceneMounted, setSceneMounted] = useState(false)
  const [ghostVisible, setGhostVisible] = useState(false)
  const [ghostDismissed, setGhostDismissed] = useState(false)
  const [exploded, setExploded] = useState(false)
  const [introFocus, setIntroFocus] = useState(false)
  const reducedMotion = useReducedMotionPreference()
  const performanceProfile = useScenePerformanceProfile()
  const fallback = useMemo(() => <LegacyMakeupTable {...props} />, [props])

  useEffect(() => {
    if (!openingReady) {
      setSceneMounted(false)
      setReady(false)
      setGhostDismissed(false)
      return undefined
    }
    const frame = window.requestAnimationFrame(() => setSceneMounted(true))
    return () => window.cancelAnimationFrame(frame)
  }, [openingReady])

  useEffect(() => {
    setIntroFocus(false)
    if (!openingReady || reducedMotion) {
      if (openingReady && reducedMotion) setIntroFocus(true)
      return undefined
    }
    const timer = window.setTimeout(() => setIntroFocus(true), 620)
    return () => window.clearTimeout(timer)
  }, [openingReady, reducedMotion])

  useEffect(() => {
    if (!ready || reducedMotion || exploded || ghostDismissed || !performanceProfile.showGhostCursor) {
      setGhostVisible(false)
      return undefined
    }
    const showTimer = window.setTimeout(() => setGhostVisible(true), 180)
    const hideTimer = window.setTimeout(() => setGhostVisible(false), GHOST_LIFETIME_MS)
    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
    }
  }, [exploded, ghostDismissed, performanceProfile.showGhostCursor, ready, reducedMotion])

  if (!webGLAvailable) return fallback

  function handleItemClick(item) {
    onViewCategory(item.category)
  }

  function handleCategory(item) {
    onViewCategory(item.category)
  }

  return (
    <SceneErrorBoundary fallback={fallback}>
      <section className="makeup-3d-section content-section" aria-labelledby="makeup-3d-title">
        <h2 id="makeup-3d-title" className="makeup-3d-sr-title">交互式化妆桌</h2>

        <motion.div className="makeup-3d-stage" initial={{ opacity: 0, y: 24 }} animate={openingReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ duration: reducedMotion ? .01 : .72, ease: [.2, .8, .2, 1] }}>
          <div className="makeup-3d-canvas" role="img" aria-label={exploded ? '八件化妆品以花瓣形悬浮展开的三维化妆桌' : '摆放八件化妆品的三维粉色化妆桌'} onPointerDown={() => { setGhostDismissed(true); setGhostVisible(false) }}>
            {sceneMounted && <Scene exploded={exploded} introFocus={introFocus} reducedMotion={reducedMotion} quality={performanceProfile} onItemClick={handleItemClick} onBackgroundClick={() => setExploded(false)} onReady={() => setReady(true)} />}
          </div>
          {ghostVisible && !exploded && <div className="makeup-3d-ghost-layer" aria-hidden="true"><GhostCursor color="#f6d3f6" size={56} trailLength={24} inertia={0.42} turbulence={0.42} drift={-0.1} detail={0.68} brightness={0.94} bloomStrength={0.3} bloomRadius={0.58} bloomThreshold={0.05} grainIntensity={0.012} theme="light" mixBlendMode="normal" intro fadeDelayMs={620} fadeDurationMs={900} maxDevicePixelRatio={1.25} targetPixels={220000} zIndex={2} /><div className="makeup-3d-ghost-particles">{GHOST_PARTICLES.map((particle, index) => <i key={index} style={{ '--particle-x': particle.x, '--particle-y': particle.y, '--particle-size': `${particle.size}px`, '--particle-delay': particle.delay, '--particle-duration': particle.duration, '--particle-drift': particle.drift }} />)}</div></div>}

          <AnimatePresence>
            {!ready && <motion.div className="makeup-3d-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><span />正在准备妆台</motion.div>}
          </AnimatePresence>

          <div className="makeup-3d-status makeup-3d-stage-label" aria-live="polite"><span>{exploded ? '花瓣陈列' : '桌面全景'}</span><small>{exploded ? '8 件妆具已展开' : '点击妆具进入对应产品品类'}</small></div>
          <div className="makeup-3d-tools">
            <button type="button" className={`makeup-3d-bloom-toggle${exploded ? ' is-active' : ''}`} aria-label={exploded ? '收拢花瓣陈列' : '展开花瓣陈列'} aria-pressed={exploded} title={exploded ? '收拢花瓣陈列' : '展开花瓣陈列'} onClick={() => setExploded((current) => !current)}><Sparkles size={17} /></button>
            <button type="button" className="makeup-3d-reset" aria-label="恢复默认视角并收拢妆具" title="恢复默认视角" onClick={() => setExploded(false)}><RotateCcw size={18} /></button>
          </div>
          <div className={`makeup-3d-bloom-guide${exploded ? ' is-hidden' : ''}`} aria-label="点击右上角闪光按钮查看花瓣展开效果">
            <span>点击这里 会有奇妙效果哦</span>
            <svg viewBox="0 0 250 105" aria-hidden="true">
              <path d="M108 92 C91 80 92 61 107 53 C123 45 137 53 133 67 C129 80 111 80 107 66 C102 45 132 29 160 25 C191 21 216 15 244 10" />
              <path d="M235 3 L244 10 L235 17" />
            </svg>
          </div>

          <nav className="makeup-3d-category-rail" aria-label="化妆桌品类">
            {COSMETIC_ITEMS.map((item) => <button key={item.id} type="button" onClick={() => handleCategory(item)} title={`查看${item.name}产品`}><i style={{ background: item.color }} aria-hidden="true" />{item.name}</button>)}
          </nav>

          <div className="makeup-3d-orbit-hint makeup-3d-stage-label" aria-hidden="true"><Maximize2 size={13} /> 360° 旋转查看</div>
        </motion.div>
        <div className="makeup-3d-notes">
          <p><Info size={14} aria-hidden="true" /> 八类妆具为几何陈列，不代表具体商品外观；真实产品资料请从对应品类进入。</p>
          <p>场景由基础几何体实时生成；不读取照片、不调用外部服务，也不保存视角。</p>
        </div>
      </section>
    </SceneErrorBoundary>
  )
}
