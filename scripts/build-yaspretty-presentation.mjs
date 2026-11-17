import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const workspaceDir = path.resolve(scriptDir, '..')
const buildDir = path.join(workspaceDir, '.qa/presentation-build')
const outputVersion = process.env.YASPRETTY_PRESENTATION_VERSION || '最终版'
const outputDir = process.env.YASPRETTY_PRESENTATION_OUTPUT_DIR
  ? path.resolve(process.env.YASPRETTY_PRESENTATION_OUTPUT_DIR)
  : path.join(workspaceDir, 'docs/presentation')
const finalPath = path.join(outputDir, `YasPretty-项目介绍-人均180-${outputVersion}.pptx`)
const skillDir = process.env.PRESENTATION_SKILL_DIR
const pythonExecutable = process.env.RUNTIME_PYTHON
const runtimeNodeModules = process.env.RUNTIME_NODE_MODULES || process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES

if (!skillDir || !pythonExecutable || !runtimeNodeModules) {
  throw new Error('PRESENTATION_SKILL_DIR、RUNTIME_PYTHON 和 RUNTIME_NODE_MODULES 必须指向 Codex workspace dependencies。')
}

process.env.RUNTIME_NODE_MODULES = runtimeNodeModules
process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES = runtimeNodeModules
const { Presentation, PresentationFile } = await import(pathToFileURL(path.join(runtimeNodeModules, '@oai/artifact-tool/dist/artifact_tool.mjs')).href)

const W = 1280
const H = 720
const FONT_SANS = 'Noto Sans SC'
const FONT_SERIF = 'Noto Serif SC'
const C = {
  bg: '#F8F3F0', paper: '#FFFDFC', ink: '#3D302C', muted: '#7B6862',
  rose: '#A45F70', blush: '#EAD4D3', dusty: '#D6B9B7', cocoa: '#5B4A43',
  line: '#DFCBC5', sage: '#71887D', blue: '#6F8191', white: '#FFFFFF',
}

const A = (relative) => path.join(workspaceDir, relative)
const assets = {
  heroMobile: A('public/assets/logo/hero/hero-mobile.jpg'),
  logo: A('public/assets/logo/yaspretty-wordmark-dark.png'),
  monogram: A('public/assets/logo/yaspretty-monogram.png'),
  share: A('public/assets/social/share-cover.png'),
  mirror: A('public/assets/doodles/mirror.png'),
  sparkle: A('public/assets/doodles/sparkle.png'),
  home: A('.qa/presentation/home.png'),
  workbench: A('.qa/presentation/workbench.png'),
  mobile: A('.qa/presentation/workbench-mobile.png'),
  plan: A('.qa/presentation/plan.png'),
  product: A('.qa/presentation/product-detail.png'),
  table: A('.qa/presentation/makeup-table.png'),
  armani: A('public/products/armani-luminous-silk/cover.webp'),
  flower: A('public/products/flower-knows-cloud/cover.webp'),
  dior: A('public/products/dior-forever-skin-glow/cover.webp'),
}

async function bytes(file) {
  const value = await fs.readFile(file)
  return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength)
}

function contentType(file) {
  if (file.endsWith('.jpg') || file.endsWith('.jpeg')) return 'image/jpeg'
  if (file.endsWith('.webp')) return 'image/webp'
  return 'image/png'
}

function addText(slide, text, x, y, w, h, opts = {}) {
  const shape = slide.shapes.add({
    geometry: 'textbox',
    position: { left: x, top: y, width: w, height: h },
    fill: 'none',
    line: { style: 'solid', fill: 'none', width: 0 },
  })
  shape.text = text
  shape.text.style = {
    typeface: opts.fontFamily || FONT_SANS,
    fontSize: opts.fontSize || 23,
    bold: Boolean(opts.bold),
    color: opts.color || C.ink,
    italic: Boolean(opts.italic),
  }
  return shape
}

function addLinkText(slide, label, uri, x, y, w, h, opts = {}) {
  const shape = addText(slide, label, x, y, w, h, opts)
  shape.text.get(label).link = { uri, isExternal: true }
  return shape
}

