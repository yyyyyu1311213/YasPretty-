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
  }))
  assert.equal(introAtReveal.active, true)
  assert(introAtReveal.elapsed < 1.5, `intro skipped ahead to ${introAtReveal.elapsed}s`)
  await opening.waitForFunction(() => document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop?.intro.elapsed >= 2.9, { timeout: 12000 })
  const fixtureRise = await opening.frameLocator('.beauty-shop-frame').locator('#beautyShop3d canvas').evaluate(() => {
    const shop = window.BeautyShop
    return { elapsed: shop.intro.elapsed, y: shop.scene.getObjectByName('shop-fixtures').position.y }
  })
  assert(fixtureRise.y < -0.01, `fixtures did not rise during intro: ${JSON.stringify(fixtureRise)}`)
  await opening.screenshot({ path: path.join(output, '1440-fixture-rise.png') })
  await opening.waitForFunction(() => document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop?.intro.active === false, { timeout: 12000 })
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
      const target = shop.scene.getObjectByName('vanity')
      const point = target.getWorldPosition(new shop.THREE.Vector3()).add(new shop.THREE.Vector3(0, 0.5, 0)).project(shop.camera)
      return { x: (point.x + 1) * canvas.clientWidth / 2, y: (1 - point.y) * canvas.clientHeight / 2 }
    })
    const bounds = await page.locator('.beauty-shop-frame').boundingBox()
    await page.mouse.click(bounds.x + projected.x, bounds.y + projected.y)
    await page.locator('.beauty-shop-stage[data-stage="transition"]').waitFor()
    await page.waitForTimeout(850)
    await page.screenshot({ path: path.join(output, `${viewport.width}-transition.png`), animations: 'disabled' })
    await page.locator('.beauty-shop-stage[data-stage="vanity"]').waitFor({ timeout: 12000 })
    assert.equal(await page.locator('.beauty-shop-categories button').count(), 8)
    assert.equal(await frame.locator('#beautyShop3d canvas').evaluate(() => window.BeautyShop.interactiveObjects.length), 8)
    assert(await frame.locator('#beautyShop3d canvas').evaluate(() => window.BeautyShop.scene.getObjectByName('diorama-base').position.length() > 5))
    await page.screenshot({ path: path.join(output, `${viewport.width}-vanity.png`), animations: 'disabled' })

    await page.getByRole('button', { name: '返回店铺' }).click()
    await page.locator('.beauty-shop-stage[data-stage="shop"]').waitFor({ timeout: 12000 })
    assert.equal(await page.locator('.beauty-shop-categories').count(), 0)
    assert.equal(await frame.locator('#beautyShop3d canvas').evaluate(() => window.BeautyShop.interactiveObjects.length), 1)

    await page.locator('.beauty-shop-keyboard-entry').evaluate((button) => button.click())
    await page.locator('.beauty-shop-stage[data-stage="vanity"]').waitFor({ timeout: 12000 })
    const eyeshadow = await frame.locator('#beautyShop3d canvas').evaluate((canvas) => {
      const shop = window.BeautyShop
      const target = shop.categoryObjects.find((object) => object.userData.category === '眼影')
      const point = target.getWorldPosition(new shop.THREE.Vector3()).add(new shop.THREE.Vector3(0, 0.12, 0)).project(shop.camera)
      return { x: (point.x + 1) * canvas.clientWidth / 2, y: (1 - point.y) * canvas.clientHeight / 2 }
    })
    await page.mouse.click(bounds.x + eyeshadow.x, bounds.y + eyeshadow.y)
    await page.locator('.library-page').waitFor({ timeout: 10000 })
    assert.equal(pageErrors.length, 0, pageErrors.join('\n'))
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.close()
    console.log(`${viewport.width}px shop, vanity, return, category: passed`)
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
