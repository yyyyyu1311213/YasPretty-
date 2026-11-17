// Run with an existing Playwright installation against the local Vite server.
// Fresh contexts contain synthetic profiles only; no real provider calls are made.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { products } from '../../src/data/products.js'
import { createMakeupPlanService } from '../../server/services/makeup-plan-service.cjs'

const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const baseURL = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5174'
assert(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(baseURL).hostname), 'Use a local server')
const outputDir = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/arch-02-s01')
await fs.mkdir(outputDir, { recursive: true })
const service = createMakeupPlanService({ products, zhipuProvider: { configured: false } })
const results = []
const browser = await chromium.launch({
  headless: true,
  ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}),
})
const profile = { skin: '混油皮', finish: '柔雾', budget: 400, scene: '通勤', tone: '冷调' }

async function until(check, message) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await check()) return
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  assert.fail(message)
}

async function openAssistant(page) {
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
  await page.locator('.brand-opening').waitFor({ state: 'hidden', timeout: 15000 })
  const menu = page.getByRole('button', { name: '打开导航', exact: true })
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('button', { name: '小Y智能选妆', exact: true }).filter({ visible: true }).click()
  await page.locator('.makeup-workbench').waitFor()
}

async function formValues(page) {
  const form = page.locator('.makeup-workbench-form')
  return {
    skin: await form.getByLabel('肤质').inputValue(),
    undertone: await form.getByLabel('色调倾向').inputValue(),
    finish: await form.getByLabel('妆效').inputValue(),
    scene: await form.getByLabel('场景').inputValue(),
    style: await form.getByLabel('风格').inputValue(),
    budget: await form.getByLabel('预算上限（元）').inputValue(),
    wearHours: await form.getByLabel('预计带妆').inputValue(),
    skill: await form.getByLabel('熟练度').inputValue(),
    priorities: await form.locator('input:checked').evaluateAll((items) => items.map((item) => item.parentElement.textContent)),
  }
}

async function layout(page) {
  const geometry = await page.evaluate(() => {
    const rect = (item) => {
      const { x, y, width, height } = item.getBoundingClientRect()
      return { x, y, width, height, right: x + width, bottom: y + height }
    }
    return {
      width: innerWidth, documentWidth: document.documentElement.scrollWidth,
      fields: [...document.querySelectorAll('.makeup-workbench-form > label')].map(rect),
      controls: [...document.querySelectorAll('.makeup-workbench select, .makeup-workbench input, .makeup-workbench button')].map(rect),
    }
  })
  assert(geometry.documentWidth <= geometry.width + 1, 'Document overflows horizontally')
  for (const item of geometry.controls) {
    assert(item.width > 0 && item.height > 0 && item.x >= -1 && item.right <= geometry.width + 1, 'Control outside viewport')
  }
  for (let i = 0; i < geometry.fields.length; i++) {
    for (const other of geometry.fields.slice(i + 1)) {
      const item = geometry.fields[i]
      assert(item.right <= other.x + 1 || other.right <= item.x + 1 || item.bottom <= other.y + 1 || other.bottom <= item.y + 1, 'Form fields overlap')
    }
  }
  return geometry
}

async function capture(page, name) {
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), animations: 'disabled' })
}

async function scenario(viewport, name, seed, test) {
  const context = await browser.newContext({
    viewport, reducedMotion: 'reduce', deviceScaleFactor: 1,
    storageState: { cookies: [], origins: [{ origin: new URL(baseURL).origin, localStorage: Object.entries(seed).map(([name, value]) => ({ name, value })) }] },
  })
  const page = await context.newPage()
  page.setDefaultTimeout(10000)
  const errors = [], consoleErrors = [], failedRequests = [], requests = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }))
  let reply = async (route, payload) => route.fulfill({ json: { ok: true, plan: await service.create(payload) } })
  await page.route((url) => url.pathname.startsWith('/api/'), async (route) => {
    assert.equal(new URL(route.request().url()).pathname, '/api/makeup-plans', 'Unexpected API call')
    assert.equal(route.request().method(), 'POST')
    const payload = route.request().postDataJSON()
    requests.push(payload)
    await reply(route, payload)
  })
  const label = `${viewport.width}-${name}`
  try {
    await openAssistant(page)
    const evidence = await test({ page, requests, setReply: (next) => { reply = next } }, label)
    assert.deepEqual(errors, [])
    if (evidence?.expectedNetworkFailure) {
      // Only this scenario intentionally produces browser HTTP/network errors.
      // Keep every event in the evidence and reject unrelated console/resource errors.
      assert.equal(consoleErrors.length, 3)
      for (const message of consoleErrors) assert.match(message, /^Failed to load resource: (?:the server responded with a status of (?:503|504) .+|net::ERR_TIMED_OUT)$/)
      assert.equal(failedRequests.length, 1)
      assert.equal(new URL(failedRequests[0].url).pathname, '/api/makeup-plans')
      assert.equal(failedRequests[0].error, 'net::ERR_TIMED_OUT')
    } else {
      assert.deepEqual(consoleErrors, [])
      assert.deepEqual(failedRequests, [])
    }
    results.push({ label, passed: true, requests, errors, consoleErrors, failedRequests, ...evidence })
  } catch (error) {
    results.push({ label, passed: false, error: error.stack, requests, errors, consoleErrors, failedRequests })
    await capture(page, `${label}-failed`).catch(() => {})
  } finally {
    await context.close()
  }
}

