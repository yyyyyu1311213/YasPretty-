import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const COLORS = {
  cream: 0xf3e2d5,
  ivory: 0xfaece1,
  blush: 0xecb9ad,
  rose: 0xd7958e,
  deepRose: 0xb86f77,
  mauve: 0x9f6a76,
  cocoa: 0x4d332f,
  chocolate: 0x2d1b1a,
  gold: 0xcb9a5a,
  champagne: 0xe4c393,
  rug: 0xe8c6b9,
  rugInner: 0xf5e3d8,
  powder: 0xf2c9c3,
  lip: 0xb74753,
  baseTop: 0xf0d9cd,
}

const rampData = new Uint8Array([84, 150, 208, 255])
const ramp = new THREE.DataTexture(rampData, 4, 1, THREE.RedFormat)
ramp.minFilter = THREE.NearestFilter
ramp.magFilter = THREE.NearestFilter
ramp.generateMipmaps = false
ramp.needsUpdate = true

const toon = (color, extra = {}) => new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...extra })
const materials = {
  cream: toon(COLORS.cream), ivory: toon(COLORS.ivory), blush: toon(COLORS.blush),
  rose: toon(COLORS.rose), deepRose: toon(COLORS.deepRose), mauve: toon(COLORS.mauve),
  cocoa: toon(COLORS.cocoa), chocolate: toon(COLORS.chocolate), rug: toon(COLORS.rug),
  rugInner: toon(COLORS.rugInner), powder: toon(COLORS.powder), lip: toon(COLORS.lip),
  baseTop: toon(COLORS.baseTop), black: toon(0x241716),
  gold: new THREE.MeshStandardMaterial({ color: COLORS.gold, metalness: .92, roughness: .26, envMapIntensity: .9 }),
  champagne: new THREE.MeshStandardMaterial({ color: COLORS.champagne, metalness: .55, roughness: .34, envMapIntensity: .7 }),
  pearl: new THREE.MeshPhysicalMaterial({ color: 0xfff1e2, metalness: .12, roughness: .19, clearcoat: 1, clearcoatRoughness: .16, envMapIntensity: 1.1 }),
}

const outlineCache = new Map()
const vanityMaterialCache = new WeakMap()
const VANITY_MATERIAL_GRADE = .5
function outlineMaterial(thickness, color = 0x4a3330) {
  const key = `${thickness}_${color}`
  if (outlineCache.has(key)) return outlineCache.get(key)
  const material = new THREE.ShaderMaterial({
    uniforms: { uThickness: { value: thickness }, uColor: { value: new THREE.Color(color) } },
    vertexShader: `uniform float uThickness; void main(){ vec4 p=modelViewMatrix*vec4(position,1.0); vec3 n=normalize(normalMatrix*normal); p.xyz+=n*uThickness*max(2.0,-p.z); gl_Position=projectionMatrix*p; }`,
    fragmentShader: `uniform vec3 uColor; void main(){ gl_FragColor=vec4(uColor,1.0); }`,
    side: THREE.BackSide,
  })
  outlineCache.set(key, material)
  return material
}

function addOutline(mesh, thickness = .0017, color) {
  mesh.geometry.computeBoundingSphere()
  const hull = new THREE.Mesh(mesh.geometry, outlineMaterial(thickness, color))
  hull.castShadow = false
  hull.receiveShadow = false
  hull.renderOrder = -1
  mesh.add(hull)
}

function mesh(geometry, material, options = {}) {
  const item = new THREE.Mesh(geometry, material)
  if (options.position) item.position.fromArray(options.position)
  if (options.rotation) item.rotation.fromArray(options.rotation)
  if (options.scale) item.scale.fromArray(options.scale)
  item.castShadow = options.cast !== false
  item.receiveShadow = options.receive !== false
  if (options.outline) addOutline(item, options.outline, options.outlineColor)
  return item
}

function gradeVanityMaterials(root) {
  root.traverse((object) => {
    if (!object.isMesh || !object.material) return
    const grade = (material) => {
      if (!vanityMaterialCache.has(material)) {
        const toned = material.clone()
        if (toned.color) toned.color.multiplyScalar(VANITY_MATERIAL_GRADE)
        if (toned.emissive) toned.emissive.multiplyScalar(VANITY_MATERIAL_GRADE)
        if (toned.uniforms?.uColor?.value?.isColor) toned.uniforms.uColor.value.multiplyScalar(VANITY_MATERIAL_GRADE)
        vanityMaterialCache.set(material, toned)
      }
      return vanityMaterialCache.get(material)
    }
    object.material = Array.isArray(object.material) ? object.material.map(grade) : grade(object.material)
  })
  return root
}

