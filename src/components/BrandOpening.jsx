import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import StrokeText from './StrokeText'

const PARTICLES = [
  { x: -28, y: 23, size: 7, delay: 140, duration: 1220, rotate: -18 },
  { x: -21, y: 15, size: 4, delay: 230, duration: 1040, rotate: 22 },
  { x: -14, y: 31, size: 5, delay: 310, duration: 1180, rotate: -9 },
  { x: -7, y: 18, size: 3, delay: 390, duration: 980, rotate: 12 },
  { x: 5, y: 29, size: 6, delay: 270, duration: 1120, rotate: -24 },
  { x: 13, y: 16, size: 4, delay: 350, duration: 1020, rotate: 17 },
  { x: 20, y: 27, size: 5, delay: 190, duration: 1160, rotate: -12 },
  { x: 28, y: 19, size: 3, delay: 430, duration: 960, rotate: 28 },
  { x: -34, y: 30, size: 3, delay: 500, duration: 1080, rotate: 8 },
  { x: 35, y: 32, size: 4, delay: 460, duration: 1020, rotate: -21 },
  { x: -39, y: 11, size: 4, delay: 610, duration: 1320, rotate: 16 },
  { x: -31, y: 39, size: 6, delay: 720, duration: 1240, rotate: -8 },
  { x: 39, y: 12, size: 5, delay: 660, duration: 1280, rotate: 11 },
  { x: 31, y: 41, size: 3, delay: 790, duration: 1160, rotate: -18 },
  { x: -24, y: 8, size: 4, delay: 880, duration: 1380, rotate: 9 },
  { x: -11, y: 44, size: 5, delay: 930, duration: 1290, rotate: -16 },
  { x: 9, y: 47, size: 3, delay: 1040, duration: 1220, rotate: 14 },
  { x: 24, y: 8, size: 4, delay: 850, duration: 1340, rotate: -6 },
  { x: -45, y: 22, size: 3, delay: 560, duration: 1180, rotate: 12 },
  { x: 45, y: 24, size: 3, delay: 740, duration: 1240, rotate: -14 },
  { x: -18, y: 52, size: 3, delay: 1080, duration: 1420, rotate: 18 },
  { x: 18, y: 54, size: 4, delay: 1160, duration: 1360, rotate: -18 },
]
const SPARKLES = [
  { x: 25, y: 30, size: 58, delay: 760, duration: 2180 },
  { x: 72, y: 34, size: 44, delay: 980, duration: 1880 },
  { x: 24, y: 68, size: 34, delay: 1180, duration: 2320 },
  { x: 76, y: 68, size: 50, delay: 840, duration: 2040 },
  { x: 65, y: 18, size: 30, delay: 1340, duration: 1820 },
  { x: 35, y: 20, size: 24, delay: 1520, duration: 1960 },
  { x: 63, y: 78, size: 27, delay: 1240, duration: 2120 },
  { x: 17, y: 29, size: 22, delay: 1680, duration: 2060 },
  { x: 83, y: 31, size: 24, delay: 1540, duration: 1940 },
  { x: 18, y: 78, size: 19, delay: 1820, duration: 2260 },
  { x: 82, y: 76, size: 21, delay: 1760, duration: 2180 },
]
const GLINTS = [
  { x: 34, y: 38, size: 5, delay: 880, duration: 1380 },
  { x: 67, y: 39, size: 4, delay: 1080, duration: 1540 },
  { x: 43, y: 68, size: 3, delay: 1240, duration: 1460 },
  { x: 58, y: 64, size: 5, delay: 980, duration: 1620 },
  { x: 29, y: 57, size: 3, delay: 1420, duration: 1280 },
  { x: 72, y: 58, size: 3, delay: 1160, duration: 1400 },
  { x: 48, y: 27, size: 3, delay: 1540, duration: 1320 },
  { x: 53, y: 78, size: 4, delay: 1320, duration: 1500 },
  { x: 38, y: 30, size: 4, delay: 980, duration: 1440 },
  { x: 62, y: 30, size: 4, delay: 1120, duration: 1500 },
  { x: 35, y: 80, size: 3, delay: 1480, duration: 1380 },
  { x: 66, y: 82, size: 3, delay: 1580, duration: 1420 },
]
const OPENING_MS = 5200
const EXIT_MS = 1800
const REDUCED_MS = 120

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function BrandOpening({ onComplete }) {
  const [reduced, setReduced] = useState(prefersReducedMotion)
  const [closing, setClosing] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const skipTimerRef = useRef(null)

  useEffect(() => () => {
    if (skipTimerRef.current !== null) window.clearTimeout(skipTimerRef.current)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(media.matches)
    media.addEventListener?.('change', sync)
    return () => media.removeEventListener?.('change', sync)
  }, [])

  useEffect(() => {
    if (reduced) {
      const timer = window.setTimeout(onComplete, REDUCED_MS)
      return () => window.clearTimeout(timer)
    }
    const closeTimer = window.setTimeout(() => setClosing(true), OPENING_MS - EXIT_MS)
    const completeTimer = window.setTimeout(onComplete, OPENING_MS)
    return () => {
      window.clearTimeout(closeTimer)
      window.clearTimeout(completeTimer)
    }
  }, [onComplete, reduced])

  function skip() {
    setSkipping(true)
    setClosing(true)
    if (skipTimerRef.current !== null) window.clearTimeout(skipTimerRef.current)
    skipTimerRef.current = window.setTimeout(() => {
      skipTimerRef.current = null
      onComplete()
    }, reduced ? 0 : 120)
  }

  return (
    <div className={`brand-opening${reduced ? ' reduced' : ''}${closing ? ' closing fade-out' : ''}${skipping ? ' skip-closing' : ''}`} aria-label="YasPretty 品牌开幕">
      <div className="opening-atmosphere" aria-hidden="true">
        <img className="opening-powder-cloud" src="/assets/doodles/reference-cutouts/ornaments-powder-cloud.png" alt="" />
        <img className="opening-powder-dots" src="/assets/doodles/reference-cutouts/ornaments-dots.png" alt="" />
        <img className="opening-petal opening-petal-left" src="/assets/doodles/petal.svg" alt="" />
        <img className="opening-petal opening-petal-right" src="/assets/doodles/petal.svg" alt="" />
        <div className="opening-particles">
          {PARTICLES.map((particle, index) => (
            <span
              key={`particle-${index}`}
              className="opening-particle"
              style={{
                '--particle-x': `${particle.x}%`,
                '--particle-y': `${particle.y}%`,
                '--particle-size': `${particle.size}px`,
                '--particle-delay': `${particle.delay}ms`,
                '--particle-duration': `${particle.duration}ms`,
                '--particle-rotate': `${particle.rotate}deg`,
              }}
            />
          ))}
        </div>
        <div className="opening-sparkles">
          {SPARKLES.map((sparkle, index) => (
            <span
              key={`sparkle-${index}`}
              className="opening-sparkle"
              style={{
                '--sparkle-x': `${sparkle.x}%`,
                '--sparkle-y': `${sparkle.y}%`,
                '--sparkle-size': `${sparkle.size}px`,
                '--sparkle-delay': `${sparkle.delay}ms`,
                '--sparkle-duration': `${sparkle.duration}ms`,
              }}
            />
          ))}
        </div>
        <div className="opening-glints">
          {GLINTS.map((glint, index) => (
            <span
              key={`glint-${index}`}
              className="opening-glint"
              style={{
                '--glint-x': `${glint.x}%`,
                '--glint-y': `${glint.y}%`,
                '--glint-size': `${glint.size}px`,
                '--glint-delay': `${glint.delay}ms`,
                '--glint-duration': `${glint.duration}ms`,
              }}
            />
          ))}
        </div>
      </div>
      <div className="opening-brand" aria-hidden="true">
        <span className="opening-wordmark"><span>Yas </span><span className="opening-wordmark-pretty">Pretty</span></span>
        <span className="opening-wordmark-sparkle opening-wordmark-sparkle-left" />
        <span className="opening-wordmark-sparkle opening-wordmark-sparkle-right" />
        <StrokeText
          className="opening-tagline"
          text="You are so pretty"
          strokeColor="#fffaf9"
          fillColor="#fffaf9"
          strokeWidth={2.2}
          drawDuration={0.95}
          fillDelay={0.08}
          stagger={0.025}
          ease="power2.out"
          trigger="mount"
          fillMode="wipe"
          wipeFrom="left"
          fontSize={68}
          fontWeight={700}
          fontFamily="'Segoe Script', 'Snell Roundhand', 'Brush Script MT', cursive"
          fontStyle="italic"
          letterSpacing={-1.2}
        />
        <img className="opening-monogram" src="/assets/logo/yaspretty-monogram.svg?v=20261104-y-seal-lines" alt="" />
      </div>
      <p className="brand-opening-caption">PERSONAL BEAUTY DECISION LIBRARY</p>
      <button className="brand-opening-skip" type="button" onClick={skip} aria-label="跳过品牌开幕" title="跳过品牌开幕">
        <span>跳过</span><X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}

export { OPENING_MS, EXIT_MS, REDUCED_MS, prefersReducedMotion }
