// Tests unavailable-model behavior using real baseline inference.
// Readiness/unavailable responses are stubbed so this remains repeatable after setup.
// Baseline inference is real; no fake DECA mesh.
import assert from 'node:assert/strict'
const { chromium } = await import(process.env.YAS_QA_PLAYWRIGHT_MODULE || '../../.qa/playwright/node_modules/playwright/index.mjs')
const baseURL = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5175'
const browser = await chromium.launch({ headless: true, executablePath: process.env.YAS_QA_BROWSER_EXECUTABLE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const errors = [], posted = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => { if (request.method() === 'POST') posted.push(request.url()) })
  let ready = false
  await page.route('**/api/face-reconstruction/deca/status', (route) => route.fulfill({ json: { ok: true, available: ready, engine: 'DECA' } }))
  await page.route('**/api/face-reconstruction/deca', (route) => route.fulfill({ status: 503, json: { ok: false, error: { code: 'FACE_UNAVAILABLE', message: '本机重建服务尚未准备好，请稍后重试。' } } }))
  await page.goto(`${baseURL}/face-study`)
  await page.getByText('DECA 尚未就绪，暂不能进行双模型对照。现有 3DDFA_V2 仍可使用。').waitFor()
  assert(await page.getByRole('button', { name: 'DECA', exact: true }).isDisabled())
  assert.equal(posted.length, 0)
  ready = true
  await page.reload()
  await page.getByLabel('我同意将照片交由本机后端进行本次分析').check()
  await page.getByLabel('选择人脸照片').setInputFiles('public/assets/skin-guide/oily-skin.jpg')
  await page.getByText('面部重建完成', { exact: true }).waitFor({ timeout: 60000 })
  await page.getByRole('button', { name: 'DECA', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: '尚未准备好' }).waitFor()
  assert.equal(await page.locator('.face-stage__mesh').count(), 0, 'no baseline geometry mislabeled as DECA')
  await page.getByRole('button', { name: '3DDFA_V2', exact: true }).click()
  await page.getByText('面部重建完成', { exact: true }).waitFor()
  assert.equal(posted.filter((url) => url.endsWith('/api/face-reconstruction')).length, 1, 'same-photo baseline restored from session memory')
  assert.equal(posted.filter((url) => url.endsWith('/deca')).length, 1)
  await page.getByRole('button', { name: '删除照片与结果', exact: true }).click()
  assert.equal(await page.locator('.face-stage').count(), 0)
  await page.getByRole('button', { name: 'DECA', exact: true }).click()
  assert.equal(posted.length, 2, 'deleted photo cannot be reused')
  assert.equal(await page.locator('.face-stage').count(), 0)
  assert.deepEqual(errors, [])
  console.log('Unavailable DECA, no fallback, same-photo baseline recovery, deletion and console checks passed.')
} finally { await browser.close() }
