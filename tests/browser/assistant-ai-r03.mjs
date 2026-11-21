// Real production page -> HTTP -> router -> tools; no API response stubbing or real providers.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { performance } from 'node:perf_hooks'

const require = createRequire(import.meta.url)
require('dotenv').config = () => ({ parsed: {} })
const { buildApp } = require('../../server/app.cjs')
const { loadConfig } = require('../../server/config.cjs')
const { knowledgeEntries } = require('../../server/knowledge/beauty-knowledge.cjs')
const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const output = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/ai-r03/browser')
await fs.mkdir(output, { recursive: true })
let mode = 'no-key'
const calls = []
const provider = {
  configured: false, modelName: 'synthetic-ai-r03',
  async chat(messages) {
    const prompt = messages[0].content
    calls.push({ tool: 'chat', type: prompt.startsWith('按问题组织受控手法') ? 'knowledge' : prompt.includes('结构化妆容') ? 'plan' : 'other' })
    if (mode === 'timeout') throw Error('synthetic timeout')
    if (mode === 'invalid' || prompt.includes('结构化妆容')) return '{"unsupported":"合成无效结构"}'
    if (prompt.startsWith('按问题组织受控手法')) {
      // Use only the actual retrieved IDs in the prompt, without supplying a routing hint.
      const ids = [...prompt.matchAll(/\n\[([^\]]+)\]/g)].map((m) => m[1])
      return JSON.stringify({ sections: ids.map((id) => ({ id, techniques: knowledgeEntries.find((entry) => entry.id === id).techniques })) })
    }
    if (prompt.includes('仅从本次参考资料')) return JSON.stringify({ claims: [{ productId: 'catalog-108', field: 'price', value: '1.23元', sourceIds: ['search:1'] }] })
    return '合成一般回答，不代表真实模型结果。'
  },
  async search(query) {
    calls.push({ tool: 'search', query })
    if (mode === 'empty-search') return []
    if (mode === 'search-failure') throw Error('synthetic network failure')
    return [{ title: 'MAC魅可 小金盒高光修容盘 · 合成检索测试', url: 'https://detail.tmall.com/item.htm?id=1063617091783',
      publisher: '合成 provider', accessedAt: '2026-11-21T05:00:00.000Z', content: '小金盒高光修容盘，价格：1.23元。仅测试，不代表实际售价。' }]
  },
}
const app = await buildApp({ config: loadConfig({ NODE_ENV: 'production', ZHIPU_API_KEY: '', API_RATE_LIMIT_MAX: 10000, AI_RATE_LIMIT_MAX: 1000, AI_DAILY_LIMIT: 100000 }),
  logger: false, providers: { zhipu: provider, weather: { configured: false, forecast: async () => { throw Error('synthetic weather unavailable') } } } })
