// Real models, existing repository illustration photos only. No API geometry is saved.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || '../../.qa/playwright/node_modules/playwright/index.mjs')
const baseURL = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5175'
const output = path.resolve('.qa/deca-comparison')
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' })
const measurements = []
try {
  for (const width of [1440, 360]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: width === 360 ? 'reduce' : 'no-preference' })
    const page = await context.newPage()
    await page.addInitScript(() => {
      const originalFetch = window.fetch
      window.faceTestUploadDigests = []
      window.fetch = async (url, options) => {
        if (options?.body instanceof Blob && String(url).startsWith('/api/face-reconstruction')) {
          const digest = await crypto.subtle.digest('SHA-256', await options.body.arrayBuffer())
          window.faceTestUploadDigests.push(Array.from(new Uint8Array(digest)).join(','))
        }
        return originalFetch(url, options)
      }
    })
    const errors = [], requests = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('request', (request) => { if (request.method() === 'POST') requests.push(request) })
    await page.goto(`${baseURL}/face-study`)
    await page.getByRole('button', { name: 'DECA', exact: true }).waitFor()
    await page.waitForFunction(() => ![...document.querySelectorAll('button')].find((b) => b.textContent === 'DECA')?.disabled)
    assert(await page.getByLabel('选择人脸照片').isDisabled())
    await page.getByLabel('我同意将照片交由本机后端进行本次分析').check()
    for (const sample of width === 1440 ? ['oily-skin', 'camera-ready-skin'] : ['camera-ready-skin']) {
      for (const engine of ['3DDFA_V2', 'DECA']) {
        const endpoint = `/api/face-reconstruction${engine === 'DECA' ? '/deca' : ''}`
        const response = page.waitForResponse((r) => new URL(r.url()).pathname === endpoint && r.request().method() === 'POST', { timeout: 70000 })
        if (engine === '3DDFA_V2') {
          await page.getByRole('button', { name: engine, exact: true }).click()
          await page.getByLabel('选择人脸照片').setInputFiles(`public/assets/skin-guide/${sample}.jpg`)
        } else await page.getByRole('button', { name: engine, exact: true }).click()
        const api = await response
        assert.equal(api.status(), 200, await api.text())
        const { result } = await api.json()
        assert.equal(result.engine, engine)
        assert.equal(result.vertices.length, engine === 'DECA' ? 59315 : 38365)
        if (width === 1440) {
          await page.locator('.face-stage.is-scanning').waitFor()
          assert.equal(await page.locator('.face-stage__photo').evaluate((e) => getComputedStyle(e).opacity), '1')
        }
        await page.getByText('面部重建完成', { exact: true }).waitFor({ timeout: 60000 })
        await page.locator('.face-stage.is-centered').waitFor()
        assert.equal(await page.locator('.face-stage__photo').evaluate((e) => getComputedStyle(e).opacity), '0')
        await page.locator('.face-stage').screenshot({ path: path.join(output, `${width}-${sample}-${engine}-mesh.png`) })
        const canvas = page.locator('.face-stage__mesh canvas')
        const before = await canvas.screenshot()
        const box = await canvas.boundingBox()
        await page.mouse.move(box.x + box.width * .45, box.y + box.height * .5)
        await page.mouse.down(); await page.mouse.move(box.x + box.width * .57, box.y + box.height * .5, { steps: 10 }); await page.mouse.up()
        assert(!before.equals(await canvas.screenshot()), 'mesh rotates')
        await page.getByRole('button', { name: '对照原照片', exact: true }).click()
        await page.waitForTimeout(width === 1440 ? 1200 : 50)
        assert.equal(await page.locator('.face-stage__photo').evaluate((e) => getComputedStyle(e).opacity), '1')
        await page.locator('.face-stage').screenshot({ path: path.join(output, `${width}-${sample}-${engine}-overlay.png`) })
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true)
        measurements.push({ width, sample, engine, inferenceMs: result.inferenceMs, vertices: result.vertices.length, qualityIssues: result.qualityIssues })
      }
      const pair = await page.evaluate(() => window.faceTestUploadDigests.slice(-2))
      assert.equal(pair.length, 2)
      assert.equal(pair[0], pair[1], 'both engines receive identical normalized photo bytes')
      const count = requests.length
      await page.getByRole('button', { name: '3DDFA_V2', exact: true }).click()
      await page.getByText('面部重建完成', { exact: true }).waitFor()
      await page.getByRole('button', { name: 'DECA', exact: true }).click()
      await page.getByText('面部重建完成', { exact: true }).waitFor()
      assert.equal(requests.length, count, 'same-photo cached results restored')
      await page.getByRole('button', { name: '删除照片与结果', exact: true }).click()
      await page.getByRole('button', { name: '3DDFA_V2', exact: true }).click()
      assert.equal(requests.length, count)
      assert.equal(await page.locator('.face-stage').count(), 0)
    }
    assert(requests.every((r) => new URL(r.url()).origin === baseURL && new URL(r.url()).pathname.startsWith('/api/face-reconstruction')))
    assert.deepEqual(errors, [])
    await context.close()
  }
  await fs.writeFile(path.join(output, 'measurements.json'), JSON.stringify(measurements, null, 2))
  console.log(JSON.stringify({ status: 'passed', measurements }, null, 2))
} finally { await browser.close() }
