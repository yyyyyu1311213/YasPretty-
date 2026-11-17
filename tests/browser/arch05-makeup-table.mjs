// Use an existing Playwright + Chrome installation; no dependency installation.
// Fault cases replace only Scene, or reject the lazy module, in fresh contexts.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { products } from '../../src/data/products.js'

const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const baseURL = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5192'
assert(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(baseURL).hostname))
const outputDir = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/arch-05-before')
await fs.mkdir(outputDir, { recursive: true })
const referenceSources = process.env.YAS_QA_REFERENCE_SNAPSHOT
  ? JSON.parse(await fs.readFile(process.env.YAS_QA_REFERENCE_SNAPSHOT, 'utf8')).sources
  : null
let lazyPath
for (const owner of ['src/App.jsx', 'src/features/home/components/HomeView.jsx']) {
  const source = referenceSources ? referenceSources[owner] : await fs.readFile(owner, 'utf8')
  const lazyImport = source?.match(/const MakeupTable(?:Experience)? = lazy\(\(\) => import\('(.+?)'\)\)/)?.[1]
  if (lazyImport) {
    lazyPath = `/${path.posix.normalize(path.posix.join(path.posix.dirname(owner), `${lazyImport}.jsx`))}`
    break
  }
}
assert(lazyPath, 'Find the actual lazy table entry from App or HomeView')
const migrated = lazyPath.includes('/features/')
const browser = await chromium.launch({ headless: true, ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}) })
const results = []

async function until(check, message, timeout = 15000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (await check()) return
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  assert.fail(message)
}

function instrument({ noWebGL, low }) {
  if (noWebGL) {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) { return /webgl/i.test(kind) ? null : original.call(this, kind, ...args) }
  }
  Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => low ? 4 : 12 })
  Object.defineProperty(navigator, 'deviceMemory', { get: () => low ? 4 : 16 })
  const owned = () => /(?:MakeupTable|makeup-table-3d)/.test(new Error().stack)
  const timers = new Set(), frames = new Set(), listeners = [], observers = [], resources = new Map()
  const timeout = window.setTimeout, clear = window.clearTimeout, raf = window.requestAnimationFrame, cancel = window.cancelAnimationFrame
  window.setTimeout = function (fn, delay, ...args) {
    if (!owned()) return timeout(fn, delay, ...args)
    const id = timeout(() => { timers.delete(id); fn(...args) }, delay)
    timers.add(id)
    return id
  }
  window.clearTimeout = function (id) { timers.delete(id); return clear(id) }
  window.requestAnimationFrame = function (fn) {
    if (!owned()) return raf(fn)
    const id = raf((time) => { frames.delete(id); fn(time) })
    frames.add(id)
    return id
  }
  window.cancelAnimationFrame = function (id) { frames.delete(id); return cancel(id) }
  const add = EventTarget.prototype.addEventListener, remove = EventTarget.prototype.removeEventListener
  EventTarget.prototype.addEventListener = function (type, fn, options) {
    if (owned()) listeners.push({ target: this, type, fn, active: true })
    return add.call(this, type, fn, options)
  }
  EventTarget.prototype.removeEventListener = function (type, fn, options) {
    for (const entry of listeners) if (entry.target === this && entry.type === type && entry.fn === fn) entry.active = false
    return remove.call(this, type, fn, options)
  }
  for (const key of ['ResizeObserver', 'IntersectionObserver']) {
    const Original = window[key]
    window[key] = class extends Original {
      constructor(...args) { super(...args); this.qaOwned = owned(); this.qaActive = false; if (this.qaOwned) observers.push(this) }
      observe(...args) { this.qaActive = true; return super.observe(...args) }
      disconnect() { this.qaActive = false; return super.disconnect() }
    }
  }
  for (const kind of ['Buffer', 'Texture', 'Framebuffer', 'Program', 'VertexArray']) {
    const proto = window.WebGL2RenderingContext?.prototype
    if (!proto) continue
    const create = proto[`create${kind}`], destroy = proto[`delete${kind}`]
    proto[`create${kind}`] = function (...args) { const value = create.apply(this, args); if (/GhostCursor/.test(new Error().stack) && value) resources.set(value, kind); return value }
    proto[`delete${kind}`] = function (value) { resources.delete(value); return destroy.call(this, value) }
  }
  window.__tableQA = () => ({ timers: timers.size, frames: frames.size, listeners: listeners.filter((entry) => entry.active).length, observers: observers.filter((entry) => entry.qaActive).length, ghostResources: resources.size })
}

async function navigate(page, name) {
  if (name === '首页') { await page.getByRole('button', { name: '回到首页', exact: true }).click(); return }
  const menu = page.getByRole('button', { name: '打开导航', exact: true })
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('button', { name, exact: true }).filter({ visible: true }).first().click()
}

