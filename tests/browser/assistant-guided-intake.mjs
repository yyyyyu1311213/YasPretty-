// Real production page -> HTTP -> Fastify -> assistant modules; no API stubbing or real providers.
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
const output = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/arch-14/guided-intake')
await fs.mkdir(output, { recursive: true })

const provider = {
  configured: false,
  modelName: 'not-used',
  async chat() { throw new Error('The guided catalog flow must not call a model when unavailable.') },
  async search() { throw new Error('The guided catalog flow must not search the web.') },
}
const app = await buildApp({
  config: loadConfig({ NODE_ENV: 'production', ZHIPU_API_KEY: '', API_RATE_LIMIT_MAX: 10000, AI_RATE_LIMIT_MAX: 1000, AI_DAILY_LIMIT: 100000 }),
  logger: false,
  providers: { zhipu: provider, weather: { configured: false } },
})
const base = await app.listen({ host: '127.0.0.1', port: 0 })
const { chromium: chromiumBrowser } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromiumBrowser.launch({ headless: true, ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}) })
const scenarios = [
  { width: 1440, choice: 'skin-dry', label: '洗脸后常紧绷或起皮', allowed: ['干皮', '混干皮'] },
  { width: 1440, choice: 'skin-oily', label: '全脸容易出油', allowed: ['油皮', '混油皮'] },
  { width: 1440, choice: 'skin-combination', label: 'T区油、两颊偏干', allowed: ['混油皮', '混干皮'] },
  { width: 1440, choice: 'skin-unknown', label: '不确定，先按原问题继续', skipped: true },
  { width: 360, choice: 'skin-dry', label: '洗脸后常紧绷或起皮', allowed: ['干皮', '混干皮'] },
  { width: 360, choice: 'skin-oily', label: '全脸容易出油', allowed: ['油皮', '混油皮'] },
  { width: 360, choice: 'skin-combination', label: 'T区油、两颊偏干', allowed: ['混油皮', '混干皮'] },
  { width: 360, choice: 'skin-unknown', label: '不确定，先按原问题继续', skipped: true },
]
const initialQuery = '我想选底妆，但不清楚自己的肤质'
const seededProfile = { skin: '油皮', finish: '柔雾' }
const results = []

function markerIds(answer) {
  return [...answer.matchAll(/\[\[PRODUCT:([^\]]+)\]\]/g)].map((match) => match[1])
}

