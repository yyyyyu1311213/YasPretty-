// Read-only frontend audit using the parser already supplied by Vite/Rolldown.
// Reports candidates for review; unused exports alone never authorize deletion.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseSync } from 'rolldown/utils'

const root = fileURLToPath(new URL('../../', import.meta.url))
const relative = value => path.relative(root, value).replaceAll('\\', '/')
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)])
const sourceFiles = walk(path.join(root, 'src'))
const files = [...sourceFiles, ...walk(path.join(root, 'tests'))].filter(file => /\.(?:[cm]?js|jsx)$/.test(file))
const production = sourceFiles.filter(file => /\.(?:js|jsx)$/.test(file) && !file.includes('.test.'))
const graph = new Map(files.map(file => [file, []]))
const imports = [], types = [], strings = [], exports = [], forwarding = [], duplicateBodies = new Map()
const issues = []
const text = file => fs.readFileSync(file, 'utf8')

function resolve(from, specifier) {
  const candidate = path.resolve(path.dirname(from), specifier.split('?')[0].split('#')[0])
  const target = ['', '.js', '.jsx', '.mjs', '.cjs', '.css', '.json', '/index.js', '/index.jsx']
    .map(suffix => candidate + suffix).find(file => fs.existsSync(file) && fs.statSync(file).isFile())
  if (!target) { issues.push(`Missing ${relative(from)} -> ${specifier}`); return null }
  let current = root
  for (const part of path.relative(root, target).split(path.sep)) {
    if (!fs.readdirSync(current).includes(part)) issues.push(`Case mismatch ${relative(from)} -> ${specifier}`)
    current = path.join(current, part)
  }
  return target
}
function visit(node, visitor) {
  if (!node || typeof node !== 'object') return
  if (node.type) visitor(node)
  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent') continue
    if (Array.isArray(value)) value.forEach(child => visit(child, visitor))
    else if (value && typeof value === 'object') visit(value, visitor)
  }
}
for (const file of files) {
  const source = text(file), parsed = parseSync(file, source)
  if (parsed.errors.length) issues.push(...parsed.errors.map(error => `${relative(file)}: ${error.message}`))
  const usage = new Map()
  visit(parsed.program, node => {
    if (node.type === 'Identifier' || node.type === 'JSXIdentifier') usage.set(node.name, (usage.get(node.name) || 0) + 1)
    if (node.type === 'Literal' && typeof node.value === 'string' && /(?:src\/|\.\.?\/).*\.(?:jsx?|mjs|cjs|css)(?:\?|$)/.test(node.value)) {
      strings.push({ file: relative(file), value: node.value })
    }
  })
  const record = (specifier, kind, names = []) => {
    if (typeof specifier !== 'string' || !specifier.startsWith('.')) return
    const target = resolve(file, specifier)
    if (!target) return
    graph.get(file).push(target)
    imports.push({ file: relative(file), target: relative(target), specifier, kind, names })
  }
  visit(parsed.program, node => {
    if (node.type === 'ImportDeclaration') {
      const names = node.specifiers.map(item => ({ imported: item.type === 'ImportDefaultSpecifier' ? 'default' : item.type === 'ImportNamespaceSpecifier' ? '*' : item.imported.name || item.imported.value, local: item.local.name, uses: usage.get(item.local.name) || 0 }))
      record(node.source.value, 'static', names)
    }
    if (node.type === 'ImportExpression') {
      if (typeof node.source.value === 'string') record(node.source.value, 'dynamic', [{ imported: '*' }])
      else strings.push({ file: relative(file), nonliteralDynamicImport: source.slice(node.start, node.end) })
    }
    if (node.type === 'ExportNamedDeclaration' && node.source) record(node.source.value, 're-export', [{ imported: '*' }])
    if (node.type === 'ExportAllDeclaration') record(node.source.value, 're-export', [{ imported: '*' }])
    if (!production.includes(file)) return
    if (node.type === 'ExportDefaultDeclaration') exports.push({ file: relative(file), name: 'default' })
    if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration?.id) exports.push({ file: relative(file), name: node.declaration.id.name })
      for (const declaration of node.declaration?.declarations || []) if (declaration.id.type === 'Identifier') exports.push({ file: relative(file), name: declaration.id.name })
      for (const item of node.specifiers || []) exports.push({ file: relative(file), name: item.exported.name || item.exported.value })
    }
    if (node.type === 'FunctionDeclaration' && node.body) {
      const body = source.slice(node.body.start, node.body.end).replace(/\s+/g, ' ').trim()
      if (body.length > 100) duplicateBodies.set(body, [...(duplicateBodies.get(body) || []), `${relative(file)}:${node.id?.name}`])
    }
  })
  const annotations = source.split('\n').filter(line => /@(typedef|type|param|returns|property)\b/.test(line)).join('\n')
  for (const match of annotations.matchAll(/import\(['"]([^'"]+)['"]\)\./g)) {
    if (!match[1].startsWith('.')) continue
    const target = resolve(file, match[1])
    if (target) types.push({ file: relative(file), target: relative(target), specifier: match[1] })
  }
  if (production.includes(file) && !file.includes(`${path.sep}contracts${path.sep}`) && parsed.program.body.length &&
    parsed.program.body.every(node => node.type === 'ImportDeclaration' || node.type === 'ExportAllDeclaration' || (node.type === 'ExportNamedDeclaration' && !node.declaration))) forwarding.push(relative(file))
}

