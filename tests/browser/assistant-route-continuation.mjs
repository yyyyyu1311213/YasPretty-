// Real production page -> HTTP -> Fastify; isolated storage and no live provider calls.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
require('dotenv').config = () => ({ parsed: {} })
const { buildApp } = require('../../server/app.cjs')
const { loadConfig } = require('../../server/config.cjs')
const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const output = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/route-continuation-20261126/browser')
await fs.mkdir(output, { recursive: true })
const provider = { configured: false, async chat() { throw new Error('No live model') }, async search() { throw new Error('No live search') } }
const app = await buildApp({ config: loadConfig({ NODE_ENV: 'production', ZHIPU_API_KEY: '', API_RATE_LIMIT_MAX: 10000, AI_RATE_LIMIT_MAX: 1000, AI_DAILY_LIMIT: 100000 }),
  logger: false, providers: { zhipu: provider, weather: { configured: false } } })
const base = await app.listen({ host: '127.0.0.1', port: 0 })
const browser = await chromium.launch({ headless: true, ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}) })
const click = (label) => ({ label })
const women = click('我是女生，按日常彩妆建议')
const general = click('按需求选择，不区分性别')
const daily = click('简单日常入门')
const five = click('5分钟以内')
const cases = [
  { name: 'women', turns: ['我想化妆', women, daily, five], phrase: '先练两件事', steps: [1, 2, 3] },
  { name: 'men', turns: ['男生怎么化妆', click('我是男生，想看自然修饰'), daily, five], phrase: '胡茬', steps: [1, 2, 3] },
  { name: 'general', turns: ['我想化妆', general, daily, click('10分钟左右')], phrase: '局部遮瑕', steps: [1, 2, 3] },
  { name: 'cannot', turns: ['我不会化妆', women, click('还没想好'), five], phrase: '少量开始', steps: [1, 2, 3] },
  { name: 'learning', turns: ['想学化妆', women, daily, click('愿意慢慢学')], phrase: '分开练', steps: [1, 2, 3] },
  { name: 'brow', turns: ['眉毛怎么画自然', women], phrase: '短而轻的笔触', steps: [1] },
  { name: 'interview', turns: ['明天面试怎么化', women, five], phrase: '面试场景', steps: [1, 2] },
  { name: 'foundation', turns: ['推荐个粉底，预算500元', women, click('全脸都容易油')], phrase: '本次按你提供的日常感受', steps: [1, 2] },
  { name: 'unknown', turns: ['我想化妆', '不知道', '不知道', '跳过'], phrase: '薄底妆', steps: [1, 2, 3] },
  { name: 'skip', turns: ['我想化妆', '跳过'], phrase: '薄底妆', steps: [1] },
  { name: 'direct', turns: ['我想化妆', click('先按原问题直接回答')], phrase: '用眉刷', steps: [1] },
  { name: 'direct-later', turns: ['我想化妆', women, '先按原问题直接回答'], phrase: '薄底妆', steps: [1, 2] },
  { name: 'correction', turns: ['我想化妆，我是干皮，预算500元，想要哑光，用于面试，不要NARS', women,
    '简单日常入门，预算改为300元', '每天十分钟左右'], phrase: '预算300元以内', steps: [1, 2, 3], profile: { skin: '干皮', budget: 500, finish: '哑光', scene: '面试' } },
  { name: 'goal-change', turns: ['我想化妆', general, daily, '改学眉毛怎么画自然'], phrase: '短而轻的笔触', steps: [1, 2, 3] },
  { name: 'topic-change', turns: ['我想化妆', women, '换个话题，粉底和气垫有什么区别'], phrase: '包装', steps: [1, 2] },
  { name: 'safety', turns: ['我想化妆', women, '现在脸上红肿刺痛'], phrase: '停止使用', steps: [1, 2] },
  { name: 'eye-lip-gap', turns: ['我想化妆', women, click('眼妆或唇妆')], phrase: '尚不足以给出完整眼线', steps: [1, 2] },
  { name: 'base-next', turns: ['我想化妆', women, click('底妆怎么上'), '然后呢'], phrase: '接下来整理眉毛', steps: [1, 2] },
  { name: 'base-next-men', turns: ['我想化妆', click('我是男生，想看自然修饰'), click('底妆怎么上'), '然后呢', '下一步', '继续'], phrase: '定妆收尾', steps: [1, 2] },
  { name: 'base-next-general', turns: ['我想化妆', general, click('底妆怎么上'), '然后呢', '接下来呢', '继续', '然后呢', '然后呢'], phrase: '已经讲完', steps: [1, 2] },
  { name: 'daily-next', turns: ['我想化妆', women, daily, five, '然后呢'], phrase: '仍按你说的5分钟以内', steps: [1, 2, 3] },
  { name: 'advice-correction', turns: ['我想化妆，预算500元，不要NARS', general, click('底妆怎么上'), '然后呢', '预算改为300元', '接下来呢'], phrase: '预算300元以内', steps: [1, 2], profile: { budget: 500 } },
]
const results = []
async function openAssistant(page) {
  await page.locator('.brand-opening').waitFor({ state: 'hidden', timeout: 15000 })
  if (await page.getByLabel('向小Y描述你的需求').isVisible()) return
  const menu = page.getByRole('button', { name: '打开导航', exact: true })
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('button', { name: '小Y智能选妆', exact: true }).filter({ visible: true }).click()
}
async function geometry(page, width) {
  const layout = await page.evaluate(() => {
    const chat = document.querySelector('.xiaoy-messages')
    const buttons = [...document.querySelectorAll('.xiaoy-choice-group')].at(-1)?.querySelectorAll('button') || []
    const boxes = [...buttons].map((node) => { const b = node.getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom } })
    return { width: document.documentElement.scrollWidth, chat: chat.clientWidth, chatScroll: chat.scrollWidth, boxes }
  })
  assert(layout.width <= width + 1 && layout.chatScroll <= layout.chat + 1, JSON.stringify(layout))
  for (let i = 0; i < layout.boxes.length; i++) {
    const a = layout.boxes[i]
    assert(a.left >= 0 && a.right <= width + 1, 'option out of viewport')
    for (const b of layout.boxes.slice(i + 1)) assert(!(Math.min(a.right, b.right) > Math.max(a.left, b.left) && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top)), 'overlapping options')
  }
  return layout
}
try {
  for (const width of [1440, 360]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    await context.route(/^https:\/\//, (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }))
    const page = await context.newPage()
    const errors = []
    const consoleErrors = []
    const requests = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (event) => { if (event.type() === 'error') consoleErrors.push(event.text()) })
    page.on('request', (request) => { if (new URL(request.url()).pathname === '/api/assistant') requests.push(request.postDataJSON()) })
    await page.goto(base, { waitUntil: 'domcontentloaded' })
    await openAssistant(page)
    const input = page.getByLabel('向小Y描述你的需求')
    async function turn(value) {
      const n = await page.locator('.xiaoy-message:not(.loading)').count()
      const responsePromise = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/assistant')
      if (typeof value === 'string') { await input.fill(value); await input.press('Enter') }
      else {
        const button = page.getByRole('group', { name: '小Y引导选项' }).last().getByRole('button', { name: value.label, exact: true })
        await button.focus()
        assert(await button.evaluate((node) => node === document.activeElement))
        if (width === 1440) await button.press('Enter')
        else await button.click()
      }
      const response = await responsePromise
      const result = await response.json()
      assert.equal(response.status(), 200, JSON.stringify(result))
      await page.waitForFunction((count) => document.querySelectorAll('.xiaoy-message:not(.loading)').length === count + 2, n)
      await geometry(page, width)
      return result
    }
    for (const scenario of cases) {
      await page.getByRole('button', { name: '重新开始', exact: true }).click()
      let result
      const steps = []
      for (const value of scenario.turns) {
        result = await turn(value)
        if (result.guidedQuestion) steps.push(result.guidedQuestion.step)
        if (scenario.name === 'women' && result.guidedQuestion?.step === 2) {
          await page.getByRole('group', { name: '小Y引导选项' }).last().scrollIntoViewIfNeeded()
          await page.screenshot({ path: path.join(output, `${width}-goals.png`) })
        }
      }
      assert.deepEqual(steps, scenario.steps)
      assert.equal(result.guidedQuestion, undefined)
      assert(result.answer.includes(scenario.phrase), `${scenario.name}: ${result.answer}`)
      assert(!/我还不确定你的意思|请补充具体需求|没有足够相关/.test(result.answer))
      assert.equal(await page.locator('[aria-label="小Y引导选项"] button:enabled').count(), 0)
      assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('yaspretty-xiaoy-profile-v1')).value), scenario.profile || {})
      const count = requests.length
      const old = page.locator('[aria-label="小Y引导选项"] button').first()
      await old.evaluate((node) => node.click())
      assert.equal(requests.length, count, 'old buttons dispatched another request')
      if (scenario.name === 'women') {
        await page.locator('.xiaoy-message.assistant').last().scrollIntoViewIfNeeded()
        await page.screenshot({ path: path.join(output, `${width}-advice.png`) })
      }
      results.push({ width, scenario: scenario.name, steps, passed: true, layout: await geometry(page, width) })
    }
    assert.deepEqual(consoleErrors, [])
    // Hold a real click in flight, inject an HTTP failure, then retry the original payload.
    await page.getByRole('button', { name: '重新开始', exact: true }).click()
    await turn('我想化妆')
    let release
    const gate = new Promise((resolve) => { release = resolve })
    let entered
    const intercepted = new Promise((resolve) => { entered = resolve })
    await context.route('**/api/assistant', async (route) => {
      entered()
      await gate
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { code: 'UPSTREAM_TIMEOUT', message: '合成服务超时' } }) })
    }, { times: 1 })
    const routeButton = page.getByRole('button', { name: women.label, exact: true })
    const requestCount = requests.length
    await routeButton.click()
    await intercepted
    await page.locator('.xiaoy-message.loading').waitFor({ state: 'visible' })
    assert(await routeButton.isDisabled())
    assert(await page.getByRole('button', { name: '重新开始', exact: true }).isDisabled())
    await routeButton.evaluate((node) => node.click())
    assert.equal(requests.length, requestCount + 1)
    release()
    await page.getByRole('button', { name: '重试这次选择', exact: true }).waitFor({ state: 'visible' })
    assert((await page.locator('.xiaoy-message.assistant').last().innerText()).includes('尚未处理完成'))
    const failedPayload = requests.at(-1)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await openAssistant(page)
    const retryResponse = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/assistant')
    await page.getByRole('button', { name: '重试这次选择', exact: true }).click()
    assert.equal((await retryResponse).status(), 200)
    await page.getByRole('button', { name: daily.label, exact: true }).waitFor({ state: 'visible' })
    assert.deepEqual(requests.at(-1), failedPayload, 'retry changed the initial request/context')
    await turn(daily)
    const result = await turn(five)
    assert(result.answer.includes('薄底妆和眉毛'))
    assert.deepEqual(errors, [])
    assert(consoleErrors.every((text) => /503/.test(text)), JSON.stringify(consoleErrors))
    results.push({ width, scenario: 'failure-retry-duplicate-reload', passed: true, expectedConsoleErrors: consoleErrors, layout: await geometry(page, width) })
    // Reload preserves advice progress; failed continuation retries the same step.
    await page.reload({ waitUntil: 'domcontentloaded' })
    await openAssistant(page)
    const continuation = await turn('然后呢')
    assert.equal(continuation.beginnerContext.lastStep, 'color')
    await context.route('**/api/assistant', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { message: '合成追问失败' } }) }), { times: 1 })
    await input.fill('继续')
    await input.press('Enter')
    await page.getByRole('button', { name: '重试这次追问', exact: true }).waitFor({ state: 'visible' })
    const failedFollowup = requests.at(-1)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await openAssistant(page)
    const retryFollowup = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/assistant')
    await page.getByRole('button', { name: '重试这次追问', exact: true }).click()
    const resumed = await (await retryFollowup).json()
    assert.equal(resumed.beginnerContext.lastStep, 'finish')
    assert.deepEqual(requests.at(-1), failedFollowup)
    await page.getByText('最后检查边缘，按需定妆收尾。', { exact: false }).waitFor()
    await page.locator('.xiaoy-message.assistant').last().scrollIntoViewIfNeeded()
    await page.screenshot({ path: path.join(output, `${width}-continued.png`) })
    const changed = await turn('换个话题，粉底和气垫有什么区别')
    assert.equal(changed.beginnerContext, undefined)
    const afterTopic = await turn('然后呢')
    assert.equal(afterTopic.beginnerContext, undefined)
    assert.deepEqual(errors, [])
    assert(consoleErrors.every((text) => /503/.test(text)), JSON.stringify(consoleErrors))
    results.push({ width, scenario: 'advice-reload-failure-retry-topic-change', passed: true, layout: await geometry(page, width) })
    await context.close()
  }
} finally {
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ generatedAt: new Date().toISOString(), provider: 'synthetic, no live calls', results }, null, 2))
  await browser.close()
  await app.close()
}
console.log(JSON.stringify({ passed: results.length, total: (cases.length + 2) * 2, output }))