function addRect(slide, x, y, w, h, fill, line = 'none', radius = false) {
  return slide.shapes.add({
    geometry: radius ? 'roundRect' : 'rect',
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: 'solid', fill: line, width: line === 'none' ? 0 : 1 },
    ...(radius ? { borderRadius: 'rounded-md' } : {}),
  })
}

async function addImage(slide, file, x, y, w, h, fit = 'cover', radius = false) {
  return slide.images.add({
    blob: await bytes(file),
    contentType: contentType(file),
    alt: path.basename(file),
    fit,
    position: { left: x, top: y, width: w, height: h },
    geometry: radius ? 'roundRect' : 'rect',
    ...(radius ? { borderRadius: 'rounded-md' } : {}),
  })
}

function base(slide, number, dark = false) {
  slide.background.fill = dark ? C.cocoa : C.bg
  addRect(slide, 52, 680, 1176, 1, dark ? '#826D66' : C.line)
  addText(slide, 'YASPRETTY / PERSONAL BEAUTY DECISION LIBRARY', 54, 690, 500, 18, {
    fontSize: 10, color: dark ? C.blush : C.muted, bold: true,
  })
  addText(slide, String(number).padStart(2, '0'), 1180, 688, 45, 18, {
    fontSize: 11, color: dark ? C.blush : C.rose, bold: true,
  })
}

function heading(slide, kicker, title, subtitle = '') {
  addText(slide, kicker.toUpperCase(), 58, 42, 580, 24, { fontSize: 12, color: C.rose, bold: true })
  addText(slide, title, 56, 73, 1160, 62, { fontSize: 42, color: C.ink, bold: true, fontFamily: FONT_SERIF })
  if (subtitle) addText(slide, subtitle, 58, 140, 1080, 44, { fontSize: 19, color: C.muted })
}

function note(slide, text) {
  slide.speakerNotes.text = text
  slide.speakerNotes.setVisible(true)
}

function addStep(slide, n, title, body, x, y, width) {
  const circle = slide.shapes.add({
    geometry: 'ellipse', position: { left: x, top: y, width: 34, height: 34 },
    fill: C.rose, line: { style: 'solid', fill: C.rose, width: 0 },
  })
  circle.text = String(n)
  circle.text.style = { typeface: FONT_SANS, fontSize: 15, bold: true, color: C.white }
  addText(slide, title, x + 48, y - 1, width - 48, 30, { fontSize: 19, bold: true })
  addText(slide, body, x + 48, y + 31, width - 48, 48, { fontSize: 15, color: C.muted })
}

