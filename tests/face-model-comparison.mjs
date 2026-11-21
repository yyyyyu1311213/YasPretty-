// Real local inference only. No photograph, vertices or landmarks are saved/logged.
// This checks operability and measures timing, not reconstruction accuracy.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import providerModule from '../server/providers/face-reconstruction-provider.cjs'
import routesModule from '../server/face-reconstruction/routes.cjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const baseline = process.env.YAS_3DDFA_RUNTIME || path.resolve(root, '.runtime/3ddfa')
const providers = [
  providerModule.createFaceReconstructionProvider({ enabled: true, runtime: baseline }),
  providerModule.createFaceReconstructionProvider({ enabled: true, engine: 'DECA' }),
]
let photo
try {
  for (const provider of providers) assert(provider.configured, `${provider.engine} missing local assets; prepare models before comparing`)
  photo = await fs.readFile(process.argv[2] || path.join(root, 'public/assets/skin-guide/oily-skin.jpg'))
  let dimensions
  for (const provider of providers) {
    for (const run of ['cold', 'warm']) {
      const start = performance.now()
      const result = routesModule.validateResult(await provider.reconstruct(photo))
      assert.equal(result.engine, provider.engine)
      dimensions ||= [result.width, result.height]
      assert.deepEqual([result.width, result.height], dimensions)
      console.log(JSON.stringify({ engine: result.engine, run, device: result.device || 'cpu',
        requestMs: Math.round(performance.now() - start), inferenceMs: result.inferenceMs,
        vertices: result.vertices.length, triangles: result.triangles.length,
        qualityIssueCount: result.qualityIssues.length, likeness: 'requires visual acceptance' }))
    }
  }
} finally {
  photo?.fill(0)
  providers.forEach((provider) => provider.close())
}
