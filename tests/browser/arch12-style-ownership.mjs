// Compare the same presentation states before/after ARCH-12 with isolated fixtures.
// Uses the existing external Playwright runtime; never calls a paid provider.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { products } from '../../src/data/products.js'
import { createMakeupPlanService } from '../../server/services/makeup-plan-service.cjs'

const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const baseURL = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5221'
assert(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(baseURL).hostname))
const outputDir = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/arch-12/styles')
await fs.mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}) })
const service = createMakeupPlanService({ products, zhipuProvider: { configured: false } })
const results = []
const properties = `display position z-index box-sizing width height min-width min-height max-width max-height margin-top margin-right margin-bottom margin-left padding-top padding-right padding-bottom padding-left gap row-gap column-gap grid-template-columns grid-template-rows flex-direction flex-wrap align-items justify-content overflow-x overflow-y color background-color background-image background-size border-top-width border-right-width border-bottom-width border-left-width border-top-color border-top-style border-radius box-shadow font-family font-size font-weight font-style line-height letter-spacing text-align text-decoration-line white-space opacity transform animation-name animation-duration animation-delay animation-timing-function transition-property transition-duration cursor pointer-events`.split(' ')

async function snapshot(page, label, selector) {
  await page.locator(selector).scrollIntoViewIfNeeded()
  await page.mouse.move(0, 0)
  await page.evaluate(() => document.fonts.ready)
  if (label.endsWith('-opening')) await page.clock.runFor(32)
  else await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const evidence = await page.locator(selector).evaluate((root, properties) => {
    const round = n => Math.round(n * 1000) / 1000
    const rootBox = root.getBoundingClientRect()
    const entries = []
    function visit(el, key) {
      const css = getComputedStyle(el), rect = el.getBoundingClientRect()
      const style = Object.fromEntries(properties.map(p => [p, css.getPropertyValue(p)]))
      // Running animation progress is sampled separately by existing opening/home suites.
      if (css.animationName !== 'none') { delete style.opacity; delete style.transform }
      entries.push({ key, tag: el.tagName, classes: el.getAttribute('class'), style,
        geometry: { x: round(rect.x - rootBox.x), y: round(rect.y - rootBox.y), width: round(rect.width), height: round(rect.height) },
        pseudo: Object.fromEntries(['::before', '::after'].map(pseudo => { const s = getComputedStyle(el, pseudo); return [pseudo, Object.fromEntries(['content', 'display', 'color', 'background-color', 'width', 'height', 'animation-name', 'animation-duration'].map(p => [p, s.getPropertyValue(p)]))] })) })
      // SVG text metrics depend on random clip IDs; its actual SVG still appears in screenshots.
      if (el.tagName.toLowerCase() !== 'svg' && el.tagName.toLowerCase() !== 'canvas') [...el.children].forEach((child, i) => visit(child, `${key}/${i}`))
    }
    visit(root, '0')
    return { viewport: { width: innerWidth, height: innerHeight }, documentWidth: document.documentElement.scrollWidth, entries }
  }, properties)
  assert(evidence.documentWidth <= evidence.viewport.width + 1, `${label}: horizontal overflow`)
  await page.screenshot({ path: path.join(outputDir, `${label}.png`), animations: 'disabled' })
  results.push({ label, evidence })
  console.log(`PASS ${label}: ${evidence.entries.length} elements`)
}