try {
  for (const scenario of scenarios) {
    const context = await browser.newContext({ viewport: { width: scenario.width, height: 900 }, reducedMotion: 'reduce' })
    await context.addInitScript((profile) => {
      localStorage.setItem('yaspretty-xiaoy-profile-v1', JSON.stringify({ version: 1, value: profile }))
    }, seededProfile)
    await context.route(/^https:\/\//, (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }))
    const page = await context.newPage()
    const pageErrors = []
    const apiRequests = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('request', (request) => {
      if (new URL(request.url()).pathname === '/api/assistant') apiRequests.push(request.postDataJSON())
    })
    await page.goto(base, { waitUntil: 'domcontentloaded' })
    await page.locator('.brand-opening').waitFor({ state: 'hidden', timeout: 15000 })
    const menu = page.getByRole('button', { name: '打开导航', exact: true })
    if (await menu.isVisible()) await menu.click()
    await page.getByRole('button', { name: '小Y智能选妆', exact: true }).filter({ visible: true }).click()

    const input = page.getByLabel('向小Y描述你的需求')
    async function sendText(text) {
      const count = await page.locator('.xiaoy-message:not(.loading)').count()
      const responsePromise = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/assistant')
      await input.fill(text)
      await input.press('Enter')
      const response = await responsePromise
      const body = await response.json()
      await page.waitForFunction((before) => document.querySelectorAll('.xiaoy-message:not(.loading)').length === before + 2, count)
      return { body, status: response.status() }
    }
    async function clickChoice(label) {
      const button = page.locator('.xiaoy-choice-group').last().getByRole('button', { name: label, exact: true })
      await button.waitFor({ state: 'visible' })
      assert.equal(await button.isEnabled(), true, `${scenario.width}px: ${label} should be clickable`)
      const count = await page.locator('.xiaoy-message:not(.loading)').count()
      const responsePromise = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/assistant')
      await button.click()
      const response = await responsePromise
      const body = await response.json()
      await page.waitForFunction((before) => document.querySelectorAll('.xiaoy-message:not(.loading)').length === before + 2, count)
      return { body, status: response.status() }
    }

    const first = await sendText(initialQuery)
    assert.equal(first.status, 200)
    assert.equal(first.body.guidedQuestion?.step, 1)
    assert.equal(first.body.guidedQuestion?.initialQuery, initialQuery)
    assert.match(first.body.answer, /我想选底妆，但不清楚自己的肤质/)
    const route = await clickChoice('按需求选择，不区分性别')
    assert.equal(route.status, 200)
    assert.equal(route.body.guidedQuestion?.step, 2)
    assert.equal(route.body.guidedQuestion?.initialQuery, initialQuery)
    const optionLabels = await page.locator('.xiaoy-choice-group').last().getByRole('button').allTextContents()
    for (const expected of ['全脸容易出油', 'T区油、两颊偏干', '洗脸后常紧绷或起皮', '容易刺痛或泛红', '不确定，先按原问题继续']) {
      assert(optionLabels.some((label) => label.trim() === expected), `missing clickable option: ${expected}`)
    }

    const final = await clickChoice(scenario.label)
    assert.equal(final.status, 200)
    assert.equal(final.body.guidedQuestion, undefined, 'selection should complete without asking the skin question again')
    assert.equal(apiRequests.at(-1).query, scenario.choice)
    assert.equal(apiRequests.at(-1).messages.at(-1).question.initialQuery, initialQuery)
    assert.equal(apiRequests.at(-1).profile.skin, seededProfile.skin)
    assert.equal(apiRequests.at(-1).profile.finish, seededProfile.finish)
    const storedProfile = await page.evaluate(() => JSON.parse(localStorage.getItem('yaspretty-xiaoy-profile-v1')).value)
    assert.deepEqual(storedProfile, seededProfile, 'a one-time choice must not update the saved profile')

    const ids = markerIds(final.body.answer)
    assert(ids.length > 0, 'the flow should return real catalog candidates')
    const byId = new Map(products.map((product) => [product.id, product]))
    if (scenario.skipped) {
      assert.match(final.body.answer, /没有按肤质筛选候选/)
      const unfiltered = selectRecommendations(products, { category: '粉底液', finish: seededProfile.finish })
        .map(({ product }) => product.id)
      assert.deepEqual(ids, unfiltered, 'skip must match the existing non-skin-filtered candidate set despite a saved oily profile')
    } else {
      assert.match(final.body.answer, /本次按你提供的日常感受/)
      assert(ids.every((id) => byId.get(id)?.skins?.some((skin) => scenario.allowed.includes(skin))),
        `${scenario.choice} must hard-filter candidates by the selected request condition`)
      if (scenario.choice === 'skin-dry') assert(ids.some((id) => byId.get(id)?.skins?.includes('干皮') || byId.get(id)?.skins?.includes('混干皮')))
    }
    assert(!final.body.answer.includes('请先告诉我你的肤质'))

    const finalMessage = page.locator('.xiaoy-message.assistant:not(.loading)').last()
    const rendered = await finalMessage.innerText()
    assert(rendered.includes(scenario.skipped ? '没有按肤质筛选候选' : '本次按你提供的日常感受'))
    const geometry = await page.evaluate(() => {
      const choice = [...document.querySelectorAll('.xiaoy-choice-group')].at(-1)
      const buttons = [...(choice?.querySelectorAll('button') || [])].map((button) => {
        const rect = button.getBoundingClientRect()
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, disabled: button.disabled }
      })
      const overlaps = []
      for (let i = 0; i < buttons.length; i += 1) for (let j = i + 1; j < buttons.length; j += 1) {
        if (Math.min(buttons[i].right, buttons[j].right) > Math.max(buttons[i].left, buttons[j].left)
          && Math.min(buttons[i].bottom, buttons[j].bottom) > Math.max(buttons[i].top, buttons[j].top)) overlaps.push([i, j])
      }
      return { documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth, buttonCount: buttons.length, overlaps }
    })
    assert(geometry.documentWidth <= scenario.width + 1, `${scenario.width}px page horizontal overflow: ${JSON.stringify(geometry)}`)
    assert(geometry.bodyWidth <= scenario.width + 1, `${scenario.width}px body horizontal overflow: ${JSON.stringify(geometry)}`)
    assert.equal(geometry.buttonCount, 5)
    assert.deepEqual(geometry.overlaps, [], 'visible guide choices must not overlap')
    assert.deepEqual(pageErrors, [])
    results.push({ width: scenario.width, choice: scenario.choice, skipped: Boolean(scenario.skipped), candidateIds: ids, geometry, passed: true })
    await context.close()
  }
} finally {
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ generatedAt: new Date().toISOString(), provider: 'synthetic, no real provider calls', results }, null, 2))
  await browser.close()
  await app.close()
}

console.log(JSON.stringify({ passed: results.filter((item) => item.passed).length, total: scenarios.length, output }))
