// Run against a local YasPretty dev server; no dependency installation or real API calls.
// Set YAS_QA_PLAYWRIGHT_MODULE to an existing Playwright module URL when it is not installed locally.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
const baseURL = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5174'
assert(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(baseURL).hostname), 'Use a local test server')
const outputDir = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/arch-01-storage')
await fs.mkdir(outputDir, { recursive: true })
const keys = {
  profile: 'yaspretty-xiaoy-profile-v1', messages: 'yaspretty-xiaoy-messages-v1',
  oldProfile: 'yaspretty-xiaoy-profile', oldMessages: 'yaspretty-xiaoy-messages',
  oldConfig: 'yaspretty-xiaoy-config', oldAssistantConfig: 'yaspretty-assistant-config',
}
const pack = (value) => JSON.stringify({ version: 1, value })
const profile = { skin: '混油皮', finish: '柔雾', scene: '通勤', budget: 400, category: '粉底液', coverage: '高', tone: '中性调', city: '' }
const messages = Array.from({ length: 25 }, (_, index) => ({
  id: String(index), role: index % 2 ? 'assistant' : 'user', content: `ARCH-01 合成测试 ${index}`, productIds: [],
}))
messages[24] = {
  ...messages[24], role: 'assistant', productIds: ['nars-light-reflecting'],
  sources: [{ kind: 'knowledge', title: 'ARCH-01 合成来源', url: 'https://example.test/arch-01', publisher: '测试', accessedAt: '2026-11-17T00:00:00.000Z' }],
}
const results = []
const browser = await chromium.launch({
  headless: true,
  ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}),
})

async function openAssistant(page) {
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
  await page.locator('.brand-opening').waitFor({ state: 'hidden', timeout: 15000 })
  if (!await page.locator('.xiaoy-page').count()) {
    const mobile = page.getByRole('button', { name: '打开导航', exact: true })
    if (await mobile.isVisible()) await mobile.click()
    await page.getByRole('button', { name: '小Y智能选妆', exact: true }).filter({ visible: true }).click()
  }
  await page.getByRole('heading', { name: '和小Y一起，找到适合你的底妆。', exact: true }).waitFor()
}

async function reloadAssistant(page) {
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.xiaoy-page').waitFor()
}

async function readStorage(page) {
  // Each context below is new and contains only synthetic data from this script.
  return page.evaluate(() => Object.fromEntries(Object.entries(localStorage)))
}

async function waitStored(page, key, count) {
  await page.waitForFunction(({ key, count }) => {
    const record = JSON.parse(localStorage.getItem(key) || 'null')
    return record?.version === 1 && (count === undefined || record.value?.length === count)
  }, { key, count })
}

async function assertLayout(page) {
  const geometry = await page.evaluate(() => {
    const rect = (selector) => {
      const { x, y, width, height } = document.querySelector(selector).getBoundingClientRect()
      return { x, y, width, height, right: x + width, bottom: y + height }
    }
    const chat = document.querySelector('.xiaoy-messages')
    return {
      width: innerWidth, documentWidth: document.documentElement.scrollWidth,
      panel: rect('.xiaoy-page'), workbench: rect('.makeup-workbench'),
      sidebar: rect('.xiaoy-sidebar'), chat: rect('.xiaoy-chat'),
      input: rect('.xiaoy-composer input'), send: rect('.xiaoy-composer button'),
      messageWidth: chat.clientWidth, messageScrollWidth: chat.scrollWidth,
    }
  })
  assert(geometry.documentWidth <= geometry.width + 1, 'Horizontal document overflow')
  assert(geometry.messageScrollWidth <= geometry.messageWidth + 1, 'Horizontal message overflow')
  for (const name of ['panel', 'workbench', 'sidebar', 'chat', 'input', 'send']) {
    const rect = geometry[name]
    assert(rect.width > 0 && rect.height > 0 && rect.x >= -1 && rect.right <= geometry.width + 1, `${name} outside viewport width`)
  }
  assert(geometry.input.right <= geometry.send.x + 1, 'Composer controls overlap')
  const a = geometry.sidebar
  const b = geometry.chat
  assert(a.right <= b.x + 1 || a.bottom <= b.y + 1, 'Profile and chat overlap')
  return geometry
}

async function screenshot(page, name) {
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: true, animations: 'disabled' })
}

