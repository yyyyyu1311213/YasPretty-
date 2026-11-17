import { Component, useEffect, useMemo, useState } from 'react'
import LegacyMakeupTable from './MakeupTable'
import MakeupTable3D from './MakeupTable3D'
import { readScenePerformanceProfile } from '../makeup-table-3d/performance-profile'

export const SCENE_READY_TIMEOUT_MS = 6000
export const AUTO_BLOOM_DELAY_MS = 1180

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

export default function MakeupTableExperience(props) {
  const { openingReady = false, onViewCategory } = props
  const [webGLAvailable] = useState(canUseWebGL)
  const [ready, setReady] = useState(false)
  const [sceneMounted, setSceneMounted] = useState(false)
  const [sceneUnavailable, setSceneUnavailable] = useState(false)
  const [exploded, setExploded] = useState(false)
  const [introFocus, setIntroFocus] = useState(false)
  const [autoBloomPlayed, setAutoBloomPlayed] = useState(false)
  const reducedMotion = useReducedMotionPreference()
  const performanceProfile = useScenePerformanceProfile()
  const fallback = useMemo(() => <LegacyMakeupTable {...props} />, [props])

  useEffect(() => {
    if (!openingReady) {
      setSceneMounted(false)
      setSceneUnavailable(false)
      setReady(false)
      setExploded(false)
      setAutoBloomPlayed(false)
      return undefined
    }
    const frame = window.requestAnimationFrame(() => setSceneMounted(true))
    return () => window.cancelAnimationFrame(frame)
  }, [openingReady])

  useEffect(() => {
    if (!sceneMounted || ready) return undefined
    const timer = window.setTimeout(() => setSceneUnavailable(true), SCENE_READY_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [ready, sceneMounted])

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
    if (!ready || !introFocus || autoBloomPlayed) return undefined
    const timer = window.setTimeout(() => {
      setAutoBloomPlayed(true)
      setExploded(true)
    }, reducedMotion ? 0 : AUTO_BLOOM_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [autoBloomPlayed, introFocus, ready, reducedMotion])

  if (!webGLAvailable || sceneUnavailable) return fallback

  function handleItemClick(item) {
    onViewCategory(item.category)
  }

  function handleCategory(item) {
    onViewCategory(item.category)
  }

  function handleCollapse() {
    setAutoBloomPlayed(true)
    setExploded(false)
  }

  return (
    <SceneErrorBoundary fallback={fallback}>
      <MakeupTable3D openingReady={openingReady} ready={ready} sceneMounted={sceneMounted} exploded={exploded} introFocus={introFocus} reducedMotion={reducedMotion} performanceProfile={performanceProfile} onItemClick={handleItemClick} onCategory={handleCategory} onCollapse={handleCollapse} onReady={() => setReady(true)} />
    </SceneErrorBoundary>
  )
}