const lathe = (points, segments = 48) => new THREE.LatheGeometry(points.map(([radius, y]) => new THREE.Vector2(radius, y)), segments)
const cylinder = (top, bottom, height, segments = 40) => new THREE.CylinderGeometry(top, bottom, height, segments)
const torus = (radius, tube, segments = 12, radialSegments = 64) => new THREE.TorusGeometry(radius, tube, segments, radialSegments)
const sphere = (radius, segments = 24) => new THREE.SphereGeometry(radius, segments, Math.max(10, segments >> 1))

function ring(group, radius, tube, y, material = materials.gold, segments = 10) {
  const bead = mesh(torus(radius, tube, segments), material, { position: [0, y, 0], rotation: [Math.PI / 2, 0, 0], cast: false })
  group.add(bead)
  return bead
}

function makeHeartShape(size) {
  const shape = new THREE.Shape()
  const x = size
  shape.moveTo(0, -x * .9)
  shape.bezierCurveTo(-x * 1.4, -x * .1, -x * 1.15, x * .85, -x * .4, x * .82)
  shape.bezierCurveTo(-x * .12, x * .8, 0, x * .55, 0, x * .35)
  shape.bezierCurveTo(0, x * .55, x * .12, x * .8, x * .4, x * .82)
  shape.bezierCurveTo(x * 1.15, x * .85, x * 1.4, -x * .1, 0, -x * .9)
  return shape
}

function canvasTexture(width, height, paint) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  paint(canvas.getContext('2d'), width, height)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function labelTexture(title, subtitle = '') {
  return canvasTexture(512, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#f7e4d7'
    ctx.fillRect(4, 4, w - 8, h - 8)
    ctx.strokeStyle = '#c49a63'
    ctx.lineWidth = 4
    ctx.strokeRect(12, 12, w - 24, h - 24)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#4a302c'
    ctx.font = '600 23px Georgia, serif'
    ctx.fillText('YASPRETTY', w / 2, 61)
    ctx.fillStyle = '#a94f5b'
    ctx.font = 'italic 50px Georgia, serif'
    ctx.fillText(title, w / 2, 139)
    ctx.fillStyle = '#4a302c'
    ctx.font = '500 19px Arial, sans-serif'
    ctx.fillText(subtitle, w / 2, 192)
  })
}

const labels = {
  foundation: labelTexture('FOUNDATION', 'LIQUID BASE'),
  concealer: labelTexture('CONCEALER', 'PERFECT COVER'),
  cushion: labelTexture('CUSHION', 'AIR FIT'),
  lipstick: labelTexture('LIPSTICK', 'VELVET MATTE'),
  powder: labelTexture('LOOSE POWDER', 'SILKY FINISH'),
  mascara: labelTexture('MASCARA', 'LASH'),
}
const compactMirror = canvasTexture(512, 512, (ctx, w, h) => {
  const gradient = ctx.createLinearGradient(0, 0, w, h)
  gradient.addColorStop(0, '#f9f5ee')
  gradient.addColorStop(.5, '#e4d9d3')
  gradient.addColorStop(1, '#c5b7b3')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(255,255,255,.38)'
  ctx.fillRect(74, 24, 130, 300)
  ctx.fillRect(286, 50, 54, 230)
})

function labelPlane(width, height, texture) {
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false }))
}

function disc(radius, y, texture) {
  return mesh(new THREE.CircleGeometry(radius, 48), new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false }), { position: [0, y, 0], rotation: [-Math.PI / 2, 0, 0], cast: false })
}

function mirrorReflectionTexture() {
  return canvasTexture(640, 900, (ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, w * .2, h)
    gradient.addColorStop(0, '#f6e4d8')
    gradient.addColorStop(.45, '#efd4c8')
    gradient.addColorStop(1, '#c79d97')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(255,251,244,.48)'
    ctx.beginPath()
    ctx.moveTo(w * .1, h * .58)
    ctx.lineTo(w * .1, h * .22)
    ctx.arc(w * .27, h * .22, w * .17, Math.PI, 0)
    ctx.lineTo(w * .44, h * .58)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = 'rgba(124,77,75,.3)'
    ctx.filter = 'blur(14px)'
    ctx.fillRect(w * .56, h * .54, w * .12, h * .28)
    ctx.fillRect(w * .72, h * .6, w * .08, h * .22)
  })
}