async function scenario(viewport, name, seed, test) {
  const context = await browser.newContext({
    viewport, reducedMotion: 'reduce', deviceScaleFactor: 1,
    storageState: { cookies: [], origins: [{ origin: new URL(baseURL).origin, localStorage: Object.entries(seed).map(([name, value]) => ({ name, value })) }] },
  })
  const page = await context.newPage()
  const errors = []
  const consoleErrors = []
  const apiRequests = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  page.on('request', (request) => { if (new URL(request.url()).pathname.startsWith('/api/')) apiRequests.push(request.url()) })
  const label = `${viewport.width}-${name}`
  try {
    await openAssistant(page)
    const details = await test(page, label)
    assert.deepEqual(errors, [], 'Unhandled browser errors')
    assert.deepEqual(apiRequests, [], 'Unexpected API request in local storage regression')
    results.push({ label, passed: true, details, pageErrors: errors, consoleErrors, apiRequests })
    console.log(`PASS ${label}`)
  } catch (error) {
    await screenshot(page, `${label}-failure`).catch(() => {})
    results.push({ label, passed: false, error: error.stack, pageErrors: errors, consoleErrors, apiRequests })
    console.error(`FAIL ${label}: ${error.message}`)
  } finally {
    await context.close()
  }
}

try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
    await scenario(viewport, 'fresh-defaults', {}, async (page, label) => {
      await waitStored(page, keys.messages, 1)
      const stored = await readStorage(page)
      assert.deepEqual(JSON.parse(stored[keys.profile]), { version: 1, value: {} })
      assert.equal(JSON.parse(stored[keys.messages]).value[0].id, 'welcome')
      assert.equal(await page.locator('.xiaoy-message').count(), 1)
      const geometry = await assertLayout(page)
      await screenshot(page, label)
      return { geometry }
    })

    await scenario(viewport, 'conversation-refresh-limit-reset', {}, async (page, label) => {
      const input = page.getByRole('textbox', { name: '向小Y描述你的需求' })
      for (let index = 0; index < 11; index++) {
        await input.fill(index === 0 ? '我是混油皮，预算 400 元，想要柔雾通勤底妆' : '继续推荐通勤底妆')
        await page.getByRole('button', { name: '发送', exact: true }).click()
        await page.waitForFunction((count) => document.querySelectorAll('.xiaoy-message:not(.loading)').length === count, 3 + index * 2)
      }
      await waitStored(page, keys.messages, 20)
      let stored = await readStorage(page)
      const persistedProfile = JSON.parse(stored[keys.profile])
      const persistedMessages = JSON.parse(stored[keys.messages])
      assert.equal(await page.locator('.xiaoy-message').count(), 23)
      assert.equal(persistedProfile.value.skin, '混油皮')
      assert.equal(persistedProfile.value.budget, 400)
      const visible = await page.locator('.xiaoy-message-body > p').allTextContents()
      assert.deepEqual(persistedMessages.value.map(({ content }) => content), visible.slice(-20))
      await reloadAssistant(page)
      assert.equal(await page.locator('.xiaoy-message').count(), 20)
      assert.deepEqual(await page.locator('.xiaoy-message-body > p').allTextContents(), persistedMessages.value.map(({ content }) => content))
      stored = await readStorage(page)
      assert.deepEqual(JSON.parse(stored[keys.profile]), persistedProfile)
      assert.deepEqual(JSON.parse(stored[keys.messages]), persistedMessages)
      assert.match(await page.locator('.xiaoy-profile').innerText(), /混油皮/)
      assert.match(await page.locator('.xiaoy-profile').innerText(), /400 元内/)
      const geometry = await assertLayout(page)
      await screenshot(page, label)
      await page.getByRole('button', { name: '重新开始', exact: true }).click()
      await waitStored(page, keys.messages, 1)
      await reloadAssistant(page)
      stored = await readStorage(page)
      assert.deepEqual(JSON.parse(stored[keys.profile]).value, {})
      assert.equal(JSON.parse(stored[keys.messages]).value[0].id, 'welcome')
      assert.equal(await page.locator('.xiaoy-message').count(), 1)
      assert.match(await page.locator('.xiaoy-profile-count').innerText(), /0/)
      return { messagesBeforeReload: 23, restoredMessages: 20, resetMessages: 1, geometry }
    })

    await scenario(viewport, 'legacy-migration-and-credentials', {
      [keys.oldProfile]: JSON.stringify(profile), [keys.oldMessages]: JSON.stringify(messages),
      [keys.oldConfig]: 'ARCH-01-test-only', [keys.oldAssistantConfig]: 'ARCH-01-test-only',
      'arch-01-unrelated-test': 'keep', 'base-archive-collection': '{}',
    }, async (page, label) => {
      await waitStored(page, keys.messages, 20)
      let stored = await readStorage(page)
      assert.deepEqual(JSON.parse(stored[keys.profile]), { version: 1, value: profile })
      assert.deepEqual(JSON.parse(stored[keys.messages]), { version: 1, value: messages.slice(-20) })
      for (const key of [keys.oldProfile, keys.oldMessages, keys.oldConfig, keys.oldAssistantConfig]) assert.equal(stored[key], undefined)
      assert.equal(stored['arch-01-unrelated-test'], 'keep')
      assert.equal(stored['base-archive-collection'], '{}')
      assert.equal(await page.locator('.xiaoy-message').count(), 25)
      await reloadAssistant(page)
      assert.equal(await page.locator('.xiaoy-message').count(), 20)
      assert.deepEqual(await page.locator('.xiaoy-message-body > p').allTextContents(), messages.slice(-20).map(({ content }) => content))
      assert.equal(await page.getByRole('link', { name: /ARCH-01 合成来源/ }).getAttribute('href'), 'https://example.test/arch-01')
      assert.equal(await page.locator('.xiaoy-product').count(), 1)
      const geometry = await assertLayout(page)
      await screenshot(page, label)
      return { migratedMessages: 25, storedAndRestoredMessages: 20, clearedCredentialKeys: 2, preservedUnrelatedRecords: true, geometry }
    })

    await scenario(viewport, 'current-precedence', {
      [keys.profile]: pack(profile), [keys.messages]: pack(messages.slice(-2)),
      [keys.oldProfile]: JSON.stringify({ skin: '干皮', budget: 300 }), [keys.oldMessages]: JSON.stringify(messages.slice(0, 1)),
      [keys.oldConfig]: 'ARCH-01-test-only', [keys.oldAssistantConfig]: 'ARCH-01-test-only',
    }, async (page) => {
      await waitStored(page, keys.messages, 2)
      const stored = await readStorage(page)
      assert.deepEqual(JSON.parse(stored[keys.profile]).value, profile)
      assert.deepEqual(JSON.parse(stored[keys.messages]).value, messages.slice(-2))
      assert.deepEqual(JSON.parse(stored[keys.oldProfile]), { skin: '干皮', budget: 300 })
      assert.deepEqual(JSON.parse(stored[keys.oldMessages]), messages.slice(0, 1))
      assert.equal(stored[keys.oldConfig], undefined)
      assert.equal(stored[keys.oldAssistantConfig], undefined)
      await reloadAssistant(page)
      assert.deepEqual(JSON.parse((await readStorage(page))[keys.messages]).value, messages.slice(-2))
    })

    await scenario(viewport, 'broken-current-valid-legacy', {
      [keys.profile]: '{broken', [keys.messages]: '{broken',
      [keys.oldProfile]: JSON.stringify(profile), [keys.oldMessages]: JSON.stringify(messages.slice(-2)),
    }, async (page) => {
      await waitStored(page, keys.messages, 2)
      const stored = await readStorage(page)
      assert.deepEqual(JSON.parse(stored[keys.profile]).value, profile)
      assert.deepEqual(JSON.parse(stored[keys.messages]).value, messages.slice(-2))
      assert.equal(stored[keys.oldProfile], undefined)
      assert.equal(stored[keys.oldMessages], undefined)
      assert.equal(await page.locator('.xiaoy-message').count(), 2)
    })

    for (const [name, seed] of [
      ['broken-json-fallback', { [keys.profile]: '{broken', [keys.messages]: '{broken', [keys.oldProfile]: '{broken', [keys.oldMessages]: '{broken' }],
      ['invalid-version-fallback', { [keys.profile]: JSON.stringify({ version: 2, value: profile }), [keys.messages]: '{"version":1}' }],
    ]) {
      await scenario(viewport, name, seed, async (page) => {
        await waitStored(page, keys.messages, 1)
        const stored = await readStorage(page)
        assert.deepEqual(JSON.parse(stored[keys.profile]), { version: 1, value: {} })
        assert.equal(JSON.parse(stored[keys.messages]).value[0].id, 'welcome')
        assert.equal(await page.locator('.xiaoy-message').count(), 1)
        if (name === 'broken-json-fallback') {
          assert.equal(stored[keys.oldProfile], '{broken')
          assert.equal(stored[keys.oldMessages], '{broken')
        }
      })
    }
  }
} finally {
  const summary = { createdAt: new Date().toISOString(), baseURL, browser: browser.version(), reducedMotion: 'reduce', total: results.length, passed: results.filter(({ passed }) => passed).length, results }
  await fs.writeFile(path.join(outputDir, 'results.json'), JSON.stringify(summary, null, 2) + '\n')
  await browser.close()
  console.log(JSON.stringify({ total: summary.total, passed: summary.passed, outputDir }))
}
if (results.some(({ passed }) => !passed)) process.exitCode = 1
