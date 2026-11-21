import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || '../../.qa/playwright/node_modules/playwright/index.mjs')
const baseURL = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5174'
const output = path.resolve('.qa/face-study')
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  ...(process.env.YAS_QA_BROWSER_EXECUTABLE ? { executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE } : process.platform === 'win32' ? { executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' } : {}),
})
const measurements = []
try {
  for (const width of [1440, 360]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: width === 360 ? 'reduce' : 'no-preference' })
    const page = await context.newPage()
    const errors = [], posted = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('request', (request) => { if (request.method() === 'POST') posted.push(new URL(request.url()).pathname) })
    await page.goto(`${baseURL}/face-study`)
    await page.getByRole('heading', { name: '看见自己的面部轮廓' }).waitFor()
    assert(await page.getByLabel('选择人脸照片').isDisabled(), 'consent is required')
    await page.getByLabel('我同意将照片交由本机后端进行本次分析').check()
    const input = page.getByLabel('选择人脸照片')
    await input.setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') })
    await page.getByRole('alert').filter({ hasText: 'JPG' }).waitFor()
    assert.equal(posted.length, 0, 'invalid files are not uploaded')
    const started = performance.now()
    const response = page.waitForResponse((r) => r.url().endsWith('/api/face-reconstruction') && r.request().method() === 'POST')
    await input.setInputFiles('public/assets/skin-guide/oily-skin.jpg')
    const api = await response
    assert.equal(api.status(), 200)
    const data = await api.json()
    assert.equal(data.result.engine, '3DDFA_V2')
    assert(data.result.vertices.length > 30000 && data.result.triangles.length > 60000)
    if (width === 1440) {
      await page.locator('.face-stage.is-scanning').waitFor()
      assert.equal(await page.locator('.face-stage__photo').evaluate((e) => getComputedStyle(e).opacity), '1')
      await page.screenshot({ path: path.join(output, `${width}-scanning.png`), fullPage: true })
    }
    await page.getByText('面部重建完成', { exact: true }).waitFor({ timeout: 60000 })
    await page.waitForTimeout(700)
    assert.equal(await page.locator('.face-stage__photo').evaluate((e) => getComputedStyle(e).opacity), '0')
    assert.equal(await page.locator('.face-leaders circle').count(), 3)
    assert.equal(await page.locator('.face-label').count(), width === 1440 ? 3 : 0)
    assert.equal(await page.locator('.face-advice article').count(), 5)
    assert(await page.locator('.face-advice').innerText().then((text) => text.includes('正面照')))
    measurements.push({ width, inferenceMs: data.result.inferenceMs, untilPresentationMs: Math.round(performance.now() - started), vertices: data.result.vertices.length })
    const canvas = page.locator('.face-stage__mesh canvas')
    const before = await canvas.screenshot()
    const box = await canvas.boundingBox()
    await page.mouse.move(box.x + box.width * .45, box.y + box.height * .5)
    await page.mouse.down(); await page.mouse.move(box.x + box.width * .6, box.y + box.height * .5, { steps: 10 }); await page.mouse.up()
    const after = await canvas.screenshot()
    assert(!before.equals(after), 'real 3D model rotates')
    await page.getByRole('button', { name: '对照原照片', exact: true }).click()
    await page.waitForTimeout(width === 1440 ? 1200 : 10)
    assert.equal(await page.locator('.face-stage__photo').evaluate((e) => getComputedStyle(e).opacity), '1')
    await page.getByRole('button', { name: '只看模型', exact: true }).click()
    await page.waitForTimeout(width === 1440 ? 1200 : 10)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.screenshot({ path: path.join(output, `${width}-result.png`), fullPage: true })
    assert.equal(await page.locator('.face-study-page').evaluate((element) => getComputedStyle(element).backgroundColor), 'rgb(251, 247, 242)')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true)
    assert(posted.every((url) => url === '/api/face-reconstruction'), 'no photo result is sent to XiaoY')
    await page.getByRole('button', { name: '删除照片与结果', exact: true }).click()
    assert.equal(await page.locator('.face-stage').count(), 0)
    assert.equal(await page.locator('.face-advice').count(), 0)
    if (width === 1440) {
      const blank = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 600; c.getContext('2d').fillRect(0, 0, 600, 600); return c.toDataURL('image/png').split(',')[1] })
      await input.setInputFiles({ name: 'blank.png', mimeType: 'image/png', buffer: Buffer.from(blank, 'base64') })
      await page.getByRole('alert').filter({ hasText: '没有检测到人脸' }).waitFor({ timeout: 60000 })
      assert.equal(await page.locator('.face-stage__mesh').count(), 0, 'no generic model on failure')
      const doubled = await page.evaluate(async () => {
        const img = new Image(); img.src = '/assets/skin-guide/oily-skin.jpg'; await img.decode()
        const c = document.createElement('canvas'); c.width = 1400; c.height = 750
        const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height)
        ctx.drawImage(img, 0, 0, 700, 743); ctx.drawImage(img, 700, 0, 700, 743)
        return c.toDataURL('image/jpeg').split(',')[1]
      })
      await input.setInputFiles({ name: 'two.jpg', mimeType: 'image/jpeg', buffer: Buffer.from(doubled, 'base64') })
      await page.getByRole('alert').filter({ hasText: '多张人脸' }).waitFor({ timeout: 60000 })
      await context.grantPermissions(['camera'])
      await page.getByRole('button', { name: '打开相机', exact: true }).click()
      await page.waitForFunction(() => document.querySelector('.face-camera video')?.videoWidth > 0)
      await page.evaluate(() => { window.__faceTrack = document.querySelector('.face-camera video').srcObject.getVideoTracks()[0] })
      await page.getByRole('button', { name: '关闭相机', exact: true }).click()
      assert.equal(await page.evaluate(() => window.__faceTrack.readyState), 'ended')
    }
    await page.getByRole('button', { name: '返回首页', exact: true }).click()
    await page.locator('.home-face-entry').waitFor()
    await page.locator('.home-face-entry button').click()
    await page.getByRole('heading', { name: '看见自己的面部轮廓' }).waitFor()
    assert.equal(await page.locator('.face-stage').count(), 0, 'leaving page clears photo state')
    await page.goBack()
    await page.locator('.home-face-entry').waitFor()
    const menu = page.getByRole('button', { name: '打开导航' })
    if (await menu.isVisible()) await menu.click()
    await page.getByRole('button', { name: '小Y智能选妆', exact: true }).filter({ visible: true }).click()
    await page.locator('.makeup-workbench').waitFor()
    assert.equal(await page.locator('.visual-analysis, .face-study, input[type=file]').count(), 0, 'XiaoY has no photo module')
    assert.deepEqual(errors, [])
    await context.close()
  }
  const fallbackContext = await browser.newContext({ viewport: { width: 800, height: 900 }, reducedMotion: 'reduce' })
  const fallbackPage = await fallbackContext.newPage()
  await fallbackPage.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (String(kind).includes('webgl')) return null
      return original.call(this, kind, ...args)
    }
  })
  await fallbackPage.goto(`${baseURL}/face-study`)
  await fallbackPage.getByLabel('我同意将照片交由本机后端进行本次分析').check()
  await fallbackPage.getByLabel('选择人脸照片').setInputFiles('public/assets/skin-guide/oily-skin.jpg')
  await fallbackPage.getByRole('alert').filter({ hasText: '无法显示 3D 模型' }).waitFor({ timeout: 60000 })
  const photo = fallbackPage.locator('.face-stage__photo')
  assert((await photo.boundingBox()).width > 300, 'WebGL fallback keeps a readable photo')
  assert.equal(await photo.evaluate((e) => getComputedStyle(e).opacity), '1')
  assert.equal(await fallbackPage.locator('.face-leaders').count(), 0, 'failed presentation has no success annotations')
  await fallbackContext.close()
  console.log(JSON.stringify({ status: 'passed', webglFallback: true, measurements }, null, 2))
  await fs.writeFile(path.join(output, 'browser-results.json'), JSON.stringify({ measuredAt: new Date().toISOString(), measurements }, null, 2))
} finally { await browser.close() }