try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce', deviceScaleFactor: 1 })
    const errors = [], requests = []
    await context.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '/* deterministic offline font fallback */' }))
    await context.addInitScript(() => {
      if (!sessionStorage.getItem('arch12-seeded')) {
        localStorage.clear()
        localStorage.setItem('yaspretty-xiaoy-profile-v1', JSON.stringify({ version: 1, value: { skin: '混油皮', budget: 400, scene: '通勤', finish: '柔雾' } }))
        sessionStorage.setItem('arch12-seeded', 'yes')
      }
    })
    const page = await context.newPage()
    page.on('pageerror', e => errors.push(e.message))
    let release, failure = false
    await context.route(url => url.pathname.startsWith('/api/'), async route => {
      const endpoint = new URL(route.request().url()).pathname
      requests.push(endpoint)
      await new Promise(resolve => { release = resolve })
      if (failure) return route.fulfill({ status: 503, json: { ok: false, error: { code: 'SERVICE_UNAVAILABLE', message: '合成服务暂不可用' } } })
      if (endpoint === '/api/makeup-plans') return route.fulfill({ json: { ok: true, plan: await service.create(route.request().postDataJSON()) } })
      assert.equal(endpoint, '/api/assistant')
      return route.fulfill({ json: { ok: true, intent: 'external_research', answer: '这是用于样式回归的合成检索回答。', answerMode: 'web', sources: [{ title: '合成来源', url: 'https://example.test/arch12', publisher: '测试', accessedAt: '2026-11-17T00:00:00.000Z' }] } })
    })
    await page.goto(baseURL)
    await page.locator('.brand-opening').waitFor({ state: 'detached' })
    await page.locator('.home-motion-stage.is-ready').waitFor()
    await page.locator('.home-hero img').evaluate(img => img.decode())
    await snapshot(page, `${viewport.width}-header`, '.site-header')
    await snapshot(page, `${viewport.width}-home`, '.hero-copy')
    await page.locator('.home-selection').scrollIntoViewIfNeeded()
    await page.locator('.featured-grid .product-card').first().waitFor()
    await snapshot(page, `${viewport.width}-featured`, '.home-selection')
    await page.getByRole('button', { name: '创建我的妆容方案', exact: true }).click()
    await snapshot(page, `${viewport.width}-assistant-initial`, '.xiaoy-page')
    await page.locator('.makeup-plan-submit').click()
    await page.locator('.makeup-plan-submit[disabled]').waitFor()
    await snapshot(page, `${viewport.width}-workbench-loading`, '.makeup-workbench')
    assert(release); release()
    await page.locator('.makeup-plan-result').waitFor()
    await snapshot(page, `${viewport.width}-workbench-result`, '.makeup-workbench')
    failure = true
    const retryRequest = page.waitForRequest(url => new URL(url.url()).pathname === '/api/makeup-plans')
    await page.locator('.makeup-plan-submit').click()
    await page.locator('.makeup-plan-submit[disabled]').waitFor()
    // Wait for the route handler to replace the release callback, before responding.
    await retryRequest
    release()
    await page.locator('.makeup-plan-error').waitFor()
    await snapshot(page, `${viewport.width}-workbench-error`, '.makeup-workbench')
    failure = false
    await page.getByLabel('向小Y描述你的需求').fill('今年最新的美妆趋势是什么')
    const waiting = page.waitForRequest(url => new URL(url.url()).pathname === '/api/assistant')
    await page.getByRole('button', { name: '发送', exact: true }).click()
    await waiting
    await page.locator('.xiaoy-message.loading').waitFor()
    await snapshot(page, `${viewport.width}-assistant-loading`, '.xiaoy-chat')
    release()
    await page.locator('.xiaoy-sources a').waitFor()
    await snapshot(page, `${viewport.width}-assistant-source`, '.xiaoy-chat')
    assert.deepEqual(errors, [])
    assert.deepEqual(requests, ['/api/makeup-plans', '/api/makeup-plans', '/api/assistant'])
    await context.close()

    const openingContext = await browser.newContext({ viewport, reducedMotion: 'no-preference', deviceScaleFactor: 1 })
    await openingContext.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }))
    const opening = await openingContext.newPage()
    await opening.clock.install()
    await opening.clock.pauseAt(new Date())
    await opening.goto(baseURL)
    await opening.locator('.brand-opening').waitFor()
    await snapshot(opening, `${viewport.width}-opening`, '.brand-opening')
    await opening.getByRole('button', { name: '跳过品牌开幕', exact: true }).click({ force: true })
    await opening.clock.runFor(200)
    await opening.locator('.brand-opening').waitFor({ state: 'detached' })
    await openingContext.close()
  }
} finally {
  await fs.writeFile(path.join(outputDir, 'results.json'), JSON.stringify({ completedAt: new Date().toISOString(), browser: browser.version(), baseURL, results }, null, 2) + '\n')
  await browser.close()
}
if (process.env.YAS_QA_STYLE_BASELINE) {
  const before = JSON.parse(await fs.readFile(path.resolve(process.env.YAS_QA_STYLE_BASELINE), 'utf8'))
  const differences = []
  // Separate local reference servers serve the same asset paths at different ports.
  const comparable = (evidence, url) => JSON.stringify(evidence).replaceAll(new URL(url).origin, '<origin>')
  for (const after of results) {
    const old = before.results.find(r => r.label === after.label)
    if (!old || comparable(old.evidence, before.baseURL) !== comparable(after.evidence, baseURL)) differences.push(after.label)
  }
  await fs.writeFile(path.join(outputDir, 'comparison.json'), JSON.stringify({ before: process.env.YAS_QA_STYLE_BASELINE, snapshots: results.length, differences }, null, 2) + '\n')
  assert.deepEqual(differences, [], 'Computed styles/geometry changed; inspect results before proceeding')
}
assert.equal(results.length, 20)
console.log(`${results.length}/20 presentation snapshots passed`)
