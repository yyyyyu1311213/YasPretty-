import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export default function FaceStudyViewer({ result, preview, phase, showPhoto, annotations, thirdsStatus, onReady, onUnavailable }) {
  const mountRef = useRef(null), runtimeRef = useRef(null)
  const callbacks = useRef({ onReady, onUnavailable })
  callbacks.current = { onReady, onUnavailable }
  const [layout, setLayout] = useState({ width: 1, height: 1, left: 0, region: null, anchors: [] })
  const [centered, setCentered] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    let renderer
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }) }
    catch { callbacks.current.onUnavailable(); return undefined }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const geometry = new THREE.BufferGeometry()
    const centerZ = result.vertices.reduce((sum, p) => sum + p[2], 0) / result.vertices.length
    const worldPoint = (p) => new THREE.Vector3(p[0] - result.width / 2, result.height / 2 - p[1], p[2] - centerZ)
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(result.vertices.flatMap((p) => worldPoint(p).toArray()), 3))
    geometry.computeBoundingBox()
    const modelCenter = geometry.boundingBox.getCenter(new THREE.Vector3())
    // 3DDFA's image-space Y inversion reverses winding; FLAME is already outward in world space.
    geometry.setIndex(result.engine === '3DDFA_V2' ? result.triangles.flatMap(([a, b, c]) => [a, c, b]) : result.triangles.flat())
    geometry.computeVertexNormals()
    const material = new THREE.MeshStandardMaterial({ color: '#dfb8a8', roughness: 0.78, metalness: 0.04, side: THREE.DoubleSide })
    const mesh = new THREE.Mesh(geometry, material)
    const wireMaterial = new THREE.MeshBasicMaterial({ color: '#80584e', wireframe: true, transparent: true, opacity: 0.12, depthWrite: false })
    const wire = new THREE.Mesh(geometry, wireMaterial)
    mesh.add(wire)
    scene.add(mesh, new THREE.HemisphereLight('#fff7ec', '#a98a7e', 2.2))
    const light = new THREE.DirectionalLight('#fff2dc', 3)
    light.position.set(-400, 600, 1000)
    scene.add(light)
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100000)
    camera.position.set(0, 0, 10000)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false; controls.enableZoom = false; controls.enableRotate = false
    controls.minAzimuthAngle = -Math.PI / 5; controls.maxAzimuthAngle = Math.PI / 5
    controls.minPolarAngle = Math.PI * 0.36; controls.maxPolarAngle = Math.PI * 0.64
    controls.saveState()
    let width = 1, height = 1, left = 0, region = 1, centering = 0, frame = 0
    const placeModel = () => mesh.position.set(-modelCenter.x * mesh.scale.x * centering, -modelCenter.y * mesh.scale.x * centering, 0)
    const render = () => {
      renderer.render(scene, camera)
      const anchors = result.landmarks.map((p) => {
        const projected = worldPoint(p).multiplyScalar(mesh.scale.x).add(mesh.position).project(camera)
        return [(projected.x + 1) * width / 2, (1 - projected.y) * height / 2]
      })
      setLayout({ width, height, left, region, anchors })
    }
    const resize = () => {
      width = mount.clientWidth; height = mount.clientHeight
      if (!width || !height) return
      region = width >= 600 ? width * 0.58 : width
      left = (width - region) / 2
      mesh.scale.setScalar(Math.min(region / result.width, height / result.height))
      placeModel()
      camera.left = -width / 2; camera.right = width / 2
      camera.top = height / 2; camera.bottom = -height / 2
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      render()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    controls.addEventListener('change', render)
    const contextLost = (event) => { event.preventDefault(); callbacks.current.onUnavailable() }
    renderer.domElement.addEventListener('webglcontextlost', contextLost)
    const present = (shouldCenter) => {
      cancelAnimationFrame(frame)
      controls.enableRotate = false
      controls.reset()
      setCentered(false)
      if (!shouldCenter) {
        centering = 0; placeModel(); render(); return
      }
      const from = centering
      const started = performance.now()
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const step = (now) => {
        const progress = reducedMotion ? 1 : Math.min(1, (now - started) / 650)
        const eased = progress * progress * (3 - 2 * progress)
        centering = from + (1 - from) * eased
        placeModel(); render()
        if (progress < 1) frame = requestAnimationFrame(step)
        else { controls.enableRotate = true; setCentered(true) }
      }
      step(started)
    }
    runtimeRef.current = { present }
    resize()
    callbacks.current.onReady()
    return () => {
      runtimeRef.current = null
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.removeEventListener('change', render)
      controls.dispose()
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      geometry.dispose(); material.dispose(); wireMaterial.dispose(); renderer.dispose()
      renderer.domElement.remove()
    }
  }, [result])

  useEffect(() => {
    const runtime = runtimeRef.current
    if (!runtime) return
    runtime.present(phase === 'complete' && !showPhoto)
  }, [phase, showPhoto, result])

  const labelsVisible = phase === 'complete' && !showPhoto && centered
  return <div className="face-model-area"><div className={`face-stage is-${phase}${showPhoto ? ' shows-photo' : ''}${centered ? ' is-centered' : ''}`} data-testid="face-stage">
    <img className="face-stage__photo" src={preview} alt="与重建模型对齐的原照片" style={{ left: layout.left, width: layout.region ?? '100%' }} />
    <div className="face-stage__mesh" ref={mountRef} role="img" aria-label="根据照片重建的可旋转立体面部模型" />
    {phase === 'scanning' && <div className="face-scanline" aria-hidden="true" />}
    {labelsVisible && <>
      <svg className="face-leaders" viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
        {annotations.map((entry) => {
          const anchor = layout.anchors[entry.index]
          if (!anchor) return null
          const endX = entry.side === 'left' ? layout.width * 0.18 : layout.width * 0.82
          const endY = layout.height * entry.top / 100
          return <g key={entry.id}>
            {layout.width >= 600 && <polyline points={`${anchor[0]},${anchor[1]} ${(anchor[0] + endX) / 2},${endY} ${endX},${endY}`} />}
            <circle cx={anchor[0]} cy={anchor[1]} r={layout.width >= 600 ? 3 : 10} />
            {layout.width < 600 && <text x={anchor[0]} y={anchor[1] + 3}>{entry.number}</text>}
          </g>
        })}
      </svg>
      {layout.width >= 600 && annotations.map((entry) => <div key={entry.id} className={`face-label face-label--${entry.side}`} style={{ top: `${entry.top}%` }}><strong>{entry.number}. {entry.title}</strong><span>{entry.value}</span></div>)}
    </>}
  </div>{labelsVisible && <aside className="face-thirds-label" aria-label="模型旁的三庭比例">
    <strong>{thirdsStatus.title}</strong><span>{thirdsStatus.detail}</span>
  </aside>}</div>
}
