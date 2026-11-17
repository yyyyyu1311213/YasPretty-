// Use an existing Playwright installation and a local Vite server.
// All API responses are isolated test fixtures; no real provider or credentials are used.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { products } from '../../src/data/products.js'
import { createMakeupPlanService } from '../../server/services/makeup-plan-service.cjs'

const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const baseURL = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5174'
assert(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(baseURL).hostname), 'Use a local server')
const outputDir = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/arch-03-s01')
await fs.mkdir(outputDir, { recursive: true })
const service = createMakeupPlanService({ products, zhipuProvider: { configured: false } })
const results = []
const browser = await chromium.launch({
  headless: true,
  ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}),
})
const knownIds = products.slice(0, 4).map(({ id }) => id)
const sources = [
  { kind: 'web', title: 'ARCH-03 合成来源一', url: 'https://example.test/arch03/source-1', publisher: '测试', accessedAt: '2026-11-17T00:00:00.000Z' },
  { kind: 'web', title: 'ARCH-03 合成来源二', url: 'https://example.test/arch03/source-2', publisher: '测试', accessedAt: '2026-11-17T00:00:00.000Z' },
]

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
  await page.locator('.xiaoy-page').waitFor()
}

async function send(page, text, keyboard = false) {
  const input = page.getByLabel('向小Y描述你的需求')
  const before = await page.locator('.xiaoy-message:not(.loading)').count()
  await input.fill(text)
  if (keyboard) await input.press('Enter')
  else await page.getByRole('button', { name: '发送', exact: true }).click()
  await until(async () => await page.locator('.xiaoy-message:not(.loading)').count() === before + 2, 'Reply missing')
  await until(() => input.isEnabled(), 'Busy state did not clear')
  return page.locator('.xiaoy-message.assistant:not(.loading)').last().innerText()
}

async function stored(page, key) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null')?.value, key)
}

async function layout(page) {
  const geometry = await page.evaluate(() => {
    const rect = (selector) => {
      const { x, y, width, height } = document.querySelector(selector).getBoundingClientRect()
      return { x, y, width, height, right: x + width, bottom: y + height }
    }
    const chat = document.querySelector('.xiaoy-messages')
    return {
      width: innerWidth, documentWidth: document.documentElement.scrollWidth,
      sidebar: rect('.xiaoy-sidebar'), chat: rect('.xiaoy-chat'),
      input: rect('.xiaoy-composer input'), send: rect('.xiaoy-composer button'),
      messageWidth: chat.clientWidth, messageScrollWidth: chat.scrollWidth,
    }
  })
  assert(geometry.documentWidth <= geometry.width + 1, 'Document overflows horizontally')
  assert(geometry.messageScrollWidth <= geometry.messageWidth + 1, 'Messages overflow horizontally')
  for (const name of ['sidebar', 'chat', 'input', 'send']) {
    const item = geometry[name]
    assert(item.width > 0 && item.height > 0 && item.x >= -1 && item.right <= geometry.width + 1, `${name} outside viewport`)
  }
  assert(geometry.input.right <= geometry.send.x + 1, 'Composer controls overlap')
  const a = geometry.sidebar, b = geometry.chat
  assert(a.right <= b.x + 1 || a.bottom <= b.y + 1, 'Profile and chat overlap')
  return geometry
}

async function capture(page, label) {
  await page.locator('.xiaoy-messages').evaluate((element) => { element.scrollTop = element.scrollHeight })
  await page.locator('.xiaoy-chat').scrollIntoViewIfNeeded()
  await page.screenshot({ path: path.join(outputDir, `${label}.png`), animations: 'disabled' })
}

