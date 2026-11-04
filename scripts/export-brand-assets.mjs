import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'

const root = process.cwd()
const require = createRequire(import.meta.url)
const sharpCandidates = [
  process.env.CODEX_NODE_MODULES ? path.join(process.env.CODEX_NODE_MODULES, 'sharp') : null,
  path.join(root, 'node_modules', 'sharp'),
].filter(Boolean)
let sharp
for (const candidate of sharpCandidates) {
  try {
    sharp = require(candidate)
    break
  } catch {
    // Try the next runtime location.
  }
}
if (!sharp) throw new Error('sharp is required. Set CODEX_NODE_MODULES to a runtime node_modules directory.')

const assetsRoot = path.join(root, 'public', 'assets')
const contactSheetPath = path.join(assetsRoot, 'asset-contact-sheet.png')
const validationPath = path.join(assetsRoot, 'asset-export-validation.json')

const walk = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(fullPath))
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.svg')) files.push(fullPath)
  }
  return files
}

const dimensionsFromSvg = (svg) => {
  const match = svg.match(/viewBox\s*=\s*["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i)
  if (!match) throw new Error('SVG is missing a numeric viewBox')
  return { width: Math.round(Number(match[1])), height: Math.round(Number(match[2])) }
}

const exportPng = async (svgPath) => {
  const svg = await fs.readFile(svgPath, 'utf8')
  const dimensions = dimensionsFromSvg(svg)
  const pngPath = svgPath.replace(/\.svg$/i, '.png')
  const tempPath = `${pngPath}.exporting`
  await sharp(Buffer.from(svg), { density: 144 })
    .resize(dimensions.width, dimensions.height, { fit: 'fill' })
    .ensureAlpha()
    .png({ compressionLevel: 9 })
    .toFile(tempPath)
  await fs.rm(pngPath, { force: true })
  await fs.rename(tempPath, pngPath)
  const metadata = await sharp(pngPath).metadata()
  return {
    svg: path.relative(root, svgPath).replaceAll('\\', '/'),
    png: path.relative(root, pngPath).replaceAll('\\', '/'),
    width: metadata.width,
    height: metadata.height,
    channels: metadata.channels,
    hasAlpha: metadata.hasAlpha === true,
  }
}

const makeLabel = (text, width, fill = '#F8F3F0', color = '#5B4A43') => Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="34">
    <rect width="100%" height="100%" fill="${fill}"/>
    <text x="12" y="23" fill="${color}" font-family="Arial, sans-serif" font-size="14">${text.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</text>
  </svg>
`)

const buildContactSheet = async (exports) => {
  const tileWidth = 260
  const imageHeight = 230
  const tileHeight = imageHeight + 34
  const columns = 4
  const doodles = exports.filter(({ svg }) => svg.includes('/doodles/'))
  const heroes = exports.filter(({ svg }) => svg.includes('/hero/'))
  const logos = exports.filter(({ svg }) => svg.includes('/logo/'))
  const doodleRows = Math.ceil(doodles.length / columns)
  const heroHeight = 380
  const logoHeight = 250
  const sheetWidth = columns * tileWidth
  const heroTop = doodleRows * tileHeight + 30
  const logoTop = heroTop + heroHeight + 30
  const composites = []
  for (let index = 0; index < doodles.length; index += 1) {
    const item = doodles[index]
    const source = await sharp(path.join(root, item.png))
      .resize(tileWidth - 20, imageHeight - 20, { fit: 'contain', background: { r: 248, g: 243, b: 240, alpha: 0 } })
      .png()
      .toBuffer()
    const tile = await sharp({
      create: { width: tileWidth, height: tileHeight, channels: 4, background: { r: 248, g: 243, b: 240, alpha: 1 } },
    })
      .composite([
        { input: source, left: 10, top: 10 },
        { input: makeLabel(path.basename(item.svg, '.svg'), tileWidth), left: 0, top: imageHeight },
      ])
      .png()
      .toBuffer()
    composites.push({ input: tile, left: (index % columns) * tileWidth, top: Math.floor(index / columns) * tileHeight })
  }
  for (let index = 0; index < heroes.length; index += 1) {
    const item = heroes[index]
    const width = Math.floor(sheetWidth / heroes.length)
    const source = await sharp(path.join(root, item.png))
      .resize(width - 30, heroHeight - 54, { fit: 'contain', background: { r: 248, g: 243, b: 240, alpha: 1 } })
      .png()
      .toBuffer()
    composites.push({ input: source, left: index * width + 15, top: heroTop + 10 })
    composites.push({ input: makeLabel(path.basename(item.svg, '.svg'), width), left: index * width, top: heroTop + heroHeight - 34 })
  }
  for (let index = 0; index < logos.length; index += 1) {
    const item = logos[index]
    const width = Math.floor(sheetWidth / logos.length)
    const isLight = item.svg.includes('wordmark-light')
    const background = isLight ? { r: 91, g: 74, b: 67, alpha: 1 } : { r: 248, g: 243, b: 240, alpha: 1 }
    const source = await sharp(path.join(root, item.png))
      .resize(width - 30, logoHeight - 54, { fit: 'contain', background: { ...background, alpha: 0 } })
      .png()
      .toBuffer()
    const tile = await sharp({ create: { width, height: logoHeight, channels: 4, background } })
      .composite([
        { input: source, left: 15, top: 10 },
        { input: makeLabel(path.basename(item.svg, '.svg'), width, isLight ? '#5B4A43' : '#F8F3F0', isLight ? '#F8F3F0' : '#5B4A43'), left: 0, top: logoHeight - 34 },
      ])
      .png()
      .toBuffer()
    composites.push({ input: tile, left: index * width, top: logoTop })
  }
  await sharp({
    create: { width: sheetWidth, height: logoTop + logoHeight, channels: 4, background: { r: 248, g: 243, b: 240, alpha: 1 } },
  }).composite(composites).png({ compressionLevel: 9 }).toFile(contactSheetPath)
}

const svgPaths = (await walk(assetsRoot)).sort()
const exports = []
for (const svgPath of svgPaths) exports.push(await exportPng(svgPath))
await buildContactSheet(exports)

const validation = {
  generatedAt: new Date().toISOString(),
  sourceCount: exports.length,
  contactSheet: path.relative(root, contactSheetPath).replaceAll('\\', '/'),
  exports,
  allPngsRgba: exports.every(({ channels, hasAlpha }) => channels === 4 && hasAlpha),
}
await fs.writeFile(validationPath, `${JSON.stringify(validation, null, 2)}\n`, 'utf8')
console.log(JSON.stringify({ sourceCount: exports.length, contactSheet: validation.contactSheet, allPngsRgba: validation.allPngsRgba }, null, 2))
