import { AdditiveBlending } from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'

function seeded(index) {
  return ((index * 9301 + 49297) % 233280) / 233280
}

export default function ParticleBurst({ active, reducedMotion }) {
  const pointsRef = useRef(null)
  const materialRef = useRef(null)
  const invalidate = useThree((state) => state.invalidate)
  const positions = useMemo(() => {
    const values = new Float32Array(42 * 3)
    for (let index = 0; index < 42; index += 1) {
      const angle = seeded(index) * Math.PI * 2
      const radius = .35 + seeded(index + 9) * 1.45
      values[index * 3] = Math.cos(angle) * radius
      values[index * 3 + 1] = Math.sin(angle) * radius * .72
      values[index * 3 + 2] = (seeded(index + 21) - .5) * 1.15
    }
    return values
  }, [])

  useEffect(() => {
    const points = pointsRef.current
    const material = materialRef.current
    if (!points || !material) return undefined
    gsap.killTweensOf([points.scale, material])
    if (!active || reducedMotion) {
      material.opacity = 0
      points.scale.setScalar(.2)
      return undefined
    }
    points.scale.setScalar(.2)
    material.opacity = .9
    const timeline = gsap.timeline()
      .to(points.scale, { x: 2.4, y: 2.4, z: 2.4, duration: .9, ease: 'power3.out' })
      .to(material, { opacity: 0, duration: .55, ease: 'power2.in' }, .38)
    timeline.eventCallback('onUpdate', invalidate)
    timeline.eventCallback('onComplete', invalidate)
    return () => timeline.kill()
  }, [active, invalidate, reducedMotion])

  return (
    <points ref={pointsRef} position={[0, 2.75, .65]}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial ref={materialRef} color="#fff0c7" size={.09} transparent opacity={0} depthWrite={false} blending={AdditiveBlending} />
    </points>
  )
}