async function build() {
  await fs.mkdir(buildDir, { recursive: true })
  await fs.mkdir(path.dirname(finalPath), { recursive: true })
  const deck = Presentation.create({ slideSize: { width: W, height: H } })
  deck.theme.defaultFont = FONT_SANS

  // 1. Cover
  {
    const s = deck.slides.add()
    s.background.fill = C.bg
    await addImage(s, assets.heroMobile, 760, 0, 520, 720, 'contain')
    addRect(s, 0, 0, 760, 720, C.bg)
    await addImage(s, assets.logo, 58, 46, 196, 45, 'contain')
    addText(s, '个性化智能选妆与妆容推荐平台', 60, 126, 560, 30, { fontSize: 16, color: C.rose, bold: true })
    addText(s, '甄选好物，\n找到适配你的美', 56, 192, 640, 176, { fontSize: 62, bold: true, fontFamily: FONT_SERIF })
    addText(s, '从肤质、场景和预算出发，\n为你整理一套能看懂、能调整的妆容方案。', 60, 392, 590, 80, { fontSize: 23, color: C.muted })
    addRect(s, 60, 520, 164, 42, C.rose, C.rose, true)
    addText(s, '生活服务赛道', 81, 529, 126, 24, { fontSize: 15, color: C.white, bold: true })
    addText(s, '团队：人均180', 60, 584, 260, 28, { fontSize: 18, color: C.cocoa, bold: true })
    addLinkText(s, '项目网页　https://yaspretty.netlify.app/', 'https://yaspretty.netlify.app/', 60, 620, 420, 24, { fontSize: 14, color: C.rose, bold: true })
    addText(s, 'YASPRETTY / 2026', 60, 654, 230, 20, { fontSize: 11, color: C.muted, bold: true })
    note(s, [
      '封面文案来源：src/App.jsx 中现有首页 slogan“甄选好物，找到适配你的美”。',
      '视觉素材来源：public/assets/logo/hero/hero-mobile.jpg 与 YasPretty 自有字标。竖版 Hero 使用 contain 完整显示，不裁切产品插画。',
      '素材状态：项目原创，见 public/assets/asset-manifest.json。',
      '项目网页：https://yaspretty.netlify.app/。链接由项目负责人于 2026-11-08 提供；本页不据此声称所有在线 AI 能力均已复验。',
    ].join('\n'))
  }

  // 2. Problem
  {
    const s = deck.slides.add(); base(s, 2); heading(s, 'WHY YASPRETTY', '产品很多，适合自己的答案却很少')
    addText(s, '选化妆品，难的不是找到一款热门产品，\n而是判断它是否适合此刻的自己。', 58, 173, 590, 76, { fontSize: 25, color: C.cocoa, bold: true })
    const rows = [
      ['01', '不知道怎么选', '产品信息很多，真正与自己有关的信息很少。'],
      ['02', '不知道怎么搭', '找到了单品，却不知道如何完成一整套妆容。'],
      ['03', '不知道能不能信', '推荐给出了结论，却没有交代理由和来源。'],
    ]
    rows.forEach(([n, t, b], i) => {
      const y = 290 + i * 102
      addText(s, n, 60, y, 42, 30, { fontSize: 14, color: C.rose, bold: true })
      addText(s, t, 112, y - 3, 220, 32, { fontSize: 21, bold: true })
      addText(s, b, 112, y + 31, 480, 38, { fontSize: 16, color: C.muted })
      addRect(s, 60, y + 78, 540, 1, C.line)
    })
    addRect(s, 703, 160, 470, 440, C.paper, C.line, true)
    await addImage(s, assets.armani, 730, 218, 130, 300, 'contain')
    await addImage(s, assets.flower, 860, 188, 142, 335, 'contain')
    await addImage(s, assets.dior, 1004, 226, 126, 286, 'contain')
    addText(s, '热门，不等于适配', 786, 550, 310, 34, { fontSize: 22, color: C.rose, bold: true })
    note(s, [
      '问题定义来源：FINAL-PROMPT.md“目标用户与核心任务”。',
      '产品图片取自 public/products，逐张来源和授权状态见 src/data/product-image-sources.js。',
      '公开边界：产品图片来源已披露，明确再利用授权仍待核验。',
    ].join('\n'))
  }

  // 3. Solution
  {
    const s = deck.slides.add(); base(s, 3); heading(s, 'OUR ANSWER', '从化妆台开始，整理你的选择')
    addText(s, '告诉小Y你的肤质、预算、场景和喜欢的妆效。\n它会先整理条件，再规划完整妆容，并从站内资料中寻找合适的选择。', 58, 164, 485, 92, { fontSize: 21, color: C.cocoa })
    addRect(s, 58, 283, 493, 296, C.paper, C.line, true)
    const labels = [
      ['01', '了解你的需要'], ['02', '规划完整妆容'], ['03', '匹配站内产品'],
      ['04', '说明推荐理由'], ['05', '根据反馈调整'],
    ]
    labels.forEach(([n, t], i) => {
      const y = 310 + i * 48
      addText(s, n, 82, y, 36, 24, { fontSize: 12, color: C.rose, bold: true })
      addText(s, t, 126, y - 2, 360, 28, { fontSize: 18, bold: i === 0 || i === 4 })
      if (i < 4) addRect(s, 96, y + 29, 1, 19, C.dusty)
    })
    addRect(s, 592, 154, 630, 447, C.paper, C.line, true)
    await addImage(s, assets.home, 604, 166, 606, 423, 'cover', true)
    addText(s, '从“我该买什么”，走到“这一套应该怎么完成”。', 60, 618, 1040, 36, { fontSize: 22, color: C.rose, bold: true })
    note(s, [
      '产品定义与主流程来源：FINAL-PROMPT.md。',
      '界面截图：2026-11-08 从本地真实入口 http://127.0.0.1:5174/ 采集。',
      '截图没有使用控制台注入或静态演示页面。',
    ].join('\n'))
  }

  // 4. User journey
  {
    const s = deck.slides.add(); base(s, 4); heading(s, 'USER JOURNEY', '一套妆容方案，是怎样生成的')
    addRect(s, 58, 154, 790, 420, C.paper, C.line, true)
    await addImage(s, assets.workbench, 70, 166, 766, 396, 'cover', true)
    addRect(s, 886, 154, 272, 420, C.paper, C.line, true)
    await addImage(s, assets.mobile, 900, 166, 244, 396, 'cover', true)
    addStep(s, 1, '说出你的需要', '选择肤质、场景、风格、预算和带妆时间。', 58, 600, 280)
    addStep(s, 2, '得到完整步骤', '从底妆到定妆，生成七步方案。', 350, 600, 252)
    addStep(s, 3, '查看产品档案', '价格、特点、注意事项和来源都能打开查看。', 614, 600, 300)
    addStep(s, 4, '随时改变想法', '更轻薄、更平价，或换个场景，都能重新调整。', 926, 600, 300)
    note(s, [
      '界面截图：2026-11-08 从本地真实入口采集，覆盖桌面端 1440px 与手机端 390px。',
      '七步方案由 server/services/makeup-plan-service.cjs 生成并按 server/schemas.cjs 校验。',
      '当前照片边界：README.md 明确记录尚无照片上传或分析能力。',
    ].join('\n'))
  }

  // 5. Recommendation mechanism
  {
    const s = deck.slides.add(); base(s, 5); heading(s, 'HOW IT DECIDES', '为什么这份推荐更适合你', '小Y不会直接让模型“猜”一款产品。')
    addRect(s, 58, 200, 465, 416, C.paper, C.line, true)
    addStep(s, 1, '先排除不合适的选择', '检查预算、品类、排除品牌和不喜欢的妆效。', 84, 230, 400)
    addStep(s, 2, '再比较匹配程度', '综合肤质、场景、妆效和带妆时间。', 84, 324, 400)
    addStep(s, 3, '只在候选产品中推荐', '模型不能创造商品，也不能修改价格和色号。', 84, 418, 400)
    addStep(s, 4, '服务中断也有基础方案', '在线模型不可用时，本地规则继续生成完整方案。', 84, 512, 400)
    addRect(s, 565, 176, 657, 452, C.paper, C.line, true)
    await addImage(s, assets.plan, 577, 188, 633, 428, 'cover', true)
    addText(s, '推荐不只告诉你“选什么”，也会告诉你“为什么”。', 58, 644, 850, 30, { fontSize: 21, color: C.rose, bold: true })
    note(s, [
      '推荐规则来源：server/services/makeup-plan-service.cjs。',
      '结构化校验来源：server/schemas.cjs 中 makeup-plan.v1 schema。',
      '降级事实：provider 错误会返回确定性本地方案，不能表述为模型成功。',
      '截图中的“本地规则降级”标签保留，用于证明降级路径真实可见。',
    ].join('\n'))
  }

  // 6. Product records
  {
    const s = deck.slides.add(); base(s, 6); heading(s, 'PRODUCT RECORDS', '每一款产品，都有自己的资料页')
    addRect(s, 54, 150, 702, 482, C.paper, C.line, true)
    await addImage(s, assets.product, 66, 162, 678, 458, 'cover', true)
    const stats = [
      ['35', '条受控彩妆资料'],
      ['35', '份可访问核验档案'],
      ['111', '份商品与店铺证据'],
    ]
    stats.forEach(([n, label], i) => {
      const y = 162 + i * 118
      addText(s, n, 805, y, 180, 64, { fontSize: 52, color: i === 2 ? C.sage : C.rose, bold: true, fontFamily: FONT_SERIF })
      addText(s, label, 944, y + 22, 250, 30, { fontSize: 18, color: C.cocoa, bold: true })
      if (i < 2) addRect(s, 805, y + 83, 385, 1, C.line)
    })
    addText(s, '产品名称、品类、规格、参考价格和来源分别记录。', 805, 520, 390, 34, { fontSize: 17, bold: true })
    addText(s, '图片来源已经披露，明确再利用授权仍待核验。', 805, 560, 390, 44, { fontSize: 16, color: C.muted })
    addText(s, '编辑评价不代表真实用户评分或平台口碑。', 805, 610, 390, 34, { fontSize: 14, color: C.rose, bold: true })
    note(s, [
      '数据数字来源：README.md“当前真实能力”和“数据与素材状态”。',
      '35 条产品资料、35 份核验档案、111 份商品详情/参数/店铺截图均为当前仓库记录。',
      '产品详情截图：2026-11-08 从 /products/armani-luminous-silk 真实入口采集。',
      '授权边界：全部产品图片授权状态不得写成 verified。',
    ].join('\n'))
  }

  // 7. Architecture
  {
    const s = deck.slides.add(); base(s, 7); heading(s, 'TECHNOLOGY', '小Y如何工作', '用户看到的是简单流程，系统在背后把每一步分开处理。')
    const layers = [
      { y: 196, color: C.blush, label: '用户体验', title: 'React + Vite', detail: '产品库　妆容工作台　小Y助手　3D 化妆桌' },
      { y: 292, color: '#E5DDD9', label: '服务入口', title: 'Fastify API', detail: 'Zod 校验　限流　安全响应头　统一错误处理' },
      { y: 388, color: '#DCE5E0', label: '决策过程', title: 'intentRouter + 规则评分', detail: '硬条件过滤　候选排序　方案校验　本地降级' },
      { y: 484, color: '#DCE2E8', label: '数据与外部能力', title: '受控产品资料 + Providers', detail: '智谱 GLM　Web Search　Open-Meteo' },
    ]
    layers.forEach((layer, i) => {
      addRect(s, 116, layer.y, 1040, 76, layer.color, 'none', true)
      addText(s, layer.label, 140, layer.y + 14, 170, 24, { fontSize: 13, color: i < 2 ? C.rose : C.sage, bold: true })
      addText(s, layer.title, 315, layer.y + 10, 300, 34, { fontSize: 23, bold: true })
      addText(s, layer.detail, 627, layer.y + 18, 500, 30, { fontSize: 17, color: C.muted })
    })
    await addImage(s, assets.mirror, 25, 500, 78, 78, 'contain')
    await addImage(s, assets.sparkle, 1160, 170, 72, 72, 'contain')
    addRect(s, 116, 592, 1040, 54, C.paper, C.line, true)
    addText(s, '密钥只在服务端', 145, 607, 245, 26, { fontSize: 16, color: C.rose, bold: true })
    addText(s, '匿名数据保存在浏览器', 422, 607, 278, 26, { fontSize: 16, color: C.sage, bold: true })
    addText(s, '外部服务失败时保留本地能力', 730, 607, 390, 26, { fontSize: 16, color: C.blue, bold: true })
    note(s, [
      '技术栈来源：package.json、server/app.cjs、server/services/assistant-service.cjs。',
      '隐私边界来源：README.md“数据与隐私边界”。',
      'Open-Meteo 只作为统一 /api/assistant 路由中的外部信息 provider，不单独包装成核心天气产品。',
      '普通用户界面不会接收第三方 API Key。',
    ].join('\n'))
  }

  // 8. Current result
  {
    const s = deck.slides.add(); base(s, 8); heading(s, 'WHAT WORKS TODAY', '目前，我们已经做到这些')
    addRect(s, 0, 154, 1280, 330, '#E8E1DE')
    await addImage(s, assets.table, 0, 154, 760, 330, 'cover')
    addRect(s, 760, 154, 520, 330, C.cocoa)
    addText(s, '真实可操作的主流程', 808, 190, 380, 38, { fontSize: 26, color: C.white, bold: true, fontFamily: FONT_SERIF })
    addText(s, '首页与 3D 化妆桌\n产品搜索与详情\n七步妆容方案\n小Y意图路由与来源展示', 808, 246, 370, 170, { fontSize: 22, color: C.blush })
    const stats = [
      ['35', '条产品资料'],
      ['73', '项 Vitest 测试'],
      ['7', '步妆容方案'],
    ]
    stats.forEach(([n, label], i) => {
      const x = 72 + i * 380
      addText(s, n, x, 520, 110, 72, { fontSize: 58, color: i === 1 ? C.sage : C.rose, bold: true, fontFamily: FONT_SERIF })
      addText(s, label, x + 120, 549, 220, 30, { fontSize: 18, bold: true })
    })
    addText(s, '仍在继续：照片分析、眉妆资料、组件与端到端测试、产品图片明确授权。', 72, 626, 1080, 30, { fontSize: 16, color: C.muted })
    note(s, [
      '当前能力与测试数字来源：README.md“当前真实能力”。',
      '73 项测试为当前 README 记录，不将其表述为全部浏览器或端到端覆盖。',
      '3D 化妆桌截图：2026-11-08 从本地真实 WebGL 场景采集。',
      '未完成项必须保留：照片分析、眉妆资料、React Testing Library、Playwright、图片明确授权。',
    ].join('\n'))
  }

  // 9. Closing
  {
    const s = deck.slides.add()
    s.background.fill = C.bg
    await addImage(s, assets.share, 0, 0, 1280, 720, 'cover')
    addRect(s, 0, 0, 720, 720, '#F8F3F0')
    await addImage(s, assets.logo, 60, 48, 210, 50, 'contain')
    addText(s, '找到适配你的美', 58, 176, 590, 70, { fontSize: 49, bold: true, fontFamily: FONT_SERIF })
    addText(s, '美没有统一答案。', 60, 285, 520, 38, { fontSize: 25, color: C.rose, bold: true })
    addText(s, 'YasPretty 想做的，是帮每个人整理自己的需要，\n理解每一次推荐，再找到适合当下场景的选择。', 60, 342, 590, 88, { fontSize: 22, color: C.cocoa })
    addRect(s, 60, 474, 510, 1, C.dusty)
    addText(s, '选什么　为什么选　应该怎么用', 60, 496, 540, 32, { fontSize: 20, color: C.muted, bold: true })
    addText(s, '小Y陪你一步一步找到答案。', 60, 545, 520, 36, { fontSize: 23, color: C.rose, bold: true })
    addLinkText(s, '项目网页　https://yaspretty.netlify.app/', 'https://yaspretty.netlify.app/', 60, 600, 460, 24, { fontSize: 14, color: C.rose, bold: true })
    addText(s, 'You are so pretty.', 60, 640, 420, 30, { fontSize: 22, color: C.cocoa, italic: true, fontFamily: FONT_SERIF })
    addText(s, '生活服务赛道　团队：人均180', 840, 648, 360, 24, { fontSize: 14, color: C.cocoa, bold: true })
    note(s, [
      '结尾语言延续 src/App.jsx 的品牌 slogan 与“You are so pretty”。',
      '背景来源：public/assets/social/share-cover.png，项目原创，见 public/assets/asset-manifest.json。',
      '项目网页：https://yaspretty.netlify.app/。本页不包含二维码，也不把链接本身当作在线 AI 能力复验证据。',
    ].join('\n'))
  }

  const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, 'container_tools/artifact_tool_utils.mjs')).href)
  const previewDir = path.join(buildDir, 'previews')
  await fs.mkdir(previewDir, { recursive: true })
  for (const [index, slide] of deck.slides.items.entries()) {
    const png = await deck.export({ slide, format: 'png', scale: 1 })
    await fs.writeFile(path.join(previewDir, `slide-${String(index + 1).padStart(2, '0')}.png`), new Uint8Array(await png.arrayBuffer()))
  }
  const montage = await deck.export({ format: 'webp', montage: true })
  await fs.writeFile(path.join(buildDir, 'montage.webp'), new Uint8Array(await montage.arrayBuffer()))

  const candidatePath = path.join(buildDir, `candidate-${outputVersion}.pptx`)
  await (await PresentationFile.exportPptx(deck)).save(candidatePath)
  const result = await finalizePresentation({
    explicitTotalSlideCount: 9,
    requiredNativeTableOwnerSlides: [],
    requiredNativeChartOwnerSlides: [],
    workspaceDir,
    candidatePath,
    finalPath,
    pythonExecutable,
    integrityValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_package_integrity.py'),
    layoutValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_layout_geometry.py'),
    layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-heading-fit'],
    fontPolicy: { basis: 'design', families: [FONT_SANS, FONT_SERIF] },
    verifyArtifactToolImport: true,
    receiptPath: path.join(buildDir, `YasPretty-项目介绍-人均180-${outputVersion}.validation.json`),
  })
  console.log(JSON.stringify({ finalPath, result }, null, 2))
}

build().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
