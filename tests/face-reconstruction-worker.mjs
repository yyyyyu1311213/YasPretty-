// Explicit integration check; requires prepared local research models.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import providerModule from '../server/providers/face-reconstruction-provider.cjs'

const children = []
const engine = process.env.YAS_TEST_FACE_ENGINE || '3DDFA_V2'
const provider = providerModule.createFaceReconstructionProvider({ enabled: true, engine,
  spawnProcess: (...args) => { const child = spawn(...args); children.push(child); return child },
})
const bytes = await fs.readFile(new URL('../public/assets/skin-guide/oily-skin.jpg', import.meta.url))
const exited = (child) => child.exitCode !== null || child.signalCode !== null ? Promise.resolve() : once(child, 'exit')
try {
  const controller = new AbortController()
  const pending = provider.reconstruct(bytes, { signal: controller.signal })
  await assert.rejects(provider.reconstruct(bytes), (error) => error.code === 'FACE_BUSY')
  controller.abort()
  await assert.rejects(pending, (error) => error.code === 'FACE_CANCELLED')
  await exited(children[0])
  const first = await provider.reconstruct(bytes)
  assert.equal(first.engine, engine)
  assert.equal(first.vertices.length, engine === 'DECA' ? 59315 : 38365)
  assert.equal(first.landmarks.length, 68)
  const second = await provider.reconstruct(await fs.readFile(new URL('../public/assets/skin-guide/camera-ready-skin.jpg', import.meta.url)))
  assert.notDeepEqual(first.vertices[100], second.vertices[100], 'geometry changes with the input photo')
  assert.notEqual(first.yaw, second.yaw)
  await assert.rejects(provider.reconstruct(Buffer.from('this is not a photo')), (error) => error.code === 'INVALID_IMAGE')
  console.log(JSON.stringify({ cancelled: true, rejectedConcurrent: true, restarted: true,
    samples: [{ name: 'oily-skin', ms: first.inferenceMs, yaw: first.yaw, issues: first.qualityIssues },
      { name: 'camera-ready-skin', ms: second.inferenceMs, yaw: second.yaw, issues: second.qualityIssues }] }))
} finally {
  provider.close()
  await Promise.all(children.map(exited))
}
const quick = providerModule.createFaceReconstructionProvider({ enabled: true, engine, timeoutMs: 1 })
try { await assert.rejects(quick.reconstruct(bytes), (error) => error.code === 'FACE_TIMEOUT') }
finally { quick.close() }
console.log('Cancellation, timeout, restart, invalid image and input-dependent geometry checks passed.')
