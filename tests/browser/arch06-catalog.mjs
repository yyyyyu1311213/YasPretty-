// Run with the existing Playwright/Chrome runtime; evidence stays in ignored .qa/.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { products, categoryOptions, skinOptions, finishOptions, quickFilters } from '../../src/data/products.js'

const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const baseURL = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5194'
assert(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(baseURL).hostname))
const outputDir = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/arch-06-before')
await fs.mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}) })
const results = []
const empty = { categories: [], skins: [], finishes: [], coverages: [], minWear: '', oxidations: [], regions: [], price: '', keyword: '', scene: '', maxPrice: null }

// Independent oracle frozen from the accepted pre-migration behavior, not the new Utils.
function expected(filters = empty, sort = 'recommended') {
  return products.filter((p) => {
    const needle = filters.keyword.trim().toLowerCase()
    if (needle && ![p.brand, p.name, p.category, ...p.shades.flatMap(Object.values), ...p.scenes].join(' ').toLowerCase().includes(needle)) return false
    if (filters.categories.length && !filters.categories.includes(p.category)) return false
    if (filters.skins.length && !filters.skins.some((v) => p.skins.includes(v))) return false
    if (filters.finishes.length && !filters.finishes.includes(p.finish)) return false
    if (filters.coverages.length && !filters.coverages.includes(p.coverage)) return false
    if (filters.minWear && p.wear < Number(filters.minWear)) return false
    if (filters.oxidations.length && !filters.oxidations.includes(p.oxidation)) return false
    if (filters.regions.length && !filters.regions.includes(p.brandRegion)) return false
    if (filters.price) { const [min, max] = filters.price.split('-').map(Number); if (p.price < min || p.price > max) return false }
    if (filters.maxPrice && p.price > filters.maxPrice) return false
    return !filters.scene || p.scenes.includes(filters.scene)
  }).sort((a, b) => sort === 'rating' ? b.rating - a.rating : sort === 'price-asc' ? a.price - b.price : sort === 'price-desc' ? b.price - a.price : b.rating * 10 + b.wear - (a.rating * 10 + a.wear)).map((p) => p.id)
}

async function until(check, message) {
  const end = Date.now() + 12000
  while (Date.now() < end) { if (await check()) return; await new Promise((resolve) => setTimeout(resolve, 40)) }
  assert.fail(message)
}

async function navigate(page, name) {
  const accessibleName = name === '我的收藏' ? /^我的收藏/ : name
  if (await page.getByRole('button', { name: '打开导航', exact: true }).isVisible()) {
    await page.getByRole('button', { name: '打开导航', exact: true }).click()
    await page.locator('.mobile-nav').getByRole('button', { name: accessibleName, exact: true }).click()
  } else await page.locator('.desktop-nav').getByRole('button', { name: accessibleName, exact: true }).click()
}

async function library(page) {
  await navigate(page, '产品库')
  await page.locator('.library-page').waitFor()
}

async function ids(page) {
  const names = await page.locator('.library-results .product-name').allTextContents()
  return names.map((name) => { const p = products.find((item) => item.name === name); assert(p, name); return p.id })
}

async function checkResults(page, filters = empty, sort = 'recommended') {
  const want = expected(filters, sort)
  await until(async () => JSON.stringify(await ids(page)) === JSON.stringify(want), 'Exact ordered product IDs')
  assert.equal(await page.locator('.results-toolbar strong').textContent(), String(want.length))
  return { ids: await ids(page), count: want.length }
}

async function openFilters(page) {
  if (await page.locator('.filter-button').isVisible() && !(await page.locator('.filter-panel').getAttribute('class')).includes('open')) await page.locator('.filter-button').click()
}
async function closeFilters(page) {
  if (await page.locator('.filter-close').isVisible()) await page.locator('.filter-close').click()
}
async function clear(page) {
  await openFilters(page)
  await page.locator('.filter-panel .clear-button').click()
}
function group(page, label) { return page.locator('.filter-group').filter({ has: page.locator('p', { hasText: new RegExp(`^${label}$`) }) }) }
async function choose(page, label, value) {
  await openFilters(page)
  await group(page, label).getByRole('button', { name: value, exact: true }).click()
}
async function layout(page, selector) {
  return page.locator(selector).evaluate((root) => {
    const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } }
    const boxes = [...root.querySelectorAll('button,input,select')].filter((el) => el.checkVisibility()).map((el) => ({ name: el.getAttribute('aria-label') || el.textContent.trim(), ...box(el) }))
    return { root: box(root), viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, controls: boxes }
  })
}
async function screenshot(page, label) { await page.screenshot({ path: path.join(outputDir, `${label}.png`), animations: 'disabled' }) }
async function home(page) {
  await page.getByRole('button', { name: '回到首页', exact: true }).click()
  const skip = page.getByRole('button', { name: /跳过/ }).first()
  if (await skip.isVisible()) await skip.click()
  await until(async () => page.evaluate(() => document.body.style.overflow !== 'hidden'), 'Home opening scroll unlock')
}