function buildBase() {
  const group = new THREE.Group()
  group.name = 'vanity-diorama-base'
  group.add(mesh(lathe([[0, 0], [3.55, 0], [3.75, .04], [3.87, .14], [3.88, .4], [3.8, .53], [3.66, .6], [0, .6]], 80), materials.cream))
  group.add(mesh(new THREE.CircleGeometry(3.66, 64), materials.baseTop, { position: [0, .602, 0], rotation: [-Math.PI / 2, 0, 0], cast: false }))
  ring(group, 3.83, .026, .035, materials.cocoa)
  ring(group, 3.82, .014, .105, materials.champagne)
  ring(group, 3.79, .012, .502, materials.champagne)
  ring(group, 2.9, .009, .607, materials.champagne)
  const beadGeometry = sphere(.042, 14)
  const beads = new THREE.InstancedMesh(beadGeometry, materials.pearl, 64)
  const dummy = new THREE.Object3D()
  for (let index = 0; index < 64; index += 1) {
    const angle = index / 64 * Math.PI * 2
    dummy.position.set(Math.cos(angle) * 3.8, .575, Math.sin(angle) * 3.8)
    dummy.updateMatrix()
    beads.setMatrixAt(index, dummy.matrix)
  }
  beads.castShadow = false
  beads.receiveShadow = false
  group.add(beads)
  const shade = canvasTexture(256, 256, (ctx) => {
    const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 128)
    gradient.addColorStop(0, 'rgba(85,48,42,.22)')
    gradient.addColorStop(1, 'rgba(85,48,42,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)
  })
  group.add(mesh(new THREE.PlaneGeometry(9.4, 8.4), new THREE.MeshBasicMaterial({ map: shade, transparent: true, depthWrite: false, toneMapped: false }), { position: [0, -.015, 0], rotation: [-Math.PI / 2, 0, 0], cast: false }))
  return group
}

function buildRug() {
  const group = new THREE.Group()
  group.name = 'vanity-rug'
  group.position.z = .12
  group.add(mesh(new THREE.CircleGeometry(1, 64), materials.rug, { position: [0, .616, 0], rotation: [-Math.PI / 2, 0, 0], scale: [3.28, 2.92, 1], cast: false }))
  group.add(mesh(new THREE.CircleGeometry(1, 64), materials.rugInner, { position: [0, .619, 0], rotation: [-Math.PI / 2, 0, 0], scale: [2.9, 2.56, 1], cast: false }))
  group.add(mesh(torus(1, .011, 8, 64), materials.champagne, { position: [0, .622, 0], rotation: [-Math.PI / 2, 0, 0], scale: [3.1, 2.74, 1], cast: false }))
  const dots = new THREE.InstancedMesh(sphere(.038, 10), materials.ivory, 84)
  const dummy = new THREE.Object3D()
  for (let index = 0; index < 84; index += 1) {
    const angle = index / 84 * Math.PI * 2
    dummy.position.set(Math.cos(angle) * 3.3, .612, Math.sin(angle) * 2.95)
    dummy.scale.set(1, .55, 1)
    dummy.updateMatrix()
    dots.setMatrixAt(index, dummy.matrix)
  }
  dots.castShadow = false
  dots.receiveShadow = false
  group.add(dots)
  return group
}

function buildTable() {
  const group = new THREE.Group()
  group.name = 'vanity-table-model'
  group.add(mesh(cylinder(2.48, 2.56, .2, 72), materials.cream, { position: [0, 2.52, 0], outline: .0014 }))
  group.add(mesh(cylinder(2.49, 2.49, .055, 72), materials.ivory, { position: [0, 2.626, 0], cast: false }))
  ring(group, 2.535, .024, 2.52, materials.champagne)
  ring(group, 1.9, .008, 2.655, materials.rose)
  ring(group, 1.2, .008, 2.655, materials.rose)
  group.add(mesh(cylinder(2.36, 2.4, .18, 72), materials.blush, { position: [0, 2.33, 0] }))
  ring(group, 2.35, .022, 2.238, materials.cream)
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(.045, -.32, 0), new THREE.Vector3(.16, -.72, 0),
    new THREE.Vector3(.17, -1.12, 0), new THREE.Vector3(.075, -1.48, 0), new THREE.Vector3(.015, -1.7, 0),
  ])
  const legGeometry = new THREE.TubeGeometry(curve, 32, .085, 10, false)
  for (let index = 0; index < 4; index += 1) {
    const angle = Math.PI / 4 + index * Math.PI / 2
    const leg = new THREE.Group()
    leg.position.set(Math.cos(angle) * 1.82, 2.43, Math.sin(angle) * 1.82)
    leg.rotation.y = -angle
    leg.add(mesh(legGeometry, materials.cocoa, { outline: .0015, outlineColor: 0x221413 }))
    leg.add(mesh(torus(.094, .014, 10, 48), materials.gold, { position: [.075, -1.5, 0], rotation: [Math.PI / 2, 0, 0] }))
    leg.add(mesh(sphere(.11, 20), materials.champagne, { position: [.015, -1.735, 0], scale: [1, .72, 1], outline: .0018 }))
    group.add(leg)
  }
  group.add(mesh(new THREE.ConeGeometry(.075, .16, 20), materials.champagne, { position: [0, 2.16, 0] }))
  return group
}

