// Private, local noncommercial research setup. Never publishes licensed assets.
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const runtime = path.join(root, '.runtime/deca')
const upstream = path.join(runtime, 'upstream')
const commit = 'a11554ae2a2b0f3998cf1fa94dd4db03babb34a2'
const api = 'https://api.github.com/repos/yfeng95/DECA'
const headers = { 'User-Agent': 'YasPretty-local-noncommercial-research' }
const json = async (url) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(120000) })
      if (!response.ok) throw new Error(`Official source HTTP ${response.status}`)
      return await response.json()
    } catch (error) { if (attempt === 2) throw error }
  }
}
const tree = await json(`${api}/git/trees/${commit}?recursive=1`)
const assets = new Set(['LICENSE', 'README.md', 'fetch_data.sh', 'data/head_template.obj', 'data/landmark_embedding.npy', 'data/texture_data_256.npy', 'data/fixed_displacement_256.npy', 'data/uv_face_eye_mask.png', 'data/uv_face_mask.png'])
const selected = tree.tree.filter((entry) => entry.type === 'blob' && (assets.has(entry.path) || /^decalib\/.*\.py$/.test(entry.path)))
const records = []
for (let index = 0; index < selected.length; index += 3) {
  await Promise.all(selected.slice(index, index + 3).map(async (entry) => {
    const file = path.join(upstream, entry.path)
    let bytes = await fs.readFile(file).catch(() => null)
    const gitHash = (data) => createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex')
    if (!bytes || gitHash(bytes) !== entry.sha) {
      const blob = await json(`${api}/git/blobs/${entry.sha}`)
      if (blob.encoding !== 'base64') throw new Error(`Missing asset: ${entry.path}`)
      bytes = Buffer.from(blob.content, 'base64')
      if (gitHash(bytes) !== entry.sha) throw new Error(`Integrity mismatch: ${entry.path}`)
      await fs.mkdir(path.dirname(file), { recursive: true })
      await fs.writeFile(file, bytes)
    }
    records.push({ path: entry.path, sha256: createHash('sha256').update(bytes).digest('hex'), gitBlob: entry.sha })
    console.log(`Verified ${entry.path}`)
  }))
}
await fs.mkdir(path.join(runtime, 'models'), { recursive: true })
await fs.writeFile(path.join(runtime, 'source.json'), JSON.stringify({ repository: 'https://github.com/yfeng95/DECA', commit, purpose: 'local-noncommercial-research', files: records }, null, 2))
console.log('Source prepared. FLAME2020 generic_model.pkl must come from the licensed official download.')
