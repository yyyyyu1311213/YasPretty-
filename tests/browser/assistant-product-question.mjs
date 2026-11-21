// npm run build, then run with an existing Playwright module/browser.
// Real local HTTP + production UI, isolated contexts and synthetic providers only.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
require('dotenv').config = () => ({ parsed: {} })
const { buildApp } = require('../../server/app.cjs')
const { loadConfig } = require('../../server/config.cjs')
const { AppError } = require('../../server/errors.cjs')
const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const output = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/assistant-product-question')
await fs.mkdir(output, { recursive: true })
const question = '这个兰芝NEO小方块哑光气垫，15g是正装还是带替换芯？一个大概能用多久？平时放包里补妆方便吗？'
const source = { title: '合成产品来源（仅测试）', url: 'https://example.test/product-question', publisher: '测试', accessedAt: '2026-11-20T17:00:00.000Z', content: '测试来源，不代表产品事实。' }
let scenario = 'success'
const calls = []
const provider = {
  configured: true,
  modelName: 'synthetic-model',
  async search(query) {
    calls.push('search')
    assert(query.includes('最新价格'))
    if (scenario === 'empty') return []
    if (scenario === 'timeout') throw new AppError('UPSTREAM_TIMEOUT', '合成超时', 504)
    return [source]
  },
  async chat(messages) {
    calls.push('chat')
    assert(messages[0].content.includes('归类为：product_fact'))
    return '合成产品回答：仅凭15g不能确认是否包含替换芯。使用时长取决于用量与频率。[1]\n[[PRODUCT:laneige-neo-matte]]'
  },
}
const app = await buildApp({
  config: loadConfig({ NODE_ENV: 'production', ZHIPU_API_KEY: '', API_RATE_LIMIT_MAX: 10000, AI_RATE_LIMIT_MAX: 1000, AI_DAILY_LIMIT: 100000 }),
  logger: false,
  providers: { zhipu: provider, weather: { configured: false } },
})
const base = await app.listen({ host: '127.0.0.1', port: 0 })
const browser = await chromium.launch({ headless: true, ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}) })
const results = []

try {
  for (const width of [1440, 360]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    const page = await context.newPage()
    const pageErrors = []
    const unexpectedConsoleErrors = []
    const requests = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error' && !/Failed to load resource: the server responded with a status of (502|503|504)/.test(message.text())) unexpectedConsoleErrors.push(message.text())
    })
    page.on('request', (request) => {
      if (new URL(request.url()).pathname === '/api/assistant') requests.push(request.postDataJSON())
    })
    // Keep external fonts deterministic; no real external requests or user storage.
    await context.route(/^https:\/\//, (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }))
    await page.goto(base)
    await page.locator('.brand-opening').waitFor({ state: 'hidden' })
    const menu = page.getByRole('button', { name: '打开导航', exact: true })
    if (await menu.isVisible()) await menu.click()
    await page.getByRole('button', { name: '小Y智能选妆', exact: true }).filter({ visible: true }).click()
    const input = page.getByLabel('向小Y描述你的需求')
    const last = page.locator('.xiaoy-message.assistant:not(.loading)').last()
    async function send(text) {
      const count = await page.locator('.xiaoy-message:not(.loading)').count()
      await input.fill(text)
      await input.press('Enter')
      await page.waitForFunction((count) => document.querySelectorAll('.xiaoy-message:not(.loading)').length === count + 2, count)
      return last.innerText()
    }
    await send('我是油皮，预算400元，推荐气垫')
    assert.equal(requests.length, 1, 'Ordinary recommendation reaches the assistant API')
    for (scenario of ['success', 'empty', 'timeout', 'unconfigured']) {
      provider.configured = scenario !== 'unconfigured'
      calls.length = 0
      const sentQuestion = ['empty', 'timeout'].includes(scenario) ? 'NEO小方块哑光气垫最新价格是多少？' : question
      const reply = await send(sentQuestion)
      assert(!reply.includes('没有同时满足'))
      const payload = requests.at(-1)
      assert.equal(payload.query, sentQuestion)
      assert.equal(payload.profile.budget, 400)
      if (scenario === 'unconfigured') {
        assert(reply.includes('规格记录：15g') && !reply.includes('智能服务未配置'))
        assert.equal(await last.locator('.xiaoy-product').count(), 1)
        assert.deepEqual(calls, [])
      } else if (scenario === 'success') {
        assert.deepEqual(calls, [])
        assert(reply.includes('规格记录：15g') && reply.includes('替换芯：未知'))
        assert((await last.locator('.xiaoy-sources').innerText()).includes('2026-10-30'))
        assert.equal(await last.locator('.xiaoy-product').count(), 1)
      } else {
        assert(/检索(?:没有返回|失败或超时)/.test(reply))
        assert(reply.includes('历史参考价：325元'))
        assert.equal(await last.locator('.xiaoy-product').count(), 1)
        assert.deepEqual(calls, scenario === 'unconfigured' ? [] : ['search'])
      }
      const geometry = await page.evaluate(() => {
        const chat = document.querySelector('.xiaoy-messages')
        const input = document.querySelector('.xiaoy-composer input').getBoundingClientRect()
        const send = document.querySelector('.xiaoy-composer button').getBoundingClientRect()
        return { width: innerWidth, document: document.documentElement.scrollWidth, chat: chat.clientWidth, chatScroll: chat.scrollWidth, inputRight: input.right, sendLeft: send.left }
      })
      assert(geometry.document <= width + 1 && geometry.chatScroll <= geometry.chat + 1)
      assert(geometry.inputRight <= geometry.sendLeft + 1)
      await page.locator('.xiaoy-chat').scrollIntoViewIfNeeded()
      await page.locator('.xiaoy-messages').evaluate((element) => element.scrollTo({ top: element.scrollHeight, behavior: 'instant' }))
      await page.waitForFunction(() => {
        const element = document.querySelector('.xiaoy-messages')
        return element.scrollHeight - element.clientHeight - element.scrollTop < 2
      })
      await page.screenshot({ path: path.join(output, `${width}-${scenario}.png`) })
      results.push({ width, scenario, passed: true, geometry })
    }
    assert.equal(requests.length, 5)
    await page.reload()
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('yaspretty-xiaoy-profile-v1')).value.budget), 400)
    assert.deepEqual(pageErrors, [])
    assert.deepEqual(unexpectedConsoleErrors, [])
    await context.close()
  }
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ finishedAt: new Date().toISOString(), browser: browser.version(), results }, null, 2))
  console.log(`${results.length}/${results.length} browser scenarios passed`)
} finally {
  await browser.close()
  await app.close()
}
