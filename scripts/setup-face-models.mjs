// Local academic evaluation only. Upstream BFM assets are not MIT-licensed.
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const commit = '1b6c67601abffc1e9f248b291708aef0e43b55ae'
const api = 'https://api.github.com/repos/cleardusk/3DDFA_V2'
const destination = path.join(root, '.runtime/3ddfa/upstream')
const headers = { 'User-Agent': 'YasPretty-local-academic-evaluation' }
async function json(url) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(60000) })
  if (!response.ok) throw new Error(`Official source HTTP ${response.status}`)
  return response.json()
}
const tree = await json(`${api}/git/trees/${commit}?recursive=1`)
const assets = new Set(['LICENSE', 'readme.md', 'bfm/readme.md', 'weights/mb1_120x120.pth', 'FaceBoxes/weights/FaceBoxesProd.pth', 'configs/bfm_noneck_v3.pkl', 'configs/tri.pkl', 'configs/param_mean_std_62d_120x120.pkl'])
const selected = tree.tree.filter((entry) => entry.type === 'blob' && (assets.has(entry.path) || /^(models|FaceBoxes\/models)\/.*\.py$/.test(entry.path)))
const records = []
for (let index = 0; index < selected.length; index += 3) {
  await Promise.all(selected.slice(index, index + 3).map(async (entry) => {
    const file = path.join(destination, entry.path)
    let bytes = await fs.readFile(file).catch(() => null)
    const gitHash = (data) => createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex')
    if (!bytes || gitHash(bytes) !== entry.sha) {
      const blob = await json(`${api}/git/blobs/${entry.sha}`)
      if (blob.encoding !== 'base64') throw new Error(`Missing official asset: ${entry.path}`)
      bytes = Buffer.from(blob.content, 'base64')
      if (gitHash(bytes) !== entry.sha) throw new Error(`Integrity check failed: ${entry.path}`)
      await fs.mkdir(path.dirname(file), { recursive: true })
      await fs.writeFile(file, bytes)
    }
    records.push({ path: entry.path, gitBlob: entry.sha, sha256: createHash('sha256').update(bytes).digest('hex') })
    console.log(`Verified ${entry.path} (${bytes.length} bytes)`)
  }))
}
await fs.writeFile(path.join(destination, '../source.json'), JSON.stringify({ repository: 'https://github.com/cleardusk/3DDFA_V2', commit, purpose: 'noncommercial-academic-local-only', retrievedAt: new Date().toISOString(), files: records }, null, 2))