async function run(viewport, name, body, mode = '') {
  const label = `${viewport.width}-${name}`
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const pageErrors = [], consoleErrors = [], failedRequests = [], badResponses = [], apiRequests = []
  page.on('request', (r) => { if (new URL(r.url()).pathname.startsWith('/api/')) apiRequests.push(r.url()) })
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('requestfailed', (r) => failedRequests.push({ url: r.url(), failure: r.failure()?.errorText }))
  page.on('response', (r) => { if (r.status() >= 400) badResponses.push({ url: r.url(), status: r.status() }) })
  try {
    if (mode === 'image') await page.route('**/products/*/cover.webp', (route) => route.abort('failed'))
    if (mode === 'empty') await page.route('**/src/data/products.js*', async (route) => {
      const response = await route.fetch()
      const source = await response.text()
      assert(source.includes('].map(enrichProductRecord)'))
      await route.fulfill({ response, body: source.replace('].map(enrichProductRecord)', '].map(enrichProductRecord).slice(0, 0)') })
    })
    await page.goto(baseURL)
    const evidence = await body(page, label)
    assert.deepEqual(pageErrors, [])
    assert.deepEqual(apiRequests, [], 'Catalog interactions remain independent of external APIs')
    const localFailures = failedRequests.filter((r) => new URL(r.url).origin === new URL(baseURL).origin)
    if (mode === 'image') assert(localFailures.length > 0 && localFailures.every((r) => /\/products\/.+\/cover.webp/.test(r.url)))
    else assert.deepEqual(localFailures, [])
    assert.deepEqual(badResponses, [])
    assert(consoleErrors.every((e) => /Failed to load resource: net::ERR_(?:FAILED|NETWORK_ACCESS_DENIED)/.test(e)), consoleErrors.join('\n'))
    results.push({ label, passed: true, evidence, pageErrors, consoleErrors, failedRequests, badResponses })
    console.log(`PASS ${label}`)
  } catch (error) {
    results.push({ label, passed: false, error: error.stack, pageErrors, consoleErrors, failedRequests, badResponses })
    console.error(`FAIL ${label}: ${error.message}`)
    await screenshot(page, `${label}-failed`).catch(() => {})
  } finally { await context.close() }
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
  await run(viewport, 'search-sort', async (page, label) => {
    await library(page)
    const initial = await checkResults(page)
    await screenshot(page, label)
    const geometry = await layout(page, '.library-page')
    assert(geometry.documentWidth <= viewport.width)
    const searches = []
    for (const keyword of ['nArS', '  ', products[0].shades[0].name, '通勤', '腮红', 'ARCH06-no-such-product']) {
      await page.locator('.library-search input').fill(keyword)
      searches.push({ keyword, ...await checkResults(page, { ...empty, keyword }) })
    }
    assert.equal(await page.locator('.empty-results h2').textContent(), '没有找到对应档案')
    await screenshot(page, `${label}-empty`)
    await page.getByRole('button', { name: '清空筛选', exact: true }).click()
    const sorts = []
    const select = page.getByRole('combobox', { name: '排序方式' }).filter({ visible: true })
    for (const sort of ['recommended', 'rating', 'price-asc', 'price-desc']) {
      await select.selectOption(sort)
      sorts.push({ sort, ...await checkResults(page, empty, sort) })
    }
    await select.focus(); await page.keyboard.press('Home'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter')
    const keyboardSort = await select.inputValue()
    await checkResults(page, empty, keyboardSort)
    return { initial, searches, sorts, keyboardSort, geometry }
  })

  await run(viewport, 'filters', async (page, label) => {
    await library(page)
    const cases = [
      ['产品类别', 'categories', categoryOptions], ['适合肤质', 'skins', skinOptions], ['妆效', 'finishes', finishOptions],
      ['遮瑕度', 'coverages', ['低', '中', '高']], ['氧化程度', 'oxidations', ['低', '中']],
      ['品牌地区', 'regions', ['中国', '法国', '美国', '意大利', '韩国']],
    ]
    const checks = []
    for (const [label, key, values] of cases) for (const value of values) {
      await clear(page); await choose(page, label, value)
      checks.push({ key, value, ...await checkResults(page, { ...empty, [key]: [value] }) })
      await choose(page, label, value)
      await checkResults(page)
    }
    for (const minWear of ['', '6', '8', '10']) {
      await clear(page); await choose(page, '持妆时长', minWear ? `${minWear}h+` : '不限')
      checks.push({ minWear, ...await checkResults(page, { ...empty, minWear }) })
    }
    for (const [price, name] of [['', '不限'], ['0-200', '200 元以下'], ['200-400', '200 - 400'], ['400-800', '400 元以上']]) {
      await clear(page); await choose(page, '价格区间', name)
      checks.push({ price, ...await checkResults(page, { ...empty, price }) })
    }
    await clear(page)
    await choose(page, '适合肤质', '油皮'); await choose(page, '适合肤质', '干皮')
    await choose(page, '妆效', '柔雾'); await choose(page, '价格区间', '200 - 400')
    const combined = await checkResults(page, { ...empty, skins: ['油皮', '干皮'], finishes: ['柔雾'], price: '200-400' })
    await page.locator('.filter-panel').evaluate((el) => { el.scrollTop = 0 })
    await screenshot(page, label)
    const panel = await layout(page, '.filter-panel')
    assert(panel.root.width <= viewport.width)
    await page.keyboard.press('Escape')
    if (viewport.width === 360) {
      assert(!(await page.locator('.filter-panel').getAttribute('class')).includes('open'))
      await openFilters(page); await closeFilters(page)
      await openFilters(page); await page.locator('.filter-backdrop').click({ position: { x: viewport.width - 5, y: 200 } })
    }
    await navigate(page, '品牌文化'); await library(page)
    const restored = await checkResults(page, { ...empty, skins: ['油皮', '干皮'], finishes: ['柔雾'], price: '200-400' })
    await clear(page); await closeFilters(page); await checkResults(page)
    return { checks, combined, restored, panel }
  })

  await run(viewport, 'drawer-history-collection', async (page, label) => {
    await library(page)
    const product = products.find((p) => p.id === expected()[0])
    const card = page.locator('.product-card').filter({ has: page.getByRole('button', { name: product.name, exact: true }) })
    await card.getByRole('button', { name: product.name, exact: true }).focus()
    await page.keyboard.press('Enter')
    const drawer = page.getByRole('dialog')
    await drawer.waitFor()
    const first = await drawer.innerText()
    assert.equal(await drawer.locator('h2').textContent(), product.name)
    const navigation = await page.evaluate(() => ({ path: location.pathname, state: history.state, focus: document.activeElement?.className, bodyOverflow: document.body.style.overflow }))
    assert.equal(navigation.state.drawerProductId, product.id)
    const shadeNames = await drawer.locator('.shade-choice').allTextContents()
    if (shadeNames.length > 1) {
      await drawer.locator('.shade-choice').nth(1).click()
      assert.equal(await drawer.locator('.shade-choice.selected').innerText(), shadeNames[1])
    }
    await drawer.getByRole('button', { name: '收藏这款', exact: true }).click()
    await drawer.getByRole('combobox', { name: '收藏状态' }).selectOption('正在用')
    await drawer.evaluate((el) => { el.scrollTop = el.scrollHeight })
    const scroll = await drawer.evaluate((el) => ({ top: el.scrollTop, height: el.clientHeight, scrollHeight: el.scrollHeight }))
    assert(scroll.top > 0)
    const similarName = await drawer.locator('.recommendation-list button').first().innerText()
    await drawer.locator('.recommendation-list button').first().click()
    const similar = await page.evaluate(() => history.state.drawerProductId)
    const resetShade = await drawer.locator('.shade-choice.selected').innerText()
    assert.equal(resetShade, products.find((p) => p.id === similar).shades[0].name)
    await page.keyboard.press('Escape'); await drawer.waitFor({ state: 'detached' })
    const closedFocus = await page.evaluate(() => document.activeElement?.className)
    if (viewport.width === 1440) {
      await card.getByRole('button', { name: product.name, exact: true }).click()
      await page.locator('.dialog-backdrop').click({ position: { x: 2, y: 400 } })
      await drawer.waitFor({ state: 'detached' })
    }
    await card.getByRole('button', { name: product.name, exact: true }).click()
    await screenshot(page, label)
    const drawerGeometry = await layout(page, '.detail-drawer')
    assert(drawerGeometry.root.width <= viewport.width)
    await page.reload(); await page.getByRole('dialog').waitFor()
    assert.equal(await page.getByRole('combobox', { name: '收藏状态' }).inputValue(), '正在用')
    await page.getByRole('button', { name: '关闭详情', exact: true }).click()
    await page.getByRole('dialog').waitFor({ state: 'detached' })
    await navigate(page, '我的收藏')
    assert.equal(await page.locator('.favorite-name').textContent(), product.name)
    await page.locator('.favorite-name').click(); await page.getByRole('dialog').waitFor()
    await page.getByRole('button', { name: '返回上一级', exact: true }).click()
    await page.getByRole('dialog').waitFor({ state: 'detached' })
    await page.locator('.favorite-name').click()
    await page.getByRole('button', { name: '查看完整产品资料', exact: true }).click()
    await page.locator('.product-profile-page').waitFor()
    assert.equal(new URL(page.url()).pathname, `/products/${product.id}`)
    const profile = await page.locator('.product-profile-page').innerText()
    await page.reload(); await page.locator('.product-profile-page').waitFor()
    assert.equal(await page.getByRole('combobox', { name: '收藏状态' }).inputValue(), '正在用')
    await screenshot(page, `${label}-profile`)
    await page.getByRole('button', { name: '返回', exact: true }).click()
    await page.getByRole('dialog').waitFor()
    await page.goBack(); await page.getByRole('dialog').waitFor({ state: 'detached' })
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('base-archive-collection')))
    assert.deepEqual(stored, { [product.id]: '正在用' })
    await page.getByRole('button', { name: '取消', exact: true }).click()
    assert.equal(await page.locator('.empty-favorites h2').textContent(), '收藏清单还是空的')
    return { productId: product.id, first, navigation, shadeNames, scroll, similarName, similar, resetShade, closedFocus, drawerGeometry, profile, stored }
  })

  await run(viewport, 'direct-link', async (page, label) => {
    const product = products[0]
    await page.goto(`${baseURL}/products/${product.id}`)
    await page.locator('.product-profile-page').waitFor()
    const before = await page.locator('.product-profile-page').innerText()
    await page.reload(); await page.locator('.product-profile-page').waitFor()
    assert.equal(await page.locator('.product-profile-page').innerText(), before)
    const geometry = await layout(page, '.product-profile-page')
    assert(geometry.documentWidth <= viewport.width)
    await screenshot(page, label)
    await page.getByRole('button', { name: '返回', exact: true }).click(); await page.locator('.library-page').waitFor()
    return { productId: product.id, before, geometry, pathAfterReturn: new URL(page.url()).pathname }
  })

  await run(viewport, 'home-guide', async (page) => {
    await library(page); await home(page)
    const checks = []
    await page.getByRole('textbox', { name: '搜索品牌、产品名或色号' }).fill('nArS')
    await page.locator('.hero-search').getByRole('button', { name: '搜索', exact: true }).click()
    checks.push({ kind: 'home-search', ...await checkResults(page, { ...empty, keyword: 'nArS' }) })
    for (const filter of quickFilters) {
      await home(page)
      await page.locator('.quick-links').getByRole('button', { name: filter.label, exact: true }).click()
      checks.push({ kind: filter.label, ...await checkResults(page, { ...empty, ...filter.query }) })
    }
    await navigate(page, '肤质指南'); await page.getByRole('button', { name: '按此筛选', exact: true }).first().click()
    checks.push({ kind: 'guide', ...await checkResults(page, { ...empty, skins: ['油皮'], minWear: 8 }) })
    await home(page)
    const featured = [...products].sort((a, b) => b.rating - a.rating)[0]
    const card = page.locator('.featured-grid .product-name').first()
    if (await card.isVisible()) await card.click()
    else {
      const carousel = page.getByRole('region', { name: '精选产品轮播' })
      await carousel.focus(); await page.keyboard.press('Home'); await page.keyboard.press('Enter')
    }
    await page.getByRole('dialog').waitFor()
    assert.equal(await page.getByRole('dialog').locator('h2').innerText(), featured.name)
    const homeDetail = { id: await page.evaluate(() => history.state.drawerProductId), text: await page.getByRole('dialog').innerText() }
    await page.keyboard.press('Escape'); await page.getByRole('dialog').waitFor({ state: 'detached' })
    return { checks, homeDetail }
  })

  await run(viewport, 'image-failure', async (page, label) => {
    await library(page)
    await page.locator('.product-photo-fallback').first().waitFor()
    const fallback = await page.locator('.product-photo-fallback').first().innerText()
    await screenshot(page, label)
    const ordered = await ids(page)
    assert.deepEqual(ordered, expected())
    return { fallback, ordered }
  }, 'image')

  await run(viewport, 'empty-data', async (page, label) => {
    await library(page)
    assert.equal(await page.locator('.results-toolbar strong').textContent(), '0')
    await page.locator('.empty-results').waitFor()
    await page.getByRole('button', { name: '清空筛选', exact: true }).click()
    assert.equal(await page.locator('.results-toolbar strong').textContent(), '0')
    await screenshot(page, label)
    return { message: await page.locator('.empty-results').innerText() }
  }, 'empty')
}

await browser.close()
await fs.writeFile(path.join(outputDir, 'results.json'), JSON.stringify({ baseURL, browserVersion: browser.version(), results }, null, 2))
assert(results.every((r) => r.passed), `${results.filter((r) => !r.passed).length}/${results.length} failed`)
console.log(`${results.length}/${results.length} passed; ${outputDir}`)
