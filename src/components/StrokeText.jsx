import { useEffect, useMemo, useRef, useState } from 'react'
import './StrokeText.css'

// Adapted from React Bits StrokeText (MIT + Commons Clause), replacing GSAP
// with CSS animations and IntersectionObserver so the site keeps its current
// dependency surface and remains usable on a weak connection.
const DEFAULT_TEXT = 'Draw Attention'

const EASES = {
  'power2.out': 'cubic-bezier(.22, 1, .36, 1)',
  'power3.out': 'cubic-bezier(.16, 1, .3, 1)',
  'power1.out': 'cubic-bezier(.25, .8, .25, 1)',
  linear: 'linear',
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function StrokeText({
  text = DEFAULT_TEXT,
  strokeColor = '#A78BFA',
  fillColor = 'currentColor',
  strokeWidth = 1.4,
  drawDuration = 1.6,
  fillDelay = 0.2,
  stagger = 0.05,
  ease = 'power2.out',
  trigger = 'mount',
  fillMode = 'wipe',
  wipeFrom = 'left',
  fontSize = 128,
  fontWeight = 800,
  fontFamily = 'inherit',
  fontStyle = 'normal',
  letterSpacing = -4,
  hoverRedraw = false,
  className = '',
  style = {},
}) {
  const rootRef = useRef(null)
  const [active, setActive] = useState(trigger === 'mount' && !prefersReducedMotion())
  const [reduced, setReduced] = useState(prefersReducedMotion)
  const characters = useMemo(() => Array.from(String(text ?? '')), [text])
  const animationEase = EASES[ease] || ease || EASES['power2.out']
  const dashArray = '900'
  const textStyle = {
    ...style,
    '--stroke-color': strokeColor,
    '--fill-color': fillColor,
    '--stroke-width': strokeWidth,
    '--draw-duration': `${Math.max(Number(drawDuration) || 0, 0.01)}s`,
    '--fill-delay': `${Math.max(Number(fillDelay) || 0, 0)}s`,
    '--stagger': `${Math.max(Number(stagger) || 0, 0)}s`,
    '--stroke-ease': animationEase,
    '--letter-spacing': `${letterSpacing}px`,
    '--wipe-origin': wipeFrom,
  }

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      setReduced(media.matches)
      if (media.matches) setActive(true)
    }
    media.addEventListener?.('change', sync)
    return () => media.removeEventListener?.('change', sync)
  }, [])

  useEffect(() => {
    if (trigger === 'mount' || trigger === 'loop' || reduced) {
      setActive(true)
      return undefined
    }
    if (trigger === 'hover') return undefined

    const root = rootRef.current
    if (!root || typeof IntersectionObserver === 'undefined') {
      setActive(true)
      return undefined
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setActive(true)
        observer.disconnect()
      }
    }, { threshold: 0.15 })
    observer.observe(root)
    return () => observer.disconnect()
  }, [reduced, trigger])

  function redraw() {
    if (hoverRedraw && !reduced) {
      setActive(false)
      requestAnimationFrame(() => setActive(true))
    }
  }

  const classes = [
    'stroke-text',
    active || reduced ? 'stroke-text--active' : '',
    trigger === 'hover' ? 'stroke-text--hover' : '',
    fillMode === 'none' ? 'stroke-text--no-fill' : '',
    reduced ? 'stroke-text--reduced' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <span
      ref={rootRef}
      className={classes}
      style={textStyle}
      role="img"
      aria-label={String(text ?? '')}
      onPointerEnter={trigger === 'hover' ? () => { setActive(true); redraw() } : redraw}
    >
      <svg className="stroke-text__svg" viewBox="0 0 1000 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <text
          className="stroke-text__fill"
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          style={{ fontSize, fontWeight, fontFamily, fontStyle, letterSpacing }}
        >
          {characters.map((char, index) => (
            <tspan
              key={`fill-${index}`}
              style={{ '--char-index': index }}
            >
              {char === ' ' ? String.fromCharCode(160) : char}
            </tspan>
          ))}
        </text>
        <text
          className="stroke-text__stroke"
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          style={{ fontSize, fontWeight, fontFamily, fontStyle, letterSpacing }}
          strokeDasharray={dashArray}
        >
          {characters.map((char, index) => (
            <tspan
              key={`stroke-${index}`}
              style={{ '--char-index': index }}
            >
              {char === ' ' ? String.fromCharCode(160) : char}
            </tspan>
          ))}
        </text>
      </svg>
    </span>
  )
}

export { prefersReducedMotion }
