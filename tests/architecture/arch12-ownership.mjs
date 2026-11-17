// Read-only ARCH-12 preservation audit. Uses parsers already installed by Vite.
// Compares against the accepted ARCH-11 commit, never changes Git or source files.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import { parseSync } from 'rolldown/utils'

const root = fileURLToPath(new URL('../../', import.meta.url))
const baseline = '57b0a877a9a6bbd769fdb079c2c4ef71629e28e9'
const read = file => fs.readFileSync(path.join(root, file), 'utf8')
const old = file => execFileSync('git', ['show', `${baseline}:${file}`], { cwd: root, encoding: 'utf8', maxBuffer: 2000000 })
const targets = {
  global: 'src/styles.css', home: 'src/features/home/components/HomeView.css',
  assistant: 'src/features/assistant/assistant.css', workbench: 'src/features/makeup-plan/components/MakeupWorkbench.css',
  opening: 'src/features/app-shell/components/BrandOpening.css',
}
const moves = [
  ...['FlexCarousel', 'ScrollFloat', 'StrokeText'].flatMap(name => ['jsx', 'css'].map(ext => [`src/components/${name}.${ext}`, `src/components/visual/${name}.${ext}`])),
  ['src/components/XiaoYAssistant.jsx', 'src/features/assistant/components/XiaoYAssistant.jsx'],
  ['src/components/BrandOpening.jsx', 'src/features/app-shell/components/BrandOpening.jsx'],
  ['src/components/BrandOpening.test.js', 'src/features/app-shell/components/BrandOpening.test.js'],
]
function owner(selector) {
  if (/^\.(brand-opening|opening-)/.test(selector)) return 'opening'
  if (/^\.(home-|hero-|quick-links|featured-|makeup-table-intro-|makeup-table-lazy-placeholder|section-heading|text-action|story-closing|assistant-entry-button)/.test(selector)) return 'home'
  if (/^\.xiaoy-/.test(selector)) return 'assistant'
  if (/^\.(makeup-workbench|makeup-plan-|makeup-priority-list)/.test(selector)) return 'workbench'
  return 'global'
}
function bodyWithoutImports(source, file) {
  const parsed = parseSync(file, source)
  assert.deepEqual(parsed.errors, [], file)
  for (const node of parsed.program.body.filter(n => n.type === 'ImportDeclaration').reverse()) source = source.slice(0, node.start) + source.slice(node.end)
  return source.trim()
}
for (const [from, to] of moves) {
  assert(!fs.existsSync(path.join(root, from)), `Old implementation remains: ${from}`)
  if (from.startsWith('src/components/') && /(?:FlexCarousel|ScrollFloat|StrokeText)\./.test(from)) assert.equal(read(to), old(from), `Visual whole-file move changed: ${to}`)
  else if (/\.jsx$/.test(from)) assert.equal(bodyWithoutImports(read(to), to), bodyWithoutImports(old(from), from), `Component behavior changed: ${to}`)
  else assert.equal(read(to), old(from), `Whole-file move changed: ${to}`)
}
for (const file of ['src/App.jsx', 'src/features/home/components/HomeView.jsx', 'src/features/makeup-plan/components/MakeupWorkbench.jsx']) {
  // Home's lazy import changes only its module path, outside import declarations.
  const before = old(file).replace("import('../../../components/FlexCarousel')", "import('../../../components/visual/FlexCarousel')")
  assert.equal(bodyWithoutImports(read(file), file), bodyWithoutImports(before, file), `Composition changed: ${file}`)
}
assert(!fs.existsSync(path.join(root, 'src/xiaoy.css')))
assert.equal(read('src/main.jsx'), old('src/main.jsx').replace("import App from './App'\n", '').replace("import './xiaoy.css'", "import App from './App'"))
for (const [file, specifier] of [
  ['src/features/assistant/components/XiaoYAssistant.jsx', '../assistant.css'],
  ['src/features/app-shell/components/BrandOpening.jsx', './BrandOpening.css'],
  ['src/features/home/components/HomeView.jsx', './HomeView.css'],
  ['src/features/makeup-plan/components/MakeupWorkbench.jsx', './MakeupWorkbench.css'],
]) assert(read(file).includes(`import '${specifier}'`), `Missing CSS owner import: ${file}`)

