import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || '../../.qa/playwright/node_modules/playwright/index.mjs')

const baseUrl = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5174/'
const output = path.resolve('.qa/beauty-shop')
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' })

try {
  const opening = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await opening.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.abort())
  const openingStarted = Date.now()
  await opening.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await opening.locator('.beauty-shop-frame').waitFor({ timeout: 15000 })
  const frameMountedDuringOpening = await opening.locator('.brand-opening').isVisible()
  await opening.waitForFunction(() => document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop?.intro.paused === true, { timeout: 15000 })
  await opening.locator('.brand-opening').waitFor({ state: 'hidden', timeout: 15000 })
  const stageAfterOpening = await opening.locator('.beauty-shop-stage').getAttribute('data-stage')
  assert.equal(frameMountedDuringOpening, true)
  assert.equal(stageAfterOpening, 'shop')
  assert.equal(await opening.locator('.beauty-shop-loading').count(), 0)
  await opening.waitForFunction(() => document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop?.intro.paused === false, { timeout: 3000 })
  const openingMs = Date.now() - openingStarted
  const introAtReveal = await opening.frameLocator('.beauty-shop-frame').locator('#beautyShop3d canvas').evaluate(() => ({
    active: window.BeautyShop.intro.active,
    elapsed: window.BeautyShop.intro.elapsed,
    position: window.BeautyShop.camera.position.toArray(),
    fov: window.BeautyShop.camera.fov,
  }))
  assert.equal(introAtReveal.active, true)
  assert(introAtReveal.elapsed < 1.5, `intro skipped ahead to ${introAtReveal.elapsed}s`)
  await opening.waitForFunction(() => document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop?.intro.elapsed >= 2.9, { timeout: 12000 })
  const fixtureRise = await opening.frameLocator('.beauty-shop-frame').locator('#beautyShop3d canvas').evaluate(() => {
    const shop = window.BeautyShop
    return { elapsed: shop.intro.elapsed, y: shop.scene.getObjectByName('shop-fixtures').position.y, position: shop.camera.position.toArray() }
  })
  assert(fixtureRise.y < -0.01, `fixtures did not rise during intro: ${JSON.stringify(fixtureRise)}`)
  assert(Math.hypot(...fixtureRise.position.map((value, index) => value - introAtReveal.position[index])) > 0.1, 'camera should breathe during scene growth')
  await opening.screenshot({ path: path.join(output, '1440-fixture-rise.png') })
  await opening.waitForFunction(() => document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop?.intro.active === false, { timeout: 12000 })
  await opening.waitForFunction(() => {
    const shop = document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop
    return shop?.camera.fov < 44.2
  }, { timeout: 3000 })
  const peakFov = await opening.frameLocator('.beauty-shop-frame').locator('canvas').evaluate(() => window.BeautyShop.camera.fov)
  await opening.waitForFunction(() => {
    const shop = document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop
    return shop?.camera.fov > 46.4
  }, { timeout: 3000 })
  const finalFov = await opening.frameLocator('.beauty-shop-frame').locator('canvas').evaluate(() => window.BeautyShop.camera.fov)
  assert(peakFov < introAtReveal.fov - 4.5 && finalFov > peakFov + 2 && finalFov < introAtReveal.fov - 2,
    `camera should zoom in and settle halfway back: ${introAtReveal.fov} -> ${peakFov} -> ${finalFov}`)
  const sceneCost = await opening.frameLocator('.beauty-shop-frame').locator('#beautyShop3d canvas').evaluate(() => ({
    rain: Boolean(window.BeautyShop.scene.getObjectByName('rain')),
    wetGround: Boolean(window.BeautyShop.scene.getObjectByName('wet-ground-mirror')),
    drawCalls: window.BeautyShop.renderer.info.render.calls,
  }))
  assert.equal(sceneCost.rain, false)
  assert.equal(sceneCost.wetGround, false)
  await opening.waitForTimeout(750)
  const countFrames = () => opening.frameLocator('.beauty-shop-frame').locator('#beautyShop3d canvas').evaluate(async () => {
    const renderer = window.BeautyShop.renderer
    const original = renderer.render
    let frames = 0
    renderer.render = function (...args) {
      frames += 1
      return original.apply(this, args)
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
    renderer.render = original
    return frames
  })
  const idleFrames = await countFrames()
  assert(idleFrames <= 40, `idle scene rendered ${idleFrames} frames in one second`)
  await opening.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await opening.waitForTimeout(300)
  const offscreenFrames = await countFrames()
  assert(offscreenFrames <= 2, `offscreen scene rendered ${offscreenFrames} frames in one second`)
  await opening.evaluate(() => window.scrollTo(0, 0))
  await opening.screenshot({ path: path.join(output, '1440-natural-opening.png'), animations: 'disabled' })
  console.log(`natural opening: ${openingMs}ms to visible shop, animated fixture rise verified, ${sceneCost.drawCalls} draw calls, ${idleFrames} idle and ${offscreenFrames} offscreen frames/s`)
  await opening.close()

  for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce' })
    await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.abort())
    const pageErrors = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
    await page.locator('.brand-opening').waitFor({ state: 'hidden' })
    await page.locator('.beauty-shop-stage[data-stage="shop"]').waitFor({ timeout: 30000 })
    const frame = page.frameLocator('.beauty-shop-frame')
    await frame.locator('#beautyShop3d canvas').waitFor()
    await page.waitForFunction(() => document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop?.intro.active === false, { timeout: 30000 })
    if (viewport.width > viewport.height) {
      const distance = await frame.locator('canvas').evaluate(() => {
        const { camera, controls } = window.BeautyShop
        return camera.position.distanceTo(controls.target)
      })
      assert(distance < 20, `initial street camera is too distant: ${distance}`)
    }
    const shopProductLayout = await frame.locator('#beautyShop3d canvas').evaluate(() => window.BeautyShop.categoryObjects.map((object) => ({
      distanceFromVanity: object.position.distanceTo(object.userData.gatherTarget),
      position: object.position.toArray(),
    })))
    assert.equal(shopProductLayout.length, 8)
    assert(shopProductLayout.every((item) => item.distanceFromVanity > 1), `products should be scattered around the shop: ${JSON.stringify(shopProductLayout)}`)
    const brightness = await frame.locator('#beautyShop3d canvas').evaluate((canvas) => {
      const shop = window.BeautyShop
      shop.renderer.render(shop.scene, shop.camera)
      const gl = shop.renderer.getContext()
      const pixel = new Uint8Array(4)
      const values = []
      for (const y of [0.2, 0.4, 0.6, 0.8]) {
        for (const x of [0.2, 0.4, 0.6, 0.8]) {
          gl.readPixels(Math.floor(canvas.width * x), Math.floor(canvas.height * y), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
          values.push((pixel[0] + pixel[1] + pixel[2]) / 3)
        }
      }
      return Math.max(...values) - Math.min(...values)
    })
    assert(brightness > 35, `${viewport.width}px canvas brightness range ${brightness}`)
    assert.equal(await page.locator('.beauty-shop-categories').count(), 0)
    await page.screenshot({ path: path.join(output, `${viewport.width}-shop.png`), animations: 'disabled' })

    const projected = await frame.locator('#beautyShop3d canvas').evaluate((canvas) => {
      const shop = window.BeautyShop
      if (shop.interactiveObjects[0] !== shop.shop) throw new Error('the whole storefront should be the shop interaction target')
      const target = shop.scene.getObjectByName('vanity')
      const point = target.getWorldPosition(new shop.THREE.Vector3()).add(new shop.THREE.Vector3(0, 0.5, 0)).project(shop.camera)
      return { x: (point.x + 1) * canvas.clientWidth / 2, y: (1 - point.y) * canvas.clientHeight / 2 }
    })
    const bounds = await page.locator('.beauty-shop-frame').boundingBox()
    await page.mouse.move(bounds.x + projected.x, bounds.y + projected.y)
    await page.waitForFunction(() => document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop?.shop.scale.x > 1.05)
    await frame.locator('canvas').evaluate(() => {
      const shop = window.BeautyShop
      window.motionSamples = []
      function sample() {
        const progress = shop.categoryGatherProgress
        if (progress >= .34 && progress <= .66) {
          shop.scene.updateMatrixWorld(true)
          window.motionSamples.push(shop.categoryObjects.map((object) => {
            const box = new shop.THREE.Box3().setFromObject(object.children[0])
            const corners = []
            for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
              corners.push(new shop.THREE.Vector3(x, y, z).project(shop.camera))
            }
            return { category: object.userData.category, top: box.max.y, visible: corners.every((p) => Math.abs(p.x) < .96 && Math.abs(p.y) < .96 && p.z > -1 && p.z < 1) }
          }))
        }
        if (progress < 1) requestAnimationFrame(sample)
      }
      requestAnimationFrame(sample)
    })
    await page.mouse.click(bounds.x + projected.x, bounds.y + projected.y)
    await page.locator('.beauty-shop-stage[data-stage="transition"]').waitFor()
    await page.waitForFunction(() => {
      const progress = document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop?.categoryGatherProgress
      return progress >= .38 && progress < .66
    })
    const spiralDescent = await frame.locator('#beautyShop3d canvas').evaluate(() => {
      const shop = window.BeautyShop
      const object = shop.categoryObjects[0]
      return {
        progress: shop.categoryGatherProgress,
        y: object.getWorldPosition(new shop.THREE.Vector3()).y,
        startY: object.userData.gatherStart.y,
      }
    })
    assert(spiralDescent.y > spiralDescent.startY + 2.5, `category did not descend from above: ${JSON.stringify(spiralDescent)}`)
    await page.screenshot({ path: path.join(output, `${viewport.width}-transition.png`), animations: 'disabled' })
    await page.locator('.beauty-shop-stage[data-stage="vanity"]').waitFor({ timeout: 12000 })
    const motionSamples = await frame.locator('canvas').evaluate(() => window.motionSamples)
    assert(motionSamples.length >= 3, 'capture several frames of the airborne circle')
    assert(motionSamples.flat().every((item) => item.top < 4.7 && item.visible), `orbit must stay near the roof and inside the viewport: ${JSON.stringify(motionSamples.filter((items) => items.some((item) => item.top >= 4.7 || !item.visible)))}`)
    const backBox = await page.locator('.beauty-shop-back').boundingBox()
    const titleBox = await page.locator('.makeup-table-intro-title').boundingBox()
    assert(backBox.y >= titleBox.y + titleBox.height + 8, 'return button must sit below the title with a gap')
    const layout = await frame.locator('canvas').evaluate(() => {
      const { THREE, scene, categoryObjects } = window.BeautyShop
      scene.updateMatrixWorld(true)
      const vanity = scene.getObjectByName('vanity')
      const table = vanity.getObjectByName('vanity-table-model')
      const center = table.getWorldPosition(new THREE.Vector3())
      const scale = table.getWorldScale(new THREE.Vector3()).x
      const surfaceY = center.y + 2.6535 * scale
      const mirror = new THREE.Box3().setFromObject(vanity.getObjectByName('vanity-mirror-model'))
      const boxes = categoryObjects.map((root) => {
        // Measure physical geometry only; labels are billboards, not collision volumes.
        const model = root.children.find((child) => child.name.startsWith('vanity-cosmetic-model-'))
        const box = new THREE.Box3().setFromObject(model)
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(root.getWorldQuaternion(new THREE.Quaternion()))
        return { category: root.userData.category, box, upright: up.distanceTo(new THREE.Vector3(0, 1, 0)) < .001 }
      })
      return boxes.map(({ category, box, upright }, index) => ({
        category, upright,
        surfaceGap: box.min.y - surfaceY,
        onTable: [box.min.x, box.max.x].every((x) => [box.min.z, box.max.z].every((z) => Math.hypot(x - center.x, z - center.z) < 2.49 * scale)),
        hitsMirror: box.intersectsBox(mirror),
        overlaps: boxes.slice(index + 1).filter((other) => box.intersectsBox(other.box)).map((other) => other.category),
      }))
    })
    for (const item of layout) {
      assert(item.upright, `${item.category} did not land upright`)
      assert(item.surfaceGap >= -.001 && item.surfaceGap < .003, `${item.category} is floating or embedded: ${item.surfaceGap}`)
      assert(item.onTable, `${item.category} extends beyond the table`)
      assert.equal(item.hitsMirror, false, `${item.category} intersects the mirror`)
      assert.deepEqual(item.overlaps, [], `${item.category} intersects another cosmetic`)
    }
    assert.equal(await page.locator('.beauty-shop-categories button').count(), 8)
    assert.equal(await frame.locator('#beautyShop3d canvas').evaluate(() => window.BeautyShop.interactiveObjects.length), 8)
    assert(await frame.locator('#beautyShop3d canvas').evaluate(() => {
      const scene = window.BeautyShop.scene
      const vanity = scene.getObjectByName('vanity')
      const model = vanity?.getObjectByName('vanity-model-scale')
      const modelParts = ['vanity-diorama-base', 'vanity-rug', 'vanity-table-model', 'vanity-mirror-model', 'vanity-stool', 'vanity-trinket-dish', 'vanity-petals']
      return Boolean(model && modelParts.every((name) => model.getObjectByName(name)))
        && window.BeautyShop.categoryObjects.length === 8
        && window.BeautyShop.categoryObjects.every((item) => item.children.some((child) => child.name.startsWith('vanity-cosmetic-model-')))
    }))
    await page.screenshot({ path: path.join(output, `${viewport.width}-vanity.png`), animations: 'disabled' })

    const categoryButtons = page.locator('.beauty-shop-categories button')
    for (const button of await categoryButtons.all()) {
      const category = await button.innerText()
      await button.hover()
      await page.waitForFunction((category) => {
        const objects = document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop?.categoryObjects || []
        return objects.every((o) => o.userData.category === category
          ? o.scale.x > 1.09 && o.userData.labelSprite.visible
          : o.userData.hover < .02)
      }, category)
    }
    await categoryButtons.filter({ hasText: /^气垫$/ }).hover()
    await page.waitForFunction(() => document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop?.categoryObjects.find((o) => o.userData.category === '气垫')?.userData.hover > .99)
    const labelSize = await frame.locator('canvas').evaluate((canvas) => {
      const { THREE, camera, categoryObjects } = window.BeautyShop
      const label = categoryObjects.find((o) => o.userData.category === '气垫').userData.labelSprite
      const scale = label.getWorldScale(new THREE.Vector3())
      const depth = -label.getWorldPosition(new THREE.Vector3()).applyMatrix4(camera.matrixWorldInverse).z
      const pixelsPerUnit = canvas.clientHeight / (2 * depth * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))
      return { width: scale.x * pixelsPerUnit, height: scale.y * pixelsPerUnit }
    })
    assert(labelSize.width >= 50 && labelSize.width < 80 && Math.abs(labelSize.height - 32) < 1, `label should stay compact: ${JSON.stringify(labelSize)}`)
    await page.screenshot({ path: path.join(output, `${viewport.width}-category-hover.png`), animations: 'disabled' })
    await page.mouse.move(5, 5)
    await page.waitForFunction(() => document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop?.categoryObjects.every((o) => !o.userData.labelSprite.visible && o.userData.hover < .02))
    await categoryButtons.first().focus()
    await page.waitForFunction(() => document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop?.categoryObjects.find((o) => o.userData.category === '粉底液')?.userData.hover > .9)
    await page.getByRole('button', { name: '返回店铺' }).focus()
    await page.waitForFunction(() => document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop?.categoryObjects.every((o) => !o.userData.labelSprite.visible))

    await page.getByRole('button', { name: '返回店铺' }).click()
    await page.locator('.beauty-shop-stage[data-stage="shop"]').waitFor({ timeout: 12000 })
    const returnedProducts = await frame.locator('#beautyShop3d canvas').evaluate(() => window.BeautyShop.categoryObjects.every((object) => (
      object.position.distanceTo(object.userData.gatherStart) < 0.001
      && Math.abs(object.rotation.y - object.userData.startRotation) < 0.001
    )))
    assert.equal(returnedProducts, true, 'products should return to their original shop positions and rotations')
    assert.equal(await page.locator('.beauty-shop-categories').count(), 0)
    assert.equal(await frame.locator('#beautyShop3d canvas').evaluate(() => window.BeautyShop.interactiveObjects[0] === window.BeautyShop.shop), true)

    await page.locator('.beauty-shop-keyboard-entry').evaluate((button) => button.click())
    await page.locator('.beauty-shop-stage[data-stage="vanity"]').waitFor({ timeout: 12000 })
    const eyeshadow = await frame.locator('#beautyShop3d canvas').evaluate((canvas) => {
      const shop = window.BeautyShop
      const target = shop.categoryObjects.find((object) => object.userData.category === '眼影')
      const point = target.getWorldPosition(new shop.THREE.Vector3()).add(new shop.THREE.Vector3(0, 0.12, 0)).project(shop.camera)
      return { x: (point.x + 1) * canvas.clientWidth / 2, y: (1 - point.y) * canvas.clientHeight / 2 }
    })
    await page.mouse.move(bounds.x + eyeshadow.x, bounds.y + eyeshadow.y)
    await page.waitForFunction(() => document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop?.categoryObjects.find((o) => o.userData.category === '眼影')?.userData.hover > .99)
    await page.mouse.wheel(0, -160)
    await page.waitForFunction(() => {
      const s = document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop
      return s && s.camera.position.distanceTo(s.controls.target) < (innerWidth > innerHeight ? 3.5 : 5.3)
    })
    const zoomedLabelSize = await frame.locator('canvas').evaluate((canvas) => {
      const { THREE, camera, categoryObjects } = window.BeautyShop
      const label = categoryObjects.find((o) => o.userData.category === '眼影').userData.labelSprite
      const depth = -label.getWorldPosition(new THREE.Vector3()).applyMatrix4(camera.matrixWorldInverse).z
      const scale = label.getWorldScale(new THREE.Vector3())
      return scale.y * canvas.clientHeight / (2 * depth * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))
    })
    assert(Math.abs(zoomedLabelSize - 32) < 1, `label grows when zooming: ${zoomedLabelSize}`)
    const zoomedEyeshadow = await frame.locator('canvas').evaluate((canvas) => {
      const { THREE, camera, categoryObjects } = window.BeautyShop
      const target = categoryObjects.find((o) => o.userData.category === '眼影')
      const point = target.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, .12, 0)).project(camera)
      return { x: (point.x + 1) * canvas.clientWidth / 2, y: (1 - point.y) * canvas.clientHeight / 2 }
    })
    await page.mouse.click(bounds.x + zoomedEyeshadow.x, bounds.y + zoomedEyeshadow.y)
    await page.locator('.library-page').waitFor({ timeout: 10000 })
    assert.equal(pageErrors.length, 0, pageErrors.join('\n'))
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.close()
    console.log(`${viewport.width}px shop, vanity, return, category: passed`)
  }

  for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce' })
    await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.abort())
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
    await page.locator('.brand-opening').waitFor({ state: 'hidden' })
    await page.locator('.beauty-shop-stage[data-stage="shop"]').waitFor()
    await page.waitForFunction(() => document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop?.intro.active === false, { timeout: 30000 })
    const search = page.locator('.beauty-shop-scroll-search')
    await search.waitFor({ timeout: 5000 })
    assert.equal(await search.isVisible(), true, 'search should be available before the scene shrinks')
    await page.screenshot({ path: path.join(output, `${viewport.width}-shop-search.png`), animations: 'disabled' })
    await page.frameLocator('.beauty-shop-frame').locator('canvas').hover()
    await page.mouse.wheel(0, 450)
    await page.waitForFunction(() => Number(document.querySelector('.beauty-shop-scroll-shell')?.style.getPropertyValue('--scroll-progress')) >= .49)
    assert.equal(await search.isVisible(), true, 'search should remain visible while the scene shrinks')
    await page.mouse.wheel(0, 900)
    const expectedScale = viewport.width > 680 ? .31 : .46
    await page.waitForFunction((scale) => Math.abs(new DOMMatrix(getComputedStyle(document.querySelector('.beauty-shop-stage')).transform).a - scale) < .01, expectedScale)
    await page.evaluate(() => window.scrollTo(0, 0))
    const stageScale = await page.locator('.beauty-shop-stage').evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a)
    assert(Math.abs(stageScale - expectedScale) < .01, `final scene scale should be near ${expectedScale}: ${stageScale}`)
    await page.screenshot({ path: path.join(output, `${viewport.width}-scroll-search.png`), animations: 'disabled' })
    await search.getByRole('textbox', { name: '搜索品牌、产品名或色号' }).fill('NARS')
    await search.getByRole('button', { name: '搜索' }).click()
    await page.locator('.library-page').waitFor({ timeout: 10000 })
    assert.equal(await page.locator('.library-search input').inputValue(), 'NARS')
    await page.close()
    console.log(`${viewport.width}px dark scroll search: passed`)
  }

  const fallback = await browser.newPage({ viewport: { width: 360, height: 800 }, reducedMotion: 'reduce' })
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === 'webgl' || type === 'webgl2') return null
      return original.call(this, type, ...args)
    }
  })
  await fallback.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.abort())
  await fallback.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await fallback.locator('.brand-opening').waitFor({ state: 'hidden' })
  await fallback.locator('.makeup-table-section').waitFor()
  assert.equal(await fallback.locator('.beauty-shop-frame').count(), 0)
  await fallback.close()
  console.log('WebGL unavailable: 2D category table passed')
} finally {
  await browser.close()
}
