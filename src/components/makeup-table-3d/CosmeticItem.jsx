import { forwardRef, useLayoutEffect, useState } from 'react'
import { Html, RoundedBox } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'

function ProductMaterial({ color, textureMap = null, metalness = .04, roughness = .4 }) {
  return <meshStandardMaterial color={color} map={textureMap} metalness={metalness} roughness={roughness} />
}

function GoldMaterial({ color = '#c8a46b', roughness = .24 }) {
  return <meshStandardMaterial color={color} metalness={.68} roughness={roughness} />
}

function GlassMaterial({ color = '#f2d8d5', opacity = .48 }) {
  return <meshPhysicalMaterial color={color} transparent opacity={opacity} roughness={.14} transmission={.12} thickness={.35} metalness={0} />
}

function BrandMark({ y, z, color = '#7d5752', scale = 1 }) {
  return <group position={[0, y, z]} scale={scale}><mesh><boxGeometry args={[.25, .018, .012]} /><ProductMaterial color={color} roughness={.55} /></mesh><mesh position={[0, -.075, 0]}><boxGeometry args={[.12, .012, .012]} /><ProductMaterial color={color} roughness={.55} /></mesh></group>
}

function Foundation({ item }) {
  return (
    <group>
      <RoundedBox args={[.76, 1.22, .5]} radius={.12} smoothness={5} position={[0, .63, 0]} castShadow><GlassMaterial color="#e9b8b5" opacity={.64} /></RoundedBox>
      <RoundedBox args={[.61, .94, .38]} radius={.09} smoothness={4} position={[0, .59, 0]}><ProductMaterial color={item.color} textureMap={item.textureMap} roughness={.32} /></RoundedBox>
      <BrandMark y={.68} z={.205} color="#704d4a" scale={.8} />
      <mesh position={[0, 1.3, 0]} castShadow><cylinderGeometry args={[.21, .24, .22, 32]} /><GoldMaterial color={item.accent} /></mesh>
      <mesh position={[0, 1.48, 0]} castShadow><cylinderGeometry args={[.19, .19, .16, 32]} /><GoldMaterial color="#d8b77c" /></mesh>
      <mesh position={[.07, 1.59, 0]} castShadow><boxGeometry args={[.34, .09, .18]} /><GoldMaterial color="#d8b77c" /></mesh>
      <mesh position={[.22, 1.56, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.035, .035, .12, 16]} /><GoldMaterial /></mesh>
    </group>
  )
}

function Eyeshadow({ item }) {
  const pans = [[-.28, .15, '#e8c4c0'], [.28, .15, '#b7797e'], [-.28, -.22, '#d9a89d'], [.28, -.22, '#805154']]
  return (
    <group>
      <RoundedBox args={[1.28, .18, .92]} radius={.11} smoothness={5} position={[0, .16, 0]} castShadow><ProductMaterial color="#c6a06f" metalness={.32} roughness={.28} /></RoundedBox>
      <RoundedBox args={[1.13, .13, .77]} radius={.08} smoothness={4} position={[0, .27, 0]}><ProductMaterial color="#f3ded5" roughness={.65} /></RoundedBox>
      {pans.map(([x, z, color]) => <mesh key={`${x}-${z}`} position={[x, .355, z]} rotation={[-Math.PI / 2, 0, 0]}><cylinderGeometry args={[.19, .19, .045, 32]} /><ProductMaterial color={color} roughness={.76} /></mesh>)}
      <mesh position={[0, .37, -.43]}><boxGeometry args={[.32, .025, .025]} /><GoldMaterial color={item.accent} /></mesh>
    </group>
  )
}

function Compact({ item, blush = false }) {
  return (
    <group>
      <mesh position={[0, .18, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.62, .64, .22, 48]} /><GoldMaterial color={item.accent} roughness={.3} /></mesh>
      <mesh position={[0, .305, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.48, .07, 16, 48]} /><GoldMaterial color="#d9b785" /></mesh>
      <mesh position={[0, .32, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.46, 48]} /><ProductMaterial color={blush ? item.color : '#f0d9ce'} roughness={.72} /></mesh>
      <mesh position={[0, .34, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.18, .22, 40]} /><ProductMaterial color={blush ? '#edb1b7' : '#f9ede7'} roughness={.78} /></mesh>
      <mesh position={[0, .05, -.61]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.045, .045, .2, 16]} /><GoldMaterial /></mesh>
    </group>
  )
}

function Mascara({ item }) {
  return (
    <group>
      <mesh position={[0, .72, 0]} castShadow><cylinderGeometry args={[.19, .22, 1.38, 32]} /><ProductMaterial color={item.color} roughness={.27} /></mesh>
      <mesh position={[0, 1.48, 0]} castShadow><cylinderGeometry args={[.23, .2, .34, 32]} /><GoldMaterial color={item.accent} /></mesh>
      {[1.36, 1.43, 1.5, 1.57].map((y) => <mesh key={y} position={[0, y, 0]}><torusGeometry args={[.205, .012, 8, 32]} /><GoldMaterial color="#a98353" /></mesh>)}
      <BrandMark y={.72} z={.207} color="#e8d1c2" scale={.52} />
    </group>
  )
}

