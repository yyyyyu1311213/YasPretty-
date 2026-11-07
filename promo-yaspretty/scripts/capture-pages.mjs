import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const outDir = new URL('../public/captures/', import.meta.url)
const port = 9333

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const browser = spawn(chrome, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`,
  '--user-data-dir=D:/VScode/yaspretty/promo-yaspretty/.chrome-profile', '--window-size=1920,1080',
  'http://127.0.0.1:5174/',
], { stdio: 'ignore', windowsHide: true })

async function getTarget() {
  for (let i = 0; i < 30; i += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`)
      const targets = await response.json()
      const page = targets.find((target) => target.type === 'page')
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl
    } catch {}
    await sleep(200)
  }
  throw new Error('Chrome DevTools target unavailable')
}

const ws = new WebSocket(await getTarget())
let sequence = 0
const pending = new Map()
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  const resolve = pending.get(message.id)
  if (resolve) { pending.delete(message.id); resolve(message) }
})
await new Promise((resolve, reject) => { ws.addEventListener('open', resolve); ws.addEventListener('error', reject) })

function command(method, params = {}) {
  return new Promise((resolve) => {
    const id = ++sequence
    pending.set(id, resolve)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function waitForSettled() {
  await sleep(1200)
  await command('Runtime.evaluate', { expression: 'document.fonts.ready' })
  await sleep(900)
}

async function clickButton(text) {
  await command('Runtime.evaluate', {
    expression: `([...document.querySelectorAll('button')].find((button) => button.textContent.includes(${JSON.stringify(text)})))?.click()`,
  })
}

async function capture(name) {
  await waitForSettled()
  const result = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  await writeFile(new URL(name, outDir), Buffer.from(result.result.data, 'base64'))
}

await command('Page.enable')
await command('Runtime.enable')
await command('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 2, mobile: false })
await capture('brand-opening.png')
await clickButton('跳过')
await capture('home.png')
await clickButton('产品库')
await capture('library.png')
await command('Runtime.evaluate', { expression: "[...document.querySelectorAll('.product-name')][0]?.click()" })
await capture('detail.png')
await clickButton('收藏这款')
await clickButton('关闭')
await clickButton('我的收藏')
await capture('favorites.png')
await clickButton('小Y智能选妆')
await capture('assistant.png')
await clickButton('创建我的妆容方案')
await capture('workbench.png')

ws.close()
browser.kill()
