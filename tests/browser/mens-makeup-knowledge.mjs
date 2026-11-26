// Real page -> Fastify HTTP -> controlled knowledge. All provider modes are synthetic.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
require('dotenv').config = () => ({ parsed: {} })
const { buildApp } = require('../../server/app.cjs')
const { loadConfig } = require('../../server/config.cjs')
const { knowledgeEntries } = require('../../server/knowledge/beauty-knowledge.cjs')
const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const output = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/mens-knowledge/browser')
await fs.mkdir(output, { recursive: true })
let mode = 'none'
const provider = { configured: false, modelName: 'synthetic',
  async chat(messages) {
    if (mode === 'timeout') throw new Error('synthetic timeout')
    if (mode === 'invalid') return '{"invented":true}'
    const ids = [...messages[0].content.matchAll(/\n\[([^\]]+)\]/g)].map((m) => m[1])
    return JSON.stringify({ sections: ids.map((id) => ({ id, techniques: knowledgeEntries.find((e) => e.id === id).techniques })) })
  }, async search() { throw new Error('No live search in this suite') },
}
const app = await buildApp({ config: loadConfig({ NODE_ENV: 'production', ZHIPU_API_KEY: '', API_RATE_LIMIT_MAX: 10000, AI_RATE_LIMIT_MAX: 1000, AI_DAILY_LIMIT: 100000 }),
  logger: false, providers: { zhipu: provider, weather: { configured: false } } })
const base = await app.listen({ host: '127.0.0.1', port: 0 })
const browser = await chromium.launch({ headless: true, ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}) })
const results = []
try {
  for (const width of [1440, 360]) {
    mode = 'none'; provider.configured = false
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    await context.route(/^https:\/\//, (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }))
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto(base, { waitUntil: 'domcontentloaded' })
    await page.locator('.brand-opening').waitFor({ state: 'hidden', timeout: 15000 })
    const menu = page.getByRole('button', { name: '打开导航', exact: true })
    if (await menu.isVisible()) await menu.click()
    await page.getByRole('button', { name: '小Y智能选妆', exact: true }).filter({ visible: true }).click()
    const input = page.getByLabel('向小Y描述你的需求')
    const last = page.locator('.xiaoy-message.assistant:not(.loading)').last()
    async function turn(text, choice = false) {
      const n = await page.locator('.xiaoy-message:not(.loading)').count()
      const responsePromise = page.waitForResponse((r) => new URL(r.url()).pathname === '/api/assistant')
      if (choice) await page.locator('.xiaoy-choice-group').last().getByRole('button', { name: text, exact: true }).click()
      else { await input.fill(text); await input.press('Enter') }
      const response = await responsePromise
      const data = await response.json()
      assert.equal(response.status(), 200, JSON.stringify(data))
      await page.waitForFunction((count) => document.querySelectorAll('.xiaoy-message:not(.loading)').length === count + 2, n)
      return data
    }
    async function verify(name, data, id, phrase, screenshot = false) {
      if (id) assert(data.knowledgeEvidence.some((e) => e.id === id), `${name}: missing ${id}`)
      if (name === 'plan') for (const entry of data.knowledgeEvidence) for (const boundary of [...entry.limitations, ...entry.safetyBoundaries]) assert(data.answer.includes(boundary), 'chat dropped a plan boundary')
      if (phrase) assert((await last.innerText()).includes(phrase), `${name}: missing ${phrase}`)
      const geometry = await page.evaluate(() => {
        const chat = document.querySelector('.xiaoy-messages')
        return { document: document.documentElement.scrollWidth, chat: chat.clientWidth, scroll: chat.scrollWidth }
      })
      assert(geometry.document <= width + 1 && geometry.scroll <= geometry.chat + 1, `${name}: overflow`)
      assert.deepEqual(errors, [])
      if (id) {
        const urls = await last.locator('.xiaoy-sources a').evaluateAll((nodes) => nodes.map((n) => n.href))
        assert(data.sources.every((s) => urls.includes(s.url)), `${name}: sources not rendered`)
      }
      if (screenshot) {
        await last.scrollIntoViewIfNeeded()
        await page.screenshot({ path: path.join(output, `${width}-${name}.png`) })
      }
      results.push({ width, name, mode, passed: true, answerMode: data.answerMode, knowledgeIds: data.knowledgeEvidence?.map((e) => e.id), geometry })
    }
    const first = await turn('男生眉毛怎么画')
    assert.equal(first.guidedQuestion.step, 1)
    const guided = await turn('我是男生，想看自然修饰', true)
    await verify('guided-brows', guided, 'mens-natural-brows', '短而轻的笔触', true)
    const scenarios = [
      ['base', '男士底妆怎么涂', 'mens-natural-base', '胡须和胡茬'],
      ['contour', '男生修容教程', 'mens-subtle-contour', '少量修容'],
      ['shaving', '剃须后化妆有哪些注意', 'shaving-and-makeup', '固定等待分钟数'],
      ['hygiene', '化妆刷多久洗', 'makeup-hygiene', '每周清洁'],
      ['research', '男生化妆有什么科学证据', 'mens-makeup-evidence', '200名美国评价者'],
      ['proportions', '黄金比例可靠吗', 'face-proportions-boundary', '普遍适用'],
      ['selfie', '自拍鼻子大怎么回事', 'selfie-perspective-boundary', '拍摄距离'],
      ['plan', '生成男生自然妆容方案', 'mens-natural-brows', '可选轻修容'],
    ]
    for (const [name, query, id, phrase] of scenarios) await verify(name, await turn(query), id, phrase, ['contour', 'plan'].includes(name))
    for (const providerMode of ['valid', 'invalid', 'timeout']) {
      mode = providerMode; provider.configured = true
      const result = await turn('男生眉毛怎么画')
      assert.equal(result.answerMode, mode === 'valid' ? 'model' : 'knowledge')
      await verify(`provider-${mode}`, result, 'mens-natural-brows', '不必购买教程中的整套商品')
    }
    mode = 'none'; provider.configured = false
    await verify('no-hit', await turn('银河尘埃眼影的粒子共振原理是什么'), null, '无法可靠解答')
    const safety = await turn('剃须刮破了，帮我推荐遮瑕')
    assert(!safety.answer.includes('[[PRODUCT:'))
    await verify('safety', safety, null, '暂不提供继续上妆或产品推荐')
    await context.setOffline(true)
    const count = await page.locator('.xiaoy-message:not(.loading)').count()
    await input.fill('男生眉毛怎么画'); await input.press('Enter')
    await page.waitForFunction((n) => document.querySelectorAll('.xiaoy-message:not(.loading)').length === n + 2, count)
    await verify('offline', {}, null, '智能服务当前不可用')
    await context.close()
  }
} finally {
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ at: new Date().toISOString(), realProvider: false, results }, null, 2))
  await browser.close(); await app.close()
}
console.log(JSON.stringify({ passed: results.length, expected: 30, output }))
