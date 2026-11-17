// Run identical scenarios against the accepted baseline and migrated working tree.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { products, quickFilters } from '../../src/data/products.js'

const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const baseURL = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5198'
assert(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(baseURL).hostname))
const outputDir = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/arch-08-before')
await fs.mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}) })
const results = []
const featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, 12)
const key = 'base-archive-collection'

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
async function homeReady(page) {
  const skip = page.getByRole('button', { name: /跳过/ }).first()
  if (await skip.isVisible()) await skip.click()
  await page.locator('.home-motion-stage.is-ready').waitFor()
  await until(async () => page.evaluate(() => document.body.style.overflow !== 'hidden'), 'Home scroll unlocked')
}
async function home(page) { await page.getByRole('button', { name: '回到首页', exact: true }).click(); await homeReady(page) }
async function shot(page, label) { await page.screenshot({ path: path.join(outputDir, `${label}.png`), animations: 'disabled' }) }
async function geometry(page, selector) {
  const result = await page.locator(selector).evaluate((root) => {
    const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } }
    return { root: box(root), viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, controls: [...root.querySelectorAll('button,input,select')].filter((el) => el.checkVisibility()).map((el) => ({ name: el.getAttribute('aria-label') || el.textContent.trim(), ...box(el) })) }
  })
  assert(result.documentWidth <= result.viewport, 'No horizontal overflow')
  for (let a = 0; a < result.controls.length; a++) for (let b = a + 1; b < result.controls.length; b++) {
    const x = result.controls[a], y = result.controls[b]
    assert(Math.min(x.x + x.width, y.x + y.width) - Math.max(x.x, y.x) <= 1 || Math.min(x.y + x.height, y.y + y.height) - Math.max(x.y, y.y) <= 1, `Controls overlap: ${x.name}/${y.name}`)
  }
  return result
}
async function ids(page, selector) {
  return (await page.locator(selector).allTextContents()).map((name) => { const p = products.find((p) => p.name === name); assert(p, name); return p.id })
}
async function collection(page, expected) {
  await until(async () => await page.evaluate((k) => localStorage.getItem(k), key) === JSON.stringify(expected), 'Same collection storage')
  return page.evaluate((k) => localStorage.getItem(k), key)
}
async function close(page, method = 'Escape') {
  if (method === 'Escape') await page.keyboard.press('Escape')
  else await page.getByRole('button', { name: method, exact: true }).click()
  await page.getByRole('dialog').waitFor({ state: 'detached' })
}

