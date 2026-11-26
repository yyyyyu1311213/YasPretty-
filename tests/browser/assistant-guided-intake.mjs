// Real production page -> HTTP -> Fastify; isolated browser, no real provider calls.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { products } from '../../src/data/products.js'
const require = createRequire(import.meta.url)
require('dotenv').config = () => ({ parsed: {} })
const { buildApp } = require('../../server/app.cjs')
const { loadConfig } = require('../../server/config.cjs')
const { selectRecommendations } = require('../../server/services/assistant/tools.cjs')
const output = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/skin-guidance-20261126/browser')
await fs.mkdir(output, { recursive: true })
const provider = { configured: false, modelName: 'not-used',
  async chat() { throw new Error('Guidance must not call the unavailable model.') },
  async search() { throw new Error('Guidance must not search the web.') } }
const app = await buildApp({
  config: loadConfig({ NODE_ENV: 'production', ZHIPU_API_KEY: '', API_RATE_LIMIT_MAX: 10000, AI_RATE_LIMIT_MAX: 1000, AI_DAILY_LIMIT: 100000 }),
  logger: false, providers: { zhipu: provider, weather: { configured: false } },
})
const base = await app.listen({ host: '127.0.0.1', port: 0 })
const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ headless: true, ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}) })
const choice = (label) => ({ label })
const cases = [
  { name: 'free-mixed', turns: ['推荐个粉底', '不知道自己啥肤质', '鼻子油两边干'], allowed: ['混油皮', '混干皮'], summary: '暂时偏向混合肤质' },
  { name: 'cushion-skip', turns: ['想买气垫，两百以内', '没注意过', '先跳过'], skipped: true, category: '气垫', budget: 200 },
  { name: 'known-oily', turns: ['推荐个粉底', '我是油皮'], allowed: ['油皮'] },
  { name: 'occasional', turns: ['推荐个粉底', '不清楚', '偶尔起皮', '先跳过'], skipped: true },
  { name: 'direct', turns: ['推荐个粉底', '不清楚', '不用问了，直接推荐'], skipped: true },
  { name: 'safety', turns: ['推荐个粉底', '不清楚', '现在脸红，还刺痛'], safety: true },
  { name: 'click-dry', turns: ['推荐个粉底，我不清楚肤质', choice('按需求选择，不区分性别'), choice('不太出油'), choice('经常会')], allowed: ['干皮', '混干皮'] },
  { name: 'click-oily', turns: ['推荐个粉底，我不清楚肤质', choice('按需求选择，不区分性别'), choice('全脸都容易油')], allowed: ['油皮', '混油皮'] },
  { name: 'click-mixed', turns: ['推荐个粉底，我不清楚肤质', choice('按需求选择，不区分性别'), choice('主要是额头和鼻子'), choice('经常会')], allowed: ['混油皮', '混干皮'] },
  { name: 'balanced', turns: ['推荐个粉底，我不清楚肤质', choice('按需求选择，不区分性别'), choice('不太出油'), choice('基本不会')], skipped: true, summary: '较平衡' },
  { name: 'knowledge', turns: ['怎么看肤质', choice('主要是额头和鼻子'), choice('经常会')], knowledge: true, summary: '暂时偏向混合肤质' },
  { name: 'recall-mixed', turns: ['推荐个粉底，预算400元', '不知道自己啥肤质', choice('没注意过，换个问法'),
    choice('鼻子额头油亮，两颊不明显'), choice('经常会')], allowed: ['混油皮', '混干皮'], budget: 400, summary: '暂时偏向混合肤质', expectedSteps: [1, 2, 3, 4] },
  { name: 'fifth-dry', turns: ['推荐个粉底，预算500元', '不清楚', '不知道', choice('还是想不起来'),
    choice('经常会'), choice('很少出油，两颊经常干')], allowed: ['干皮', '混干皮'], budget: 500, summary: '偏向干性肤质', expectedSteps: [1, 2, 3, 4, 5], reloadAtStep: 5 },
  { name: 'fifth-unknown', turns: ['我不知道我的肤质', '不知道', '不知道', '不知道', '不知道', '不知道'],
    knowledge: true, summary: '暂时无法可靠判断肤质', expectedSteps: [1, 2, 3, 4, 5] },
  { name: 'conflict-resolved', turns: ['推荐个粉底，预算400元，有时候油有时候干', choice('按需求选择，不区分性别'),
    choice('大部分脸常油，干燥只是偶尔')], allowed: ['油皮', '混油皮'], budget: 400, summary: '偏向油性肤质' },
  { name: 'cheek-recall', turns: ['怎么看肤质', choice('不太出油'), choice('说不清'), choice('常觉得干，笑起来有紧绷感')],
    knowledge: true, summary: '偏向干性肤质' },
  { name: 'empty-dry', turns: ['推荐个粉底，预算200元', '不清楚', choice('不太出油'), choice('经常会')],
    empty: true, summary: '偏向干性肤质' },
  { name: 'purchase-cap', turns: ['推荐个粉底', '不清楚', '不知道', '不知道', '不知道', '不知道'],
    skipped: true, summary: '暂时无法可靠判断肤质', expectedSteps: [1, 2, 3, 4, 5] },
]
const seededProfile = { skin: '油皮', budget: 1000, finish: '柔雾' }
const results = []
const byId = new Map(products.map((p) => [p.id, p]))
async function geometry(page, width) {
  const result = await page.evaluate(() => {
    const group = [...document.querySelectorAll('.xiaoy-choice-group')].at(-1)
    const buttons = [...(group?.querySelectorAll('button') || [])].map((button) => {
      const { left, right, top, bottom } = button.getBoundingClientRect()
      return { left, right, top, bottom }
    })
    const overlaps = []
    for (let i = 0; i < buttons.length; i++) for (let j = i + 1; j < buttons.length; j++) {
      if (Math.min(buttons[i].right, buttons[j].right) > Math.max(buttons[i].left, buttons[j].left)
        && Math.min(buttons[i].bottom, buttons[j].bottom) > Math.max(buttons[i].top, buttons[j].top)) overlaps.push([i, j])
    }
    return { documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, buttons, overlaps }
  })
  assert(result.documentWidth <= width + 1 && result.bodyWidth <= width + 1, `horizontal overflow: ${JSON.stringify(result)}`)
  assert(result.buttons.every((b) => b.left >= 0 && b.right <= width + 1), 'choice outside viewport')
  assert.deepEqual(result.overlaps, [], 'choices overlap')
  return result
}
try {
  for (const width of [1440, 360]) for (const scenario of cases) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    await context.addInitScript((profile) => {
      localStorage.setItem('yaspretty-xiaoy-profile-v1', JSON.stringify({ version: 1, value: profile }))
    }, seededProfile)
    await context.route(/^https:\/\//, (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }))
    const page = await context.newPage()
    const pageErrors = []
    const consoleErrors = []
    const apiRequests = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('console', (event) => { if (event.type() === 'error') consoleErrors.push(event.text()) })
    page.on('request', (request) => { if (new URL(request.url()).pathname === '/api/assistant') apiRequests.push(request.postDataJSON()) })
    await page.goto(base, { waitUntil: 'domcontentloaded' })
    await page.locator('.brand-opening').waitFor({ state: 'hidden', timeout: 15000 })
    const menu = page.getByRole('button', { name: '打开导航', exact: true })
    if (await menu.isVisible()) await menu.click()
    await page.getByRole('button', { name: '小Y智能选妆', exact: true }).filter({ visible: true }).click()
    assert.equal(await page.locator('.xiaoy-choice-group').count(), 0, 'welcome must not contain a questionnaire')
    const input = page.getByLabel('向小Y描述你的需求')
    let final
    const steps = []
    for (const turn of scenario.turns) {
      const before = await page.locator('.xiaoy-message:not(.loading)').count()
      const responsePromise = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/assistant')
      if (typeof turn === 'string') {
        await input.fill(turn)
        await input.press('Enter')
      } else {
        const button = page.locator('.xiaoy-choice-group').last().getByRole('button', { name: turn.label, exact: true })
        assert.equal(await button.isEnabled(), true)
        await button.focus()
        assert.equal(await button.evaluate((node) => document.activeElement === node), true)
        if (width === 360) await button.click()
        else await button.press('Enter')
      }
      const response = await responsePromise
      final = await response.json()
      assert.equal(response.status(), 200, JSON.stringify(final))
      await page.waitForFunction((count) => document.querySelectorAll('.xiaoy-message:not(.loading)').length === count + 2, before)
      await geometry(page, width)
      if (final.guidedQuestion) {
        steps.push(final.guidedQuestion.step)
        assert(final.guidedQuestion.step <= 5)
        if (final.guidedQuestion.step === scenario.reloadAtStep) {
          await page.reload({ waitUntil: 'domcontentloaded' })
          await page.locator('.brand-opening').waitFor({ state: 'hidden', timeout: 15000 })
          const nav = page.getByRole('button', { name: '小Y智能选妆', exact: true }).filter({ visible: true })
          if (!(await input.isVisible())) {
            if (await menu.isVisible()) await menu.click()
            await nav.click()
          }
          assert.equal(await page.locator('.xiaoy-choice-group').last().getByRole('button').first().isEnabled(), true)
        }
        if (final.guidedQuestion.step >= 4 && ['recall-mixed', 'fifth-dry'].includes(scenario.name)) {
          await page.locator('.xiaoy-choice-group').last().scrollIntoViewIfNeeded()
          await page.screenshot({ path: path.join(output, `${width}-${scenario.name}-round-${final.guidedQuestion.step}.png`) })
        }
        if (final.guidedQuestion.options[0].value === 'skin-oily' && scenario.name === 'free-mixed') {
          await page.locator('.xiaoy-choice-group').last().scrollIntoViewIfNeeded()
          await page.screenshot({ path: path.join(output, `${width}-oil-question.png`) })
        }
        if (final.guidedQuestion.options[0].value === 'cheek-often' && scenario.name === 'click-dry') {
          await page.locator('.xiaoy-choice-group').last().scrollIntoViewIfNeeded()
          await page.screenshot({ path: path.join(output, `${width}-cheek-question.png`) })
        }
      }
    }
    assert.equal(final.guidedQuestion, undefined, 'must finish without restarting')
    assert(steps.length <= 5, 'total guide exceeds five rounds')
    if (scenario.expectedSteps) assert.deepEqual(steps, scenario.expectedSteps)
    assert.equal(await page.locator('.xiaoy-choice-group button:enabled').count(), 0, 'old choices must be disabled')
    const ids = [...final.answer.matchAll(/\[\[PRODUCT:([^\]]+)\]\]/g)].map((match) => match[1])
    const conditions = { category: scenario.category || '粉底液', budget: scenario.budget || 1000, finish: seededProfile.finish }
    if (scenario.safety || scenario.knowledge || scenario.empty) {
      assert.deepEqual(ids, [])
      if (scenario.safety) assert.match(final.answer, /停止使用.*咨询合格专业人员/)
      if (scenario.empty) assert.match(final.answer, /没有.*候选|没有同时满足/)
    } else {
      assert(ids.length > 0, `${scenario.name} should have catalog candidates`)
      assert(ids.every((id) => byId.get(id)?.category === conditions.category && byId.get(id)?.price <= conditions.budget))
      if (scenario.skipped) {
        assert.match(final.answer, /没有按肤质筛选/)
        assert.deepEqual(ids, selectRecommendations(products, conditions).map(({ product }) => product.id), 'saved oily skin must not filter skip')
      } else assert(ids.every((id) => byId.get(id)?.skins.some((skin) => scenario.allowed.includes(skin))))
    }
    if (scenario.summary) assert(final.answer.includes(scenario.summary))
    const expectedProfile = { ...seededProfile, ...(scenario.name === 'cushion-skip' ? { category: '气垫' } : {}) }
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('yaspretty-xiaoy-profile-v1')).value), expectedProfile,
      'observation replies and choices must not rewrite long-term profile')
    assert.equal(apiRequests.at(-1).profile.skin, '油皮')
    if (!scenario.safety) {
      const detail = page.locator('.xiaoy-message.assistant').last().locator('details')
      assert.equal(await detail.getAttribute('open'), null)
      await detail.locator('summary').focus()
      await detail.locator('summary').press('Enter')
      assert.notEqual(await detail.getAttribute('open'), null)
      const explanation = await detail.innerText()
      assert(explanation.includes('日常出油位置、两颊干燥程度和出现频率'))
      assert(!/这不是诊断|也不保证产品适配|本次选择不会写入长期画像/.test(explanation))
      await detail.locator('summary').click()
      assert.equal(await detail.getAttribute('open'), null)
    }
    if (['free-mixed', 'fifth-dry'].includes(scenario.name)) {
      await page.locator('.xiaoy-message.assistant').last().scrollIntoViewIfNeeded()
      await page.screenshot({ path: path.join(output, `${width}-${scenario.name}-result.png`) })
    }
    const layout = await geometry(page, width)
    assert.deepEqual(pageErrors, [])
    assert.deepEqual(consoleErrors, [])
    results.push({ width, scenario: scenario.name, steps, candidateIds: ids, layout, pageErrors, consoleErrors, passed: true })
    await context.close()
  }
} finally {
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ generatedAt: new Date().toISOString(), provider: 'synthetic, no real provider calls', results }, null, 2))
  await browser.close()
  await app.close()
}
console.log(JSON.stringify({ passed: results.length, total: cases.length * 2, output }))
