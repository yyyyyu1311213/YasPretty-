import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const env = { ...process.env, NODE_ENV: 'development', YASPRETTY_HOST: '127.0.0.1',
  FISHTALK_PORT: '8788', YAS_API_TARGET: 'http://127.0.0.1:8788',
  YAS_FACE_COMPARISON: '1', VITE_FACE_COMPARISON: '1',
  YAS_3DDFA_RUNTIME: process.env.YAS_3DDFA_RUNTIME || path.join(root, '.runtime/3ddfa'),
}
const children = []
let stopping = false
function stop(code = 0) {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (child.exitCode !== null) continue
    if (process.platform === 'win32') spawnSync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' })
    else child.kill('SIGTERM')
  }
  process.exitCode = code
}
for (const args of [
  ['server/fishtalk-server.cjs', '--no-open'],
  ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5175', '--strictPort'],
]) {
  const child = spawn(process.execPath, args, { cwd: root, env, stdio: 'inherit', windowsHide: true })
  children.push(child)
  child.on('error', () => stop(1))
  child.on('exit', (code) => { if (!stopping) stop(code || 0) })
}
process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())
console.log('Local research comparison: http://127.0.0.1:5175/face-study (API 8788)')