function buildMirror() {
  const group = new THREE.Group()
  group.name = 'vanity-mirror-model'
  group.position.set(0, 0, -1.32)
  group.add(mesh(new RoundedBoxGeometry(1.35, .085, .44, 4, .035), materials.chocolate, { position: [0, 2.67, 0], outline: .0014 }))
  group.add(mesh(new RoundedBoxGeometry(1.16, .028, .32, 3, .02), materials.champagne, { position: [0, 2.718, 0] }))
  for (const side of [-1, 1]) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * .52, 2.7, 0), new THREE.Vector3(side * .66, 3, .02),
      new THREE.Vector3(side * .86, 3.3, .04), new THREE.Vector3(side * .98, 3.66, .06),
    ])
    group.add(mesh(new THREE.TubeGeometry(curve, 28, .042, 8), materials.gold, { outline: .0016, outlineColor: 0x5c3f28 }))
    group.add(mesh(sphere(.078, 20), materials.gold, { position: [side * .98, 3.67, .06] }))
  }
  const frame = new THREE.Group()
  frame.position.set(0, 3.98, .06)
  frame.rotation.x = -.055
  frame.add(mesh(torus(.98, .066, 14, 64), materials.chocolate, { scale: [1, 1.2, 1], outline: .0013, outlineColor: 0x170e0d }))
  frame.add(mesh(torus(.912, .022, 10, 64), materials.champagne, { scale: [1, 1.2, 1], position: [0, 0, .045] }))
  frame.add(mesh(new THREE.CircleGeometry(.97, 48), new THREE.MeshBasicMaterial({ color: COLORS.chocolate, side: THREE.DoubleSide }), { scale: [1, 1.2, 1], position: [0, 0, -.045] }))
  const glass = new THREE.Mesh(new THREE.CircleGeometry(.9, 48), new THREE.MeshBasicMaterial({ map: mirrorReflectionTexture(), color: 0xf0d8cc, toneMapped: false }))
  glass.scale.set(1, 1.2, 1)
  glass.position.z = .012
  frame.add(glass)
  frame.add(mesh(torus(.82, .011, 8, 64), materials.champagne, { scale: [1, 1.2, 1], position: [0, 0, -.052], cast: false }))
  frame.add(mesh(new THREE.ExtrudeGeometry(makeHeartShape(.15), { depth: .035, bevelEnabled: true, bevelSize: .012, bevelThickness: .01, bevelSegments: 2, curveSegments: 18 }), materials.gold, { position: [0, 1.33, 0], outline: .0013, outlineColor: 0x5c3f28 }))
  group.add(frame)
  return group
}

