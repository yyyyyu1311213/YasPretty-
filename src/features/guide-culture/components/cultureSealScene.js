import * as THREE from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'

// Geometry is derived from the project's original seal, including its handwritten strokes.
export async function createCultureSeal(host, signal) {
  const response = await fetch('/assets/logo/yaspretty-monogram.svg?v=20261104-y-seal-lines', { signal })
  if (!response.ok) throw new Error('Brand seal asset unavailable')
  const source = await response.text()
  if (signal.aborted) return undefined

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
  const geometries = []
  const materials = []
  const textures = []
  let frame = 0
  let observer
  let resizeObserver
  let disposed = false
  let pointerId = null
  let lastPointerX = 0
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const panel = host.parentElement
  const gradient = new THREE.DataTexture(new Uint8Array([115, 182, 226, 255]), 4, 1, THREE.RedFormat)
  gradient.minFilter = gradient.magFilter = THREE.NearestFilter
  gradient.needsUpdate = true

  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    observer?.disconnect()
    resizeObserver?.disconnect()
    motion.removeEventListener('change', updateMotion)
    document.removeEventListener('visibilitychange', updateMotion)
    renderer.domElement.removeEventListener('webglcontextlost', contextLost)
    renderer.domElement.removeEventListener('pointerdown', startDrag)
    renderer.domElement.removeEventListener('pointermove', drag)
    renderer.domElement.removeEventListener('pointerup', endDrag)
    renderer.domElement.removeEventListener('pointercancel', endDrag)
    renderer.domElement.removeEventListener('lostpointercapture', endDrag)
    host.classList.remove('is-dragging')
    geometries.forEach((geometry) => geometry.dispose())
    materials.forEach((material) => material.dispose())
    textures.forEach((texture) => texture.dispose())
    gradient.dispose()
    renderer.dispose()
    renderer.domElement.remove()
    delete panel.dataset.sealReady
  }

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-260, 260, 260, -260, 1, 2000)
  camera.position.set(0, 65, 900)
  camera.lookAt(0, 0, 0)
  const seal = new THREE.Group()
  scene.add(seal)
  let visible = true
  let angle = -.45
  let previous = 0

  function draw() {
    seal.rotation.set(-.14, angle, -.065)
    seal.position.y = 12
    renderer.render(scene, camera)
  }

  function render(time = 0) {
    frame = 0
    if (disposed) return
    const animated = visible && !document.hidden && !motion.matches
    if (animated && previous && time - previous < 32) {
      frame = requestAnimationFrame(render)
      return
    }
    if (animated && previous && pointerId === null) angle += Math.min(time - previous, 64) * .0003
    previous = time
    draw()
    if (animated) frame = requestAnimationFrame(render)
  }

  function startDrag(event) {
    if (pointerId !== null || !event.isPrimary || event.button !== 0) return
    pointerId = event.pointerId
    lastPointerX = event.clientX
    previous = 0
    renderer.domElement.setPointerCapture(pointerId)
    host.classList.add('is-dragging')
  }

  function drag(event) {
    if (event.pointerId !== pointerId) return
    angle += (event.clientX - lastPointerX) * .012
    lastPointerX = event.clientX
    draw()
  }

  function endDrag(event) {
    if (event.pointerId !== pointerId) return
    pointerId = null
    previous = 0
    host.classList.remove('is-dragging')
    if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId)
  }

  function updateMotion() {
    cancelAnimationFrame(frame)
    previous = 0
    render()
  }

  function contextLost(event) {
    event.preventDefault()
    dispose()
  }

  try {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setClearColor(0x000000, 0)
    host.appendChild(renderer.domElement)

    function material(color) {
      const result = new THREE.MeshToonMaterial({ color, gradientMap: gradient })
      materials.push(result)
      return result
    }
    function mesh(geometry, surface, parent = seal) {
      geometries.push(geometry)
      const result = new THREE.Mesh(geometry, surface)
      parent.add(result)
      return result
    }
    const { paths } = new SVGLoader().parse(source)
    const outline = paths[0]
    const body = new THREE.ExtrudeGeometry(SVGLoader.createShapes(outline), {
      depth: 28, bevelEnabled: true, bevelThickness: 7, bevelSize: 6, bevelSegments: 3, curveSegments: 32,
    })
    const wax = mesh(body, [material('#d6b9b7'), material('#af8585')])
    // Keep the reflection on the object so Three.js also corrects face winding.
    wax.scale.y = -1
    wax.position.set(-256, 236, -14)

    // Raised ink and highlights follow the SVG paths in 3D, rather than a flat texture.
    const frontInk = new THREE.Group()
    seal.add(frontInk)
    paths.forEach((path, index) => {
      const style = path.userData.style
      if (!style.stroke || style.stroke === 'none') return
      const ink = material(style.stroke)
      ink.transparent = Number(style.opacity ?? 1) < 1
      ink.opacity = Number(style.opacity ?? 1)
      path.subPaths.forEach((subPath) => {
        const points = subPath.getPoints(90).map((point) => new THREE.Vector3(point.x - 256, 236 - point.y, index === 0 ? 17 : 24))
        const curve = new THREE.CatmullRomCurve3(points)
        const radius = Number(style.strokeWidth) / 2
        // Preserve the original dotted embossing as tiny raised wax beads.
        if (path.userData.node.hasAttribute('stroke-dasharray')) {
          const count = Math.max(2, Math.round(curve.getLength() / 12))
          for (let bead = 0; bead <= count; bead++) {
            const dot = mesh(new THREE.SphereGeometry(radius * .68, 6, 5), ink, frontInk)
            dot.position.copy(curve.getPointAt(bead / count))
          }
        } else mesh(new THREE.TubeGeometry(curve, 160, radius, 6, false), ink, frontInk)
      })
    })
    const backInk = frontInk.clone()
    backInk.rotation.y = Math.PI
    seal.add(backInk)

    scene.add(new THREE.AmbientLight('#fff4ed', 1.5))
    const light = new THREE.DirectionalLight('#fff7e8', 2.3)
    light.position.set(-240, 350, 500)
    scene.add(light)
    // A feathered ambient shadow suits the illustrated finish without a hard cast edge.
    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = shadowCanvas.height = 128
    const context = shadowCanvas.getContext('2d')
    const fade = context.createRadialGradient(64, 64, 0, 64, 64, 64)
    fade.addColorStop(0, 'rgba(84, 58, 52, .28)')
    fade.addColorStop(.4, 'rgba(84, 58, 52, .16)')
    fade.addColorStop(1, 'rgba(84, 58, 52, 0)')
    context.fillStyle = fade
    context.fillRect(0, 0, 128, 128)
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas)
    shadowTexture.colorSpace = THREE.SRGBColorSpace
    textures.push(shadowTexture)
    const shadow = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
    materials.push(shadow)
    const ground = mesh(new THREE.PlaneGeometry(310, 38), shadow, scene)
    ground.position.set(0, -190, -80)

    const resize = () => {
      const width = host.clientWidth
      const height = host.clientHeight
      if (!width || !height) return
      camera.left = -260 * width / height
      camera.right = 260 * width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      updateMotion()
    }
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updateMotion() })
      observer.observe(host)
    }
    motion.addEventListener('change', updateMotion)
    document.addEventListener('visibilitychange', updateMotion)
    renderer.domElement.addEventListener('webglcontextlost', contextLost)
    renderer.domElement.addEventListener('pointerdown', startDrag)
    renderer.domElement.addEventListener('pointermove', drag)
    renderer.domElement.addEventListener('pointerup', endDrag)
    renderer.domElement.addEventListener('pointercancel', endDrag)
    renderer.domElement.addEventListener('lostpointercapture', endDrag)
    resize()
    panel.dataset.sealReady = 'true'
    return dispose
  } catch (error) {
    dispose()
    throw error
  }
}
