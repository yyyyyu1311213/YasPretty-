import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || '../../.qa/playwright/node_modules/playwright/index.mjs')
const baseUrl = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5174/'
const output = path.resolve('.qa/mobile-touch-handoff')
await fs.mkdir(output, { recursive: true })

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
})

try {
  const context = await browser.newContext({
    viewport: { width: 360, height: 800 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.abort())
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await page.locator('.brand-opening').waitFor({ state: 'hidden' })
  await page.locator('.beauty-shop-stage[data-stage="shop"]').waitFor()
  await page.waitForFunction(() => document.querySelector('.beauty-shop-frame')?.contentWindow?.BeautyShop?.intro.active === false, { timeout: 30000 })

  const frame = await page.locator('.beauty-shop-frame').boundingBox()
  assert(frame, 'mobile store frame should be measurable')
  const x = frame.x + frame.width / 2
  let y = Math.min(frame.y + frame.height - 40, 750)
  const cdp = await context.newCDPSession(page)

  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x, y }] })
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ id: 1, x: x + 80, y }] })
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(80)
  assert.equal(await page.locator('.beauty-shop-scroll-shell').evaluate((element) => Number(element.style.getPropertyValue('--scroll-progress'))), 0,
    'horizontal touch should remain a scene gesture')

  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x, y }] })
  for (let step = 0; step < 4; step += 1) {
    y -= 100
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ id: 1, x, y }] })
    await page.waitForTimeout(40)
  }

  await page.waitForFunction(() => Number(document.querySelector('.beauty-shop-scroll-shell')?.style.getPropertyValue('--scroll-progress')) >= .75)
  const progress = await page.locator('.beauty-shop-scroll-shell').evaluate((element) => Number(element.style.getPropertyValue('--scroll-progress')))
  assert(progress >= .75 && progress < 1, 'touch drag should advance the mobile transition before releasing: ' + progress)
  assert.equal(await page.locator('.beauty-shop-scroll-search').isVisible(), true, 'search should remain visible during the scene transition')
  assert.equal(await page.evaluate(() => window.scrollY), 0, 'the page should not scroll before the scene transition reaches its boundary')

  y -= 100
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ id: 1, x, y }] })
  await page.waitForFunction(() => Number(document.querySelector('.beauty-shop-scroll-shell')?.style.getPropertyValue('--scroll-progress')) === 1)
  await page.waitForFunction(() => window.scrollY > 0)
  const releasedScroll = await page.evaluate(() => window.scrollY)
  assert(releasedScroll > 0, 'continued upward touch should release into page scrolling')
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await cdp.detach()
  assert.deepEqual(pageErrors, [])
  await page.screenshot({ path: path.join(output, '360-touch-scroll-handoff.png'), animations: 'disabled' })
  await context.close()
  console.log('360px touch scroll handoff passed (progress ' + progress.toFixed(2) + ', page scroll ' + releasedScroll + 'px)')
} finally {
  await browser.close()
}