function buildStool() {
  const group = new THREE.Group()
  group.name = 'vanity-stool'
  group.position.set(-.85, 0, 2.9)
  group.rotation.y = .2
  group.add(mesh(lathe([[0, .8], [.56, .8], [.7, .86], [.76, 1], [.75, 1.14], [.71, 1.24], [.64, 1.32], [.5, 1.39], [.3, 1.44], [0, 1.46]], 56), materials.blush, { outline: .0017 }))
  group.add(mesh(cylinder(.585, .59, .075, 48), materials.rose, { position: [0, .815, 0] }))
  ring(group, .72, .02, 1.2, materials.ivory).castShadow = false
  group.add(mesh(new THREE.ExtrudeGeometry(makeHeartShape(.062), { depth: .018, bevelEnabled: true, bevelSize: .006, bevelThickness: .004, bevelSegments: 2, curveSegments: 14 }), materials.gold, { position: [.12, .99, .742], outline: .0011, outlineColor: 0x5c3f28 }))
  group.add(mesh(sphere(.065, 18), materials.gold, { position: [0, 1.462, 0], scale: [1, .55, 1] }))
  for (let index = 0; index < 14; index += 1) {
    const angle = index / 14 * Math.PI * 2
    group.add(mesh(sphere(1, 14), materials.blush, { position: [Math.cos(angle) * .64, .88, Math.sin(angle) * .64], rotation: [0, -angle, 0], scale: [.16, .13, .07], cast: false }))
  }
  for (let index = 0; index < 4; index += 1) {
    const angle = Math.PI / 4 + index * Math.PI / 2
    const leg = mesh(cylinder(.042, .052, .28, 16), materials.gold, { position: [Math.cos(angle) * .5, .75, Math.sin(angle) * .5], outline: .002, outlineColor: 0x5c3f28 })
    leg.rotation.z = Math.cos(angle) * .24
    leg.rotation.x = -Math.sin(angle) * .24
    group.add(leg)
    group.add(mesh(sphere(.072, 14), materials.champagne, { position: [Math.cos(angle) * .62, .655, Math.sin(angle) * .62], scale: [1, .65, 1] }))
  }
  const shade = canvasTexture(128, 128, (ctx) => {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    gradient.addColorStop(0, 'rgba(84,50,44,.3)')
    gradient.addColorStop(1, 'rgba(84,50,44,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 128, 128)
  })
  group.add(mesh(new THREE.PlaneGeometry(1.85, 1.85), new THREE.MeshBasicMaterial({ map: shade, transparent: true, depthWrite: false, toneMapped: false }), { position: [0, .624, 0], rotation: [-Math.PI / 2, 0, 0], cast: false }))
  return group
}

function buildTrinketDish() {
  const group = new THREE.Group()
  group.name = 'vanity-trinket-dish'
  group.add(mesh(new THREE.ExtrudeGeometry(makeHeartShape(.34), { depth: .025, bevelEnabled: true, bevelSize: .012, bevelThickness: .008, bevelSegments: 2, curveSegments: 22 }), materials.champagne, { position: [0, .012, 0], rotation: [-Math.PI / 2, 0, 0], outline: .0014 }))
  group.add(mesh(new THREE.ExtrudeGeometry(makeHeartShape(.31), { depth: .05, bevelEnabled: true, bevelSize: .015, bevelThickness: .012, bevelSegments: 2, curveSegments: 22 }), materials.ivory, { position: [0, .035, 0], rotation: [-Math.PI / 2, 0, 0], outline: .0014 }))
  group.add(mesh(new THREE.ExtrudeGeometry(makeHeartShape(.235), { depth: .012, bevelEnabled: true, bevelSize: .008, bevelThickness: .005, bevelSegments: 2, curveSegments: 20 }), materials.rose, { position: [0, .078, 0], rotation: [-Math.PI / 2, 0, 0], cast: false }))
  group.add(mesh(sphere(.072, 20), materials.pearl, { position: [.06, .12, .02] }))
  group.add(mesh(sphere(.052, 18), materials.pearl, { position: [-.09, .112, .07] }))
  group.add(mesh(torus(.085, .014, 8, 32), materials.gold, { position: [.02, .115, -.08], rotation: [Math.PI / 2 + .22, .2, 0] }))
  group.position.set(2.3, .632, 2.66)
  group.rotation.y = -.28
  group.scale.setScalar(.98)
  return group
}

function buildPetals() {
  const group = new THREE.Group()
  group.name = 'vanity-petals'
  const spots = [[2.65, .63, 1.72, .4], [2.15, .63, 2.32, -.7], [-2.5, .63, 1.92, 1.2], [-3.05, .63, .6, 2.3], [3.2, .63, -.42, -1.5], [-1.9, .63, 2.6, .9]]
  spots.forEach(([x, y, z, rotation], index) => {
    group.add(mesh(sphere(1, 16), index % 2 ? materials.rose : materials.blush, { position: [x, y, z], rotation: [0, rotation, 0], scale: [.12, .018, .062], outline: .001, outlineColor: 0x7d4f4d }))
    group.add(mesh(new THREE.BoxGeometry(.11, .006, .008), materials.deepRose, { position: [x, y + .006, z], rotation: [0, rotation + .2, 0], cast: false }))
  })
  return group
}

function addItemLabel(group, title, subtitle, width, height) {
  const plane = labelPlane(width, height, labelTexture(title, subtitle))
  plane.position.set(0, height / 2, .36)
  group.add(plane)
}

function buildFoundation() {
  const group = new THREE.Group()
  group.add(mesh(lathe([[0, 0], [.3, 0], [.345, .035], [.35, .6], [.34, .72], [.27, .85], [.18, .94], [.16, 1.02]], 56), materials.blush, { outline: .0019 }))
  ring(group, .352, .008, .075, materials.champagne)
  ring(group, .345, .008, .71, materials.champagne)
  const label = labelPlane(.43, .31, labels.foundation)
  label.position.set(0, .43, .352)
  group.add(label)
  group.add(mesh(cylinder(.17, .17, .085, 40), materials.gold, { position: [0, 1.058, 0], outline: .0018 }))
  group.add(mesh(cylinder(.105, .12, .075, 32), materials.cream, { position: [0, 1.116, 0] }))
  group.add(mesh(cylinder(.038, .038, .11, 16), materials.gold, { position: [0, 1.165, 0] }))
  group.add(mesh(new RoundedBoxGeometry(.34, .13, .17, 4, .052), materials.gold, { position: [.055, 1.235, 0], outline: .0018, outlineColor: 0x6d4b30 }))
  group.add(mesh(cylinder(.032, .032, .11, 16), materials.gold, { position: [-.165, 1.225, 0], rotation: [0, 0, Math.PI / 2] }))
  group.add(mesh(sphere(.038, 16), materials.cream, { position: [.055, 1.305, 0] }))
  return group
}

function buildConcealer() {
  const group = new THREE.Group()
  group.add(mesh(cylinder(.105, .115, .52, 32), materials.cream, { position: [0, .26, 0], outline: .0018 }))
  group.add(mesh(cylinder(.12, .12, .3, 32), materials.rose, { position: [0, .67, 0], outline: .0018 }))
  group.add(mesh(sphere(.12, 28), materials.rose, { position: [0, .82, 0], scale: [1, .42, 1], outline: .0018 }))
  ring(group, .12, .009, .525, materials.gold)
  ring(group, .118, .009, .56, materials.champagne)
  const label = labelPlane(.145, .235, labels.concealer)
  label.position.set(0, .29, .112)
  group.add(label)
  group.add(mesh(new THREE.ExtrudeGeometry(makeHeartShape(.032), { depth: .012, bevelEnabled: true, bevelSize: .005, bevelThickness: .004, bevelSegments: 2, curveSegments: 12 }), materials.gold, { position: [0, .66, .123], outline: .001, outlineColor: 0x6d4b30 }))
  return group
}

function buildBlush() {
  const group = new THREE.Group()
  group.add(mesh(cylinder(.44, .45, .17, 60), materials.rose, { position: [0, .085, 0], outline: .0018 }))
  ring(group, .442, .016, .17, materials.champagne)
  group.add(mesh(cylinder(.352, .352, .045, 56), materials.powder, { position: [0, .185, 0], outline: .0014 }))
  group.add(mesh(new THREE.ExtrudeGeometry(makeHeartShape(.13), { depth: .018, bevelEnabled: true, bevelSize: .008, bevelThickness: .006, bevelSegments: 2, curveSegments: 24 }), materials.rose, { position: [0, .19, .015], rotation: [-Math.PI / 2, 0, 0] }))
  const lid = new THREE.Group()
  lid.position.set(0, .175, -.41)
  lid.add(mesh(cylinder(.44, .44, .08, 60), materials.rose, { position: [0, 0, .41], outline: .0018 }))
  lid.add(mesh(torus(.438, .015, 10, 64), materials.champagne, { position: [0, 0, .41], rotation: [Math.PI / 2, 0, 0] }))
  lid.add(mesh(new THREE.CircleGeometry(.36, 56), new THREE.MeshBasicMaterial({ map: compactMirror, toneMapped: false }), { position: [0, -.041, .41], rotation: [Math.PI / 2, 0, 0] }))
  lid.rotation.x = -1.92
  group.add(lid)
  group.add(mesh(cylinder(.036, .036, .62, 20), materials.gold, { position: [0, .175, -.41], rotation: [0, 0, Math.PI / 2] }))
  return group
}

function bulletGeometry(radius, height, slant) {
  const geometry = new THREE.CylinderGeometry(radius * .94, radius, height, 36, 6)
  const positions = geometry.attributes.position
  for (let index = 0; index < positions.count; index += 1) {
    const y = positions.getY(index)
    if (y > height / 2 - .0002) positions.setY(index, y - (positions.getZ(index) + radius) * slant)
  }
  positions.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

function buildLipstick() {
  const group = new THREE.Group()
  group.add(mesh(cylinder(.145, .155, .5, 40), materials.ivory, { position: [0, .25, 0], outline: .0018 }))
  ring(group, .148, .012, .045, materials.gold)
  ring(group, .146, .012, .47, materials.gold)
  group.add(mesh(cylinder(.149, .149, .06, 40), materials.rose, { position: [0, .12, 0] }))
  const label = labelPlane(.15, .24, labels.lipstick)
  label.position.set(0, .29, .15)
  group.add(label)
  group.add(mesh(cylinder(.132, .132, .09, 36), materials.champagne, { position: [0, .53, 0], outline: .0016 }))
  const bullet = mesh(bulletGeometry(.115, .34, .85), materials.lip, { position: [0, .74, 0], outline: .0018 })
  group.add(bullet)
  return group
}

function buildCushion() {
  const group = new THREE.Group()
  group.add(mesh(cylinder(.47, .48, .19, 64), materials.rose, { position: [0, .095, 0], outline: .0018 }))
  ring(group, .472, .017, .19, materials.champagne)
  group.add(mesh(cylinder(.39, .39, .035, 56), materials.cream, { position: [0, .205, 0], outline: .0014 }))
  const dots = canvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = '#f5ddd0'; ctx.fillRect(0, 0, 256, 256); ctx.fillStyle = 'rgba(190,130,122,.3)'
    for (let y = 14; y < 256; y += 18) for (let x = 14; x < 256; x += 18) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill() }
  })
  group.add(disc(.382, .224, dots))
  group.add(mesh(sphere(.32, 40), materials.ivory, { position: [.04, .24, .015], scale: [1, .26, 1], outline: .0016 }))
  group.add(mesh(new RoundedBoxGeometry(.56, .018, .075, 3, .008), materials.deepRose, { position: [.04, .305, .015], rotation: [0, .25, 0] }))
  const lid = new THREE.Group()
  lid.position.set(0, .19, -.45)
  lid.add(mesh(cylinder(.47, .47, .085, 64), materials.rose, { position: [0, 0, .45], outline: .0018 }))
  lid.add(mesh(torus(.468, .017, 10, 64), materials.champagne, { position: [0, 0, .45], rotation: [Math.PI / 2, 0, 0] }))
  lid.add(mesh(new THREE.CircleGeometry(.39, 56), new THREE.MeshBasicMaterial({ map: compactMirror, toneMapped: false }), { position: [0, -.043, .45], rotation: [Math.PI / 2, 0, 0] }))
  lid.rotation.x = -1.66
  group.add(lid)
  group.add(mesh(cylinder(.036, .036, .66, 20), materials.gold, { position: [0, .19, -.45], rotation: [0, 0, Math.PI / 2] }))
  return group
}

