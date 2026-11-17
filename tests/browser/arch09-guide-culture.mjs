// Run the same scenarios before and after extracting the existing pages.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { products } from '../../src/data/products.js'
import { emptyFilters, productMatches, sortCatalogProducts } from '../../src/features/catalog/catalogUtils.js'

const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const baseURL = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5200'
assert(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(baseURL).hostname))
const outputDir = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/arch-09-before')
await fs.mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}) })
const results = []
const collectionKey = 'base-archive-collection'
const queries = [{ skins: ['油皮'], minWear: 8 }, { skins: ['干皮'] }, { scene: '拍照' }]

async function until(check, message) {
  const end = Date.now() + 12000
  while (Date.now() < end) { if (await check()) return; await new Promise((resolve) => setTimeout(resolve, 40)) }
  assert.fail(message)
}
async function homeReady(page) {
  const skip = page.getByRole('button', { name: /跳过/ }).first()
  if (await skip.isVisible()) await skip.click({ timeout: 1000 }).catch(async (error) => {
    // Reduced-motion opening may finish between visibility detection and click.
    if (await skip.isVisible()) throw error
  })
  await page.locator('.home-motion-stage.is-ready').waitFor()
  await until(() => page.evaluate(() => document.body.style.overflow !== 'hidden'), 'Home scroll unlocked')
}
async function navigate(page, name) {
  const accessibleName = name === '我的收藏' ? /^我的收藏/ : name
  if (await page.getByRole('button', { name: '打开导航', exact: true }).isVisible()) {
    if (!await page.locator('.mobile-nav').isVisible()) await page.getByRole('button', { name: '打开导航', exact: true }).click()
    await page.locator('.mobile-nav').getByRole('button', { name: accessibleName, exact: true }).click()
    assert.equal(await page.locator('.mobile-nav').count(), 0)
  } else await page.locator('.desktop-nav').getByRole('button', { name: accessibleName, exact: true }).click()
}
async function state(page) {
  // Only stable fields; do not compare timing or opaque browser navigation IDs.
  return page.evaluate(() => ({ path: location.pathname, hash: location.hash, title: document.title, length: history.length, state: history.state,
    focus: { tag: document.activeElement.tagName, label: document.activeElement.getAttribute('aria-label'), text: document.activeElement.tagName === 'BODY' ? null : document.activeElement.textContent },
    overflow: [document.body.style.overflow, document.documentElement.style.overflow] }))
}
async function shot(page, label) { await page.screenshot({ path: path.join(outputDir, `${label}.png`), animations: 'disabled', fullPage: true }) }
async function geometry(page, selector) {
  const result = await page.locator(selector).evaluate((root) => {
    const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } }
    return { width: innerWidth, documentWidth: document.documentElement.scrollWidth, root: box(root), controls: [...root.querySelectorAll('button,input,select')].filter((el) => el.checkVisibility()).map((el) => ({ name: el.getAttribute('aria-label') || el.textContent.trim(), ...box(el) })) }
  })
  assert(result.documentWidth <= result.width, 'No document horizontal overflow')
  for (let a = 0; a < result.controls.length; a++) for (let b = a + 1; b < result.controls.length; b++) {
    const x = result.controls[a], y = result.controls[b]
    assert(Math.min(x.x + x.width, y.x + y.width) - Math.max(x.x, y.x) <= 1 || Math.min(x.y + x.height, y.y + y.height) - Math.max(x.y, y.y) <= 1, `Controls overlap: ${x.name}/${y.name}`)
  }
  return result
}
async function ids(page) {
  return (await page.locator('.library-results .product-name').allTextContents()).map((name) => { const p = products.find((p) => p.name === name); assert(p, name); return p.id })
}
async function run(viewport, name, body) {
  const label = `${viewport.width}-${name}`
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce', deviceScaleFactor: 1 })
  const page = await context.newPage()
  const pageErrors = [], consoleErrors = [], failedRequests = [], badResponses = [], apiRequests = []
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('requestfailed', (r) => failedRequests.push({ url: r.url(), error: r.failure()?.errorText }))
  page.on('response', (r) => { if (r.status() >= 400) badResponses.push({ url: r.url(), status: r.status() }) })
  page.on('request', (r) => { if (new URL(r.url()).pathname.startsWith('/api/')) apiRequests.push(r.url()) })
  try {
    await page.goto(baseURL)
    await homeReady(page)
    const evidence = await body(page, label)
    assert.deepEqual(pageErrors, [])
    assert.deepEqual(apiRequests, [], 'These scenarios stay local')
    assert.deepEqual(badResponses, [])
    assert(failedRequests.every((r) => r.url.startsWith('https://fonts.googleapis.com/')), JSON.stringify(failedRequests))
    assert(consoleErrors.every((e) => /^Failed to load resource: net::ERR_(?:FAILED|NETWORK_ACCESS_DENIED)/.test(e)), consoleErrors.join('\n'))
    results.push({ label, passed: true, evidence, pageErrors, consoleErrors, failedRequests, badResponses, apiRequests })
    console.log(`PASS ${label}`)
  } catch (error) {
    results.push({ label, passed: false, error: error.stack, pageErrors, consoleErrors, failedRequests, badResponses, apiRequests })
    console.error(`FAIL ${label}: ${error.message}`)
    await shot(page, `${label}-failed`).catch(() => {})
  } finally { await context.close() }
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
  await run(viewport, 'guide-entries-filters', async (page, label) => {
    const mobile = viewport.width === 360
    if (mobile) await page.getByRole('button', { name: '打开导航', exact: true }).click()
    const nav = page.locator(mobile ? '.mobile-nav' : '.desktop-nav')
    for (const name of ['肤质指南', '品牌文化']) assert(await nav.getByRole('button', { name, exact: true }).isVisible(), `Existing entry visible: ${name}`)
    if (mobile) {
      await page.keyboard.press('Escape')
      assert(await nav.isVisible(), 'Baseline Escape does not close the mobile navigation')
      await page.getByRole('button', { name: '打开导航', exact: true }).click()
      assert.equal(await page.locator('.mobile-nav').count(), 0)
    }
    const start = await state(page)
    await navigate(page, '肤质指南')
    await page.locator('.guide-page').waitFor()
    assert.equal(await page.locator('.culture-page').count(), 0)
    const entry = await state(page), text = await page.locator('.guide-page').innerText()
    assert.equal(entry.length, start.length + 1)
    assert.equal(entry.state.view, 'guide')
    assert.equal(entry.path, '/')
    const layout = await geometry(page, '.guide-page')
    await shot(page, label)
    const checks = []
    for (let i = 0; i < queries.length; i++) {
      await page.locator('.guide-card').nth(i).getByRole('button', { name: '按此筛选' }).click()
      await page.locator('.library-page').waitFor()
      const ordered = await ids(page)
      assert.deepEqual(ordered, sortCatalogProducts(products.filter((p) => productMatches(p, { ...emptyFilters, ...queries[i] })), 'recommended').map((p) => p.id))
      checks.push({ ordered, navigation: await state(page) })
      await page.goBack(); await page.locator('.guide-page').waitFor()
      assert.equal(await page.locator('.guide-page').innerText(), text)
    }
    const beforeReload = await state(page)
    await page.reload(); await page.locator('.guide-page').waitFor()
    const afterReload = await state(page)
    assert.equal(afterReload.length, beforeReload.length)
    assert.deepEqual(afterReload.state, beforeReload.state)
    assert.equal(await page.locator('.guide-page').innerText(), text)
    return { start, entry, text, layout, checks, beforeReload, afterReload }
  })

  await run(viewport, 'culture-history-scroll', async (page, label) => {
    await navigate(page, '品牌文化'); await page.locator('.culture-page').waitFor()
    assert.equal(await page.locator('.guide-page').count(), 0)
    assert.equal(await page.getByRole('dialog').count(), 0, 'Culture is a page, without an overlay')
    const text = await page.locator('.culture-page').innerText(), entry = await state(page)
    const layout = await geometry(page, '.culture-page')
    assert.equal(entry.state.view, 'culture')
    await page.getByRole('button', { name: '浏览产品库', exact: true }).scrollIntoViewIfNeeded()
    await until(() => page.evaluate(() => scrollY > 0), 'Culture page scrolls')
    await page.getByRole('button', { name: '浏览产品库', exact: true }).focus()
    const focusBeforeEscape = await state(page)
    await page.keyboard.press('Escape')
    assert.deepEqual(await state(page), focusBeforeEscape, 'Escape keeps the culture page and focus')
    const scrollBefore = await page.evaluate(() => scrollY)
    await shot(page, label)
    await page.getByRole('button', { name: '浏览产品库', exact: true }).click()
    await page.locator('.library-page').waitFor()
    const library = await state(page)
    assert.equal(library.length, entry.length + 1)
    await page.goBack(); await page.locator('.culture-page').waitFor()
    await until(() => page.evaluate((y) => Math.abs(scrollY - y) <= 1, scrollBefore), 'Back restores culture scroll')
    const back = await state(page), restoredScroll = await page.evaluate(() => scrollY)
    await page.goForward(); await page.locator('.library-page').waitFor()
    const forward = await state(page)
    await page.goBack(); await page.locator('.culture-page').waitFor()
    await page.reload(); await page.locator('.culture-page').waitFor()
    assert.equal(await page.locator('.culture-page').innerText(), text)
    const reload = await state(page)
    await navigate(page, '品牌文化')
    assert.equal((await state(page)).length, reload.length, 'Same view does not push history')
    return { text, entry, layout, focusBeforeEscape, scrollBefore, library, back, restoredScroll, forward, reload }
  })

  await run(viewport, 'catalog-collection-detail', async (page, label) => {
    await navigate(page, '产品库')
    await page.locator('.library-search input').fill('nArS')
    const sort = page.locator(viewport.width === 360 ? '.library-controls-mobile select' : '.desktop-sort select')
    await sort.selectOption('price-asc')
    const ordered = await ids(page)
    const card = page.locator('.library-results .product-card').first()
    const name = await card.locator('.product-name').innerText()
    const product = products.find((p) => p.name === name)
    await card.getByRole('button', { name: '收藏', exact: true }).click()
    await navigate(page, '肤质指南')
    await navigate(page, '品牌文化')
    await page.getByRole('button', { name: '浏览产品库', exact: true }).click()
    assert.equal(await page.locator('.library-search input').inputValue(), 'nArS')
    assert.equal(await sort.inputValue(), 'price-asc')
    assert.deepEqual(await ids(page), ordered)
    await card.getByRole('button', { name, exact: true }).click()
    const dialog = page.getByRole('dialog')
    await dialog.waitFor()
    const opened = await state(page)
    assert.equal(opened.state.drawerProductId, product.id)
    await dialog.evaluate((el) => { el.scrollTop = el.scrollHeight })
    assert(await dialog.evaluate((el) => el.scrollTop > 0))
    await page.getByRole('button', { name: '关闭详情', exact: true }).focus()
    await shot(page, `${label}-drawer`)
    await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'detached' })
    const closed = await state(page)
    await navigate(page, '我的收藏')
    assert.equal(await page.locator('.favorite-name').innerText(), name)
    await page.getByRole('combobox').selectOption('正在用')
    await navigate(page, '肤质指南'); await page.goBack(); await page.locator('.favorites-page').waitFor()
    assert.equal(await page.getByRole('combobox').inputValue(), '正在用')
    await navigate(page, '品牌文化'); await page.goBack(); await page.locator('.favorites-page').waitFor()
    assert.equal(await page.getByRole('combobox').inputValue(), '正在用')
    await page.reload(); await page.locator('.favorites-page').waitFor()
    assert.equal(await page.getByRole('combobox').inputValue(), '正在用')
    const saved = await page.evaluate((key) => localStorage.getItem(key), collectionKey)
    assert.equal(saved, JSON.stringify({ [product.id]: '正在用' }))
    await shot(page, label)
    return { ordered, name, opened, closed, saved, layout: await geometry(page, '.favorites-page') }
  })

  await run(viewport, 'assistant-return', async (page, label) => {
    await navigate(page, '小Y智能选妆'); await page.locator('.makeup-workbench').waitFor()
    const prompt = '我是混油皮，想要柔雾通勤底妆'
    await page.locator('.xiaoy-prompts').getByRole('button', { name: prompt, exact: true }).click()
    await until(async () => await page.locator('.xiaoy-message.assistant').count() === 2, 'Local recommendation completes')
    const text = await page.locator('.xiaoy-chat').innerText()
    const form = await page.locator('.makeup-workbench').locator('input,select').evaluateAll((els) => els.map((el) => ({ name: el.name, value: el.value })))
    await navigate(page, '肤质指南'); await page.goBack(); await page.locator('.makeup-workbench').waitFor()
    assert.equal(await page.locator('.xiaoy-chat').innerText(), text)
    await navigate(page, '品牌文化'); await page.goBack(); await page.locator('.makeup-workbench').waitFor()
    assert.equal(await page.locator('.xiaoy-chat').innerText(), text)
    assert.deepEqual(await page.locator('.makeup-workbench').locator('input,select').evaluateAll((els) => els.map((el) => ({ name: el.name, value: el.value }))), form)
    await shot(page, label)
    return { text, form, navigation: await state(page) }
  })

  await run(viewport, 'hash-home-deep-link', async (page, label) => {
    await page.goto(`${baseURL}/#culture`); await homeReady(page)
    const hashEntry = await state(page)
    assert.equal(hashEntry.state, null, 'Native same-document hash navigation has no app history marker')
    assert.equal(hashEntry.hash, '#culture')
    await page.reload(); await homeReady(page)
    const hashReload = await state(page)
    assert.equal(hashReload.state.view, 'home', 'No hash router exists')
    assert.equal(hashReload.hash, '', 'Existing mount replaces the hash with navigationPath')
    await navigate(page, '品牌文化')
    await page.getByRole('button', { name: '回到首页', exact: true }).click(); await homeReady(page)
    await navigate(page, '肤质指南')
    const entry = await state(page)
    await page.goto(`${baseURL}/products/estee-lauder-double-wear`)
    await page.locator('.product-profile-page').waitFor()
    const deepLink = await state(page)
    assert.equal(deepLink.state.productId, 'estee-lauder-double-wear')
    await navigate(page, '品牌文化'); await page.goBack(); await page.locator('.product-profile-page').waitFor()
    await page.reload(); await page.locator('.product-profile-page').waitFor()
    const reload = await state(page)
    assert.equal(reload.path, deepLink.path)
    assert.equal(reload.state.productId, deepLink.state.productId)
    await shot(page, label)
    return { hashEntry, hashReload, entry, deepLink, reload }
  })
}
await browser.close()
await fs.writeFile(path.join(outputDir, 'results.json'), JSON.stringify({ baseURL, browserVersion: browser.version(), results }, null, 2))
assert(results.every((r) => r.passed), `${results.filter((r) => !r.passed).length}/${results.length} failed`)
console.log(`${results.length}/${results.length} passed; ${outputDir}`)