const base = await app.listen({ host: '127.0.0.1', port: 0 })
const browser = await chromium.launch({ headless: true, ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}) })
const results = []
try {
  for (const width of [1440, 360]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    // Fonts/source navigation are isolated from the internet; API stays actual local HTTP.
    await context.route(/^https:\/\//, (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }))
    const page = await context.newPage()
    const pageErrors = [], consoleErrors = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
    await page.goto(base, { waitUntil: 'domcontentloaded' })
    await page.locator('.brand-opening').waitFor({ state: 'hidden' })
    const menu = page.getByRole('button', { name: '打开导航', exact: true })
    if (await menu.isVisible()) await menu.click()
    await page.getByRole('button', { name: '小Y智能选妆', exact: true }).filter({ visible: true }).click()
    const input = page.getByLabel('向小Y描述你的需求')
    const last = page.locator('.xiaoy-message.assistant:not(.loading)').last()

    async function check(name, scenario, query, verify, screenshot = false) {
      await page.getByRole('button', { name: '重新开始', exact: true }).click()
      mode = scenario; provider.configured = scenario !== 'no-key'; calls.length = 0
      const before = await page.locator('.xiaoy-message:not(.loading)').count()
      const start = performance.now()
      const responsePromise = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/assistant')
      await input.fill(query); await input.press('Enter')
      const response = await responsePromise
      const result = await response.json()
      const httpLatencyMs = performance.now() - start
      await page.waitForFunction((count) => document.querySelectorAll('.xiaoy-message:not(.loading)').length === count + 2, before)
      const text = await last.innerText()
      await verify(result, text)
      const geometry = await page.evaluate(() => {
        const chat = document.querySelector('.xiaoy-messages')
        const input = document.querySelector('.xiaoy-composer input').getBoundingClientRect()
        const button = document.querySelector('.xiaoy-composer button').getBoundingClientRect()
        return { document: document.documentElement.scrollWidth, chat: chat.clientWidth, scroll: chat.scrollWidth, inputRight: input.right, buttonLeft: button.left }
      })
      assert(geometry.document <= width + 1 && geometry.scroll <= geometry.chat + 1, `${name}: overflow`)
      assert(geometry.inputRight <= geometry.buttonLeft + 1)
      assert.deepEqual(pageErrors, [])
      if (screenshot) {
        await last.scrollIntoViewIfNeeded()
        await page.screenshot({ path: path.join(output, `${width}-${name}.png`) })
      }
      results.push({ width, name, passed: true, scenario, provider: 'synthetic', query, httpLatencyMs, renderedLatencyMs: performance.now() - start,
        calls: { chat: calls.filter((item) => item.tool === 'chat').length, search: calls.filter((item) => item.tool === 'search').length }, status: response.status(), coverage: result.coverage, geometry })
    }
    await check('synonym', 'no-key', '底妆浮粉怎么办', (result, text) => {
      assert.equal(result.intent, 'beauty_knowledge'); assert(text.includes('底妆起皮、卡粉'))
      assert(text.includes('停止使用') && text.includes('专业人员')); assert.equal(calls.length, 0)
    }, true)
    await check('three-knowledge-questions', 'no-key', '先遮瑕还是先粉底？色号怎么选？化妆刷怎么选？', (result, text) => {
      assert.equal(result.coverage.length, 3); assert(result.coverage.every((item) => item.status === 'answered'))
      assert.equal(new Set(result.coverage.flatMap((item) => item.knowledgeIds)).size, 3)
      assert(text.includes('自然光') && text.includes('刷具'))
    }, true)
    await check('fact-knowledge-live-gap', 'search-failure', 'NEO 小方块气垫（哑光）净含量是多少；粉底怎么涂；小金盒高光修容盘最新价格是多少', (result, text) => {
      assert.deepEqual(result.coverage.map((item) => item.status), ['answered', 'answered', 'partial'])
      assert(text.includes('15g') && text.includes('仍缺少的信息')); assert.equal(calls.filter((item) => item.tool === 'search').length, 1)
    }, true)
    await check('no-hit', 'no-key', '银河尘埃眼影的粒子共振原理是什么', (result, text) => {
      assert.deepEqual(result.knowledgeEvidence, []); assert.equal(result.coverage[0].status, 'unavailable'); assert(text.includes('无法可靠解答'))
    })
    await check('safety-across-questions', 'success', '脸上有破损怎么办；遮瑕怎么用；给我完整妆容方案', (result, text) => {
      assert.deepEqual(result.coverage.map((item) => item.status), ['answered', 'unavailable', 'unavailable'])
      assert(text.includes('停止使用') && text.includes('专业人员') && text.includes('暂不提供继续上妆')); assert.equal(calls.length, 0)
    }, true)
    await check('knowledge-organization', 'success', '粉底怎么涂', async (result, text) => {
      assert.equal(result.answerMode, 'model'); assert(text.includes('适用条件')); assert.equal(calls.length, 1)
      assert((await last.locator('.xiaoy-sources').innerText()).includes('How To Apply Foundation'))
      const href = await last.locator('.xiaoy-sources a').first().getAttribute('href')
      assert(href.startsWith('https://www.maybelline.com/'))
    }, true)
    for (const scenario of ['invalid', 'timeout']) await check(`knowledge-${scenario}`, scenario, '底妆起皮怎么办', (result, text) => {
      assert.equal(result.answerMode, 'knowledge'); assert(text.includes('停止使用') && text.includes('专业人员')); assert.equal(calls.length, 1)
    })
    await check('compound-synthetic-price', 'success', '粉底怎么涂；小金盒高光修容盘最新价格是多少', (result, text) => {
      assert(result.coverage.every((item) => item.status === 'answered')); assert(text.includes('1.23元'))
      assert.equal(calls.filter((item) => item.tool === 'search').length, 1)
      assert.equal(calls.filter((item) => item.tool === 'chat').length, 2)
    }, true)
    await check('timely-empty-search', 'empty-search', '今年最新的粉底上妆技巧是什么；粉底怎么涂', (result, text) => {
      assert.equal(result.coverage[0].status, 'unavailable'); assert(text.includes('尚未取得可用证据'))
      assert.equal(calls.filter((item) => item.tool === 'search').length, 1)
    })
    for (const scenario of ['no-key', 'invalid']) await check(`plan-${scenario}`, scenario, '给我完整通勤妆容方案', (result, text) => {
      assert.equal(result.intent, 'makeup_plan'); assert(text.includes('本地规则方案'))
      assert(result.knowledgeEvidence.some((entry) => entry.id === 'foundation-application-basics'))
      assert.equal(calls.length, scenario === 'no-key' ? 0 : 2)
    }, true)
    await check('deferred-budget', 'empty-search', Array.from({ length: 9 }, (_, i) => `解释最近第${i + 1}项新闻`).join('；'), (result, text) => {
      assert.equal(result.coverage.length, 7); assert(text.includes('尚未处理的问题'))
      assert(calls.filter((item) => item.tool === 'search').length <= 3)
    })
    // Offline response is the existing browser fallback, not successful server knowledge retrieval.
    await context.setOffline(true)
    const count = await page.locator('.xiaoy-message:not(.loading)').count()
    await input.fill('粉底怎么涂'); await input.press('Enter')
    await page.waitForFunction((n) => document.querySelectorAll('.xiaoy-message:not(.loading)').length === n + 2, count)
    assert((await last.innerText()).includes('智能服务当前不可用'))
    assert.deepEqual(pageErrors, [])
    results.push({ width, name: 'offline-explicit-failure', passed: true, provider: 'not-called', consoleErrors })
    await context.close()
  }
} finally {
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ at: new Date().toISOString(), realProvider: 'not-authorized-not-run', results }, null, 2))
  await browser.close(); await app.close()
}
console.log(JSON.stringify({ passed: results.filter((row) => row.passed).length, total: 28, output }))