function buildPowder() {
  const group = new THREE.Group()
  group.add(mesh(lathe([[0, 0], [.29, 0], [.36, .03], [.385, .1], [.395, .48], [.38, .54], [.33, .57]], 56), materials.blush, { outline: .0019 }))
  ring(group, .395, .012, .06, materials.champagne)
  ring(group, .39, .014, .47, materials.gold)
  ring(group, .335, .012, .555, materials.gold)
  group.add(mesh(cylinder(.397, .397, .13, 56), materials.rose, { position: [0, .15, 0] }))
  ring(group, .398, .008, .085, materials.champagne)
  ring(group, .398, .008, .215, materials.champagne)
  group.add(mesh(cylinder(.33, .33, .02, 48), materials.cream, { position: [0, .552, 0], cast: false }))
  const sieve = canvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = '#f3dcc7'; ctx.fillRect(0, 0, 256, 256); ctx.fillStyle = 'rgba(140,98,80,.38)'
    for (let y = 18; y < 256; y += 22) for (let x = 18; x < 256; x += 22) { ctx.beginPath(); ctx.arc(x + ((y / 22) % 2) * 11, y, 3.2, 0, Math.PI * 2); ctx.fill() }
  })
  group.add(mesh(new THREE.CircleGeometry(.325, 48), new THREE.MeshToonMaterial({ map: sieve, gradientMap: ramp }), { position: [0, .563, 0], rotation: [-Math.PI / 2, 0, 0], cast: false }))
  group.add(mesh(sphere(.3, 40), materials.ivory, { position: [0, .615, .02], scale: [1, .26, 1], outline: .0016 }))
  group.add(mesh(new RoundedBoxGeometry(.52, .018, .07, 3, .008), materials.deepRose, { position: [0, .676, .02], rotation: [0, -.35, 0] }))
  ring(group, .332, .013, .574, materials.gold)
  const label = labelPlane(.37, .235, labels.powder)
  label.position.set(0, .34, .397)
  group.add(label)
  return group
}