try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
    await scenario(viewport, 'generate-adjust-detail', {}, async ({ page, requests, setReply }, label) => {
      const form = page.locator('.makeup-workbench-form')
      const submit = form.getByRole('button', { name: '创建我的妆容方案', exact: true })
      assert.equal(await page.locator('input[type=file]').count(), 0)
      await form.getByLabel('色调倾向').selectOption('暖调')
      await form.getByLabel('风格').selectOption('精致')
      await form.getByLabel('熟练度').selectOption('进阶')
      await form.getByLabel('预计带妆').selectOption('10')
      await form.getByLabel('持妆', { exact: true }).check()
      await form.getByLabel('预算上限（元）').fill('500')
      await form.getByLabel('场景').selectOption('通勤')
      await form.getByLabel('妆效').selectOption('柔雾')
      const initialForm = await formValues(page)
      const initialGeometry = await layout(page)
      await form.scrollIntoViewIfNeeded()
      await capture(page, `${label}-form`)
      let release
      const held = new Promise((resolve) => { release = resolve })
      setReply(async (route, payload) => {
        await held
        await route.fulfill({ json: { ok: true, plan: await service.create(payload) } })
      })
      await submit.click()
      await until(() => requests.length === 1, 'Request not sent')
      assert.equal(await submit.isDisabled(), true)
      assert.equal(await page.locator('.makeup-workbench-state').innerText(), '生成中')
      await form.getByLabel('预算上限（元）').press('Enter')
      assert.equal(requests.length, 1, 'Duplicate request while submit disabled')
      release()
      await page.locator('.makeup-plan-result').waitFor()
      assert.equal(await page.locator('.makeup-plan-step').count(), 7)
      assert.equal(await page.locator('.makeup-plan-source').innerText(), '本地规则降级')
      assert.equal(requests[0].makeupRequest.photoEnabled, false)
      const firstResult = await page.locator('.makeup-plan-result').innerText()
      await layout(page)
      await page.locator('.makeup-plan-result-heading').scrollIntoViewIfNeeded()
      await capture(page, `${label}-result`)
      await page.locator('.makeup-plan-product').first().click()
      await page.getByRole('dialog').waitFor()
      await page.getByRole('button', { name: '关闭详情', exact: true }).click()
      await page.getByRole('dialog').waitFor({ state: 'hidden' })
      await page.locator('.makeup-plan-product').first().click()
      await page.getByRole('dialog').waitFor()
      await page.keyboard.press('Escape')
      await page.getByRole('dialog').waitFor({ state: 'hidden' })
      setReply(async (route, payload) => route.fulfill({ json: { ok: true, plan: await service.create(payload) } }))
      await form.getByLabel('预算上限（元）').fill('200')
      await form.getByLabel('场景').selectOption('拍照')
      await form.getByLabel('妆效').selectOption('哑光')
      await submit.click()
      await until(async () => (await page.locator('.makeup-plan-meta').innerText()).includes('拍照'), 'Adjusted result not shown')
      assert.equal(requests.length, 2)
      assert.deepEqual(requests[1], {
        userProfile: { ...requests[0].userProfile, budgetTotal: 200, finishPreferences: ['哑光'] },
        makeupRequest: { ...requests[0].makeupRequest, scene: '拍照' },
      })
      assert.notEqual(await page.locator('.makeup-plan-result').innerText(), firstResult)
      assert.deepEqual(await formValues(page), { ...initialForm, budget: '200', scene: '拍照', finish: '哑光' })
      return { initialForm, initialGeometry, finalForm: await formValues(page), geometry: await layout(page) }
    })

    for (const legacy of [false, true]) {
      const seed = legacy
        ? { 'yaspretty-xiaoy-profile': JSON.stringify(profile) }
        : { 'yaspretty-xiaoy-profile-v1': JSON.stringify({ version: 1, value: profile }) }
      await scenario(viewport, legacy ? 'legacy-profile' : 'current-profile', seed, async ({ page }) => {
        const before = await formValues(page)
        assert.deepEqual(before, { skin: '混油皮', undertone: 'unknown', finish: '柔雾', scene: '日常', style: '自然', budget: '400', wearHours: '8', skill: '新手', priorities: ['轻薄'] })
        const form = page.locator('.makeup-workbench-form')
        await form.getByLabel('风格').selectOption('精致')
        await form.getByLabel('场景').selectOption('拍照')
        await page.getByLabel('向小Y描述你的需求').fill('我是干皮，预算 300 元，想要奶油肌底妆')
        await page.getByRole('button', { name: '发送', exact: true }).click()
        await until(async () => (await formValues(page)).skin === '干皮', 'Profile change not reflected')
        const after = await formValues(page)
        assert.deepEqual(after, { ...before, skin: '干皮', finish: '奶油肌', budget: '300' })
        return { before, after, geometry: await layout(page) }
      })
    }

    await scenario(viewport, 'empty-failure-retry', {}, async ({ page, setReply }, label) => {
      const submit = page.getByRole('button', { name: '创建我的妆容方案', exact: true })
      setReply(async (route) => route.fulfill({ json: { ok: true } }))
      await submit.click()
      await page.getByRole('alert').waitFor()
      assert.match(await page.getByRole('alert').innerText(), /方案生成失败（200）/)
      assert.equal(await page.locator('.makeup-plan-result').count(), 0)
      assert.equal(await submit.isEnabled(), true)
      setReply(async (route, payload) => route.fulfill({ json: { ok: true, plan: await service.create(payload) } }))
      await submit.click()
      await page.locator('.makeup-plan-result').waitFor()
      const previous = await page.locator('.makeup-plan-result').innerText()
      // HTTP 200 error payload models a business failure without browser network errors.
      setReply(async (route) => route.fulfill({ json: { ok: false, error: { message: 'ARCH-02 合成服务错误' } } }))
      await submit.click()
      await page.getByRole('alert').waitFor()
      assert.match(await page.getByRole('alert').innerText(), /ARCH-02 合成服务错误/)
      assert.equal(await page.locator('.makeup-workbench-state').innerText(), '结构化采集')
      assert.equal(await page.locator('.makeup-plan-result').innerText(), previous, 'Previous plan should remain')
      await page.getByRole('alert').scrollIntoViewIfNeeded()
      await capture(page, `${label}-error`)
      setReply(async (route) => route.fulfill({ contentType: 'application/json', body: '{invalid' }))
      await submit.click()
      await until(async () => (await page.getByRole('alert').innerText()).includes('方案生成失败（200）'), 'Invalid JSON not handled')
      setReply(async (route, payload) => route.fulfill({ json: { ok: true, plan: await service.create(payload) } }))
      await submit.click()
      await page.getByRole('alert').waitFor({ state: 'hidden' })
      assert.equal(await page.locator('.makeup-workbench-state').innerText(), '已生成')
      return { geometry: await layout(page) }
    })

    await scenario(viewport, 'priorities-evidence-unknown-product', {}, async ({ page, requests, setReply }, label) => {
      const form = page.locator('.makeup-workbench-form')
      for (const name of ['持妆', '遮瑕', '控油']) await form.getByLabel(name, { exact: true }).check()
      await form.getByLabel('保湿', { exact: true }).click()
      assert.equal(await form.getByLabel('保湿', { exact: true }).isChecked(), false)
      await form.getByLabel('持妆', { exact: true }).uncheck()
      await form.getByLabel('保湿', { exact: true }).check()
      setReply(async (route, payload) => {
        const plan = await service.create(payload)
        plan.steps[0].primaryProductId = 'arch02-not-real'
        plan.steps[0].alternativeProductIds = ['arch02-not-real', products[0].id]
        plan.candidateEvidence.push({ productId: 'arch02-not-real', score: 100, matchedConditions: ['must-not-render'], tradeoffs: [] })
        await route.fulfill({ json: { ok: true, plan } })
      })
      await form.getByRole('button', { name: '创建我的妆容方案', exact: true }).click()
      await page.locator('.makeup-plan-result').waitFor()
      assert.deepEqual(requests[0].makeupRequest.priorities, ['轻薄', '遮瑕', '控油', '保湿'])
      const firstStep = page.locator('.makeup-plan-step').first()
      assert.equal(await firstStep.locator('.makeup-plan-product').count(), 1)
      assert((await firstStep.innerText()).includes(products[0].name))
      assert(!(await page.locator('.makeup-plan-result').innerText()).includes('must-not-render'))
      const evidence = page.locator('.makeup-plan-evidence')
      await evidence.locator('summary').click()
      assert.equal(await evidence.getAttribute('open'), '')
      await evidence.scrollIntoViewIfNeeded()
      await layout(page)
      await capture(page, label)
      await evidence.locator('summary').click()
      assert.equal(await evidence.getAttribute('open'), null)
      await firstStep.locator('.makeup-plan-product').click()
      await page.getByRole('dialog').waitFor()
      const dialog = page.getByRole('dialog')
      assert((await dialog.innerText()).includes(products[0].name))
      await dialog.evaluate((element) => { element.scrollTop = element.scrollHeight })
      await page.keyboard.press('Escape')
      await dialog.waitFor({ state: 'hidden' })
      return { geometry: await layout(page) }
    })

    await scenario(viewport, 'http-network-failure-recovery', {}, async ({ page, setReply }, label) => {
      const submit = page.getByRole('button', { name: '创建我的妆容方案', exact: true })
      for (const [status, message] of [[503, 'ARCH-02 合成上游失败'], [504, 'ARCH-02 合成上游超时']]) {
        setReply(async (route) => route.fulfill({ status, json: { error: { message } } }))
        await submit.click()
        await until(async () => (await page.getByRole('alert').innerText()).includes(message), 'HTTP error missing')
        assert.equal(await submit.isEnabled(), true)
        assert.equal(await page.locator('.makeup-plan-result').count(), 0)
      }
      setReply(async (route) => route.abort('timedout'))
      await submit.click()
      await until(async () => (await page.getByRole('alert').innerText()).includes('Failed to fetch'), 'Network timeout missing')
      assert.equal(await submit.isEnabled(), true)
      await page.getByRole('alert').scrollIntoViewIfNeeded()
      await capture(page, label)
      setReply(async (route, payload) => route.fulfill({ json: { ok: true, plan: await service.create(payload) } }))
      await submit.click()
      await page.locator('.makeup-plan-result').waitFor()
      await page.getByRole('alert').waitFor({ state: 'hidden' })
      return { expectedNetworkFailure: true, geometry: await layout(page) }
    })

    await scenario(viewport, 'assistant-plan', {}, async ({ page, requests, setReply }) => {
      const input = page.getByLabel('向小Y描述你的需求')
      await input.fill('我是混油皮，预算 500 元，给我完整妆容，通勤 10 小时')
      await page.getByRole('button', { name: '发送', exact: true }).click()
      await until(async () => (await page.locator('.xiaoy-message.assistant').last().innerText()).includes('7. 唇妆'), 'Chat plan not shown')
      assert.equal(requests.length, 1)
      assert.equal(requests[0].userProfile.skinType, '混油皮')
      assert.equal(requests[0].userProfile.budgetTotal, 500)
      assert.equal(requests[0].makeupRequest.scene, '通勤')
      assert.equal(requests[0].makeupRequest.wearHours, 10)
      assert.equal(await page.locator('.xiaoy-mode').innerText(), '资料库推荐')
      assert((await page.locator('.xiaoy-products button').count()) > 0)
      await page.locator('.xiaoy-products button').first().click()
      await page.getByRole('dialog').waitFor()
      await page.getByRole('button', { name: '关闭详情', exact: true }).click()
      await page.getByRole('dialog').waitFor({ state: 'hidden' })
      setReply(async (route) => route.fulfill({ json: { error: { message: 'ARCH-02 合成方案不可用' } } }))
      await input.fill('再给我一个完整妆容')
      await page.getByRole('button', { name: '发送', exact: true }).click()
      await until(async () => (await page.locator('.xiaoy-message.assistant').last().innerText()).includes('这是本地基础方案'), 'Existing chat fallback not shown')
      assert.equal(await page.locator('.xiaoy-mode').innerText(), '资料库推荐')
      assert.equal(await input.isEnabled(), true)
      return { form: await formValues(page), geometry: await layout(page) }
    })
  }
} finally {
  const summary = { createdAt: new Date().toISOString(), baseURL, browser: browser.version(), reducedMotion: 'reduce', total: results.length, passed: results.filter((item) => item.passed).length, results }
  await fs.writeFile(path.join(outputDir, 'results.json'), JSON.stringify(summary, null, 2) + '\n')
  await browser.close()
  console.log(JSON.stringify({ total: summary.total, passed: summary.passed, outputDir }))
}
if (results.some((item) => !item.passed)) process.exitCode = 1
