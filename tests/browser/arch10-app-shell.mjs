// Same scenarios before/after ARCH-10, isolated profiles, existing Playwright only.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { products } from '../../src/data/products.js'
import { createMakeupPlanService } from '../../server/services/makeup-plan-service.cjs'

const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const baseURL = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5201'
assert(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(baseURL).hostname))
const outputDir = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/arch-10-before')
await fs.mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}) })
const service = createMakeupPlanService({ products, zhipuProvider: { configured: false } })
const results = []
const entries = [['assistant', '小Y智能选妆', '.xiaoy-page'], ['library', '产品库', '.library-page'], ['guide', '肤质指南', '.guide-page'], ['culture', '品牌文化', '.culture-page'], ['favorites', '我的收藏', '.favorites-page']]
async function until(check, message) {
  const end = Date.now() + 12000
  while (Date.now() < end) { if (await check()) return; await new Promise((resolve) => setTimeout(resolve, 40)) }
  assert.fail(message)
}
async function ready(page) {
  await page.locator('.brand-opening').waitFor({ state: 'hidden' })
  await until(() => page.evaluate(() => document.body.style.overflow !== 'hidden'), 'Opening scroll unlock')
}
async function navigate(page, name) {
  const menu = page.getByRole('button', { name: '打开导航', exact: true })
  const nav = page.locator(await menu.isVisible() ? '.mobile-nav' : '.desktop-nav')
  if (await menu.isVisible() && !await nav.isVisible()) await menu.click()
  await nav.getByRole('button', { name: name === '我的收藏' ? /^我的收藏/ : name, exact: true }).click()
  assert.equal(await page.locator('.mobile-nav').count(), 0)
}
async function state(page) {
  return page.evaluate(() => ({ path: location.pathname, hash: location.hash, title: document.title, length: history.length, state: history.state,
    overflow: [document.body.style.overflow, document.documentElement.style.overflow],
    focus: [document.activeElement.tagName, document.activeElement.getAttribute('aria-label')],
    active: [...document.querySelectorAll('.desktop-nav .active')].map((el) => el.textContent),
  }))
}
async function layout(page, selector) {
  const value = await page.locator(selector).evaluate((root) => {
    const box = (el) => { const { x, y, width, height } = el.getBoundingClientRect(); return { x, y, width, height } }
    return { width: innerWidth, documentWidth: document.documentElement.scrollWidth, controls: [...root.querySelectorAll('button,input,select')].filter((el) => el.checkVisibility()).map(box) }
  })
  assert(value.documentWidth <= value.width, 'No horizontal overflow')
  for (let a = 0; a < value.controls.length; a++) for (let b = a + 1; b < value.controls.length; b++) {
    const x = value.controls[a], y = value.controls[b]
    assert(Math.min(x.x + x.width, y.x + y.width) - Math.max(x.x, y.x) <= 1 || Math.min(x.y + x.height, y.y + y.height) - Math.max(x.y, y.y) <= 1, 'No overlapping controls')
  }
  return value
}
async function shot(page, label) { await page.screenshot({ path: path.join(outputDir, `${label}.png`), animations: 'disabled' }) }
async function run(viewport, name, body, motion = 'reduce') {
  const label = `${viewport.width}-${name}`
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: motion })
  const page = await context.newPage()
  page.setDefaultTimeout(12000)
  page.setDefaultNavigationTimeout(60000)
  // External fonts may remain pending; readiness is checked from the real UI.
  const goto = page.goto.bind(page)
  page.goto = (url, options = {}) => goto(url, { waitUntil: 'domcontentloaded', ...options })
  const pageErrors = [], consoleErrors = [], failedRequests = [], badResponses = [], requests = [], routeErrors = []
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('requestfailed', (r) => failedRequests.push({ url: r.url(), error: r.failure()?.errorText }))
  page.on('response', (r) => { if (r.status() >= 400) badResponses.push({ url: r.url(), status: r.status() }) })
  let reply = async () => { throw new Error('Unexpected API request') }
  await context.route((url) => url.pathname.startsWith('/api/'), async (route) => {
    try {
      const endpoint = new URL(route.request().url()).pathname
      const payload = route.request().postDataJSON()
      requests.push({ endpoint, method: route.request().method(), payload })
      await reply(route, payload)
    } catch (e) { routeErrors.push(e.message); await route.abort().catch(() => {}) }
  })
  try {
    const evidence = await body({ page, requests, setReply: (next) => { reply = next } }, label)
    assert.deepEqual(pageErrors, [])
    assert.deepEqual(routeErrors, [])
    assert.deepEqual(badResponses, [])
    const expectedTimeouts = evidence.expectedTimeouts || 0
    assert.equal(failedRequests.filter((r) => new URL(r.url).pathname.startsWith('/api/')).length, expectedTimeouts)
    assert(failedRequests.every((r) => r.url.startsWith('https://fonts.googleapis.com/') || (new URL(r.url).pathname.startsWith('/api/') && r.error === 'net::ERR_TIMED_OUT')), JSON.stringify(failedRequests))
    assert(consoleErrors.every((e) => /^Failed to load resource: net::ERR_(?:FAILED|NETWORK_ACCESS_DENIED|TIMED_OUT)/.test(e)), consoleErrors.join('\n'))
    assert.equal(consoleErrors.filter((e) => e.includes('ERR_TIMED_OUT')).length, expectedTimeouts)
    results.push({ label, passed: true, evidence, requests, pageErrors, consoleErrors, failedRequests, badResponses, routeErrors })
    console.log(`PASS ${label}`)
  } catch (e) {
    results.push({ label, passed: false, error: e.stack, requests, pageErrors, consoleErrors, failedRequests, badResponses, routeErrors })
    console.error(`FAIL ${label}: ${e.message}`)
    await shot(page, `${label}-failed`).catch(() => {})
  } finally { await context.close() }
}

