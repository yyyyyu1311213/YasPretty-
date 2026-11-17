// Same scenarios run before and after migration, with isolated synthetic storage.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { products } from '../../src/data/products.js'

const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const baseURL = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5195'
assert(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(baseURL).hostname))
const outputDir = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/arch-07-before')
await fs.mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}) })
const results = []
const key = 'base-archive-collection'
const statuses = ['想买', '正在用', '会回购']
const sentinels = {
  'yaspretty-xiaoy-profile-v1': '{"version":1,"value":{"skin":"干皮"}}',
  'yaspretty-xiaoy-messages-v1': '{"version":1,"value":[]}',
  'yaspretty-xiaoy-profile': '{"skin":"混油皮"}',
  'yaspretty-xiaoy-messages': '[]',
  'yaspretty-xiaoy-config': 'synthetic-do-not-read',
  'arch07-unrelated': 'synthetic-sentinel',
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
async function stored(page, expected) {
  await until(async () => await page.evaluate((k) => localStorage.getItem(k), key) === JSON.stringify(expected), 'Exact unversioned storage bytes')
  return page.evaluate((k) => localStorage.getItem(k), key)
}
async function preserved(page) {
  const actual = await page.evaluate((keys) => Object.fromEntries(keys.map((k) => [k, localStorage.getItem(k)])), Object.keys(sentinels))
  assert.deepEqual(actual, sentinels)
  return actual
}
async function listIds(page) {
  return (await page.locator('.favorite-name').allTextContents()).map((name) => {
    const product = products.find((p) => p.name === name)
    assert(product, name)
    return product.id
  })
}
async function layout(page, selector) {
  const geometry = await page.locator(selector).evaluate((root) => {
    const rect = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } }
    return { documentWidth: document.documentElement.scrollWidth, viewport: innerWidth, controls: [...root.querySelectorAll('button,select')].filter((el) => el.checkVisibility()).map((el) => ({ name: el.getAttribute('aria-label') || el.textContent.trim(), ...rect(el) })) }
  })
  assert(geometry.documentWidth <= geometry.viewport, 'No horizontal overflow')
  const controls = geometry.controls
  for (let a = 0; a < controls.length; a++) for (let b = a + 1; b < controls.length; b++) {
    const x = controls[a], y = controls[b]
    assert(Math.min(x.x + x.width, y.x + y.width) - Math.max(x.x, y.x) <= 1 || Math.min(x.y + x.height, y.y + y.height) - Math.max(x.y, y.y) <= 1, `Controls overlap: ${x.name}/${y.name}`)
  }
  return geometry
}
async function screenshot(page, label) { await page.screenshot({ path: path.join(outputDir, `${label}.png`), animations: 'disabled' }) }
async function drawer(page, product) {
  await page.locator('.product-card').filter({ has: page.locator('.product-name', { hasText: product.name }) }).getByRole('button', { name: product.name, exact: true }).click()
  await page.getByRole('dialog').waitFor()
  assert.equal(await page.evaluate(() => history.state.drawerProductId), product.id)
}
async function close(page) { await page.keyboard.press('Escape'); await page.getByRole('dialog').waitFor({ state: 'detached' }) }