async function geometry(page, selector) {
  const value = await page.evaluate((selector) => {
    const rect = (el) => { const { x, y, width, height } = el.getBoundingClientRect(); return { x, y, width, height } }
    return { width: innerWidth, documentWidth: document.documentElement.scrollWidth, controls: [...document.querySelectorAll(`${selector} button`)].filter((el) => el.getClientRects().length).map(rect) }
  }, selector)
  assert(value.documentWidth <= value.width + 1, 'Horizontal page overflow')
  for (const rect of value.controls) assert(rect.width > 0 && rect.height > 0 && rect.x >= -1 && rect.x + rect.width <= value.width + 1, 'Control outside viewport')
  // Check the rail/sheet controls; floating 2D product cards intentionally overlap the table.
  if (selector !== '.makeup-table-section') for (let i = 0; i < value.controls.length; i++) for (const b of value.controls.slice(i + 1)) {
    const a = value.controls[i]
    assert(a.x + a.width <= b.x + 1 || b.x + b.width <= a.x + 1 || a.y + a.height <= b.y + 1 || b.y + b.height <= a.y + 1, 'Controls overlap')
  }
  return value
}

const sceneStub = (mode, reactURL) => `import React from '${reactURL}'; const { useEffect } = React;
export default function Scene(props) {
  useEffect(() => { window.__sceneMountedAt = performance.now(); ${mode === 'ready' ? 'props.onReady()' : ''} }, []);
  ${mode === 'throw' ? "throw new Error('ARCH05 simulated scene runtime failure');" : ''}
  return React.createElement('button', { 'data-testid': 'scene-stub', 'data-state': JSON.stringify({ exploded: props.exploded, introFocus: props.introFocus, reducedMotion: props.reducedMotion, quality: props.quality }), onClick: () => props.onItemClick({ category: '腮红' }) }, '模拟妆具');
}`

async function scenario(viewport, name, options, test) {
  const context = await browser.newContext({ viewport, reducedMotion: options.reduce ? 'reduce' : 'no-preference', deviceScaleFactor: 1 })
  await context.addInitScript(instrument, options)
  const page = await context.newPage()
  page.setDefaultTimeout(12000)
  const pageErrors = [], consoleErrors = [], warnings = [], failedRequests = [], badResponses = [], requested = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); if (msg.type() === 'warning') warnings.push(msg.text()) })
  page.on('request', (request) => requested.push(new URL(request.url()).pathname))
  page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }))
  page.on('response', (response) => { if (response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() }) })
  if (options.scene) await page.route(/\/makeup-table-3d\/Scene\.jsx(?:\?|$)/, async (route) => {
    const response = await route.fetch()
    const source = await response.text()
    const reactURL = source.match(/["']([^"']*\/react\.js(?:\?[^"']*)?)["']/)?.[1]
    assert(reactURL, 'Reuse the application React module in the simulated scene')
    await route.fulfill({ contentType: 'text/javascript', body: sceneStub(options.scene, reactURL) })
  })
  let release
  if (options.delayModule) await page.route((url) => url.pathname === lazyPath, async (route) => { await new Promise((resolve) => { release = resolve }); await route.continue() })
  if (options.chunkFail) await page.route((url) => url.pathname === lazyPath, (route) => route.abort('failed'))
  const label = `${viewport.width}-${name}`
  try {
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
    if (options.delayModule) {
      await page.getByLabel('正在准备交互式化妆桌', { exact: true }).waitFor()
      assert(!requested.some((url) => url.includes('/makeup-table-3d/Scene.jsx')))
      release()
    }
    if (options.skip) {
      if (options.scene && !options.reduce) {
        assert.equal(await page.getByTestId('scene-stub').count(), 0, 'Scene must wait for openingReady')
        assert.equal(await page.locator('.makeup-3d-canvas canvas').count(), 0)
      }
      await page.getByRole('button', { name: '跳过品牌开幕' }).click()
    }
    if (!options.chunkFail) await page.locator('.brand-opening').waitFor({ state: 'hidden' })
    const evidence = await test(page, label)
    if (options.chunkFail) {
      assert(pageErrors.some((message) => /dynamically imported module|Importing a module script failed|Failed to fetch/.test(message)))
      assert.equal(await page.locator('.makeup-table-section').count(), 0)
      assert(failedRequests.some((entry) => new URL(entry.url).pathname === lazyPath))
    } else {
      assert.deepEqual(pageErrors, [])
      // Report external font failures separately; reject every local resource failure.
      assert.deepEqual(failedRequests.filter((entry) => new URL(entry.url).origin === new URL(baseURL).origin), [])
      assert.deepEqual(badResponses, [])
      if (options.scene === 'throw') {
        assert(consoleErrors.some((entry) => /ARCH05 simulated scene runtime failure/.test(entry)))
        assert(warnings.some((entry) => /3D scene unavailable/.test(entry)))
        assert(consoleErrors.every((entry) => /ARCH05 simulated scene runtime failure|Failed to load resource: net::ERR_NETWORK_ACCESS_DENIED/.test(entry)))
      } else assert(consoleErrors.every((entry) => /Failed to load resource: net::ERR_NETWORK_ACCESS_DENIED/.test(entry)) && (consoleErrors.length === 0 || failedRequests.every((entry) => new URL(entry.url).hostname === 'fonts.googleapis.com')))
    }
    results.push({ label, passed: true, mode: options, evidence, pageErrors, consoleErrors, warnings, failedRequests, badResponses })
    console.log(`PASS ${label}`)
  } catch (error) {
    results.push({ label, passed: false, error: error.stack, pageErrors, consoleErrors, warnings, failedRequests, badResponses })
    console.error(`FAIL ${label}: ${error.message}`)
    await page.screenshot({ path: path.join(outputDir, `${label}-failed.png`), animations: 'disabled' }).catch(() => {})
  } finally { release?.(); await context.close() }
}