async function run(viewport, name, body, mode = '') {
  const label = `${viewport.width}-${name}`
  const context = await browser.newContext({ viewport, reducedMotion: name === 'enhanced-detail' ? 'no-preference' : 'reduce', deviceScaleFactor: 1 })
  // Synthetic, isolated storage; no personal browser profile or provider calls.
  await context.addInitScript(() => {
    if (!sessionStorage.getItem('arch08-seeded')) {
      localStorage.clear()
      localStorage.setItem('yaspretty-xiaoy-profile-v1', JSON.stringify({ version: 1, value: { skin: '混油皮', budget: 400 } }))
      sessionStorage.setItem('arch08-seeded', 'yes')
    }
  })
  const page = await context.newPage()
  const pageErrors = [], consoleErrors = [], failedRequests = [], badResponses = [], apiRequests = []
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('requestfailed', (r) => failedRequests.push({ url: r.url(), failure: r.failure()?.errorText }))
  page.on('response', (r) => { if (r.status() >= 400) badResponses.push({ url: r.url(), status: r.status() }) })
  page.on('request', (r) => { if (new URL(r.url()).pathname.startsWith('/api/')) apiRequests.push(r.url()) })
  try {
    // Removing the enhanced item list exercises its existing ProductCard fallback.
    if (['static', 'image', 'empty'].includes(mode)) await page.route(url => /\/src\/components\/(?:visual\/)?FlexCarousel\.jsx$/.test(url.pathname), async (route) => {
      const response = await route.fetch()
      const source = await response.text()
      assert(source.includes('Array.isArray(items)'))
      await route.fulfill({ response, body: source.replace('Array.isArray(items)', 'false && Array.isArray(items)') })
    })
    if (mode === 'image') await page.route('**/products/*/cover.webp', (route) => route.abort('failed'))
    if (mode === 'empty') await page.route('**/src/data/products.js*', async (route) => {
      const response = await route.fetch(), source = await response.text()
      assert(source.includes('].map(enrichProductRecord)'))
      await route.fulfill({ response, body: source.replace('].map(enrichProductRecord)', '].map(enrichProductRecord).slice(0, 0)') })
    })
    await page.goto(baseURL)
    await homeReady(page)
    const evidence = await body(page, label)
    assert.deepEqual(pageErrors, [])
    assert.deepEqual(apiRequests, [], 'These paths stay local')
    assert.deepEqual(badResponses, [])
    const localFailures = failedRequests.filter((r) => new URL(r.url).origin === new URL(baseURL).origin)
    if (mode === 'image') assert(localFailures.length > 0 && localFailures.every((r) => /\/products\/.+\/cover.webp/.test(r.url)))
    else assert.deepEqual(localFailures, [])
    assert(failedRequests.every((r) => r.url.startsWith('https://fonts.googleapis.com/') || (mode === 'image' && /\/cover.webp$/.test(r.url))), JSON.stringify(failedRequests))
    assert(consoleErrors.every((e) => /Failed to load resource: net::ERR_(?:FAILED|NETWORK_ACCESS_DENIED)/.test(e)), consoleErrors.join('\n'))
    results.push({ label, passed: true, evidence, pageErrors, consoleErrors, failedRequests, badResponses })
    console.log(`PASS ${label}`)
  } catch (error) {
    results.push({ label, passed: false, error: error.stack, pageErrors, consoleErrors, failedRequests, badResponses })
    console.error(`FAIL ${label}: ${error.message}`)
    await shot(page, `${label}-failed`).catch(() => {})
  } finally { await context.close() }
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
  await run(viewport, 'entry-cta-assistant', async (page, label) => {
    const hero = await page.locator('.home-hero').evaluate((el) => ({ display: getComputedStyle(el).display, minHeight: getComputedStyle(el).minHeight, height: el.getBoundingClientRect().height, text: el.textContent, image: el.querySelector('img').currentSrc.replace(location.origin, '') }))
    // The accepted source has a visible full hero at BOTH viewports.
    assert.equal(hero.display, 'block')
    assert(hero.height >= 500)
    await page.locator('.home-hero').scrollIntoViewIfNeeded()
    const homeGeometry = await geometry(page, '.hero-copy')
    await shot(page, `${label}-hero`)
    const links = await page.locator('.home-motion-stage a').evaluateAll((links) => links.map((a) => ({ text: a.textContent, href: a.getAttribute('href') })))
    await page.getByRole('button', { name: '创建我的妆容方案', exact: true }).click()
    await page.locator('.makeup-workbench').waitFor()
    const entry = await page.evaluate(() => ({ path: location.pathname, view: history.state.view, productId: history.state.productId, drawerProductId: history.state.drawerProductId }))
    assert.equal(entry.view, 'assistant')
    assert.equal(await page.getByRole('textbox', { name: '向小Y描述你的需求' }).inputValue(), '')
    const prompts = await page.locator('.xiaoy-prompts button').allTextContents()
    assert.equal(prompts.length, 4)
    await page.getByRole('textbox', { name: '向小Y描述你的需求' }).fill('合成草稿')
    const prompt = '我是混油皮，想要柔雾通勤底妆'
    await page.locator('.xiaoy-prompts').getByRole('button', { name: prompt, exact: true }).click()
    await until(async () => await page.locator('.xiaoy-message.user').count() === 1, 'Quick prompt sends directly')
    assert.equal(await page.locator('.xiaoy-message.user').innerText(), prompt)
    assert.equal(await page.getByRole('textbox', { name: '向小Y描述你的需求' }).inputValue(), '')
    await until(async () => await page.locator('.xiaoy-message.assistant').count() === 2, 'Local reply')
    const text = await page.locator('.xiaoy-chat').innerText()
    await shot(page, `${label}-assistant`)
    await home(page)
    await page.getByRole('button', { name: '创建我的妆容方案', exact: true }).click()
    assert.equal(await page.locator('.xiaoy-chat').innerText(), text)
    await page.reload(); await page.locator('.makeup-workbench').waitFor()
    assert.equal(await page.locator('.xiaoy-chat').innerText(), text)
    return { hero, links, homeGeometry, entry, prompts, text, profile: await page.evaluate(() => localStorage.getItem('yaspretty-xiaoy-profile-v1')) }
  })

  await run(viewport, 'search-quick-filters', async (page) => {
    const checks = []
    await page.getByRole('textbox', { name: '搜索品牌、产品名或色号' }).fill('nArS')
    await page.locator('.hero-search').getByRole('button', { name: '搜索', exact: true }).click()
    checks.push({ keyword: await page.locator('.library-search input').inputValue(), ids: await ids(page, '.library-results .product-name') })
    for (const filter of quickFilters) {
      await home(page)
      await page.locator('.quick-links').getByRole('button', { name: filter.label, exact: true }).click()
      await page.locator('.library-page').waitFor()
      checks.push({ label: filter.label, ids: await ids(page, '.library-results .product-name'), path: new URL(page.url()).pathname })
    }
    await home(page)
    assert.equal(await page.getByRole('textbox', { name: '搜索品牌、产品名或色号' }).inputValue(), '')
    await page.getByRole('button', { name: '查看产品库', exact: true }).click()
    checks.push({ keyword: await page.locator('.library-search input').inputValue(), ids: await ids(page, '.library-results .product-name') })
    return checks
  })

  await run(viewport, 'enhanced-detail', async (page, label) => {
    const carousel = page.getByRole('region', { name: '精选产品轮播' })
    await carousel.waitFor(); await carousel.scrollIntoViewIfNeeded()
    await carousel.focus(); await page.keyboard.press('Home')
    const carouselText = await carousel.innerText()
    await shot(page, `${label}-carousel`)
    await page.keyboard.press('Enter'); await page.getByRole('dialog').waitFor()
    assert.equal(await page.evaluate(() => history.state.drawerProductId), featured[0].id)
    const dialog = page.getByRole('dialog')
    assert.equal(await dialog.locator('h2').innerText(), featured[0].name)
    await dialog.evaluate((el) => { el.scrollTop = el.scrollHeight })
    await until(async () => dialog.evaluate((el) => el.scrollTop > 0), 'Drawer internal scrolling')
    const scroll = await dialog.evaluate((el) => el.scrollTop)
    const detail = await dialog.innerText()
    await dialog.evaluate((el) => { el.scrollTop = 0 })
    await page.getByRole('button', { name: '关闭详情', exact: true }).focus()
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), '关闭详情')
    await shot(page, `${label}-drawer`)
    await close(page)
    const afterClose = await page.evaluate(() => ({ path: location.pathname, view: history.state.view, drawerProductId: history.state.drawerProductId, focus: document.activeElement.tagName, overflow: document.body.style.overflow }))
    await carousel.focus(); await page.keyboard.press('Home'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter')
    assert.equal(await page.evaluate(() => history.state.drawerProductId), featured[1].id)
    await close(page, '关闭详情')
    return { carouselText, detail, scroll, afterClose, geometry: await geometry(page, '.home-selection') }
  })

  await run(viewport, 'static-shared-collection', async (page, label) => {
    const cards = page.locator('.featured-grid .product-card')
    await cards.first().waitFor()
    const ordered = await ids(page, '.featured-grid .product-name')
    assert.deepEqual(ordered, featured.map((p) => p.id))
    await cards.first().getByRole('button', { name: '收藏', exact: true }).click()
    await collection(page, { [featured[0].id]: '想买' })
    await cards.first().getByRole('button', { name: featured[0].name, exact: true }).click()
    await page.getByRole('combobox', { name: '收藏状态' }).selectOption('会回购')
    await collection(page, { [featured[0].id]: '会回购' })
    await close(page)
    assert.equal(await cards.first().getByRole('button', { name: '取消收藏', exact: true }).count(), 1)
    await navigate(page, '产品库')
    const card = page.locator('.product-card').filter({ has: page.locator('.product-name', { hasText: featured[0].name }) })
    assert.equal(await card.getByRole('button', { name: '取消收藏', exact: true }).count(), 1)
    await card.getByRole('button', { name: featured[0].name, exact: true }).click()
    await page.getByRole('button', { name: '查看完整产品资料', exact: true }).click()
    await page.locator('.product-profile-page').waitFor()
    assert.equal(new URL(page.url()).pathname, `/products/${featured[0].id}`)
    assert.equal(await page.getByRole('combobox').inputValue(), '会回购')
    await page.reload(); await page.locator('.product-profile-page').waitFor()
    assert.equal(await page.getByRole('combobox').inputValue(), '会回购')
    await navigate(page, '我的收藏')
    assert.deepEqual(await ids(page, '.favorite-name'), [featured[0].id])
    await page.getByRole('combobox').selectOption('正在用')
    const saved = await collection(page, { [featured[0].id]: '正在用' })
    await home(page)
    await cards.first().scrollIntoViewIfNeeded()
    await shot(page, label)
    const gridGeometry = await geometry(page, '.featured-grid')
    await cards.first().getByRole('button', { name: featured[0].name, exact: true }).click()
    assert.equal(await page.getByRole('combobox').inputValue(), '正在用')
    await close(page, '返回上一级')
    await cards.first().getByRole('button', { name: '取消收藏', exact: true }).click()
    await collection(page, {})
    await navigate(page, '我的收藏')
    assert.equal(await page.locator('.empty-favorites h2').innerText(), '收藏清单还是空的')
    return { ordered, saved, gridGeometry }
  }, 'static')

  await run(viewport, 'image-failure', async (page, label) => {
    const fallback = page.locator('.featured-grid .product-photo-fallback')
    await fallback.first().waitFor()
    await fallback.first().scrollIntoViewIfNeeded()
    await shot(page, label)
    assert.equal(await fallback.first().innerText(), '图片暂不可用')
    await page.locator('.featured-grid .product-name').first().click()
    assert.equal(await page.evaluate(() => history.state.drawerProductId), featured[0].id)
    await close(page)
    return { fallback: '图片暂不可用', ordered: await ids(page, '.featured-grid .product-name') }
  }, 'image')

  await run(viewport, 'empty-data', async (page, label) => {
    assert.equal(await page.locator('.product-card').count(), 0)
    const text = await page.locator('.home-selection').innerText()
    assert(text.includes('编辑精选'))
    await page.locator('.home-selection').scrollIntoViewIfNeeded()
    await shot(page, label)
    await page.getByRole('button', { name: '查看产品库', exact: true }).click()
    assert.equal(await page.locator('.empty-results h2').innerText(), '没有找到对应档案')
    return { text, message: await page.locator('.empty-results').innerText() }
  }, 'empty')
}
await browser.close()
await fs.writeFile(path.join(outputDir, 'results.json'), JSON.stringify({ baseURL, browserVersion: browser.version(), results }, null, 2))
assert(results.every((r) => r.passed), `${results.filter((r) => !r.passed).length}/${results.length} failed`)
console.log(`${results.length}/${results.length} passed; ${outputDir}`)
