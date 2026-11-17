// Run against the isolated production server after npm run build.
// HTTP 200 alone is insufficient: product IDs also name static image directories.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { products } from '../../src/data/products.js'

const base = process.env.YAS_QA_BASE_URL || 'http://127.0.0.1:5212'
assert(['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname))
const root = await fetch(base)
const html = await root.text()
assert.equal(root.status, 200)
assert.match(html, /<div id="root"><\/div>/)
const results = []
for (const pathname of [
  ...products.map(product => `/products/${encodeURIComponent(product.id)}`),
  '/products/arch11-missing-product',
  '/products/nars-light-reflecting/',
  '/products/nars-light-reflecting?arch11=refresh',
]) {
  const response = await fetch(`${base}${pathname}`)
  const body = await response.text()
  const contentType = response.headers.get('content-type')
  results.push({ pathname, status: response.status, contentType, bytes: Buffer.byteLength(body), passed: response.status === 200 && contentType?.startsWith('text/html') === true && body === html })
}
for (const product of products) {
  const response = await fetch(`${base}${product.image}`)
  const bytes = (await response.arrayBuffer()).byteLength
  const expected = (await fs.stat(new URL(`../../public${product.image}`, import.meta.url))).size
  results.push({ pathname: product.image, status: response.status, bytes, passed: response.status === 200 && response.headers.get('content-type')?.startsWith('image/') === true && bytes === expected })
}
const report = { at: new Date().toISOString(), base, results }
if (process.env.YAS_QA_ROUTE_OUTPUT) await fs.writeFile(process.env.YAS_QA_ROUTE_OUTPUT, JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify({ total: results.length, passed: results.filter(result => result.passed).length, failures: results.filter(result => !result.passed) }, null, 2))
assert(results.every(result => result.passed), 'Every product route returns the SPA HTML and every cover remains an image')