async function scenario(viewport, name, test) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce', deviceScaleFactor: 1 })
  const page = await context.newPage()
  page.setDefaultTimeout(10000)
  const pageErrors = [], consoleErrors = [], failedRequests = [], requests = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }))
  let reply = async () => { throw new Error('Unexpected API call') }
  const routeErrors = []
  await context.route('https://example.test/**', (route) => route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<meta charset="utf-8"><title>ARCH-03 合成来源</title><p>仅用于来源打开检查。</p>' }))
  await context.route((url) => url.pathname.startsWith('/api/'), async (route) => {
    try {
      const endpoint = new URL(route.request().url()).pathname
      assert(['/api/assistant', '/api/makeup-plans'].includes(endpoint), 'Unexpected endpoint')
      assert.equal(route.request().method(), 'POST')
      const payload = route.request().postDataJSON()
      requests.push({ endpoint, payload })
      await reply(route, payload, endpoint)
    } catch (error) {
      routeErrors.push(error.message)
      await route.abort().catch(() => {})
    }
  })
  const label = `${viewport.width}-${name}`
  try {
    await openAssistant(page)
    const evidence = await test({ page, requests, context, setReply: (next) => { reply = next } }, label)
    assert.deepEqual(routeErrors, [])
    assert.deepEqual(pageErrors, [])
    const expected = evidence.expectedNetworkErrors || 0
    assert.equal(consoleErrors.length, expected, 'Unexpected browser console errors')
    for (const message of consoleErrors) assert.match(message, /^Failed to load resource: (?:the server responded with a status of (?:503|504) .+|net::ERR_TIMED_OUT)$/)
    assert.equal(failedRequests.length, evidence.expectedTimeouts || 0)
    for (const request of failedRequests) {
      assert.equal(new URL(request.url).pathname, '/api/assistant')
      assert.equal(request.error, 'net::ERR_TIMED_OUT')
    }
    results.push({ label, passed: true, requests, pageErrors, consoleErrors, failedRequests, ...evidence })
    console.log(`PASS ${label}`)
  } catch (error) {
    results.push({ label, passed: false, error: error.stack, routeErrors, requests, pageErrors, consoleErrors, failedRequests })
    await capture(page, `${label}-failed`).catch(() => {})
    console.error(`FAIL ${label}: ${error.message}`)
  } finally {
    await context.close()
  }
}

