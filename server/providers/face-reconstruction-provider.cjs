const fs = require('node:fs')
const path = require('node:path')
const { spawn, spawnSync } = require('node:child_process')
const { AppError } = require('../errors.cjs')

const ROOT = path.resolve(__dirname, '../..')
const RUNTIME = path.join(ROOT, '.runtime/3ddfa')
const messages = {
  NO_FACE: '没有检测到人脸，请换一张清晰的正面照片。',
  MULTIPLE_FACES: '检测到多张人脸，请使用只有一人的照片。',
  INVALID_IMAGE: '无法读取照片，请使用清晰的 JPG、PNG 或 WebP 图片。',
  LOW_RESOLUTION: '照片或人脸区域太小，请换一张清晰的近景照片。',
  IMAGE_TOO_LARGE: '照片像素过大，请缩小到 2400 万像素以内。',
  MODEL_UNAVAILABLE: '本机重建模型尚未准备好，请稍后重试。',
}

function createFaceReconstructionProvider({ enabled = false, timeoutMs = 60000, spawnProcess = spawn,
  engine = '3DDFA_V2', runtime = engine === 'DECA' ? path.join(ROOT, '.runtime/deca') : (process.env.YAS_3DDFA_RUNTIME || RUNTIME),
} = {}) {
  if (!['3DDFA_V2', 'DECA'].includes(engine)) throw new Error('Unsupported face engine')
  const python = process.platform === 'win32'
    ? path.join(runtime, 'venv/Scripts/python.exe')
    : path.join(runtime, 'venv/bin/python')
  let child = null
  let pending = null
  let startup = null
  let output = ''
  let busy = false
  let sequence = 0
  const required = engine === 'DECA'
    ? ['models/manifest.json', 'models/generic_model.pkl', 'models/deca_model.tar', 'models/detector.onnx', 'source.json']
    : ['models/manifest.json']
  const configured = enabled && fs.existsSync(python) && required.every((file) => fs.existsSync(path.join(runtime, file)))
  const unavailable = () => new AppError('FACE_UNAVAILABLE', messages.MODEL_UNAVAILABLE, 503)

  function stop(error = unavailable()) {
    const process = child
    child = null
    output = ''
    const waiting = pending
    pending = null
    waiting?.reject(error)
    startup = null
    if (process && !process.killed) {
      // Windows venv python.exe launches a second interpreter. Terminate both.
      if (global.process.platform === 'win32' && process.pid) {
        spawnSync('taskkill.exe', ['/PID', String(process.pid), '/T', '/F'], {
          windowsHide: true, stdio: 'ignore', timeout: 5000,
        })
      }
      process.kill()
    }
  }

  function start() {
    if (startup) return startup
    startup = new Promise((resolve, reject) => {
      pending = { resolve, reject, id: 'ready' }
      const process = spawnProcess(python, ['-u', path.join(ROOT, `server/face-reconstruction/${engine === 'DECA' ? 'deca-worker.py' : 'worker.py'}`), '--models', path.join(runtime, 'models')], {
        cwd: ROOT, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...global.process.env, PYTHONDONTWRITEBYTECODE: '1', OMP_NUM_THREADS: '2' },
      })
      child = process
      process.stdout.setEncoding('utf8')
      process.stdout.on('data', (chunk) => {
        if (child !== process) return
        output += chunk
        if (output.length > 12 * 1024 * 1024) { stop(unavailable()); return }
        let end
        while ((end = output.indexOf('\n')) !== -1) {
          const line = output.slice(0, end)
          output = output.slice(end + 1)
          try {
            const result = JSON.parse(line)
            if (!pending || result.id !== pending.id) { stop(unavailable()); return }
            const waiting = pending
            pending = null
            if (result.ok) waiting.resolve(result.result)
            else waiting.reject(new AppError(result.code in messages ? result.code : 'FACE_FAILED', messages[result.code] || '面部重建未完成，请重试。', result.code === 'MODEL_UNAVAILABLE' ? 503 : 422))
          } catch { stop(unavailable()) }
        }
      })
      // Third-party diagnostics must never be copied into API responses or logs.
      process.stderr.resume()
      process.stdin.on('error', () => { if (child === process) stop(unavailable()) })
      process.on('error', () => { if (child === process) stop(unavailable()) })
      process.on('exit', () => { if (child === process) stop(unavailable()) })
    })
    return startup
  }

  return {
    engine,
    configured,
    async reconstruct(bytes, { signal } = {}) {
      if (!configured) throw unavailable()
      if (busy) throw new AppError('FACE_BUSY', '正在处理另一张照片，请稍后重试。', 429)
      if (signal?.aborted) throw new AppError('FACE_CANCELLED', '已取消本次分析。', 499)
      busy = true
      const cancel = () => stop(new AppError('FACE_CANCELLED', '已取消本次分析。', 499))
      const timer = setTimeout(() => stop(new AppError('FACE_TIMEOUT', '重建超时，照片已释放，请重试。', 504)), timeoutMs)
      signal?.addEventListener('abort', cancel, { once: true })
      try {
        await start()
        if (signal?.aborted || !child) throw new AppError('FACE_CANCELLED', '已取消本次分析。', 499)
        const id = String(++sequence)
        return await new Promise((resolve, reject) => {
          pending = { id, resolve, reject }
          child.stdin.write(JSON.stringify({ id, image: bytes.toString('base64') }) + '\n')
        })
      } finally {
        clearTimeout(timer)
        signal?.removeEventListener('abort', cancel)
        busy = false
      }
    },
    close: () => stop(),
  }
}

module.exports = { createFaceReconstructionProvider }