try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
    await run(viewport, 'all-navigation', async ({ page }, label) => {
      await page.goto(baseURL); await ready(page)
      const initial = await state(page), checks = []
      for (const [view, name, selector] of entries) {
        await navigate(page, name); await page.locator(selector).waitFor()
        const current = await state(page)
        assert.equal(current.state.view, view)
        assert.equal(current.path, '/'); assert.equal(current.hash, '')
        assert.deepEqual(current.active, [name])
        for (const [, , other] of entries) if (other !== selector) assert.equal(await page.locator(other).count(), 0)
        const headerLayout = await layout(page, '.site-header')
        const title = await page.locator('main h1').allTextContents()
        await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator(selector).waitFor()
        assert.deepEqual((await state(page)).state, current.state)
        checks.push({ view, current, title, headerLayout, reload: await state(page) })
      }
      await page.getByRole('button', { name: '回到首页', exact: true }).click(); await ready(page)
      assert.equal(await page.locator('.brand-opening').count(), 0)
      await shot(page, label)
      return { initial, checks, home: await state(page) }
    })

    await run(viewport, 'opening-menu-filter', async ({ page }, label) => {
      await page.goto(baseURL)
      await page.locator('.brand-opening').waitFor()
      const locked = await page.evaluate(() => [document.body.style.overflow, document.documentElement.style.overflow])
      assert.deepEqual(locked, ['hidden', 'hidden'])
      await page.getByRole('button', { name: /跳过/ }).click(); await ready(page)
      await navigate(page, '产品库')
      const menu = page.getByRole('button', { name: '打开导航', exact: true })
      let mobile = null
      if (await menu.isVisible()) {
        await menu.click(); await page.keyboard.press('Escape')
        assert(await page.locator('.mobile-nav').isVisible(), 'Original Escape leaves menu open')
        mobile = await layout(page, '.site-header')
        await menu.click()
        await page.locator('.filter-button').click()
        assert(await page.locator('.filter-backdrop').isVisible())
        await page.keyboard.press('Escape')
        assert.equal(await page.locator('.filter-backdrop').count(), 0)
        await page.locator('.filter-button').click()
        await page.goBack(); await page.locator('.home-motion-stage').waitFor()
        await page.goForward(); await page.locator('.library-page').waitFor()
        assert.equal(await page.locator('.filter-backdrop').count(), 0)
      }
      await shot(page, label)
      return { locked, mobile, unlocked: await state(page) }
    }, 'no-preference')

    await run(viewport, 'rapid-history-scroll', async ({ page }, label) => {
      await page.goto(baseURL); await ready(page)
      await navigate(page, '品牌文化')
      const browse = page.getByRole('button', { name: '浏览产品库', exact: true })
      await browse.scrollIntoViewIfNeeded()
      const scrollBefore = await page.evaluate(() => scrollY)
      assert(scrollBefore > 0)
      const before = await state(page)
      await browse.click(); await navigate(page, '肤质指南')
      const last = await state(page)
      await page.goBack(); await page.locator('.library-page').waitFor()
      await page.goBack(); await page.locator('.culture-page').waitFor()
      await until(() => page.evaluate((y) => Math.abs(scrollY - y) <= 1, scrollBefore), 'History restores scroll')
      const restored = await state(page)
      await page.goForward(); await page.locator('.library-page').waitFor()
      await page.goForward(); await page.locator('.guide-page').waitFor()
      const forward = await state(page)
      await navigate(page, '品牌文化')
      await page.evaluate(() => scrollTo(0, 300))
      const length = await page.evaluate(() => history.length)
      await navigate(page, '品牌文化')
      await until(() => page.evaluate(() => scrollY === 0), 'Same-page smooth scroll to top')
      assert.equal(await page.evaluate(() => history.length), length)
      await shot(page, label)
      return { before, last, restored, forward, samePage: await state(page), scrollBefore, restoredScroll: restored.state.scrollY }
    })

    await run(viewport, 'direct-profile-return', async ({ page }, label) => {
      await page.goto(`${baseURL}/products/nars-light-reflecting`)
      await page.locator('.product-profile-page').waitFor()
      assert.equal(await page.locator('.brand-opening').count(), 0)
      const initial = await state(page)
      assert.deepEqual(initial.active, ['产品库'])
      await page.locator('.profile-back-button').click()
      await page.locator('.library-page').waitFor()
      const closed = await state(page)
      assert.equal(closed.length, initial.length, 'Direct root profile closes by replacing history')
      assert.equal(closed.state.view, 'library')
      await page.goto(`${baseURL}/products/arch10-missing`); await ready(page)
      const missing = await state(page)
      assert.equal(missing.path, '/'); assert.equal(missing.state.view, 'home')
      await shot(page, label)
      return { initial, closed, missing }
    })

    await run(viewport, 'assistant-pending-remount', async ({ page, requests, setReply }, label) => {
      await page.goto(baseURL); await ready(page); await navigate(page, '小Y智能选妆')
      let held, delivered
      const waiting = new Promise((resolve) => { held = resolve })
      const done = new Promise((resolve) => { delivered = resolve })
      setReply(async (route) => { await waiting; await route.fulfill({ json: { answer: 'ARCH10 旧页面响应', sources: [] } }); delivered() })
      const input = page.getByLabel('向小Y描述你的需求')
      await input.fill('解释一下光的折射'); await input.press('Enter')
      await until(() => requests.length === 1, 'One assistant request')
      assert(await input.isDisabled())
      assert.equal(await page.locator('.xiaoy-message.loading').count(), 1)
      await shot(page, `${label}-loading`)
      await navigate(page, '肤质指南'); await navigate(page, '小Y智能选妆')
      assert(await input.isEnabled())
      const remounted = await page.locator('.xiaoy-messages').innerText()
      assert(remounted.includes('解释一下光的折射'))
      held(); await done
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      assert.equal(await page.locator('.xiaoy-messages').innerText(), remounted, 'Old unmounted response does not enter new instance')
      await input.fill('离页草稿')
      await navigate(page, '品牌文化'); await navigate(page, '小Y智能选妆')
      assert.equal(await input.inputValue(), '', 'Original draft resets on remount')
      const messageText = await page.locator('.xiaoy-messages').innerText()
      await shot(page, label)
      return { remounted, messageText, draft: await input.inputValue(), navigation: await state(page) }
    })

    await run(viewport, 'workbench-generation-failures', async ({ page, requests, setReply }, label) => {
      await page.goto(baseURL); await ready(page); await navigate(page, '小Y智能选妆')
      await page.locator('.xiaoy-prompts button').first().click()
      const form = page.locator('.makeup-workbench-form'), budget = form.getByLabel('预算上限（元）')
      assert.equal(await form.getByLabel('肤质').inputValue(), '混油皮')
      await budget.fill('300')
      let release
      const held = new Promise((resolve) => { release = resolve })
      setReply(async (route, payload) => { await held; await route.fulfill({ json: { plan: await service.create(payload) } }) })
      const submit = form.getByRole('button', { name: '创建我的妆容方案', exact: true })
      await submit.click(); await until(() => requests.length === 1, 'Plan request started')
      assert(await submit.isDisabled()); await budget.press('Enter'); assert.equal(requests.length, 1)
      release(); await page.locator('.makeup-plan-result').waitFor()
      assert.equal(await page.locator('.makeup-plan-step').count(), 7)
      const result = await page.locator('.makeup-plan-result').innerText()
      await page.locator('.makeup-plan-result-heading').scrollIntoViewIfNeeded(); await shot(page, `${label}-result`)
      setReply((route) => route.fulfill({ json: {} }))
      await submit.click(); await page.locator('.makeup-plan-error').waitFor()
      const empty = await page.locator('.makeup-plan-error').innerText()
      assert.equal(await page.locator('.makeup-plan-result').innerText(), result)
      setReply((route) => route.abort('timedout'))
      await submit.click(); await page.locator('.makeup-plan-error').waitFor()
      const failure = await page.locator('.makeup-plan-error').innerText()
      setReply(async (route, payload) => route.fulfill({ json: { plan: await service.create(payload) } }))
      await budget.fill('200'); await submit.click()
      await until(async () => await page.locator('.makeup-workbench-state').innerText() === '已生成', 'Retry completes')
      const adjusted = await page.locator('.makeup-plan-result').innerText()
      assert.notEqual(adjusted, result)
      await navigate(page, '产品库'); await navigate(page, '小Y智能选妆')
      assert.equal(await page.locator('.makeup-plan-result').count(), 0, 'Original plan resets on page remount')
      assert.equal(await budget.inputValue(), '', 'Profile prefill is reapplied on remount')
      await shot(page, label)
      return { result, adjusted, empty, failure, budgetAfterReturn: await budget.inputValue(), expectedTimeouts: 1 }
    })
  }
} finally {
  await browser.close()
  await fs.writeFile(path.join(outputDir, 'results.json'), JSON.stringify({ baseURL, browserVersion: browser.version(), results }, null, 2))
}
assert(results.every((r) => r.passed), `${results.filter((r) => !r.passed).length}/${results.length} failed`)
console.log(`${results.length}/${results.length} passed; ${outputDir}`)
