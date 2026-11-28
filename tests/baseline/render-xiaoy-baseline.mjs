// Render observations, never score them as future acceptance criteria.
// Usage: node tests/baseline/render-xiaoy-baseline.mjs [results.json] [output.md]
import fs from 'node:fs'
import path from 'node:path'
const input = process.argv[2] || '.qa/xiaoy-baseline-0069/results.json'
const output = process.argv[3] || '.qa/xiaoy-baseline-0069/samples.md'
const data = JSON.parse(fs.readFileSync(input, 'utf8'))
const notes = {
  B01: ['候选改进项', '预算首改可承接；再次改妆效/场景转通用问答，品类与排除品牌不再进入参数。不要合成乙转商品事实。'],
  B02: ['正常行为应保持；候选改进项', '第一次预算修正保留品类和排除项；50元确无候选，不造商品。第二次预算修正的品类/排除项已丢失，不能据无候选声称全部约束仍保留。'],
  B03: ['候选改进项', '否定品牌转商品事实；后续预算修改返回b/c，原排除品牌丢失。'],
  B04: ['正常行为应保持', '紧邻比较后第二款定位b。合成模型故意不满足比较结构，比较按现有资料降级。'],
  B05: ['候选改进项', '插问术语后第二个转通用回答，无受控商品锚点。'],
  B06: ['候选改进项；正常边界应保持', '插问后第二款要求澄清。不能盲目跨话题读取任意旧商品。'],
  B07: ['正常行为应保持', '直接继续由base到brow，来源与进度存在。'],
  B08: ['候选改进项', '插问粉底/气垫区别可正常查知识，但之后继续无beginnerContext，转通用回答。'],
  B09: ['候选改进项；正常边界应保持', '切换话题正常退出；明确回到教程只重新检索底妆，未恢复进度。'],
  B10: ['候选改进项；正常边界应保持', '单句第三人称不覆盖自己画像，但请求继承自己的油皮，朋友干皮条件未用于筛选。'],
  B11: ['候选改进项', '朋友任务跨轮补充预算/妆效写入自己的画像，缺少跨轮主体归属。'],
  B12: ['正常行为应保持', '观察最多五轮；仍未知后明确未按肤质筛选；后续红肿刺痛阻止上妆和推荐。'],
  B13: ['正常行为应保持', '主动跳过后保留预算300和粉底品类，不强加肤质，不再循环追问。'],
  B14: ['正常行为应保持；候选改进项', '混合倾向无合成商品时明确空结果；随后自述干皮可推荐，但已完成引导的预算500未继续保存为任务条件。'],
  B15: ['正常行为应保持', '方向、目标、5分钟选项进入daily进度；选择不改长期画像。'],
  B16: ['正常行为应保持', '口语自述干皮后推荐匹配b/c，不重复肤质问卷。偶尔长痘不变成诊断。'],
  B17: ['正常行为应保持', '标准卡粉问法命中patchy-base-adjustment；模型结构无效后按知识降级。'],
  B18: ['候选改进项', '首次被引导；问候后仅命中底妆基础，未召回卡粉条目。'],
  B19: ['候选改进项', '描述式表达前后均通用回答，未利用既有相关手法条目；搓泥与卡粉语义仍应合理区分。'],
  B20: ['候选改进项；正常行为应保持', '首次被引导；问候后可命中卡粉及底妆基础。'],
  B21: ['候选改进项', '首次被引导；问候后检索并实际输出被明确排除的眉毛手法，不能只依赖通用提示词处理排除。'],
  B22: ['正常行为应保持；真实效果待验证', '通用分支传入硬限制、禁止内眼线等变体与简短要求；模拟回复不能证明真实模型遵守。'],
  B23: ['正常行为应保持', '三个子问题各有知识条目、来源与answered覆盖，实际三次chat。'],
  B24: ['正常边界应保持；候选改进项', '首次被引导；问候后六项中两项回答、四项不可用，知识预算耗尽不绕到通用模型。零预算探针证明有相关条目；用户缺口说明仍可更精确。'],
  B25: ['正常行为应保持', '问候后无匹配子问题最多四次模型调用，其余明确unavailable；保留首次问卷偏差。重复问题是预算压力样本，不是六种独立知识能力。'],
  B26: ['正常行为应保持', '规则未命中直接external_question，一次chat，不恢复固定菜单。'],
  B27: ['候选改进项；正常行为应保持', '同句首次进入路线问卷，问候后进入通用回答且无知识来源/evidence。已有无匹配兜底有效，但入口有状态差异。'],
  B28: ['正常行为应保持', '未配置模型503，明确不可用，零调用。'],
  B29: ['正常行为应保持', '注入超时错误后503，未伪装成功；不是等待真实供应商超时的性能测量。'],
  B30: ['正常边界应保持', '合成search抛普通Error映射500，显示失败且不编造实时资料；不代表真实provider错误码全部为500。'],
  B31: ['正常行为应保持', '合成搜索成功、结构提取失败，仍保留合成来源摘要并标partial。'],
  B32: ['正常行为应保持', 'navigator离线时零HTTP/provider，肤质引导可继续，明确干皮后本地返回b/c。不是实际断网浏览器缓存测试。'],
  B33: ['正常行为应保持', '选择网络失败保留原问题与重试；模拟刷新后重试到目标问题，未越步。'],
  B34: ['正常行为应保持', '悬挂请求期间重复发送只有一次请求，忙时不能重置；旧问题选项重复点击增量0。'],
  B35: ['正常行为应保持；保留限制', '保存进度后刷新继续到brow；内存27条，保存/再次读取20条；存储上限不等于完整历史永久保存。'],
  B36: ['正常行为应保持', '坏JSON回退；存在旧键时迁移有效旧消息并移除旧键，不接触真实用户存储。'],
  B37: ['候选改进项', 'API返回coverage/knowledgeEvidence/dialogueDecision等，但Hook消息只留文本、商品、来源等；意图与回答模式也未逐条保存。'],
  B38: ['候选改进项；安全上限应保持', '历史截到8条×4000字后仍达96502 UTF-8字节，超过64KiB得到413；不能通过放宽服务端安全上限掩盖。'],
  B39: ['候选改进项', '未知v2回退空值，挂载写v1欢迎覆盖原值；同v1错误形状可被读取。仅合成未来数据模拟，不是执行Git回退。'],
  B40: ['正常行为应保持；保留首次入口偏差', '八问题最多处理六项，四次chat后两项不可用，另有合并的延后项；没有悄悄宣称全部回答。'],
}
const location = (id) => {
  if (['B36', 'B39'].includes(id)) return 'src/lib/storage/migrations.js；src/lib/storage/storageClient.js；src/features/assistant/hooks/useAssistant.js'
  if (['B33', 'B34', 'B35', 'B37', 'B38'].includes(id)) return 'src/features/assistant/hooks/useAssistant.js；src/features/assistant/assistantApi.js；server/app.cjs'
  if (['B04', 'B05', 'B06'].includes(id)) return 'server/services/assistant/product-resolver.cjs；server/services/assistant/intent-router.cjs'
  if (['B01', 'B02', 'B03', 'B10', 'B11', 'B16'].includes(id)) return 'server/services/assistant/parameters.cjs；src/features/assistant/profileUtils.js；server/services/assistant/intent-router.cjs'
  if (['B07', 'B08', 'B09', 'B12', 'B13', 'B14', 'B15', 'B32'].includes(id)) return 'server/services/assistant/guided-intake.cjs；server/services/assistant/beginner-guidance.cjs；src/features/assistant/beginnerContext.js；src/features/assistant/skinObservation.js'
  return 'server/services/assistant-service.cjs；server/services/assistant/knowledge-answer.cjs；server/services/assistant/compound-answer.cjs；server/knowledge/beauty-knowledge.cjs；server/services/assistant/response.cjs'
}
const j = (v) => JSON.stringify(v ?? null)
const cell = (v) => String(v ?? '—').replaceAll('|', '\\|').replace(/\r?\n/g, '<br>')
const code = (v) => '`' + cell(j(v)) + '`'
const rows = data.records.slice().sort((a, b) => a.id.localeCompare(b.id))
let md = '# 小Y第一阶段：40组当前行为记录（YAS-2026-0069）\n\n'
md += `记录时间：${new Date(data.recordedAt).toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' })}（北京时间）。基线 dev / origin/dev：\`cdb8ace1bf0b98079cf254531ab620966244ef2f\`。\n\n`
md += '这是一份诊断记录，40/40只表示采集器完成，并非40项体验验收通过。分类与建议是人工解读，逐轮数据由实际运行产生；不以修改业务代码让样本“全绿”。完整请求/响应与合成调用耗时见本地忽略的 `.qa/xiaoy-baseline-0069/results.json`。复跑入口为 `tests/baseline/xiaoy-capabilities.test.js`，样本输入为 `tests/baseline/xiaoy-scenarios.mjs`；B33–B39在测试文件中实现生命周期探针。\n\n'
md += '全部初始消息为空存储，Hook实际会加入欢迎消息；profile为合成值。a=合成甲星光气垫/油皮/哑光/300，b=合成乙月光粉底液/干皮/自然光泽/200，c=合成甲晨光粉底液/干皮/哑光/100；仅为测试夹具，不是商品事实或新增目录。方向/目标英文值通过自由输入验证服务端兼容，真实按钮操作另由B33/B34和已有浏览器测试覆盖。\n\n'
md += '每组按表从第一轮依次发送。B18/19/20/21/24/25/27/40中，问候用于结束首次引导后对同句复测；前后结果均保留。参数是独立调用现有extractParameters的观测，**不等同于肤质/入门引导覆写后的最终筛选条件**；实际候选及question/beginnerContext另列。HTTP失败或离线无返回意图时记“未返回”，不猜测内部路由。来源是已有知识元数据或合成检索URL，本轮未重新外部核验。模拟chat故意返回不合规范的结构触发现有降级，普通文本含格式测试标记[1]，并非真实来源或模型事实。\n\n'
md += '耗时单位毫秒，为本机模拟调用/采集的实际耗时，不能推算真实GLM延迟、费用或回答质量。\n\n'
for (const r of rows) {
  const [kind, note] = notes[r.id]
  md += `## ${r.id} ${r.title}\n\n${kind}。${note}\n\n`
  md += `初始上下文：${code(r.initialContext)}。总调用：HTTP ${r.totals.requests} / chat ${r.totals.chat} / search ${r.totals.search}；模拟provider耗时 ${r.totals.providerElapsedMs}ms。\n\n`
  if (r.turns.length) {
    md += '| 轮次/输入 | 当前实际输出（节选） | HTTP / 意图 / 回答模式 / 覆盖 | 来源及知识ID | 可观察条件/进度 | 模拟调用与耗时 |\n|---|---|---|---|---|---|\n'
    r.turns.forEach((t, i) => {
      const x = t.requests.at(-1), b = x?.body || {}, m = t.savedMessage
      const coverage = (b.coverage || []).map(c => `${c.intent}:${c.status}`).join(';') || '未返回'
      const source = (b.sources || m.sources || []).map(s => s.title).join(';') || '无'
      const p = x?.directParameters?.recommendation
      const progress = { profile: t.profileAfter, parameters: p, productIds: m.productIds, question: m.question, beginnerContext: m.beginnerContext }
      md += `| ${i + 1}. ${cell(t.input)}${t.selectedValue ? `<br>点选=${cell(t.selectedValue)}` : ''} | ${cell(m.content.slice(0, 360))}${m.content.length > 360 ? '…（原始记录保留全文）' : ''} | ${x?.status ?? '无HTTP'} / ${b.intent || '未返回'} / ${b.answerMode || t.mode}<br>${cell(coverage)} | ${cell(source)}<br>${code((b.knowledgeEvidence || []).map(e => e.id))} | ${code(progress)} | chat/search=${t.provider.chat}/${t.provider.search}<br>provider=${t.provider.elapsedMs}ms；整轮=${t.elapsedMs}ms |\n`
    })
  }
  const sources = new Map(r.turns.flatMap(t => t.requests.flatMap(x => x.body.sources || [])).map(s => [s.url, s]))
  if (sources.size) md += '\n来源位置（本次未访问）：' + [...sources.values()].map(s => s.url ? `[${s.title}](${s.url})` : `${s.title}（站内来源，无外部URL）`).join('；') + '。\n'
  const p = r.probes
  if (Object.keys(p).length) {
    let selected = p
    if (r.id === 'B33') selected = { afterRetry: p.afterRetry.at(-1), retryQuery: p.retryRequests[0].payload.query, retryQuestion: p.retryRequests[0].body.guidedQuestion }
    if (r.id === 'B35') selected = { beforeReload: p.beforeReload.beginnerContext, inMemoryCount: p.inMemoryCount, savedCount: p.savedCount, reloadedCount: p.reloadedCount }
    if (r.id === 'B38') { const { requests, ...rest } = p; selected = { ...rest, status: requests[0].status } }
    md += '\n补充探针：\n\n```json\n' + JSON.stringify(selected, null, 2) + '\n```\n'
  }
  md += `\n复现定位：${location(r.id)}。证据：\`results.json → records[id=${r.id}]\`；按本节输入顺序运行测试可重建。\n\n`
}
fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, md)
console.log(JSON.stringify({ input, output, samples: rows.length }))