function semantic(node) {
  if (node.type === 'comment') return null
  if (node.type === 'decl') return [node.prop, node.value, Boolean(node.important)]
  return [node.type, node.name || node.selector, node.params || '', node.nodes?.map(semantic).filter(Boolean)]
}
const expected = [], actual = []
function collect(source, file, output, original) {
  const parsed = postcss.parse(source, { from: file })
  function walk(nodes, context = []) {
    for (const node of nodes) {
      if (node.type === 'comment') continue
      if (node.type === 'atrule' && node.nodes && !/keyframes/.test(node.name)) {
        walk(node.nodes, [...context, `@${node.name} ${node.params}`]); continue
      }
      const selectors = node.type === 'rule' ? node.selectors : [`@${node.name} ${node.params}`]
      for (const selector of selectors) {
        const destination = node.type === 'rule' ? owner(selector.trim()) : /keyframes/.test(node.name) ? /^opening-/.test(node.params) ? 'opening' : /^(home-|hero-)/.test(node.params) ? 'home' : 'global' : 'global'
        const target = original ? targets[destination] : file
        if (!original) assert.equal(target, targets[destination], `CSS belongs to ${destination}: ${file} ${selector}`)
        const declarations = node.nodes?.map(semantic).filter(Boolean) || []
        output.push({ file: target, selector: selector.trim(), context, declarations })
      }
    }
  }
  walk(parsed.nodes)
}
for (const file of ['src/styles.css', 'src/xiaoy.css']) collect(old(file), file, expected, true)
for (const file of Object.values(targets)) collect(read(file), file, actual, false)
// Preserve every selector's declaration sequence inside its original media context.
function grouped(entries) {
  const result = new Map()
  for (const { file, selector, context, declarations } of entries) {
    const key = JSON.stringify([file, selector, context])
    result.set(key, [...(result.get(key) || []), declarations])
  }
  return [...result].sort(([a], [b]) => a.localeCompare(b))
}
assert.deepEqual(grouped(actual), grouped(expected), 'Lost, added, reordered or changed CSS declarations')
assert.equal(actual.filter(r => r.selector === '@keyframes xiaoy-spin').length, 1)
assert(actual.some(r => r.file === targets.global && r.selector === '@keyframes xiaoy-spin'))
assert(!read(targets.workbench).includes('assistant.css'), 'Workbench must work independently of assistant CSS')

// Verify moved mocks and disclosure paths, without rewriting archived evidence.
for (const name of ['FlexCarousel', 'ScrollFloat', 'StrokeText']) {
  assert(read('src/features/home/components/HomeView.test.jsx').includes(`../../../components/visual/${name}`))
  assert(read('README.md').includes(`src/components/visual/${name}.jsx`))
}
assert(read('src/features/app-shell/App.test.jsx').includes('../assistant/components/XiaoYAssistant'))
assert(read('scripts/fill_ai_usage_statement.py').includes('src/features/assistant/components/XiaoYAssistant.jsx'))
assert.equal(read('AGENTS.md'), old('AGENTS.md'))
assert.equal(read('FINAL-PROMPT.md'), old('FINAL-PROMPT.md'))
const plan = read('docs/frontend-architecture-migration-plan.md')
const archivedStart = '### ARCH-00：'
const baselinePlan = old('docs/frontend-architecture-migration-plan.md')
assert.equal(plan.slice(plan.indexOf(archivedStart), plan.indexOf('### ARCH-12：')).trim(), baselinePlan.slice(baselinePlan.indexOf(archivedStart), baselinePlan.indexOf('## 7. 阶段状态总表')).trim(), 'Archived ARCH-00–11 history changed')
for (const file of ['docs/stage-delivery-test-report.md', 'docs/product-data-accuracy-audit.md']) assert(read(file).startsWith(old(file)), `Cumulative evidence must only append: ${file}`)
const sections = [...plan.matchAll(/^### ARCH-(\d\d)：[^\n]+\n\n\*\*状态：`([^`]+)`/gm)].map(m => ({ stage: m[1], status: m[2] }))
assert.equal(sections.length, 13)
const stageStatus = sections.find(s => s.stage === '12').status
assert(['current', 'done'].includes(stageStatus))
assert.deepEqual(sections.filter(s => s.status === 'current'), stageStatus === 'current' ? [{ stage: '12', status: 'current' }] : [])
assert(sections.filter(s => s.stage !== '12').every(s => s.status === 'done'))
const result = { baseline, movedFiles: moves.length, preservedCompositionFiles: 3, cssAtoms: actual.length, cssSelectorsAndContexts: grouped(actual).length, cssByFile: Object.fromEntries(Object.values(targets).map(f => [f, actual.filter(r => r.file === f).length])), archivedStagesPreserved: 12, stageStatus, current: stageStatus === 'current' ? 'ARCH-12' : null, passed: true }
if (process.env.YAS_QA_OWNERSHIP_JSON) fs.writeFileSync(path.resolve(process.env.YAS_QA_OWNERSHIP_JSON), JSON.stringify({ ...result, cssMapping: expected }, null, 2) + '\n')
console.log(JSON.stringify(result, null, 2))