function Concealer({ item }) {
  return (
    <group>
      <mesh position={[0, .65, 0]} castShadow><cylinderGeometry args={[.22, .24, 1.25, 32]} /><GlassMaterial color="#f0d0c5" opacity={.67} /></mesh>
      <mesh position={[0, .6, 0]}><cylinderGeometry args={[.17, .18, 1.08, 32]} /><ProductMaterial color={item.color} roughness={.5} /></mesh>
      <mesh position={[0, 1.43, 0]} castShadow><cylinderGeometry args={[.22, .22, .42, 32]} /><ProductMaterial color="#f1e5dc" metalness={.08} roughness={.28} /></mesh>
      <mesh position={[0, 1.2, 0]}><torusGeometry args={[.21, .022, 10, 32]} /><GoldMaterial color={item.accent} /></mesh>
      <BrandMark y={.64} z={.19} color="#956d64" scale={.52} />
    </group>
  )
}

function Powder({ item }) {
  return (
    <group>
      <mesh position={[0, .34, 0]} castShadow><cylinderGeometry args={[.57, .61, .6, 48]} /><GlassMaterial color="#ebc8c4" opacity={.61} /></mesh>
      <mesh position={[0, .31, 0]}><cylinderGeometry args={[.48, .5, .48, 48]} /><ProductMaterial color="#e7cdbf" roughness={.66} /></mesh>
      <mesh position={[0, .7, 0]} castShadow><cylinderGeometry args={[.62, .6, .16, 48]} /><GoldMaterial color={item.accent} roughness={.26} /></mesh>
      <mesh position={[0, .79, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.46, 48]} /><ProductMaterial color="#f4ded7" roughness={.48} /></mesh>
      <mesh position={[0, .805, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.2, .22, 36]} /><GoldMaterial color="#c59b67" /></mesh>
    </group>
  )
}

function Lip({ item }) {
  return (
    <group>
      <RoundedBox args={[.42, 1.28, .36]} radius={.12} smoothness={5} position={[0, .64, 0]} castShadow><GlassMaterial color="#cf6f79" opacity={.72} /></RoundedBox>
      <RoundedBox args={[.28, 1.05, .22]} radius={.08} smoothness={4} position={[0, .57, 0]}><ProductMaterial color={item.color} roughness={.32} /></RoundedBox>
      <RoundedBox args={[.46, .5, .4]} radius={.1} smoothness={4} position={[0, 1.53, 0]} castShadow><GoldMaterial color={item.accent} /></RoundedBox>
      <mesh position={[0, 1.25, 0]}><boxGeometry args={[.34, .035, .3]} /><GoldMaterial color="#a87d50" /></mesh>
      <BrandMark y={.67} z={.195} color="#f0d8cb" scale={.5} />
    </group>
  )
}

function Blush({ item }) {
  return <group><Compact item={item} blush /><mesh position={[.3, .35, .06]} rotation={[-Math.PI / 2, 0, .5]}><boxGeometry args={[.38, .018, .025]} /><ProductMaterial color="#f5d6d0" /></mesh></group>
}

function Geometry({ item }) {
  if (item.geometryType === 'foundation') return <Foundation item={item} />
  if (item.geometryType === 'eyeshadow') return <Eyeshadow item={item} />
  if (item.geometryType === 'cushion') return <Compact item={item} />
  if (item.geometryType === 'blush') return <Blush item={item} />
  if (item.geometryType === 'mascara') return <Mascara item={item} />
  if (item.geometryType === 'concealer') return <Concealer item={item} />
  if (item.geometryType === 'powder') return <Powder item={item} />
  return <Lip item={item} />
}

const CosmeticItem = forwardRef(function CosmeticItem({ item, index, exploded, reducedMotion, onClick }, ref) {
  const [hovered, setHovered] = useState(false)
  const invalidate = useThree((state) => state.invalidate)

  useLayoutEffect(() => {
    const group = ref.current
    if (!group) return undefined
    const targetPosition = exploded ? item.explodedPosition : item.initialPosition
    const targetRotation = exploded ? item.explodedRotation : item.rotation
    const duration = reducedMotion ? .01 : exploded ? 1.05 : .78
    const delay = reducedMotion ? 0 : index * .045
    const timeline = gsap.timeline()
    timeline.to(group.position, { x: targetPosition[0], y: targetPosition[1], z: targetPosition[2], duration, delay, ease: exploded ? 'power3.out' : 'power2.inOut' }, 0)
    timeline.to(group.rotation, { x: targetRotation[0], y: targetRotation[1], z: targetRotation[2], duration: duration * .95, delay, ease: 'power2.out' }, 0)
    if (exploded && !reducedMotion) timeline.to(group.scale, { x: 1.1, y: 1.1, z: 1.1, duration: .35, yoyo: true, repeat: 1, ease: 'sine.inOut' }, delay + .18)
    else timeline.to(group.scale, { x: 1, y: 1, z: 1, duration: duration * .6 }, 0)
    timeline.eventCallback('onUpdate', invalidate)
    timeline.eventCallback('onComplete', invalidate)
    return () => timeline.kill()
  }, [exploded, index, invalidate, item, reducedMotion, ref])

  return (
    <group ref={ref} name={`cosmetic-${item.id}`} position={item.initialPosition} rotation={item.rotation} onClick={(event) => { event.stopPropagation(); onClick(item) }} onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }} onPointerOut={() => { setHovered(false); document.body.style.cursor = '' }}>
      <Geometry item={item} />
      {hovered && <Html center position={[0, 1.95, 0]} className="makeup-3d-object-label"><span>{item.name}</span></Html>}
    </group>
  )
})

export default CosmeticItem