const reachable = new Set()
function follow(file) {
  if (reachable.has(file)) return
  reachable.add(file)
  for (const target of graph.get(file) || []) follow(target)
}
const entry = text(path.join(root, 'index.html')).match(/src="(\/src\/[^"?]+)"/)?.[1]
assert(entry, 'Vite HTML entry exists')
follow(path.join(root, entry.slice(1)))
const cycles = [], visited = new Set(), active = new Set()
function cycle(file, stack = []) {
  if (active.has(file)) { cycles.push([...stack.slice(stack.indexOf(file)), file].map(relative)); return }
  if (visited.has(file)) return
  visited.add(file); active.add(file)
  for (const target of graph.get(file) || []) cycle(target, [...stack, file])
  active.delete(file)
}
for (const file of files) cycle(file)
for (const edge of imports.filter(edge => !edge.file.includes('.test.'))) {
  if (edge.file.startsWith('src/lib/') && edge.target.startsWith('src/features/')) issues.push(`lib reverse dependency ${JSON.stringify(edge)}`)
  if (edge.file.startsWith('src/features/makeup-plan/') && edge.target.startsWith('src/features/assistant/')) issues.push(`makeup-plan reverse dependency ${JSON.stringify(edge)}`)
  if (edge.file.startsWith('src/features/') && edge.target === 'src/App.jsx') issues.push(`App reverse dependency ${JSON.stringify(edge)}`)
}
const assets = []
for (const file of sourceFiles.filter(file => /\.(?:css|js|jsx)$/.test(file) && !file.includes('.test.'))) {
  const source = text(file)
  // Literal public paths and CSS urls; data-generated paths are checked by data tests/browser requests.
  const paths = [...source.matchAll(/["'`](\/(?:assets|products|verification)\/[^"'`\s{}$]+\.(?:svg|webp|png|jpe?g|woff2?)(?:\?[^"'`\s]*)?)["'`]/g)].map(match => match[1])
  if (file.endsWith('.css')) for (const match of source.matchAll(/url\(\s*["']?([^\s)"']+)/g)) if (!/^(?:data:|https?:|#)/.test(match[1])) paths.push(match[1])
  for (const rawValue of new Set(paths)) {
    const value = rawValue.split('?')[0].split('#')[0]
    const target = value.startsWith('/') ? path.join(root, 'public', value) : path.resolve(path.dirname(file), value)
    if (!fs.existsSync(target)) issues.push(`Missing asset ${relative(file)} -> ${value}`)
    else assets.push({ file: relative(file), value })
  }
}
const unusedExports = exports.filter(item => !imports.some(edge => edge.target === item.file && edge.names.some(name => name.imported === '*' || name.imported === item.name)))
const result = {
  sourceFiles: sourceFiles.length, parsedFiles: files.length, productionModules: production.length,
  imports, types, strings, assets, cycles, forwarding,
  unusedImports: imports.flatMap(edge => edge.names.filter(name => name.uses === 1).map(name => ({ file: edge.file, name: name.local, target: edge.target }))),
  unusedExports, duplicateFunctionBodies: [...duplicateBodies.values()].filter(locations => new Set(locations.map(value => value.split(':')[0])).size > 1),
  runtimeUnreachable: production.filter(file => !reachable.has(file)).map(relative),
  emptyDirectories: [], issues,
}
function empty(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true })
  if (!entries.length) result.emptyDirectories.push(relative(directory))
  entries.filter(entry => entry.isDirectory()).forEach(entry => empty(path.join(directory, entry.name)))
}
empty(path.join(root, 'src'))
if (process.env.YAS_QA_AUDIT_OUTPUT) fs.writeFileSync(process.env.YAS_QA_AUDIT_OUTPUT, JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ ...result, imports: imports.length, types: types.length, strings: strings.length, assets: assets.length }, null, 2))
assert.deepEqual(issues, [], 'All imports/assets resolve with exact case and dependency boundaries')
assert.deepEqual(cycles, [], 'No source/test import cycles')
assert.deepEqual(forwarding, [], 'No files containing only runtime forwarding')
