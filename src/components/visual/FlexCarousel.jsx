import { useEffect, useMemo, useRef, useState } from 'react'
import './FlexCarousel.css'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

function isLowPerformanceDevice() {
  if (typeof window === 'undefined') return false
  const coarse = window.matchMedia?.('(pointer: coarse)').matches
  const cores = Number(navigator.hardwareConcurrency) || 8
  const memory = Number(navigator.deviceMemory) || 8
  return Boolean(coarse && (cores <= 4 || memory <= 4))
}

export default function FlexCarousel({
  items = [],
  preset = 'liquid',
  intro = 'rise',
  fit = 'natural',
  radius = 0,
  gap = 16,
  cardHeight = 0.58,
  squeeze = 0.2,
  captions = true,
  autoplay = false,
  interval = 4,
  captureWheel = true,
  focusOnClick = true,
  onChange,
  onSelect,
  className = '',
  style,
  fallback = null,
}) {
  const rootRef = useRef(null)
  const dragRef = useRef(null)
  const resumeTimerRef = useRef(null)
  const wheelLockRef = useRef(false)
  const interactionRef = useRef(false)
  const [active, setActive] = useState(0)
  const [drag, setDrag] = useState(0)
  const [broken, setBroken] = useState(() => new Set())
  const [imageFailed, setImageFailed] = useState(false)
  const [oglReady, setOglReady] = useState(false)
  const [oglFailed, setOglFailed] = useState(false)
  const [lowPerformance, setLowPerformance] = useState(false)
  const list = useMemo(() => (Array.isArray(items) ? items.filter((item) => item?.id && item?.src) : []), [items])
  const current = list[active] || list[0]

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const coarse = window.matchMedia?.('(pointer: coarse)')
    const update = () => {
      const cores = Number(navigator.hardwareConcurrency) || 8
      const memory = Number(navigator.deviceMemory) || 8
      setLowPerformance(Boolean(coarse?.matches && (cores <= 4 || memory <= 4)))
    }
    update()
    coarse?.addEventListener?.('change', update)
    return () => coarse?.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    setActive((index) => clamp(index, 0, Math.max(list.length - 1, 0)))
  }, [list.length])

  useEffect(() => {
    onChange?.(active, current)
  }, [active, current, onChange])

  useEffect(() => {
    if (!autoplay || list.length < 2 || typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = window.setInterval(() => {
      if (!interactionRef.current) setActive((index) => (index + 1) % list.length)
    }, Math.max(2400, Number(interval) * 1000 || 4000))
    return () => window.clearInterval(timer)
  }, [autoplay, interval, list.length])

  useEffect(() => {
    const root = rootRef.current
    if (!root || typeof window === 'undefined') return undefined
    const onWheel = (event) => {
      if (!captureWheel || (Math.abs(event.deltaY) < Math.abs(event.deltaX) && !event.shiftKey)) return
      event.preventDefault()
      event.stopPropagation()
      pauseForInteraction(true)
      if (wheelLockRef.current) return
      wheelLockRef.current = true
      move(active + ((event.deltaX || event.deltaY) > 0 ? 1 : -1))
      window.setTimeout(() => { wheelLockRef.current = false }, 420)
    }
    root.addEventListener('wheel', onWheel, { passive: false })
    return () => root.removeEventListener('wheel', onWheel)
  }, [active, captureWheel, list.length])

  useEffect(() => () => {
    if (resumeTimerRef.current !== null) window.clearTimeout(resumeTimerRef.current)
  }, [])

  useEffect(() => {
    let alive = true
    let renderer
    let resizeObserver
    const root = rootRef.current
    if (!root || typeof window === 'undefined') return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || isLowPerformanceDevice()) {
      setOglFailed(true)
      return undefined
    }
    import('ogl').then(({ Renderer, Program, Triangle, Mesh }) => {
      if (!alive || !root) return
      try {
        renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 1.5) })
        if (!renderer.isWebgl2) {
          renderer.gl.getExtension('WEBGL_lose_context')?.loseContext()
          setOglFailed(true)
          return
        }
        const gl = renderer.gl
        gl.clearColor(0, 0, 0, 0)
        const program = new Program(gl, {
          vertex: `attribute vec2 uv; attribute vec3 position; varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.0);}`,
          fragment: `precision highp float; varying vec2 vUv; void main(){vec2 p=vUv-.5; float ring=smoothstep(.47,.45,length(p)); gl_FragColor=vec4(.75,.45,.47,ring*.12);}`,
          transparent: true,
        })
        const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })
        const canvas = gl.canvas
        canvas.className = 'flex-carousel__ogl'
        canvas.setAttribute('aria-hidden', 'true')
        root.appendChild(canvas)
        const resize = () => renderer?.setSize(root.clientWidth, root.clientHeight)
        resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(root)
        resize()
        renderer.render({ scene: mesh })
        setOglReady(true)
      } catch {
        setOglReady(false)
        setOglFailed(true)
      }
    }).catch(() => { setOglReady(false); setOglFailed(true) })
    return () => {
      alive = false
      resizeObserver?.disconnect()
      renderer?.gl?.getExtension('WEBGL_lose_context')?.loseContext()
      const canvas = root?.querySelector('.flex-carousel__ogl')
      canvas?.remove()
    }
  }, [])

  function move(next) {
    if (!list.length) return
    setActive(clamp(next, 0, list.length - 1))
  }

  function pauseForInteraction(resume = false) {
    interactionRef.current = true
    if (resumeTimerRef.current !== null) window.clearTimeout(resumeTimerRef.current)
    if (resume) resumeTimerRef.current = window.setTimeout(() => { interactionRef.current = false; resumeTimerRef.current = null }, 2600)
  }

  function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return
    pauseForInteraction()
    dragRef.current = { id: event.pointerId, startX: event.clientX, offset: 0 }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function onPointerMove(event) {
    if (!dragRef.current || dragRef.current.id !== event.pointerId) return
    const offset = event.clientX - dragRef.current.startX
    dragRef.current.offset = offset
    setDrag(offset)
  }

  function onPointerUp(event) {
    const dragState = dragRef.current
    if (!dragState || dragState.id !== event.pointerId) return
    const offset = dragState.offset
    dragRef.current = null
    setDrag(0)
    if (Math.abs(offset) > 45) move(active + (offset < 0 ? 1 : -1))
    pauseForInteraction(true)
  }

  function onKeyDown(event) {
    pauseForInteraction(true)
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); move(active + 1) }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); move(active - 1) }
    if (event.key === 'Home') { event.preventDefault(); move(0) }
    if (event.key === 'End') { event.preventDefault(); move(list.length - 1) }
    if ((event.key === 'Enter' || event.key === ' ') && current) { event.preventDefault(); onSelect?.(active, current) }
    if (event.key === 'Escape' && focusOnClick) rootRef.current?.blur()
  }

  if (!list.length) return fallback || <div className={`flex-carousel flex-carousel--empty ${className}`.trim()} role="region" aria-label="精选产品轮播" style={style}>暂无精选产品</div>
  if ((oglFailed || imageFailed || lowPerformance) && fallback) return fallback
  return <div
    ref={rootRef}
    className={`flex-carousel flex-carousel--${preset} flex-carousel--${intro} flex-carousel--${fit} ${oglReady ? 'is-ogl' : 'is-static'}${drag ? ' is-dragging' : ''} ${className}`.trim()}
    style={{ ...style, '--carousel-gap': `${gap}px`, '--carousel-height': `${Math.round(cardHeight * 100)}%`, '--carousel-index': active, '--carousel-card-half': '80px', '--carousel-drag': `${drag}px`, '--carousel-radius': `${radius}px`, '--carousel-squeeze': squeeze }}
    role="region"
    aria-roledescription="carousel"
    aria-label="精选产品轮播"
    tabIndex={0}
    onKeyDown={onKeyDown}
    onFocus={() => pauseForInteraction()}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) pauseForInteraction(true) }}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
    onPointerCancel={onPointerUp}
  >
    <div className="flex-carousel__viewport">
      <div className="flex-carousel__track">
        {list.map((item, index) => <button
          type="button"
          className={`flex-carousel__card${index === active ? ' is-active' : ''}`}
          key={item.id}
          aria-label={`${item.title}，${item.subtitle || ''}`}
          onClick={() => index === active ? onSelect?.(index, item) : move(index)}
        >
          <span className="flex-carousel__image">{broken.has(item.id) ? <span className="flex-carousel__image-fallback">图片暂不可用</span> : <img src={item.src} alt={item.alt || `${item.title} 产品图`} onError={() => { setBroken((currentSet) => new Set(currentSet).add(item.id)); setImageFailed(true) }} loading={index === active || index === (active + 1) % list.length ? 'eager' : 'lazy'} />}</span>
          {captions && <span className="flex-carousel__card-caption"><strong>{item.title}</strong><small>{item.subtitle}</small></span>}
        </button>)}
      </div>
    </div>
    <div className="flex-carousel__caption" aria-live="polite">{current.title}<span>{String(active + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}</span></div>
  </div>
}