async function run(viewport, name, body, { raw, fault, expectedError } = {}) {
  const label = `${viewport.width}-${name}`
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' })
  await context.addInitScript(({ key, raw, sentinels, fault }) => {
    // Seed once per isolated context; subsequent reloads exercise actual persistence.
    if (!sessionStorage.getItem('arch07-seeded')) {
      for (const [k, value] of Object.entries(sentinels)) localStorage.setItem(k, value)
      if (raw !== undefined) localStorage.setItem(key, raw)
      sessionStorage.setItem('arch07-seeded', 'yes')
    }
    const method = fault === 'read' ? 'getItem' : fault === 'write' ? 'setItem' : null
    if (method) {
      const original = Storage.prototype[method]
      Storage.prototype[method] = function (k, ...args) {
        if (this === localStorage && k === key) throw new Error(`ARCH07 synthetic ${fault} failure`)
        return original.call(this, k, ...args)
      }
    }
  }, { key, raw, sentinels, fault })
  const page = await context.newPage()
  const pageErrors = [], consoleErrors = [], failedRequests = [], badResponses = [], apiRequests = []
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('requestfailed', (r) => failedRequests.push({ url: r.url(), failure: r.failure()?.errorText }))
  page.on('response', (r) => { if (r.status() >= 400) badResponses.push({ url: r.url(), status: r.status() }) })
  page.on('request', (r) => { if (new URL(r.url()).pathname.startsWith('/api/')) apiRequests.push(r.url()) })
  try {
    await page.goto(`${baseURL}/products/${products[0].id}`)
    if (expectedError) await until(async () => pageErrors.length > 0, 'Expected original React error')
    const evidence = await body(page, label)
    if (expectedError) {
      assert(pageErrors.length > 0 && pageErrors.every((error) => expectedError.test(error)), pageErrors.join('\n'))
      assert.equal(await page.locator('#root').innerText(), '')
    } else assert.deepEqual(pageErrors, [])
    assert.deepEqual(apiRequests, [])
    assert.deepEqual(badResponses, [])
    assert.deepEqual(failedRequests.filter((r) => new URL(r.url).origin === new URL(baseURL).origin), [])
    assert(failedRequests.every((r) => r.url.startsWith('https://fonts.googleapis.com/') && r.failure === 'net::ERR_NETWORK_ACCESS_DENIED'), JSON.stringify(failedRequests))
    assert(consoleErrors.every((e) => /Failed to load resource: net::ERR_NETWORK_ACCESS_DENIED/.test(e)), consoleErrors.join('\n'))
    results.push({ label, passed: true, evidence, pageErrors, consoleErrors, failedRequests, badResponses })
    console.log(`PASS ${label}`)
  } catch (error) {
    results.push({ label, passed: false, error: error.stack, pageErrors, consoleErrors, failedRequests, badResponses })
    console.error(`FAIL ${label}: ${error.message}`)
    await screenshot(page, `${label}-failed`).catch(() => {})
  } finally { await context.close() }
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
  await run(viewport, 'shared-flow', async (page, label) => {
    const product = products[0], second = products[1]
    await page.locator('.product-profile-page').waitFor()
    assert.equal(await stored(page, {}), '{}')
    await navigate(page, '我的收藏')
    assert.equal(await page.locator('.empty-favorites h2').innerText(), '收藏清单还是空的')
    const emptyGeometry = await layout(page, '.favorites-page')
    await screenshot(page, `${label}-empty`)
    await page.getByRole('button', { name: '浏览产品库', exact: true }).click()
    const card = page.locator('.product-card').filter({ has: page.locator('.product-name', { hasText: product.name }) })
    await card.getByRole('button', { name: '收藏', exact: true }).click()
    const states = [await stored(page, { [product.id]: '想买' })]
    await drawer(page, product)
    for (const status of statuses.slice(1)) {
      await page.getByRole('dialog').getByRole('combobox', { name: '收藏状态' }).selectOption(status)
      states.push(await stored(page, { [product.id]: status }))
    }
    await page.getByRole('dialog').getByRole('button', { name: '取消', exact: true }).click()
    states.push(await stored(page, {}))
    await page.getByRole('button', { name: '收藏这款', exact: true }).click()
    await close(page)
    await card.getByRole('button', { name: '取消收藏', exact: true }).click()
    await stored(page, {})
    await drawer(page, product)
    await page.getByRole('button', { name: '收藏这款', exact: true }).click()
    await page.getByRole('dialog').getByRole('button', { name: '查看完整产品资料', exact: true }).click()
    await page.locator('.product-profile-page').waitFor()
    assert.equal(new URL(page.url()).pathname, `/products/${product.id}`)
    await page.getByRole('combobox', { name: '收藏状态' }).selectOption('正在用')
    await stored(page, { [product.id]: '正在用' })
    await page.getByRole('button', { name: '取消', exact: true }).click()
    await page.getByRole('button', { name: '收藏这款', exact: true }).click()
    await page.getByRole('combobox', { name: '收藏状态' }).selectOption('会回购')
    const profileText = await page.locator('.product-profile-page').innerText()
    await page.reload(); await page.locator('.product-profile-page').waitFor()
    assert.equal(await page.locator('.product-profile-page').innerText(), profileText)
    await navigate(page, '产品库')
    assert.equal(await card.getByRole('button', { name: '取消收藏', exact: true }).count(), 1)
    const query = `${second.brand} ${second.name}`
    await page.locator('.library-search input').fill(query)
    await until(async () => await page.locator('.product-card').count() === 1, 'Unique brand and name query')
    await page.locator('.product-card').getByRole('button', { name: '收藏', exact: true }).click()
    await navigate(page, '我的收藏')
    assert.deepEqual(await listIds(page), [product.id, second.id])
    const first = page.locator('.favorite-item').first()
    await first.getByRole('combobox', { name: '收藏状态' }).focus()
    await page.keyboard.press('Home'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter')
    assert.equal(await first.getByRole('combobox').inputValue(), '正在用')
    await page.keyboard.press('Escape'); await page.keyboard.press('Tab')
    const listGeometry = await layout(page, '.favorites-page')
    await screenshot(page, label)
    await first.locator('.favorite-name').click()
    assert.equal(await page.getByRole('dialog').getByRole('combobox').inputValue(), '正在用')
    const drawerGeometry = await layout(page, '.detail-hero-info .status-control')
    await screenshot(page, `${label}-drawer`)
    await close(page)
    await page.locator('.favorite-item').last().getByRole('button', { name: '取消', exact: true }).click()
    assert.deepEqual(await listIds(page), [product.id])
    await navigate(page, '产品库')
    assert.equal(await page.locator('.library-search input').inputValue(), query)
    assert.equal(await page.locator('.product-card').getByRole('button', { name: '收藏', exact: true }).count(), 1)
    await page.getByRole('button', { name: '回到首页', exact: true }).click()
    const homeCards = page.locator('.featured-grid .product-card')
    await homeCards.first().waitFor()
    const featured = [...products].sort((a, b) => b.rating - a.rating)[0]
    const featuredCard = homeCards.first()
    await featuredCard.getByRole('button', { name: '收藏', exact: true }).click()
    await featuredCard.getByRole('button', { name: featured.name, exact: true }).click()
    await page.getByRole('dialog').getByRole('combobox').selectOption('会回购')
    await close(page)
    await navigate(page, '我的收藏')
    const finalIds = await listIds(page)
    assert.deepEqual(finalIds, products.filter((p) => [product.id, featured.id].includes(p.id)).map((p) => p.id))
    const final = await stored(page, { [product.id]: '正在用', [featured.id]: '会回购' })
    await page.reload(); await page.locator('.favorite-list').waitFor()
    assert.deepEqual(await listIds(page), finalIds)
    return { states, profileText, final, finalIds, preserved: await preserved(page), emptyGeometry, listGeometry, drawerGeometry }
  })

  const rawObject = { [products[3].id]: '会回购', [products[0].id]: '正在用', unknown: '想买', [products[1].id]: '' }
  await run(viewport, 'raw-object-order', async (page, label) => {
    await page.locator('.product-profile-page').waitFor()
    assert.equal(await page.getByRole('combobox').inputValue(), '正在用')
    await navigate(page, '我的收藏')
    const ids = await listIds(page)
    assert.deepEqual(ids, [products[0].id, products[3].id])
    assert.equal(await page.locator('.nav-count').textContent(), '4')
    assert.equal(await page.locator('.favorites-count').textContent(), '2 款')
    const raw = await stored(page, rawObject)
    await page.reload(); await page.locator('.favorite-list').waitFor()
    assert.deepEqual(await listIds(page), ids)
    const geometry = await layout(page, '.favorites-page')
    await screenshot(page, label)
    return { ids, raw, preserved: await preserved(page), geometry }
  }, { raw: JSON.stringify(rawObject) })

  for (const [name, raw] of [['missing', undefined], ['broken-json', '{broken'], ['empty-string', '']]) {
    await run(viewport, name, async (page) => {
      await page.locator('.product-profile-page').waitFor()
      const value = await stored(page, {})
      await navigate(page, '我的收藏')
      assert.equal(await page.locator('.empty-favorites h2').innerText(), '收藏清单还是空的')
      return { value, preserved: await preserved(page) }
    }, { raw })
  }
  await run(viewport, 'read-failure', async (page) => {
    await page.locator('.product-profile-page').waitFor()
    await navigate(page, '我的收藏')
    assert.equal(await page.locator('.empty-favorites h2').innerText(), '收藏清单还是空的')
    return { preserved: await preserved(page), empty: true }
  }, { fault: 'read' })
  for (const [name, options] of [['write-failure', { fault: 'write', expectedError: /ARCH07 synthetic write failure/ }], ['null-shape', { raw: 'null', expectedError: /Cannot convert undefined or null to object/ }]]) {
    await run(viewport, name, async (page, label) => {
      await until(async () => await page.locator('#root').innerText() === '', 'Original root failure')
      // Wait for React to report its asynchronous error, independently of root text.
      await until(async () => page.evaluate(() => !document.querySelector('.site-header')), 'Root unmounted')
      await screenshot(page, label)
      return { rootEmpty: true, preserved: await preserved(page) }
    }, options)
  }
}
await browser.close()
await fs.writeFile(path.join(outputDir, 'results.json'), JSON.stringify({ baseURL, browserVersion: browser.version(), results }, null, 2))
assert(results.every((r) => r.passed), `${results.filter((r) => !r.passed).length}/${results.length} failed`)
console.log(`${results.length}/${results.length} passed; ${outputDir}`)
