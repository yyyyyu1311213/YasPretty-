export function getScenePerformanceProfile({
  width = 1280,
  devicePixelRatio = 1,
  hardwareConcurrency = 8,
  deviceMemory = 8,
  coarsePointer = false,
} = {}) {
  const constrained = width <= 680 || coarsePointer || hardwareConcurrency <= 4 || deviceMemory <= 4
  return {
    constrained,
    dpr: constrained ? 1 : Math.min(1.25, Math.max(1, devicePixelRatio)),
    antialias: !constrained,
    contactShadowResolution: constrained ? 128 : 256,
    showGhostCursor: !constrained,
  }
}

export function readScenePerformanceProfile() {
  if (typeof window === 'undefined') return getScenePerformanceProfile()
  return getScenePerformanceProfile({
    width: window.innerWidth,
    devicePixelRatio: window.devicePixelRatio,
    hardwareConcurrency: window.navigator?.hardwareConcurrency,
    deviceMemory: window.navigator?.deviceMemory,
    coarsePointer: window.matchMedia?.('(pointer: coarse)').matches,
  })
}