function buildEyeshadow() {
  const group = new THREE.Group()
  group.add(mesh(new RoundedBoxGeometry(1.34, .045, .82, 4, .035), materials.champagne, { position: [0, .025, 0] }))
  group.add(mesh(new RoundedBoxGeometry(1.3, .12, .78, 4, .035), materials.cocoa, { position: [0, .065, 0], outline: .0017, outlineColor: 0x221413 }))
  group.add(mesh(new RoundedBoxGeometry(1.16, .045, .64, 3, .025), materials.ivory, { position: [0, .138, 0] }))
  const colors = [0xf6e2d0, 0xefbda9, 0xde9c9f, 0xba818a, 0x7c5552, 0xd8b078]
  let colorIndex = 0
  for (const z of [-.17, .17]) for (const x of [-.38, 0, .38]) {
    const shadowMaterial = colorIndex === 5 ? new THREE.MeshStandardMaterial({ color: colors[colorIndex], metalness: .55, roughness: .3 }) : toon(colors[colorIndex])
    group.add(mesh(cylinder(.136, .136, .045, 40), shadowMaterial, { position: [x, .17, z], outline: .0013 }))
    const trim = mesh(torus(.139, .006, 8, 64), materials.champagne, { position: [x, .193, z], rotation: [Math.PI / 2, 0, 0], cast: false })
    group.add(trim)
    colorIndex += 1
  }
  const lid = new THREE.Group()
  lid.position.set(0, .125, -.4)
  lid.add(mesh(new RoundedBoxGeometry(1.32, .1, .8, 4, .04), materials.cocoa, { position: [0, 0, .4], outline: .0017, outlineColor: 0x221413 }))
  lid.add(mesh(new RoundedBoxGeometry(1.36, .03, .84, 4, .035), materials.champagne, { position: [0, 0, .4] }))
  lid.add(mesh(new THREE.PlaneGeometry(1.02, .48), new THREE.MeshBasicMaterial({ map: compactMirror, toneMapped: false }), { position: [0, -.062, .4], rotation: [Math.PI / 2, 0, 0] }))
  lid.rotation.x = -2.05
  group.add(lid)
  group.add(mesh(cylinder(.028, .028, 1.24, 16), materials.gold, { position: [0, .125, -.4], rotation: [0, 0, Math.PI / 2] }))
  return group
}

