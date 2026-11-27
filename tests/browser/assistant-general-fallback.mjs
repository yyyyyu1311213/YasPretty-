// Production UI -> HTTP -> Fastify with synthetic providers; no real user data or model calls.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
require('dotenv').config = () => ({ parsed: {} })
const { buildApp } = require('../../server/app.cjs')
const { loadConfig } = require('../../server/config.cjs')
const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const output = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/general-fallback-20261128/browser')
await fs.mkdir(output, { recursive: true })
let mode = 'success'
const calls = []
const provider = {
  get configured() { return mode !== 'unconfigured' }, modelName: 'synthetic',
  async chat(messages) {
    calls.push(messages)
    if (mode === 'timeout' || mode === 'failure') throw Object.assign(new Error('synthetic-private-detail'), { code: mode === 'timeout' ? 'PROVIDER_TIMEOUT' : 'PROVIDER_UNAVAILABLE' })
    const query = messages.at(-1).content
    if (query === '每次看到那么多化妆步骤就不想动了') {
      assert(messages[0].content.includes('external_question'))
      return '可以少做一点，先选一个你想练的部分，做完就可以停。'
    }
    if (query === '我不想画眼线') {
      assert(messages[0].content.includes('不能再建议内眼线'))
      return '可以不画眼线，直接跳过这一步就好。'
    }
    if (query === '帮我写一句话') return '你希望写给谁，想表达什么？'
    if (query === '再展开说说') {
      assert(messages.some(({ content }) => content === '有点烦，陪我聊聊'), 'missing recent context')
      return '刚才你说有点烦，我们可以从最困扰你的那件事聊起。'
    }
    return '听起来今天有些累。愿意聊聊发生了什么吗？'
  },
  async search() { throw new Error('Unexpected search for non-timely fallback') },
}
const app = await buildApp({ config: loadConfig({ NODE_ENV: 'production', ZHIPU_API_KEY: '', API_RATE_LIMIT_MAX: 10000, AI_RATE_LIMIT_MAX: 1000, AI_DAILY_LIMIT: 100000 }),
  logger: false, providers: { zhipu: provider, weather: { configured: false } } })
const base = await app.listen({ host: '127.0.0.1', port: 0 })
let browser
const results = []
try {
  browser = await chromium.launch({ headless: true, ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}) })
  for (const width of [1440, 360]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    await context.route(/^https:\/\//, (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }))
    const page = await context.newPage()
    const errors = []
    const consoleErrors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (event) => { if (event.type() === 'error') consoleErrors.push(event.text()) })
    await page.goto(base, { waitUntil: 'domcontentloaded' })
    await page.locator('.brand-opening').waitFor({ state: 'hidden', timeout: 15000 })
    if (!await page.getByLabel('向小Y描述你的需求').isVisible()) {
      const menu = page.getByRole('button', { name: '打开导航', exact: true })
      if (await menu.isVisible()) await menu.click()
      await page.getByRole('button', { name: '小Y智能选妆', exact: true }).filter({ visible: true }).click()
    }
    async function turn(query, phrase, expectedStatus = 200, expectedCalls = 1) {
      const before = calls.length
      const messageCount = await page.locator('.xiaoy-message:not(.loading)').count()
      const responsePromise = page.waitForResponse((reply) => new URL(reply.url()).pathname === '/api/assistant')
      const input = page.getByLabel('向小Y描述你的需求')
      await input.fill(query)
      await input.press('Enter')
      const reply = await responsePromise
      const body = await reply.json()
      assert.equal(reply.status(), expectedStatus, JSON.stringify(body))
      await page.waitForFunction((count) => document.querySelectorAll('.xiaoy-message:not(.loading)').length === count + 2, messageCount)
      await page.waitForFunction((text) => [...document.querySelectorAll('.xiaoy-message.assistant')].at(-1)?.textContent.includes(text), phrase)
      assert.equal(calls.length - before, expectedCalls)
      const last = await page.locator('.xiaoy-message.assistant').last().innerText()
      assert(!/查询某款产品、比较产品|synthetic-private-detail/.test(last), last)
      assert.equal(await page.getByRole('group', { name: '小Y引导选项' }).count(), 0)
      const geometry = await page.evaluate(() => {
        const chat = document.querySelector('.xiaoy-messages')
        return { width: document.documentElement.scrollWidth, chat: chat.clientWidth, scroll: chat.scrollWidth }
      })
      assert(geometry.width <= width + 1 && geometry.scroll <= geometry.chat + 1, JSON.stringify(geometry))
      results.push({ width, query, status: reply.status(), passed: true, geometry })
    }
    mode = 'success'
    await turn('有点烦，陪我聊聊', '听起来今天有些累')
    await turn('再展开说说', '刚才你说有点烦')
    await page.screenshot({ path: path.join(output, `${width}-conversation.png`) })
    await page.getByRole('button', { name: '重新开始', exact: true }).click()
    await turn('帮我写一句话', '你希望写给谁')
    await page.getByRole('button', { name: '重新开始', exact: true }).click()
    await turn('每次看到那么多化妆步骤就不想动了', '可以少做一点')
    await turn('我不想画眼线', '可以不画眼线')
    await page.screenshot({ path: path.join(output, `${width}-beauty-fallback.png`) })
    await page.getByRole('button', { name: '重新开始', exact: true }).click()
    await turn('这款多少钱', '产品名称和版本', 200, 0)
    for (const failure of ['unconfigured', 'timeout', 'failure']) {
      mode = failure
      await page.getByRole('button', { name: '重新开始', exact: true }).click()
      await turn('有点烦，陪我聊聊', '智能服务当前不可用', 503, failure === 'unconfigured' ? 0 : 1)
      await turn('每次看到那么多化妆步骤就不想动了', '智能服务当前不可用', 503, failure === 'unconfigured' ? 0 : 1)
    }
    await page.screenshot({ path: path.join(output, `${width}-unavailable.png`) })
    assert.deepEqual(errors, [])
    assert(consoleErrors.every((text) => /503/.test(text)), JSON.stringify(consoleErrors))
    results.push({ width, pageErrors: errors, expected503ConsoleErrors: consoleErrors })
    await context.close()
  }
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2))
  console.log(JSON.stringify({ passed: results.filter((item) => item.passed).length, output }))
} finally {
  await browser?.close()
  await app.close()
}
