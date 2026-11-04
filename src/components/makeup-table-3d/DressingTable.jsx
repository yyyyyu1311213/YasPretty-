import { RoundedBox } from '@react-three/drei'

function StandardMaterial({ color, roughness = .7, metalness = .05 }) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
}

function Drawer({ x, width }) {
  return (
    <group position={[x, -.48, 1.43]}>
      <RoundedBox args={[width, .78, .12]} radius={.055} smoothness={3} castShadow receiveShadow><StandardMaterial color="#edc1ba" /></RoundedBox>
      <mesh position={[0, 0, .1]} castShadow><sphereGeometry args={[.1, 20, 20]} /><StandardMaterial color="#b48255" roughness={.3} metalness={.55} /></mesh>
    </group>
  )
}

export default function DressingTable() {
  return (
    <group name="dressing-table">
      <RoundedBox args={[8.1, .42, 3.25]} radius={.16} smoothness={5} position={[0, 0, 0]} castShadow receiveShadow><StandardMaterial color="#f0cac4" /></RoundedBox>
      <RoundedBox args={[7.75, .9, 2.92]} radius={.12} smoothness={4} position={[0, -.55, 0]} castShadow receiveShadow><StandardMaterial color="#e6b5ad" /></RoundedBox>
      <Drawer x={-2.65} width={2.18} />
      <Drawer x={0} width={2.7} />
      <Drawer x={2.65} width={2.18} />

      {[-3.35, 3.35].flatMap((x) => [-1.1, 1.1].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, -2.05, z]} rotation={[0, 0, x < 0 ? -.06 : .06]} castShadow receiveShadow>
          <boxGeometry args={[.38, 2.55, .42]} /><StandardMaterial color="#da9d93" /></mesh>
      )))}

      <group position={[0, 2.55, -1.38]}>
        <mesh position={[0, 0, -.03]} scale={[1.42, 1.8, 1]} receiveShadow>
          <circleGeometry args={[1, 64]} />
          <meshStandardMaterial color="#fff0ee" roughness={.3} metalness={.04} />
        </mesh>
        <mesh scale={[1.42, 1.8, 1]} castShadow>
          <torusGeometry args={[1, .075, 18, 72]} />
          <StandardMaterial color="#cb8c78" roughness={.36} metalness={.2} />
        </mesh>
        <RoundedBox args={[.18, 2.6, .18]} radius={.045} smoothness={3} position={[-1.68, -1.15, 0]} castShadow><StandardMaterial color="#cb8c78" /></RoundedBox>
        <RoundedBox args={[.18, 2.6, .18]} radius={.045} smoothness={3} position={[1.68, -1.15, 0]} castShadow><StandardMaterial color="#cb8c78" /></RoundedBox>
        <RoundedBox args={[3.62, .18, .28]} radius={.05} smoothness={3} position={[0, -2.4, 0]} castShadow><StandardMaterial color="#cb8c78" /></RoundedBox>
      </group>
    </group>
  )
}