function buildMascara() {
  const group = new THREE.Group()
  group.add(mesh(lathe([[0, 0], [.085, 0], [.1, .03], [.1, .45], [.095, .52], [.075, .56]], 40), materials.chocolate, { outline: .0018 }))
  ring(group, .1, .009, .06, materials.champagne)
  ring(group, .098, .012, .53, materials.gold)
  group.add(mesh(cylinder(.125, .128, .34, 12), materials.deepRose, { position: [0, .72, 0], outline: .0018 }))
  group.add(mesh(sphere(.125, 20), materials.deepRose, { position: [0, .89, 0], scale: [1, .35, 1], outline: .0018 }))
  const label = labelPlane(.105, .29, labels.mascara)
  label.position.set(0, .29, .102)
  group.add(label)
  ring(group, .128, .01, .555, materials.gold)
  ring(group, .126, .008, .865, materials.champagne)
  return group
}

const builders = {
  foundation: buildFoundation,
  concealer: buildConcealer,
  blush: buildBlush,
  lipstick: buildLipstick,
  cushion: buildCushion,
  powder: buildPowder,
  eyeshadow: buildEyeshadow,
  mascara: buildMascara,
}

export const VANITY_MODEL_SCALE = .34
export const VANITY_PRODUCT_LAYOUT = {
  foundation: [-1.45, 2.655, -.65],
  concealer: [-1.85, 2.655, .25],
  blush: [-1.15, 2.655, 1.15],
  lipstick: [0, 2.655, 1.7],
  cushion: [1.15, 2.655, 1.15],
  powder: [1.65, 2.655, .1],
  eyeshadow: [0, 2.655, .25],
  mascara: [1.5, 2.655, -.75],
}

export function createVanitySceneModel() {
  const group = new THREE.Group()
  group.name = 'new-vanity-scene-model'
  const scaledModel = new THREE.Group()
  scaledModel.name = 'vanity-model-scale'
  scaledModel.scale.setScalar(VANITY_MODEL_SCALE)
  scaledModel.add(buildBase(), buildRug(), buildTable(), buildMirror(), buildStool(), buildTrinketDish(), buildPetals())
  const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xffc8b8, transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false })
  const glow = new THREE.Mesh(new THREE.TorusGeometry(2.4, .018, 8, 96), glowMaterial)
  glow.rotation.x = Math.PI / 2
  glow.position.y = 2.56
  glow.name = 'vanity-underglow'
  scaledModel.add(glow)
  group.add(scaledModel)
  return gradeVanityMaterials(group)
}

export function createVanityCosmetic(kind) {
  const build = builders[kind]
  if (!build) throw new Error(`Unknown vanity cosmetic: ${kind}`)
  const group = build()
  const root = new THREE.Group()
  root.name = `vanity-cosmetic-${kind}`
  group.name = `vanity-cosmetic-model-${kind}`
  group.scale.setScalar(VANITY_MODEL_SCALE * .9)
  root.add(group)
  return gradeVanityMaterials(root)
}

export function vanityProductPosition(kind, center) {
  const local = VANITY_PRODUCT_LAYOUT[kind]
  if (!local) throw new Error(`Unknown vanity product layout: ${kind}`)
  return center.map((value, axis) => value + local[axis] * VANITY_MODEL_SCALE)
}
