import { createHash } from 'node:crypto'
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { basename, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { products } from '../src/data/products.js'
import { reviewedProductFacts } from '../src/data/product-verification.reviewed.js'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const SOURCE_ROOT = join(ROOT, '产品核验信息')
const DETAIL_ROOT = join(SOURCE_ROOT, '商品详情页')
const STORE_ROOT = join(SOURCE_ROOT, '店铺首页截图')
const BUSINESS_ROOT = join(SOURCE_ROOT, '企业工商资质')
const REVIEW_WORKBOOK = join(SOURCE_ROOT, 'YasPretty-35款产品淘宝人工核验表.xlsx')
const PUBLIC_ROOT = join(ROOT, 'public', 'verification')
const GENERATED_FILE = join(ROOT, 'src', 'data', 'product-verification.generated.js')
const syncDateArgument = process.argv.find((argument) => argument.startsWith('--date='))
const syncedAt = syncDateArgument?.slice('--date='.length) || new Date().toISOString().slice(0, 10)
const parameterFileNamesBySequence = {
  '06': 'bb23a38d616e44499b49ed4fd3961bc2.png',
  '07': '1ad2e72497191b8ae441acf3315ab0e9.png',
  '08': '713129cd4cda63a4d3ed259e03f5002d.png',
  '21': '571597c88fb9f8d94eb9bd7f9e857601.png',
  '22': '45df7337690d55a08ba61a378a9d7721.png',
  '24': '06b76fb5ad50d2fedebf09a01e9c7c46.png',
  '25': '1f91da63ec95fc63725c1e3acffadead.png',
  '28': '2b48ccda87248875f00682e3680659df.png',
}

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(directory, entry.name))
    .sort((a, b) => basename(a).localeCompare(basename(b), 'zh-CN', { numeric: true }))
}

function sequenceOf(name) {
  return name.match(/^(\d{2})/)?.[1] || null
}

function webPath(path) {
  return path.split('\\').join('/')
}

function evidenceFile(sourcePath, publicPath, kind, label) {
  const contents = statSync(sourcePath)
  const hash = createHash('sha256')
  hash.update(readFileSync(sourcePath))
  return {
    kind,
    label,
    publicPath,
    originalSourcePath: webPath(relative(ROOT, sourcePath)),
    sha256: hash.digest('hex'),
    sizeBytes: contents.size,
  }
}

function copyEvidence(sourcePath, destinationDirectory, fileStem, kind, label) {
  const extension = extname(sourcePath).toLowerCase()
  const destinationPath = join(destinationDirectory, `${fileStem}${extension}`)
  copyFileSync(sourcePath, destinationPath)
  return evidenceFile(sourcePath, `/verification/${basename(destinationDirectory)}/${fileStem}${extension}`, kind, label)
}

const detailDirectories = readdirSync(DETAIL_ROOT, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }))
const storeFiles = listFiles(STORE_ROOT)
const businessFiles = listFiles(BUSINESS_ROOT)

if (detailDirectories.length !== products.length) {
  throw new Error(`核验目录数量 ${detailDirectories.length} 与产品数量 ${products.length} 不一致。`)
}
if (Object.keys(reviewedProductFacts).length !== products.length) {
  throw new Error(`人工核验表映射数量 ${Object.keys(reviewedProductFacts).length} 与产品数量 ${products.length} 不一致。`)
}

mkdirSync(PUBLIC_ROOT, { recursive: true })

const records = {}

products.forEach((product, index) => {
  const sequence = String(index + 1).padStart(2, '0')
  const detailDirectory = detailDirectories[index]
  if (sequenceOf(detailDirectory.name) !== sequence) {
    throw new Error(`产品 ${product.id} 未匹配到编号 ${sequence} 的详情目录。`)
  }

  const destinationDirectory = join(PUBLIC_ROOT, product.id)
  rmSync(destinationDirectory, { recursive: true, force: true })
  mkdirSync(destinationDirectory, { recursive: true })

  const sourceDetailFiles = listFiles(join(DETAIL_ROOT, detailDirectory.name))
  const parameterFiles = sourceDetailFiles.filter((path) => basename(path).includes('参数信息') || basename(path) === parameterFileNamesBySequence[sequence])
  const productDetailFiles = sourceDetailFiles.filter((path) => !parameterFiles.includes(path))
  const publicEvidence = []

  productDetailFiles.forEach((sourcePath, detailIndex) => {
    publicEvidence.push(copyEvidence(
      sourcePath,
      destinationDirectory,
      `product-detail-${String(detailIndex + 1).padStart(2, '0')}`,
      'product_detail',
      `商品详情证据 ${detailIndex + 1}`,
    ))
  })
  parameterFiles.forEach((sourcePath, parameterIndex) => {
    publicEvidence.push(copyEvidence(
      sourcePath,
      destinationDirectory,
      `parameters-${String(parameterIndex + 1).padStart(2, '0')}`,
      'parameters',
      `参数信息证据 ${parameterIndex + 1}`,
    ))
  })

  const storeSource = storeFiles.find((path) => sequenceOf(basename(path)) === sequence)
  if (storeSource) {
    publicEvidence.push(copyEvidence(storeSource, destinationDirectory, 'store-home', 'store_identity', '店铺首页身份线索'))
  }

  const businessSource = businessFiles.find((path) => sequenceOf(basename(path)) === sequence)
  records[product.id] = {
    sequence,
    sourceProductFolder: webPath(relative(ROOT, join(DETAIL_ROOT, detailDirectory.name))),
    storeDisplayName: storeSource ? basename(storeSource, extname(storeSource)).replace(/^\d{2}/, '').trim() : null,
    publicEvidence,
    businessQualification: businessSource ? {
      status: 'archived_internal',
      originalSourcePath: webPath(relative(ROOT, businessSource)),
      fileName: basename(businessSource),
    } : { status: 'missing', originalSourcePath: null, fileName: null },
  }
})

const generatedSource = `// Generated by scripts/sync-product-verification.mjs. Do not edit by hand.\n` +
  `export const evidenceSync = ${JSON.stringify({
    version: 2,
    syncedAt,
    productCount: products.length,
    sourceWorkbook: evidenceFile(REVIEW_WORKBOOK, null, 'review_workbook', '35 款产品淘宝人工核验表'),
    sourceSheet: '淘宝人工核验',
    sourceRange: 'A6:S40',
  }, null, 2)}\n\n` +
  `export const generatedProductEvidence = ${JSON.stringify(records, null, 2)}\n`

writeFileSync(GENERATED_FILE, generatedSource, 'utf8')
writeFileSync(join(PUBLIC_ROOT, 'manifest.json'), JSON.stringify({ version: 1, syncedAt, products: records }, null, 2), 'utf8')

console.log(`已同步 ${products.length} 款产品的核验证据，日期 ${syncedAt}。`)
