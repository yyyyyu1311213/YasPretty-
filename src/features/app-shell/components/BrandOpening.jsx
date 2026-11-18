import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import './BrandOpening.css'

const OPENING_MS = 4200
const EXIT_MS = 1200
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
      </div>
      <div className="opening-brand" aria-hidden="true">
        <span className="opening-wordmark"><span>Yas </span><span className="opening-wordmark-pretty">Pretty</span></span>
        <span className="opening-tagline">You are so pretty</span>
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
