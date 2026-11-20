// Local production build; no injected application state or external provider requests.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'
import { products } from '../../src/data/products.js'

const base = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5194'
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname))
const output = '.qa/product-detail-refinement/browser'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, channel: 'msedge' })
const reports = []
const cases = [
  { id: 'make-up-for-ever-hd', brandRegion: '法国', origin: '法国' },
  { id: 'catalog-036', brandRegion: '韩国', origin: '韩国', noFinish: true },
  { id: 'catalog-045', brandRegion: '美国', origin: '美国／加拿大／意大利' },
  { id: 'catalog-056', brandRegion: '韩国', origin: '中国' },
  { id: 'catalog-092', brandRegion: '美国', origin: '比利时' },
  { id: 'catalog-095', brandRegion: '中国', origin: '中国' },
]
async function library(page) {
  if (await page.getByRole('button', { name: '打开导航', exact: true }).isVisible()) {
    await page.getByRole('button', { name: '打开导航', exact: true }).click()
    await page.locator('.mobile-nav').getByRole('button', { name: '产品库', exact: true }).click()
  } else await page.locator('.desktop-nav').getByRole('button', { name: '产品库', exact: true }).click()
}
async function checkView(view, item, width) {
  assert.equal(await view.locator('.shade-description, .detail-rating, .metric-grid, .assessment-grid').count(), 0)
  assert(!(await view.innerText()).includes('编辑示例'))
  const region = view.locator('dt', { hasText: /^品牌所属地区$/ }).locator('..')
  const origin = view.locator('dt', { hasText: /^实际生产地$/ }).locator('..')
  assert.equal((await region.locator('dd').innerText()).trim(), item.brandRegion)
  assert((await origin.locator('dd').innerText()).startsWith(item.origin))
  if (item.noFinish) assert.equal(await view.locator('dt', { hasText: /^妆效方向$/ }).count(), 0)
  const labels = await view.locator('.detail-source-facts dt').allTextContents()
  assert.deepEqual(labels, ['图片来源', '权利人 / 发布方'])
  assert.equal(await view.getByRole('link', { name: '权利人联系删除', exact: true }).count(), 1)
  const geometry = await view.evaluate(element => ({ width: element.getBoundingClientRect().width, scroll: element.scrollWidth, client: element.clientWidth, document: document.documentElement.scrollWidth }))
  assert(geometry.width <= width + 1 && geometry.scroll <= geometry.client + 1 && geometry.document <= width + 1, JSON.stringify(geometry))
  return geometry
}

try {
  for (const width of [1440, 360]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    const report = { width, cases: [] }
    try {
      for (const item of cases) {
        await page.goto(`${base}/products/${item.id}`)
        const profile = page.locator('.product-profile-page')
        await profile.waitFor()
        const profileGeometry = await checkView(profile, item, width)
        await profile.locator('.detail-source-records summary').click()
        assert(await profile.locator('.detail-source-records').getAttribute('open') !== null)
        if (['catalog-036', 'make-up-for-ever-hd'].includes(item.id)) await page.screenshot({ path: `${output}/${width}-${item.id}-profile.png`, fullPage: true })
        await library(page)
        await page.locator('.library-search input').fill(products.find(product => product.id === item.id).name)
        await page.locator(`[data-product-id="${item.id}"] .product-name`).click()
        const drawer = page.getByRole('dialog')
        const drawerGeometry = await checkView(drawer, item, width)
        const shades = drawer.locator('.shade-choice')
        if (await shades.count()) {
          const target = shades.nth(await shades.count() > 1 ? 1 : 0)
          await target.click()
          assert.equal(await target.getAttribute('aria-pressed'), 'true')
          assert.equal(await drawer.locator('.shade-description').count(), 0)
        }
        if (item.id === 'catalog-036') {
          const gap = await drawer.locator('.detail-scenes').evaluate(section => {
            const tags = section.querySelector('.scene-row').getBoundingClientRect()
            const note = section.querySelector('.detail-scenes-note').getBoundingClientRect()
            return note.top - tags.bottom
          })
          assert(gap >= 14, `Scene note gap ${gap}`)
          report.sceneGap = gap
        }
        if (['catalog-036', 'make-up-for-ever-hd'].includes(item.id)) {
          for (const [name, selector] of [['hero', '.detail-hero'], ['copy', '.two-columns'], ['scenes', '.detail-scenes'], ['sources', '.product-detail-sources']]) {
            await drawer.locator(selector).screenshot({ path: `${output}/${width}-${item.id}-${name}.png` })
          }
        }
        await drawer.locator('.full-profile-action').click()
        await profile.waitFor()
        assert.equal(new URL(page.url()).pathname, `/products/${item.id}`)
        report.cases.push({ id: item.id, profileGeometry, drawerGeometry })
      }
      assert.deepEqual(errors, [])
      report.passed = true
    } catch (error) {
      report.passed = false
      report.error = error.stack
      await page.screenshot({ path: `${output}/${width}-failed.png`, fullPage: true }).catch(() => {})
    } finally {
      reports.push(report)
      await context.close()
    }
  }
} finally { await browser.close() }
await fs.writeFile(`${output}/results.json`, JSON.stringify(reports, null, 2))
console.log(JSON.stringify(reports))
assert(reports.every(report => report.passed), 'Product detail browser checks failed')