async function capture(page, label, selector) {
  await page.locator(selector).scrollIntoViewIfNeeded()
  await page.screenshot({ path: path.join(outputDir, `${label}.png`), animations: 'disabled' })
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
  await scenario(viewport, 'webgl-normal-opening', { delayModule: true }, async (page, label) => {
    await page.locator('.makeup-3d-status').filter({ hasText: '花瓣陈列' }).waitFor()
    await page.waitForTimeout(1200) // Let the existing GSAP expansion finish before visual capture.
    assert.equal(await page.locator('.makeup-3d-canvas canvas').count(), 1)
    const renderer = await page.locator('.makeup-3d-canvas canvas').evaluate((canvas) => {
      const gl = canvas.getContext('webgl2'), ext = gl.getExtension('WEBGL_debug_renderer_info')
      return { renderer: gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER), vendor: gl.getParameter(ext ? ext.UNMASKED_VENDOR_WEBGL : gl.VENDOR), width: canvas.width, height: canvas.height }
    })
    await capture(page, label, '.makeup-3d-stage')
    await page.getByRole('button', { name: '恢复默认视角并收拢妆具' }).click()
    await page.locator('.makeup-3d-status').filter({ hasText: '桌面全景' }).waitFor()
    await page.waitForTimeout(1250) // Preserve and observe the original collapse/camera transition.
    const canvas = page.locator('.makeup-3d-canvas canvas'), box = await canvas.boundingBox()
    await page.mouse.move(box.x + 24, box.y + box.height / 2)
    await page.mouse.down(); await page.mouse.move(box.x + 65, box.y + box.height / 2 + 15, { steps: 12 }); await page.mouse.up()
    const layout = await geometry(page, '.makeup-3d-section')
    await capture(page, `${label}-collapsed`, '.makeup-3d-stage')
    const active = await page.evaluate(() => window.__tableQA())
    await navigate(page, '产品库')
    await until(async () => { const x = await page.evaluate(() => window.__tableQA()); return !x.timers && !x.frames && !x.listeners && !x.observers && !x.ghostResources }, 'Table resources not cleaned up')
    const cleanup = await page.evaluate(() => window.__tableQA())
    assert.equal(await page.locator('.makeup-3d-canvas canvas').count(), 0)
    await navigate(page, '首页')
    await page.locator('.makeup-3d-status').filter({ hasText: '花瓣陈列' }).waitFor()
    await page.locator('.makeup-3d-category-rail').getByRole('button', { name: '腮红', exact: true }).click()
    await page.locator('.product-grid').first().waitFor()
    assert.match(await page.locator('main').innerText(), /腮红/)
    return { renderer, layout, active, cleanup }
  })
  await scenario(viewport, 'webgl-reduced-skip', { reduce: true, skip: true, low: true }, async (page, label) => {
    await page.locator('.makeup-3d-status').filter({ hasText: '花瓣陈列' }).waitFor()
    await page.getByRole('button', { name: '恢复默认视角并收拢妆具' }).click()
    assert.equal(await page.locator('.makeup-3d-ghost-layer').count(), 0)
    await capture(page, label, '.makeup-3d-stage')
    return { layout: await geometry(page, '.makeup-3d-section'), canvasSize: await page.locator('.makeup-3d-canvas canvas').evaluate((x) => [x.width, x.height, x.clientWidth, x.clientHeight]) }
  })
  await scenario(viewport, 'no-webgl-2d', { reduce: true, noWebGL: true }, async (page, label) => {
    const trigger = page.getByRole('button', { name: /^展开粉底液/ })
    await until(() => trigger.isEnabled(), '2D table did not become interactive')
    await trigger.click()
    const area = viewport.width === 360 ? page.locator('.makeup-table-mobile-sheet') : page.locator('.makeup-table-bloom')
    assert.equal(await area.locator('.makeup-table-bloom-product').count(), 5)
    await capture(page, label, '.makeup-table-section')
    const layout = await geometry(page, viewport.width === 360 ? '.makeup-table-mobile-sheet' : '.makeup-table-section')
    await area.locator('.makeup-table-bloom-product').first().click()
    await page.getByRole('button', { name: '关闭详情', exact: true }).waitFor()
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
    await until(async () => (await trigger.getAttribute('aria-expanded')) === 'false', 'Escape did not collapse category')
    await until(() => trigger.evaluate((x) => x === document.activeElement), 'Focus was not restored')
    await trigger.click()
    const count = products.filter((product) => product.category === '粉底液').length
    await page.getByRole('button', { name: new RegExp(`^查看全部\\s*${count}\\s*款`) }).filter({ visible: true }).click()
    assert.match(await page.locator('main').innerText(), /粉底液/)
    return { layout, shownProducts: 5 }
  })
  for (const scene of ['throw', 'pending']) await scenario(viewport, `scene-${scene}`, { reduce: true, scene }, async (page, label) => {
    await page.locator('.makeup-table-section.is-ready').waitFor()
    const waitMs = scene === 'pending' ? await page.evaluate(() => performance.now() - window.__sceneMountedAt) : null
    if (scene === 'pending') assert(waitMs >= 5900, 'Scene fallback must preserve the six-second wait')
    await until(() => page.getByRole('button', { name: /^展开腮红/ }).isEnabled(), 'Fallback disabled')
    await page.getByRole('button', { name: /^展开腮红/ }).click()
    await capture(page, label, '.makeup-table-section')
    return { fallback: true, waitMs, simulatedScene: true, layout: await geometry(page, '.makeup-table-section') }
  })
  await scenario(viewport, 'pending-scene-unmount', { scene: 'pending', skip: true }, async (page) => {
    await page.getByTestId('scene-stub').waitFor()
    assert((await page.evaluate(() => window.__tableQA())).timers > 0, 'Pending scene must have active timers')
    await navigate(page, '产品库')
    const cleanup = await page.evaluate(() => window.__tableQA())
    assert.deepEqual(cleanup, { timers: 0, frames: 0, listeners: 0, observers: 0, ghostResources: 0 })
    return { cleanup, simulatedScene: true }
  })
  await scenario(viewport, 'scene-state-lifecycle', { scene: 'ready', skip: true, low: true }, async (page, label) => {
    const state = () => page.getByTestId('scene-stub').getAttribute('data-state').then(JSON.parse)
    await until(async () => (await state()).exploded, 'Auto bloom did not run')
    const standard = await state()
    assert.equal(standard.quality.dpr, 1); assert.equal(standard.quality.showGhostCursor, false)
    await page.getByRole('button', { name: '恢复默认视角并收拢妆具' }).click()
    assert.equal((await state()).exploded, false)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await until(async () => (await state()).reducedMotion, 'Reduced motion listener failed')
    await page.getByTestId('scene-stub').click()
    assert.match(await page.locator('main').innerText(), /腮红/)
    await until(async () => { const x = await page.evaluate(() => window.__tableQA()); return !x.timers && !x.frames && !x.listeners }, 'Lifecycle cleanup failed')
    await navigate(page, '首页')
    await until(async () => (await state()).exploded, 'Re-enter did not reset bloom')
    await capture(page, label, '.makeup-3d-stage')
    return { standard, reduced: await state(), simulatedScene: true }
  })
  await scenario(viewport, 'lazy-download-rejection', { reduce: true, chunkFail: true }, async (page) => {
    await until(async () => (await page.locator('#root').innerHTML()) === '', 'Expected existing uncaught lazy failure')
    return { existingGap: 'Lazy download rejection is not caught by the scene runtime boundary.' }
  })
}

await browser.close()
await fs.writeFile(path.join(outputDir, 'results.json'), JSON.stringify({ date: new Date().toISOString(), browserVersion: browser.version(), migrated, results }, null, 2))
console.log(`${results.filter((r) => r.passed).length}/${results.length} passed`)
if (results.some((r) => !r.passed)) process.exitCode = 1
