import { Children, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ScrollFloat.css'

gsap.registerPlugin(ScrollTrigger)

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
const clamp = (value) => Math.min(Math.max(value, 0), 1)
const smoothstep = (from, to, value) => {
  const progress = clamp((value - from) / (to - from))
  return progress * progress * (3 - 2 * progress)
}
const clampScrollPosition = (position) => typeof position === 'string' && !position.startsWith('clamp(') ? `clamp(${position})` : position

export default function ScrollFloat({
  as: Tag = 'h2',
  children,
  effect = 'float',
  splitBy = 'chars',
  direction = 'up',
  order = 'start',
  fromColor = 'currentColor',
  animationDuration = 1,
  ease = 'power3.out',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03,
  distance = 120,
  stretch = 2.3,
  smoothing = 0,
  containerClassName = '',
  textClassName = '',
}) {
  const containerRef = useRef(null)
  const textRef = useRef(null)
  const text = useMemo(() => {
    const parts = Children.toArray(children)
    return parts.every((part) => typeof part === 'string' || typeof part === 'number') ? parts.join('') : null
  }, [children])
  const shiftColor = fromColor && fromColor !== 'currentColor' ? fromColor : null
  const shiftStyle = shiftColor
    ? { color: `color-mix(in oklab, ${shiftColor} calc(var(--scroll-float-mix, 0) * 100%), currentColor)` }
    : undefined
  const splitText = useMemo(() => {
    if (text === null) return null
    return text.split('\n').flatMap((line, lineIndex, lines) => {
      const tokens = /[\u3400-\u9fff]/.test(line) ? Array.from(line) : line.split(/(\s+)/)
      const nodes = tokens.map((word, wordIndex) => word.trim() === '' ? word : (
        <span className="scroll-float-word" key={`${lineIndex}-${wordIndex}`}>
          {Array.from(word).map((char, charIndex) => <span className="scroll-float-char" key={`${lineIndex}-${wordIndex}-${charIndex}`} style={shiftStyle}>{char}</span>)}
        </span>
      ))
      if (lineIndex < lines.length - 1) nodes.push(<br key={`break-${lineIndex}`} />)
      return nodes
    })
  }, [text, shiftStyle])

  useIsomorphicLayoutEffect(() => {
    const element = containerRef.current
    const textElement = textRef.current
    if (!element || !textElement || typeof window === 'undefined') return undefined
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (media?.matches) return undefined
    const pieces = Array.from(element.querySelectorAll(splitBy === 'words' ? '.scroll-float-word' : '.scroll-float-char'))
    const targets = pieces.length ? pieces : [textElement]
    const middle = (targets.length - 1) / 2
    const ranks = targets.map((_, index) => {
      if (order === 'end') return targets.length - 1 - index
      if (order === 'center') return Math.abs(index - middle)
      if (order === 'edges') return middle - Math.abs(index - middle)
      return index
    })
    const first = Math.min(...ranks)
    const delays = ranks.map((rank) => (rank - first) * Math.max(0, stagger))
    const sign = direction === 'down' ? -1 : 1
    const reach = Math.max(0, Number(distance) || 0) / 120
    const squeeze = stretch > 0 ? stretch ** -0.43 : 1
    const baseEase = gsap.parseEase(ease) || ((value) => value)
    const timing = (value) => clamp(baseEase(value))
    const size = () => parseFloat(getComputedStyle(textElement).fontSize) || 16
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: element, start: scrollStart, end: clampScrollPosition(scrollEnd), scrub: smoothing > 0 ? smoothing : true, invalidateOnRefresh: true },
      })
      const add = (fromVars, toVars) => {
        gsap.set(targets, { willChange: 'opacity, transform', ...fromVars })
        return timeline.fromTo(targets, { willChange: 'opacity, transform', ...fromVars }, { duration: animationDuration, stagger: (index) => delays[index] || 0, ...toVars }, 0)
      }
      if (effect === 'wave') {
        add({ yPercent: 120 * reach * sign, scaleY: stretch, scaleX: squeeze, transformOrigin: sign > 0 ? '50% 100%' : '50% 0%' }, { ease, yPercent: 0, scaleY: 1, scaleX: 1 })
        add({ rotation: 0 }, { ease: (value) => Math.sin(timing(value) * Math.PI * 2.5) * Math.pow(1 - timing(value), 2.6), rotation: -16 * sign })
      } else {
        add({ opacity: 0, yPercent: 120 * reach * sign, scaleY: stretch, scaleX: squeeze, transformOrigin: sign > 0 ? '50% 0%' : '50% 100%' }, { ease, opacity: 1, yPercent: 0, scaleY: 1, scaleX: 1 })
      }
      add({ opacity: 0 }, { ease: (value) => smoothstep(0, 0.4, timing(value)), opacity: 1 })
      if (shiftColor) add({ '--scroll-float-mix': 1 }, { ease: (value) => smoothstep(0.5, 1, timing(value)), '--scroll-float-mix': 0 })
    })
    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      window.cancelAnimationFrame(refreshFrame)
      mm.revert()
    }
  }, [animationDuration, direction, distance, ease, effect, order, scrollEnd, scrollStart, shiftColor, smoothing, splitBy, stagger, stretch, text])

  return <Tag ref={containerRef} className={`scroll-float ${effect === 'float' ? '' : 'scroll-float--open'} ${containerClassName}`.trim()}>
    {text !== null && <span className="scroll-float-sr">{text}</span>}
    <span ref={textRef} className={`scroll-float-text ${textClassName}`.trim()} style={text === null ? shiftStyle : undefined} aria-hidden={text !== null ? true : undefined}>{splitText ?? children}</span>
  </Tag>
}