try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
    await scenario(viewport, 'local-profile-comparison', async ({ page, requests }, label) => {
      assert.match(await send(page, '推荐粉底液', true), /先确认你的肤质/)
      const answer = await send(page, '我是油皮，预算 400 元，想要柔雾通勤粉底')
      assert.match(answer, /在预算内/)
      const saved = await stored(page, 'yaspretty-xiaoy-messages-v1')
      const ids = saved.at(-1).productIds
      assert(ids.length > 0 && ids.length <= 3)
      for (const id of ids) {
        const product = products.find((item) => item.id === id)
        assert(product && product.skins.includes('油皮') && product.price <= 400 && product.category === '粉底液')
      }
      await page.locator('.xiaoy-product').first().click()
      const dialog = page.getByRole('dialog')
      await dialog.waitFor()
      assert((await dialog.innerText()).includes(products.find((item) => item.id === ids[0]).name))
      await dialog.evaluate((element) => { element.scrollTop = element.scrollHeight })
      await page.keyboard.press('Escape')
      await dialog.waitFor({ state: 'hidden' })
      await page.locator('.xiaoy-product').first().click()
      await dialog.waitFor()
      await page.getByRole('button', { name: '关闭详情', exact: true }).click()
      await dialog.waitFor({ state: 'hidden' })
      const comparison = await send(page, '帮我比较 NARS 超方瓶和雅诗兰黛持妆粉底液')
      assert.match(comparison, /按资料库信息比较/)
      assert.match(comparison, /NARS/)
      assert.match(comparison, /Estée Lauder/)
      assert.equal(requests.length, 0)
      await capture(page, label)
      const messages = await stored(page, 'yaspretty-xiaoy-messages-v1')
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.locator('.xiaoy-page').waitFor()
      assert.deepEqual(await stored(page, 'yaspretty-xiaoy-messages-v1'), messages)
      assert.equal((await stored(page, 'yaspretty-xiaoy-profile-v1')).budget, 400)
      assert.match(await page.locator('.xiaoy-profile').innerText(), /油皮/)
      return { ids, answer, comparison, geometry: await layout(page) }
    })

    await scenario(viewport, 'api-sources-loading', async ({ page, requests, context, setReply }, label) => {
      let release
      const held = new Promise((resolve) => { release = resolve })
      setReply(async (route, payload, endpoint) => {
        assert.equal(endpoint, '/api/assistant')
        await held
        await route.fulfill({ json: {
          answer: `ARCH-03 合成通用回答。\n[[PRODUCT:${knownIds[0]}]]\n[[PRODUCT:not-real]]\n[[PRODUCT:${knownIds[0]}]]\n${knownIds.slice(1).map((id) => `[[PRODUCT:${id}]]`).join('\n')}`,
          sources, answerMode: 'knowledge', model: 'test-model',
        } })
      })
      const input = page.getByLabel('向小Y描述你的需求')
      await input.fill('给我介绍一下巴黎时装周')
      await input.press('Enter')
      await until(() => requests.length === 1, 'API request missing')
      assert.equal(await input.isDisabled(), true)
      assert.equal(await page.getByRole('button', { name: '发送', exact: true }).isDisabled(), true)
      assert.match(await page.locator('.loading').innerText(), /正在组织回答/)
      await page.keyboard.press('Enter')
      assert.equal(requests.length, 1)
      release()
      await until(() => input.isEnabled(), 'Response did not clear loading')
      assert.equal(await page.locator('.loading').count(), 0)
      assert.equal(await page.locator('.xiaoy-product').count(), 3)
      assert(!(await page.locator('.xiaoy-messages').innerText()).includes('PRODUCT:'))
      assert.deepEqual((await stored(page, 'yaspretty-xiaoy-messages-v1')).at(-1).productIds, knownIds.slice(0, 3))
      const links = page.locator('.xiaoy-sources a')
      assert.equal(await links.count(), 2)
      assert.equal(await links.first().getAttribute('target'), '_blank')
      assert.equal(await links.first().getAttribute('rel'), 'noreferrer')
      assert.equal(await links.first().getAttribute('href'), sources[0].url)
      const popupReady = context.waitForEvent('page')
      await links.first().click()
      const popup = await popupReady
      await popup.waitForLoadState('domcontentloaded')
      assert.equal(await popup.title(), 'ARCH-03 合成来源')
      await popup.close()
      await page.locator('.xiaoy-messages').evaluate((element) => { element.scrollTop = 0; element.scrollTop = element.scrollHeight })
      await capture(page, label)
      setReply(async (route) => route.fulfill({ json: { answer: 'ARCH-03 合成肤质追问。', sources: [], answerMode: 'clarification' } }))
      assert.match(await send(page, '我怎么判断我的肤质'), /合成肤质追问/)
      assert.equal(await page.locator('.xiaoy-mode').innerText(), '已就绪')
      setReply(async (route) => route.fulfill({ json: { answer: 'ARCH-03 合成联网产品事实。', sources, answerMode: 'search', model: 'test-model' } }))
      assert.match(await send(page, 'NARS 现在官网多少钱'), /合成联网产品事实/)
      assert.equal(await page.locator('.xiaoy-mode').innerText(), '联网思考')
      assert.deepEqual(requests.map((item) => item.endpoint), ['/api/assistant', '/api/assistant', '/api/assistant'])
      assert.deepEqual(requests[0].payload, {
        query: '给我介绍一下巴黎时装周', profile: {},
        messages: [{ role: 'assistant', content: '嗨，我是小Y。告诉我你的肤质、喜欢的妆效和使用场景，我会从 YasPretty 产品库里给出有依据的选择。' }],
      })
      for (const { payload } of requests) for (const message of payload.messages) assert.deepEqual(Object.keys(message).sort(), ['content', 'role'])
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.locator('.xiaoy-page').waitFor()
      assert.deepEqual((await stored(page, 'yaspretty-xiaoy-messages-v1')).at(-1).sources, sources)
      return { geometry: await layout(page) }
    })

    await scenario(viewport, 'failures-disclose-recover', async ({ page, setReply, requests }, label) => {
      const answers = []
      for (const [query, status, code, message, expected] of [
        ['解释一下光的折射', 503, 'AI_NOT_CONFIGURED', '未配置模型服务。', /智能服务当前不可用：未配置模型服务。站内产品浏览和本地推荐仍可正常使用。/],
        ['NARS 最新价格', 503, 'WEB_SEARCH_FAILED', '合成联网失败。。', /联网检索当前不可用：合成联网失败。我不会用未经检索的信息冒充实时结果/],
        ['今天上海天气怎么样', 503, 'WEATHER_PROVIDER_UNAVAILABLE', '合成天气不可用。', /天气数据暂时不可用：合成天气不可用。我不会用猜测或旧资料代替实时天气/],
        ['解释一下光的折射', 504, 'UPSTREAM_TIMEOUT', '合成上游超时。', /智能服务当前不可用：合成上游超时。/],
      ]) {
        setReply(async (route) => route.fulfill({ status, json: { error: { code, message } } }))
        const answer = await send(page, query)
        assert.match(answer, expected)
        answers.push(answer)
        assert.equal(await page.locator('.xiaoy-mode').innerText(), '连接异常')
        assert.equal(await page.locator('.xiaoy-sources').count(), 0)
      }
      setReply(async (route) => route.abort('timedout'))
      const timeoutAnswer = await send(page, '解释一下光的折射')
      assert.match(timeoutAnswer, /智能服务当前不可用：Failed to fetch。/)
      answers.push(timeoutAnswer)
      await capture(page, `${label}-timeout`)
      for (const invalid of [false, true]) {
        setReply(async (route) => invalid
          ? route.fulfill({ contentType: 'application/json', body: '{invalid' })
          : route.fulfill({ json: { ok: true } }))
        assert.match(await send(page, '解释一下光的折射'), /智能服务没有返回内容/)
      }
      const lastEight = (await stored(page, 'yaspretty-xiaoy-messages-v1')).slice(-8).map(({ role, content }) => ({ role, content }))
      setReply(async (route) => route.fulfill({ json: { answer: 'ARCH-03 合成恢复回答。', sources: [], answerMode: 'model' } }))
      assert.match(await send(page, '解释一下光的折射'), /合成恢复回答/)
      assert.deepEqual(requests.at(-1).payload.messages, lastEight)
      assert.equal(await page.locator('.xiaoy-mode').innerText(), 'AI 对话')
      assert.match(await send(page, '我是油皮，预算 400 元，推荐粉底'), /在预算内/)
      await capture(page, label)
      return { answers, expectedNetworkErrors: 5, expectedTimeouts: 1, geometry: await layout(page) }
    })

    await scenario(viewport, 'plan-profile-adjust-fallback', async ({ page, requests, setReply }, label) => {
      const plans = []
      setReply(async (route, payload, endpoint) => {
        assert.equal(endpoint, '/api/makeup-plans')
        const plan = await service.create(payload)
        plans.push(plan)
        await route.fulfill({ json: { ok: true, plan } })
      })
      assert.match(await send(page, '我是混油皮，预算 500 元，给我完整妆容，通勤 10 小时'), /7. 唇妆/)
      const first = requests[0].payload
      assert.equal(first.userProfile.skinType, '混油皮')
      assert.equal(first.userProfile.budgetTotal, 500)
      assert.equal(first.makeupRequest.scene, '通勤')
      assert.equal(first.makeupRequest.wearHours, 10)
      assert.equal(first.makeupRequest.photoEnabled, false)
      assert.equal(await page.locator('.xiaoy-mode').innerText(), '资料库推荐')
      await send(page, '我是干皮，预算 300 元，想要奶油肌底妆')
      assert.match(await send(page, '拍照，给我完整妆容'), /本地规则方案/)
      const adjusted = requests[1].payload
      assert.equal(adjusted.userProfile.skinType, '干皮')
      assert.equal(adjusted.userProfile.budgetTotal, 300)
      assert.deepEqual(adjusted.userProfile.finishPreferences, ['奶油肌'])
      assert.equal(adjusted.makeupRequest.scene, '拍照')
      for (const id of (await stored(page, 'yaspretty-xiaoy-messages-v1')).at(-1).productIds) assert(products.some((product) => product.id === id))
      await capture(page, label)
      setReply(async (route) => route.fulfill({ status: 503, json: { error: { message: '合成方案失败' } } }))
      const fallback = await send(page, '给我完整妆容')
      assert.match(fallback, /1. 妆前/)
      assert.match(fallback, /7. 唇妆/)
      assert.match(fallback, /这是本地基础方案，没有使用照片分析或联网资料/)
      assert.equal(await page.locator('.xiaoy-mode').innerText(), '资料库推荐')
      assert(requests.every((item) => item.endpoint === '/api/makeup-plans'))
      await capture(page, `${label}-fallback`)
      return { planProductIds: plans.map((plan) => plan.recommendedProductIds), fallback, expectedNetworkErrors: 1, geometry: await layout(page) }
    })
  }
} finally {
  const summary = { createdAt: new Date().toISOString(), baseURL, browser: browser.version(), reducedMotion: 'reduce', total: results.length, passed: results.filter((item) => item.passed).length, results }
  await fs.writeFile(path.join(outputDir, 'results.json'), JSON.stringify(summary, null, 2) + '\n')
  await browser.close()
  console.log(JSON.stringify({ total: summary.total, passed: summary.passed, outputDir }))
}
if (results.some((item) => !item.passed)) process.exitCode = 1
