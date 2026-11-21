// Real DECA/3DDFA geometry with a repository illustration placed at bottom right.
// Pixel comparisons measure rendered mesh bounds, not internal transform variables.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || '../../.qa/playwright/node_modules/playwright/index.mjs')
const baseURL = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5175'
const output = path.resolve('.qa/face-centering')
await fs.mkdir(output, { recursive: true })
const python = path.resolve('.runtime/deca/venv/Scripts/python.exe')
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' })
const measurements = []
try {
  for (const width of [1440, 360]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: width === 360 ? 'reduce' : 'no-preference' })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`${baseURL}/face-study`)
    await page.waitForFunction(() => ![...document.querySelectorAll('button')].find((b) => b.textContent === 'DECA')?.disabled)
    const bytes = await page.evaluate(async () => {
      const img = new Image(); img.src = '/assets/skin-guide/oily-skin.jpg'; await img.decode()
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1600
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#e8dfd4'; ctx.fillRect(0, 0, 1600, 1600)
      ctx.drawImage(img, 900, 850, 550, 550 * img.height / img.width)
      return canvas.toDataURL('image/jpeg', .94).split(',')[1]
    })
    await page.getByLabel('我同意将照片交由本机后端进行本次分析').check()
    for (const engine of ['3DDFA_V2', 'DECA']) {
      const response = page.waitForResponse((r) => r.request().method() === 'POST' && new URL(r.url()).pathname === `/api/face-reconstruction${engine === 'DECA' ? '/deca' : ''}`, { timeout: 70000 })
      if (engine === '3DDFA_V2') await page.getByLabel('选择人脸照片').setInputFiles({ name: 'offset-repository-illustration.jpg', mimeType: 'image/jpeg', buffer: Buffer.from(bytes, 'base64') })
      else await page.getByRole('button', { name: 'DECA', exact: true }).click()
      const api = await response; assert.equal(api.status(), 200, await api.text())
      const { result } = await api.json()
      await page.locator('.face-stage.is-centered').waitFor({ timeout: 60000 })
      const stage = page.locator('.face-stage')
      const canvas = page.locator('.face-stage__mesh canvas')
      async function capture(name) {
        await stage.evaluate((e) => window.scrollTo({ top: scrollY + e.getBoundingClientRect().top - 130, behavior: 'instant' }))
        const style = await page.addStyleTag({ content: '.face-leaders,.face-label { visibility: hidden !important; }' })
        const clip = await canvas.boundingBox()
        const visible = await page.screenshot({ clip })
        await canvas.evaluate((e) => { e.style.visibility = 'hidden' })
        const background = await page.screenshot({ clip })
        await canvas.evaluate((e) => { e.style.visibility = '' })
        await style.evaluate((e) => e.remove())
        const measured = spawnSync(python, ['-c', `import sys,json,io,base64
from PIL import Image
import numpy as np
a,b=json.loads(sys.stdin.read())
x=np.asarray(Image.open(io.BytesIO(base64.b64decode(a))).convert('RGB')).astype(int)
y=np.asarray(Image.open(io.BytesIO(base64.b64decode(b))).convert('RGB')).astype(int)
ys,xs=np.where(np.max(np.abs(x-y),axis=2)>10)
assert len(xs)>100, 'visible mesh required'
print(json.dumps({'cx':float(xs.min()+xs.max())/2,'cy':float(ys.min()+ys.max())/2,'w':x.shape[1],'h':x.shape[0]}))
`], { input: JSON.stringify([visible.toString('base64'), background.toString('base64')]), encoding: 'utf8', windowsHide: true })
        assert.equal(measured.status, 0, measured.stderr)
        await stage.screenshot({ path: path.join(output, `${width}-${engine}-${name}.png`) })
        return JSON.parse(measured.stdout)
      }
      const centered = await capture('centered')
      assert(Math.abs(centered.cx - centered.w / 2) < 4 && Math.abs(centered.cy - centered.h / 2) < 4, JSON.stringify(centered))
      const bounds = result.vertices.reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])], [Infinity, Infinity, -Infinity, -Infinity])
      const labels = await page.locator('.face-leaders circle').evaluateAll((els) => els.map((e) => [Number(e.getAttribute('cx')), Number(e.getAttribute('cy'))]))
      assert(labels.length === 3)
      assert(labels.every(([x, y]) => x > 0 && x < centered.w && y > 0 && y < centered.h), 'leader anchors follow centered mesh')
      await page.getByRole('button', { name: '对照原照片', exact: true }).click()
      await page.waitForTimeout(width === 1440 ? 1200 : 20)
      const overlay = await capture('photo-aligned')
      const region = overlay.w >= 600 ? overlay.w * .58 : overlay.w
      const scale = Math.min(region / result.width, overlay.h / result.height)
      const expected = [overlay.w / 2 + ((bounds[0] + bounds[2]) / 2 - result.width / 2) * scale, overlay.h / 2 + ((bounds[1] + bounds[3]) / 2 - result.height / 2) * scale]
      assert(Math.abs(overlay.cx - expected[0]) < 5 && Math.abs(overlay.cy - expected[1]) < 5, JSON.stringify({ overlay, expected }))
      assert(overlay.cx > overlay.w / 2 + 25 && overlay.cy > overlay.h / 2 + 25, 'original bottom-right placement restored')
      await page.getByRole('button', { name: '只看模型', exact: true }).click()
      await page.locator('.face-stage.is-centered').waitFor()
      await page.getByRole('button', { name: '重播扫描', exact: true }).click()
      if (width === 1440) { await page.locator('.face-stage.is-scanning').waitFor(); assert.equal(await page.locator('.face-stage.is-centered').count(), 0) }
      await page.locator('.face-stage.is-centered').waitFor()
      const replay = await capture('replay')
      assert(Math.abs(replay.cx - replay.w / 2) < 4 && Math.abs(replay.cy - replay.h / 2) < 4)
      measurements.push({ width, engine, centered, overlay })
    }
    await page.getByRole('button', { name: '删除照片与结果', exact: true }).click()
    assert.equal(await page.locator('.face-stage').count(), 0)
    assert.deepEqual(errors, [])
    await context.close()
  }
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(measurements, null, 2))
  console.log(JSON.stringify({ status: 'passed', measurements }, null, 2))
} finally { await browser.close() }
