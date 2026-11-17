import { AnimatePresence, motion } from 'framer-motion'
import { Info, Maximize2, RotateCcw } from 'lucide-react'
import Scene from '../makeup-table-3d/Scene'
import { COSMETIC_ITEMS } from '../makeup-table-3d/cosmetics'
import GhostCursor from '../makeup-table-3d/GhostCursor'
import './MakeupTable3D.css'

const GHOST_PARTICLES = [
  { x: '24%', y: '34%', size: 2, delay: '-1.4s', duration: '6.8s', drift: '-12px' },
  { x: '39%', y: '23%', size: 2, delay: '-4.2s', duration: '7.4s', drift: '-16px' },
  { x: '55%', y: '31%', size: 3, delay: '-2.5s', duration: '8.2s', drift: '-11px' },
  { x: '68%', y: '46%', size: 2, delay: '-5.1s', duration: '7.1s', drift: '-15px' },
  { x: '43%', y: '63%', size: 2, delay: '-.8s', duration: '7.8s', drift: '-13px' },
  { x: '76%', y: '67%', size: 2, delay: '-3.6s', duration: '8.5s', drift: '-17px' },
]

export default function MakeupTable3D({ openingReady, ready, sceneMounted, exploded, introFocus, reducedMotion, performanceProfile, onItemClick, onCategory, onCollapse, onReady }) {
  return (
      <section className="makeup-3d-section content-section" aria-labelledby="makeup-3d-title">
        <h2 id="makeup-3d-title" className="makeup-3d-sr-title">交互式化妆桌</h2>

        <motion.div className="makeup-3d-stage" initial={{ opacity: 0, y: 24 }} animate={openingReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ duration: reducedMotion ? .01 : .72, ease: [.2, .8, .2, 1] }}>
          <div className="makeup-3d-canvas" role="img" aria-label={exploded ? '八件化妆品以花瓣形悬浮展开的三维化妆桌' : '摆放八件化妆品的三维粉色化妆桌'}>
            {sceneMounted && <Scene exploded={exploded} introFocus={introFocus} reducedMotion={reducedMotion} quality={performanceProfile} onItemClick={onItemClick} onBackgroundClick={onCollapse} onReady={onReady} />}
          </div>
          {ready && !reducedMotion && !exploded && performanceProfile.showGhostCursor && <div className="makeup-3d-ghost-layer" aria-hidden="true"><GhostCursor color="#f6d3f6" size={56} trailLength={24} inertia={0.42} turbulence={0.42} drift={-0.1} detail={0.68} brightness={0.94} bloomStrength={0.3} bloomRadius={0.58} bloomThreshold={0.05} grainIntensity={0.012} theme="light" mixBlendMode="normal" intro fadeDelayMs={620} fadeDurationMs={900} maxDevicePixelRatio={1.25} targetPixels={220000} zIndex={2} /><div className="makeup-3d-ghost-particles">{GHOST_PARTICLES.map((particle, index) => <i key={index} style={{ '--particle-x': particle.x, '--particle-y': particle.y, '--particle-size': `${particle.size}px`, '--particle-delay': particle.delay, '--particle-duration': particle.duration, '--particle-drift': particle.drift }} />)}</div></div>}

          <AnimatePresence>
            {!ready && <motion.div className="makeup-3d-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><span />正在准备妆台</motion.div>}
          </AnimatePresence>

          <div className="makeup-3d-status makeup-3d-stage-label" aria-live="polite"><span>{exploded ? '花瓣陈列' : '桌面全景'}</span><small>{exploded ? '8 件妆具已展开' : '点击妆具进入对应产品品类'}</small></div>
          <div className="makeup-3d-tools">
            <button type="button" className="makeup-3d-reset" aria-label="恢复默认视角并收拢妆具" title="恢复默认视角" onClick={onCollapse}><RotateCcw size={18} /></button>
          </div>

          <nav className="makeup-3d-category-rail" aria-label="化妆桌品类">
            {COSMETIC_ITEMS.map((item) => <button key={item.id} type="button" onClick={() => onCategory(item)} title={`查看${item.name}产品`}><i style={{ background: item.color }} aria-hidden="true" />{item.name}</button>)}
          </nav>

          <div className="makeup-3d-orbit-hint makeup-3d-stage-label" aria-hidden="true"><Maximize2 size={13} /> 360° 旋转查看</div>
        </motion.div>
        <div className="makeup-3d-notes">
          <p><Info size={14} aria-hidden="true" /> 八类妆具为几何陈列，不代表具体商品外观；真实产品资料请从对应品类进入。</p>
          <p>场景由基础几何体实时生成；不读取照片、不调用外部服务，也不保存视角。</p>
        </div>
      </section>
  )
}
