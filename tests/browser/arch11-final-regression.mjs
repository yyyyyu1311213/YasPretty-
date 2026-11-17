// ARCH-11 reuses the accepted browser scenarios, including explicit fault injection.
// Use a Vite dev server for source-interception cases; production mode runs only
// scenarios that work against built assets. No real provider calls are made.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const output = path.resolve(process.env.YAS_QA_OUTPUT_DIR || '.qa/arch-11-browser')
const staticPreview = process.argv.includes('--static-preview')
const production = process.argv.includes('--production') || staticPreview
const suites = process.argv.includes('--live-only') ? [] : [
  'arch01-storage',
  ...(!production ? ['arch02-makeup-plan', 'arch03-assistant', 'arch05-makeup-table', 'arch06-catalog', 'arch07-collection', 'arch08-home'] : []),
  'arch09-guide-culture', 'arch10-app-shell',
]
assert(['localhost', '127.0.0.1', '[::1]'].includes(new URL(process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5211').hostname))
await fs.mkdir(output, { recursive: true })
const results = []
async function liveProduction() {
  const base = process.env.YAS_QA_BASE_URL
  const health = await (await fetch(`${base}/api/health`)).json()
  assert.equal(health.services.assistant, false, 'Live QA requires the isolated no-key server')
  const assetResults = []
  const dist = path.join(root, 'dist')
  const builtFiles = async directory => (await Promise.all((await fs.readdir(directory, { withFileTypes: true })).map(entry => {
    const filename = path.join(directory, entry.name)
    return entry.isDirectory() ? builtFiles(filename) : filename
  }))).flat()
  for (const filename of await builtFiles(dist)) {
    const name = path.relative(dist, filename).replaceAll('\\', '/')
    const response = await fetch(`${base}/${name}`)
    assert.equal(response.status, 200, name)
    if (name !== 'index.html') assert(!response.headers.get('content-type')?.includes('text/html'), name)
    const bytes = (await response.arrayBuffer()).byteLength
    assert.equal(bytes, (await fs.stat(filename)).size, name)
    assetResults.push({ name, status: response.status, bytes })
  }
  const invalid = await fetch(`${base}/api/makeup-plans`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userProfile: { budgetTotal: -1 } }) })
  assert.equal(invalid.status, 400)
  assert.equal((await invalid.json()).error.code, 'VALIDATION_ERROR')
  const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || 'playwright')
  const browser = await chromium.launch({ headless: true, ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : {}) })
  const scenes = []
  try {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
      const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
      const page = await context.newPage()
      page.setDefaultNavigationTimeout(60000)
      const pageErrors = [], consoleErrors = [], failedRequests = [], badResponses = [], requests = []
      page.on('pageerror', error => pageErrors.push(error.message))
      page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()) })
      page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }))
      page.on('response', response => { if (response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() }) })
      page.on('request', request => { if (request.method() === 'POST') requests.push(new URL(request.url()).pathname) })
      const navigate = async name => {
        const menu = page.getByRole('button', { name: '打开导航', exact: true })
        if (await menu.isVisible()) await menu.click()
        await page.locator(await menu.isVisible() ? '.mobile-nav' : '.desktop-nav').getByRole('button', { name, exact: true }).click()
      }
      try {
        // Direct product URLs remain asserted by arch09/arch10. Start here at
        // the real root so a server deep-link failure cannot hide API/offline checks.
        await page.goto(base, { waitUntil: 'domcontentloaded' })
        await page.locator('.brand-opening').waitFor({ state: 'hidden' })
        await navigate('小Y智能选妆')
        const form = page.locator('.makeup-workbench-form')
        const budget = form.getByLabel('预算上限（元）')
        await budget.fill('-1')
        await form.getByRole('button', { name: '创建我的妆容方案', exact: true }).click()
        assert.equal(await budget.evaluate(input => input.checkValidity()), false)
        assert.deepEqual(requests, [])
        await budget.fill('300')
        await form.getByRole('button', { name: '创建我的妆容方案', exact: true }).click()
        await page.locator('.makeup-plan-result').waitFor()
        assert.equal(await page.locator('.makeup-plan-step').count(), 7)
        const input = page.getByLabel('向小Y描述你的需求')
        await input.fill('解释一下光的折射'); await input.press('Enter')
        await page.locator('.xiaoy-message.assistant').filter({ hasText: '智能服务当前不可用' }).waitFor()
        await page.screenshot({ path: path.join(output, `${viewport.width}-live-no-key.png`), animations: 'disabled' })
        const onlineText = await page.locator('.xiaoy-messages').innerText()
        await context.setOffline(true)
        const previousMessages = await page.locator('.xiaoy-message.assistant').count()
        await input.fill('解释一下光的折射'); await input.press('Enter')
        await page.waitForFunction(previous => document.querySelectorAll('.xiaoy-message.assistant').length > previous, previousMessages)
        await page.locator('.xiaoy-message.loading').waitFor({ state: 'detached' })
        assert.match(await page.locator('.xiaoy-message.assistant').last().innerText(), /智能服务当前不可用/)
        await input.fill('我是混油皮，想要柔雾通勤底妆'); await input.press('Enter')
        await page.locator('.xiaoy-product').first().waitFor()
        await navigate('产品库')
        assert(await page.locator('.product-card').count() > 0)
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        await page.screenshot({ path: path.join(output, `${viewport.width}-live-offline-catalog.png`), animations: 'disabled' })
        assert.deepEqual(pageErrors, [])
        assert(badResponses.every(response => response.status === 503 && new URL(response.url).pathname === '/api/assistant'), JSON.stringify(badResponses))
        assert.equal(badResponses.length, 1)
        assert(consoleErrors.every(message => /^Failed to load resource:/.test(message)), consoleErrors.join('\n'))
        assert(failedRequests.every(request => request.url.startsWith('https://fonts.googleapis.com/') || request.error === 'net::ERR_INTERNET_DISCONNECTED'), JSON.stringify(failedRequests))
        scenes.push({ label: `${viewport.width}-live-production`, passed: true, onlineText, requests, pageErrors, consoleErrors, failedRequests, badResponses })
        console.log(`PASS ${viewport.width}-live-production`)
      } catch (error) {
        scenes.push({ label: `${viewport.width}-live-production`, passed: false, error: error.stack, requests, pageErrors, consoleErrors, failedRequests, badResponses })
        console.error(`FAIL ${viewport.width}-live-production: ${error.message}`)
        await page.screenshot({ path: path.join(output, `${viewport.width}-live-failed.png`) }).catch(() => {})
      } finally { await context.close() }
    }
  } finally { await browser.close() }
  const filename = path.join(output, 'live-production.json')
  await fs.writeFile(filename, JSON.stringify({ health: { ok: health.ok, assistant: health.services.assistant }, assetResults, invalidStatus: invalid.status, results: scenes }, null, 2) + '\n')
  return { suite: 'live-production', exitCode: scenes.every(scene => scene.passed) ? 0 : 1, total: scenes.length, passed: scenes.filter(scene => scene.passed).length, evidence: path.relative(root, filename) }
}
for (const suite of suites) {
  const directory = path.join(output, suite)
  const log = []
  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, 'tests/browser', `${suite}.mjs`)], {
      cwd: root,
      env: { ...process.env, YAS_QA_BASE_URL: process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5211', YAS_QA_OUTPUT_DIR: directory },
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    child.stdout.on('data', data => { log.push(data.toString()); process.stdout.write(data) })
    child.stderr.on('data', data => { log.push(data.toString()); process.stderr.write(data) })
    child.on('error', reject)
    child.on('close', resolve)
  })
  await fs.writeFile(path.join(output, `${suite}.log`), log.join(''))
  let evidence
  try { evidence = JSON.parse(await fs.readFile(path.join(directory, 'results.json'), 'utf8')) }
  catch (error) { evidence = { results: [], readError: error.message } }
  const scenes = evidence.results || []
  results.push({ suite, exitCode, total: scenes.length, passed: scenes.filter(scene => scene.passed).length, evidence: path.relative(root, path.join(directory, 'results.json')) })
  // Persist progress and failures even if the aggregate run is interrupted.
  await fs.writeFile(path.join(output, 'summary.json'), JSON.stringify({ production, staticPreview, baseURL: process.env.YAS_QA_BASE_URL, at: new Date().toISOString(), results }, null, 2) + '\n')
}
if (production && !staticPreview) {
  results.push(await liveProduction())
  await fs.writeFile(path.join(output, 'summary.json'), JSON.stringify({ production, staticPreview, baseURL: process.env.YAS_QA_BASE_URL, at: new Date().toISOString(), results }, null, 2) + '\n')
}
assert(results.every(suite => suite.exitCode === 0 && suite.total > 0 && suite.passed === suite.total), JSON.stringify(results))
console.log(JSON.stringify({ production, suites: results.length, scenes: results.reduce((sum, suite) => sum + suite.total, 0), passed: true, output }))
