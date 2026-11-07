import { Suspense, createRef, useEffect, useMemo, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import gsap from 'gsap'
import CosmeticItem from './CosmeticItem'
import DressingTable from './DressingTable'
import ParticleBurst from './ParticleBurst'
import { COSMETIC_ITEMS } from './cosmetics'

function CameraRig({ exploded, introFocus, reducedMotion, controlsRef }) {
  const { camera, size, invalidate } = useThree()

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return undefined
    const compact = size.width <= 680
    const position = compact
      ? (exploded ? [0, 7.1, 23] : introFocus ? [0, 5.5, 14.8] : [0, 6.15, 17.1])
      : (exploded ? [0, 6.35, 14.25] : introFocus ? [0, 4.9, 9.7] : [0, 5.65, 14.25])
    const target = exploded ? [0, 2.15, .2] : compact ? [0, 1.12, 0] : [0, 1.2, 0]
    const duration = reducedMotion ? .01 : exploded || introFocus ? 1.08 : .01
    camera.fov = compact ? 44 : 41
    camera.updateProjectionMatrix()
    const timeline = gsap.timeline()
      .to(camera.position, { x: position[0], y: position[1], z: position[2], duration, ease: 'power3.inOut' }, 0)
      .to(controls.target, { x: target[0], y: target[1], z: target[2], duration, ease: 'power3.inOut', onUpdate: () => controls.update() }, 0)
    timeline.eventCallback('onUpdate', invalidate)
    timeline.eventCallback('onComplete', invalidate)
    return () => timeline.kill()
  }, [camera, controlsRef, exploded, introFocus, invalidate, reducedMotion, size.width])

  return null
}

function StudioBackdrop() {
  return (
    <group name="studio-backdrop">
      <mesh position={[0, 4.2, -5.4]} receiveShadow>
        <planeGeometry args={[40, 16]} />
        <meshBasicMaterial color="#fbefea" />
      </mesh>
      <mesh position={[0, -3.42, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial color="#eadbd5" />
      </mesh>
      <mesh position={[0, -3.12, -5.16]} receiveShadow>
        <boxGeometry args={[40, .18, .16]} />
        <meshBasicMaterial color="#ddbeb6" />
      </mesh>
      <mesh position={[0, -2.92, -5.07]}>
        <boxGeometry args={[40, .035, .035]} />
        <meshBasicMaterial color="#fff5ef" />
      </mesh>
    </group>
  )
}

function World({ exploded, introFocus, reducedMotion, quality, onItemClick }) {
  const controlsRef = useRef(null)
  const itemRefs = useMemo(() => COSMETIC_ITEMS.map(() => createRef()), [])
  return (
    <>
      <fog attach="fog" args={['#f7ebe6', 18, 42]} />
      <StudioBackdrop />
      <hemisphereLight args={['#fff8f2', '#ead1cc', .5]} />
      <ambientLight intensity={1.62} />
      <directionalLight position={[5, 9, 7]} intensity={1.95} color="#fff0d8" />
      <directionalLight position={[-5, 4, 2]} intensity={.58} color="#ffd9e2" />
      <pointLight position={[0, 4.5, 4]} intensity={.42} distance={18} color="#fff7f1" />

      <DressingTable />
      {COSMETIC_ITEMS.map((item, index) => (
        <CosmeticItem key={item.id} ref={itemRefs[index]} item={item} index={index} exploded={exploded} reducedMotion={reducedMotion} onClick={onItemClick} />
      ))}
      <ParticleBurst active={exploded} reducedMotion={reducedMotion} />
      <ContactShadows position={[0, -3.35, 0]} opacity={.18} scale={16} blur={4.6} far={7} resolution={quality.contactShadowResolution} color="#a87372" />

      <OrbitControls ref={controlsRef} makeDefault enablePan={false} enableDamping dampingFactor={.075} minDistance={8.4} maxDistance={26} minPolarAngle={Math.PI * .22} maxPolarAngle={Math.PI * .48} minAzimuthAngle={-Math.PI * .3} maxAzimuthAngle={Math.PI * .3} />
      <CameraRig exploded={exploded} introFocus={introFocus} reducedMotion={reducedMotion} controlsRef={controlsRef} />
    </>
  )
}

export default function Scene({ exploded, introFocus, reducedMotion, quality, onItemClick, onBackgroundClick, onReady }) {
  return (
    <Canvas
      frameloop="demand"
      shadows={false}
      dpr={quality.dpr}
      camera={{ position: [0, 4.85, 10.9], fov: 41, near: .1, far: 50 }}
      gl={{ antialias: quality.antialias, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl, invalidate }) => { gl.setClearColor('#fff5ee', 0); invalidate(); onReady?.() }}
      onPointerMissed={onBackgroundClick}
    >
      <Suspense fallback={null}><World exploded={exploded} introFocus={introFocus} reducedMotion={reducedMotion} quality={quality} onItemClick={onItemClick} /></Suspense>
    </Canvas>
  )
}
