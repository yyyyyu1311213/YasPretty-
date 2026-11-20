import { useEffect, useRef } from 'react'

export default function CultureSealCanvas() {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    const controller = new AbortController()
    let dispose
    import('./cultureSealScene').then(({ createCultureSeal }) => {
      if (controller.signal.aborted) return undefined
      return createCultureSeal(host, controller.signal)
    }).then((cleanup) => {
      if (controller.signal.aborted) cleanup?.()
      else dispose = cleanup
    }).catch(() => {
      // The original SVG remains visible if WebGL or the optional scene fails.
      delete host.parentElement?.dataset.sealReady
    })
    return () => {
      controller.abort()
      dispose?.()
    }
  }, [])

  return <div ref={hostRef} className="culture-seal-canvas" />
}
