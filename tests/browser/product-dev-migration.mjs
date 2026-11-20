// Run against a local build: YAS_QA_BASE_URL=http://127.0.0.1:5194 node tests/browser/product-dev-migration.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'
import { products, categoryOptions } from '../../src/data/products.js'

const base = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5194'
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname))
const output = process.env.YAS_QA_OUTPUT_DIR || '.qa/dev-product-migration/browser'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(process.env.YAS_QA_BROWSER_EXECUTABLE
  ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE }
  : { channel: process.env.YAS_QA_BROWSER_CHANNEL || 'msedge' }) })
const reports = []
const expectedTable = ['粉底液', '气垫', '遮瑕', '散粉', '眼影', '睫毛膏', '腮红', '唇妆']
async function nav(page, label) {
  if (await page.getByRole('button', { name: '打开导航', exact: true }).isVisible()) {
    await page.getByRole('button', { name: '打开导航', exact: true }).click()
    await page.locator('.mobile-nav').getByRole('button', { name: label, exact: true }).click()
  } else await page.locator('.desktop-nav').getByRole('button', { name: label, exact: true }).click()
}
async function filters(page, open) {
  if (await page.locator('.filter-button').isVisible()) {
    if (open && !(await page.locator('.filter-panel').getAttribute('class')).includes('open')) await page.locator('.filter-button').click()
    if (!open && await page.locator('.filter-close').isVisible()) await page.locator('.filter-close').click()
  }
}
async function ids(page) { return page.locator('.library-results .product-card').evaluateAll(nodes => nodes.map(node => node.dataset.productId)) }
async function fits(page, selector, width) {
  const geometry = await page.locator(selector).evaluate(element => ({ width: element.getBoundingClientRect().width, scroll: element.scrollWidth, client: element.clientWidth, document: document.documentElement.scrollWidth }))
  assert(geometry.width <= width + 1 && geometry.scroll <= geometry.client + 1 && geometry.document <= width + 1, JSON.stringify(geometry))
  return geometry
}
for (const width of [1440, 360]) {
  const context = await browser.newContext({ viewport: { width, height: width === 360 ? 800 : 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = [], apiRequests = [], badLocalResponses = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) apiRequests.push(request.url()) })
  page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) badLocalResponses.push([response.url(), response.status()]) })
  const report = { width, categories: [] }
  try {
    await page.goto(base)
    await page.locator('.featured-piece').first().waitFor()
    assert.equal(await page.locator('.featured-piece').count(), 8)
    // dev exposes this as a keyboard entry; pointer entry is the 3D scene itself.
    await page.getByRole('button', { name: '进入妆台', exact: true }).focus({ timeout: 25000 })
    await page.keyboard.press('Enter')
    await page.locator('.beauty-shop-categories').waitFor({ timeout: 25000 })
    assert.deepEqual(await page.locator('.beauty-shop-categories button').allTextContents(), expectedTable)
    const frame = await page.locator('.beauty-shop-frame').elementHandle()
    await page.locator('.beauty-shop-categories').getByRole('button', { name: '眼影', exact: true }).click()
    await page.getByRole('button', { name: '返回妆台', exact: true }).click()
    await page.locator('.beauty-shop-categories').waitFor()
    assert(await frame.evaluate(element => element === document.querySelector('.beauty-shop-frame')), 'Returning preserves the original scene iframe')
    report.tableReturn = 'same iframe, eight categories'
    await nav(page, '产品库')
    await filters(page, true)
    await page.locator('.filter-panel .clear-button').click()
    assert.equal((await ids(page)).length, 111)
    const group = page.locator('.filter-group').filter({ has: page.locator('p', { hasText: /^产品类别$/ }) })
    assert.equal(await group.locator('button').count(), 14)
    for (const category of categoryOptions) {
      await group.getByRole('button', { name: category, exact: true }).click()
      const actual = (await ids(page)).sort()
      assert.deepEqual(actual, products.filter(product => product.category === category).map(product => product.id).sort())
      report.categories.push({ category, count: actual.length })
      await group.getByRole('button', { name: category, exact: true }).click()
    }
    await filters(page, false)
    await page.locator('.library-search input').fill('MF05')
    assert.deepEqual(await ids(page), ['catalog-051'])
    report.catalogGeometry = await fits(page, '.library-page', width)
    await page.screenshot({ path: `${output}/${width}-catalog.png` })
    await page.locator('[data-product-id="catalog-051"] .product-name').click()
    const drawer = page.getByRole('dialog')
    await drawer.locator('.shade-choice').nth(1).click()
    assert.match(await drawer.locator('.shade-choice.selected').innerText(), /MF01/)
    await drawer.getByRole('button', { name: '收藏这款', exact: true }).click()
    await drawer.getByRole('combobox', { name: '收藏状态' }).selectOption('正在用')
    assert.equal(await drawer.locator('.metric-grid').count(), 0)
    report.drawerGeometry = await fits(page, '.detail-drawer', width)
    await page.screenshot({ path: `${output}/${width}-drawer.png` })
    await drawer.getByRole('button', { name: '查看完整产品资料', exact: true }).click()
    await page.locator('.product-profile-page').waitFor()
    assert.equal(new URL(page.url()).pathname, '/products/catalog-051')
    await page.reload()
    await page.locator('.product-profile-page').waitFor()
    assert.equal(await page.getByRole('combobox', { name: '收藏状态' }).inputValue(), '正在用')
    assert(await page.getByRole('link', { name: '权利人联系删除', exact: true }).first().getAttribute('href'))
    report.profileGeometry = await fits(page, '.product-profile-page', width)
    await page.screenshot({ path: `${output}/${width}-profile.png`, fullPage: true })
    await nav(page, '产品库')
    await page.locator('.library-search input').fill('not-a-product-yas-20261120')
    await page.getByRole('heading', { name: '没有找到对应档案' }).waitFor()
    await page.getByRole('button', { name: '清空筛选', exact: true }).click()
    const sort = page.getByRole('combobox', { name: '排序方式' }).filter({ visible: true })
    await sort.selectOption('price-asc')
    const prices = (await ids(page)).map(id => products.find(product => product.id === id).price)
    assert(prices.every((price, index) => index === 0 || price >= prices[index - 1]))
    assert.equal(prices.length, 111)
    assert.deepEqual(errors, [])
    assert.deepEqual(badLocalResponses, [])
    assert.deepEqual(apiRequests, [])
    report.passed = true
  } catch (error) {
    report.passed = false
    report.error = error.stack
    await page.screenshot({ path: `${output}/${width}-failed.png` }).catch(() => {})
  } finally {
    Object.assign(report, { errors, apiRequests, badLocalResponses })
    reports.push(report)
    await context.close()
  }
  console.log(JSON.stringify(report))
}
await browser.close()
const fallbackBrowser = await chromium.launch({ headless: true, channel: process.env.YAS_QA_BROWSER_CHANNEL || 'msedge', args: ['--disable-webgl'] })
for (const width of [1440, 360]) {
  const context = await fallbackBrowser.newContext({ viewport: { width, height: 800 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const report = { width, mode: 'webgl-unavailable-and-image-failure' }
  try {
    await page.goto(base)
    await page.locator('.makeup-table-category').first().waitFor()
    assert.deepEqual(await page.locator('.makeup-table-category-label').allTextContents(), expectedTable)
    assert.equal(await page.locator('.beauty-shop-frame').count(), 0)
    report.geometry = await fits(page, '.makeup-table-section', width)
    await nav(page, '产品库')
    await page.route('**/products/catalog-111/cover.webp', route => route.abort('failed'))
    await page.locator('.library-search input').fill('too cool for school')
    const card = page.locator('[data-product-id="catalog-111"]')
    await card.scrollIntoViewIfNeeded()
    await card.getByText('图片暂不可用', { exact: true }).waitFor()
    await card.locator('.product-name').click()
    await page.getByRole('dialog').waitFor()
    await page.keyboard.press('Escape')
    await page.getByRole('dialog').waitFor({ state: 'detached' })
    assert.deepEqual(errors, [])
    report.passed = true
  } catch (error) { report.passed = false; report.error = error.stack }
  Object.assign(report, { errors })
  reports.push(report)
  console.log(JSON.stringify(report))
  await context.close()
}
await fallbackBrowser.close()
await fs.writeFile(`${output}/results.json`, JSON.stringify(reports, null, 2))
assert(reports.every(report => report.passed), 'Product migration browser flows pass')
