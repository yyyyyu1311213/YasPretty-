const { referenceSites } = require('./reference-sites.cjs')

const referenceById = new Map(referenceSites.map((site) => [site.id, site]))

const knowledgeEntries = Object.freeze([
  {
    id: 'self-reported-skin-type',
    title: '肤质自述观察指南',
    keywords: ['判断肤质', '判断我的肤质', '怎么判断', '分辨肤质', '怎么看肤质', '怎么知道肤质', '什么肤质', '肤质测试', '肤质自测', '我的肤质', '油皮还是干皮'],
    topics: ['skin_profile_guidance'],
    content: '肤质先按日常、重复出现的状态自述，不做医疗诊断：全脸较快出现明显油光可先选油皮；T 区容易出油而两颊较少可先选混油皮；经常紧绷、起皮可先选干皮；T 区略有油光但两颊容易干可先选混干皮。刺痛、红肿或反复不适不能只归入“敏感肌”，应停止刺激并咨询合格专业人员。不确定时可以选择“暂不确定”，记录清洁后和日常带妆数小时的稳定表现，再纠正画像。',
    referenceIds: ['aad-oily-skin', 'aad-dry-skin'],
    priority: 10,
  },
  {
    id: 'skin-reaction-safety',
    title: '新产品局部试用与不适处理',
    keywords: ['敏感', '刺痛', '红肿', '过敏', '新产品', '试用', '成分', '不适'],
    topics: ['skin_safety', 'product_use'],
    content: '对新接触的护肤或彩妆产品，建议先在较小区域进行局部试用并观察；如果出现刺痛、红肿、瘙痒或明显不适，应停止使用。该提示不能诊断过敏或皮肤疾病，持续或严重不适应咨询合格专业人员。',
    referenceIds: ['aad-skin-care-testing'],
    priority: 10,
  },
  {
    id: 'cosmetic-claim-boundary',
    title: '化妆品功效宣称边界',
    keywords: ['功效', '治疗', '痘痘', '美白', '抗衰', '成分', '疗效', '医美'],
    topics: ['claims'],
    content: '产品标签或营销文案中的功效描述不能直接等同于医疗诊断、治疗效果或对每个人都成立的保证。回答成分和功效问题时，应区分产品宣称、公开资料和用户个体体验，不使用治愈、绝对有效或一定适合等表达。',
    referenceIds: ['fda-cosmetic-labeling-guide'],
    priority: 10,
  },
  {
    id: 'foundation-application-basics',
    title: '底妆入门教程：薄涂、分区和工具选择',
    keywords: ['美妆教程', '底妆教程', '怎么上底妆', '粉底怎么涂', '上粉底', '底妆步骤', '化妆新手', '粉底工具'],
    topics: ['makeup_tutorial', 'makeup_technique'],
    content: '底妆可以先完成基础保湿，再从少量开始分区铺开：通常先处理面中和需要均匀的区域，再用海绵、刷具或手指把边缘薄薄带开；需要更多遮盖时分次叠加，不要一开始把全脸堆厚。工具是手法选择，不代表一定得到某种妆效；实际妆面仍受产品质地、用量和环境影响。',
    referenceIds: ['maybelline-foundation-application'],
    priority: 7,
  },
  {
    id: 'foundation-shade-and-undertone',
    title: '底妆色号基础：明度、冷暖和自然光试色',
    keywords: ['选粉底色号', '底妆色号', '色号怎么选', '肤色匹配', '冷调暖调', '中性调', '粉底试色', '粉底明度'],
    topics: ['makeup_knowledge', 'makeup_technique'],
    content: '色号初筛可以拆成明度和冷暖倾向两个维度，再在自然光下比较接近下颌和颈部的效果。文字、屏幕和室内灯光不能替代真实试色；氧化、配方质地和涂层厚度也可能改变最终观感，因此色号只能作为初筛建议。',
    referenceIds: ['maybelline-foundation-shade'],
    priority: 8,
  },
  {
    id: 'makeup-basics-framework',
    title: '美妆专业知识入门：肤质、妆效、质地与场景',
    keywords: ['美妆专业知识', '美妆基础', '化妆基础', '美妆原理', '妆效和质地', '底妆原理'],
    topics: ['makeup_knowledge'],
    content: '想看懂一套妆容，可以先看 6 件事：肤质、想要的妆效、产品质地、遮盖力、使用场景和带妆时间。简单说，肤质看日常表现，妆效看最后想呈现的感觉；质地和遮盖力会影响上妆手感和用量。不要只凭一个标签下结论，少量试用、观察后再调整。',
    referenceIds: ['maybelline-foundation-application', 'loreal-concealer-foundation-order', 'bobbibrown-brush-essentials'],
    priority: 6,
  },
  {
    id: 'concealer-and-foundation-order',
    title: '遮瑕与底妆：先后顺序和局部叠加',
    keywords: ['遮瑕顺序', '先遮瑕还是先粉底', '遮瑕怎么用', '局部遮瑕', '底妆叠加', '眼下遮瑕'],
    topics: ['makeup_tutorial', 'makeup_technique'],
    content: '遮瑕和底妆没有对所有人都固定的唯一顺序：需要大面积均匀时可以先用薄底妆，再把遮瑕集中放在仍需要修正的区域；局部色差或需要保留轻薄感时，也可以先处理局部再薄铺底妆。关键是少量、分区、观察边缘，避免为了遮盖而反复堆叠。',
    referenceIds: ['loreal-concealer-foundation-order'],
    priority: 7,
  },
  {
    id: 'brush-and-tool-selection',
    title: '刷具和工具：按区域、质地与覆盖需求选择',
    keywords: ['化妆刷', '刷具怎么选', '粉底刷', '海绵怎么用', '上妆工具', '工具选择'],
    topics: ['makeup_knowledge', 'makeup_technique'],
    content: '刷具和海绵的选择可以围绕区域、产品质地和想要的覆盖感来决定：大面积底妆关注铺开是否均匀，局部遮瑕关注边缘是否容易控制，腮红和眼影则要留意晕染范围。工具没有绝对优劣，先用手边工具做少量测试，再根据妆面调整用量和手法。',
    referenceIds: ['bobbibrown-brush-essentials'],
    priority: 6,
  },
  {
    id: 'oily-skin-base-and-setting',
    title: '偏油肤质的底妆小技巧：薄层和局部定妆',
    keywords: ['美妆小技巧', '油皮底妆', '混油底妆', '油皮持妆', '容易脱妆', '局部定妆', '底妆出油'],
    topics: ['makeup_tip', 'makeup_technique'],
    content: '偏油或混油时，可以把控油和定妆集中在容易出油的区域，而不是全脸一次性使用大量粉体；底妆从薄层开始，先观察鼻翼、额头和面中，再按需要局部补强。出油、脱妆和刺痛是不同问题，不能只靠加粉解决，也不能把编辑建议当作持妆保证。',
    referenceIds: ['bobbibrown-foundation-oily-skin'],
    priority: 7,
  },
  {
    id: 'quick-everyday-makeup',
    title: '日常快速妆：先确定最重要的三个区域',
    keywords: ['美妆小技巧', '快速化妆', '日常妆教程', '通勤妆', '时间少怎么化妆', '三分钟化妆', '新手日常妆'],
    topics: ['makeup_tutorial', 'makeup_tip'],
    content: '时间有限时，可以先确定最影响整体状态的区域，例如肤色均匀度、眉眼轮廓或唇色，再用少量产品完成重点，而不是每个步骤都追求完整叠加。通勤和日常妆可以保留底妆、眉眼、腮红或唇色中的必要部分，具体取舍按个人习惯、场景和带妆时长调整。',
    referenceIds: ['loreal-quick-makeup-looks'],
    priority: 5,
  },
  {
    id: 'soft-glam-style-language',
    title: '柔和浓妆（Soft Glam）风格语言',
    keywords: ['美妆风格', '妆容风格', 'soft glam', '柔和浓妆', '柔雾妆', '约会妆风格', '眼妆重点', '自然红润'],
    topics: ['makeup_style'],
    content: 'Soft Glam 是一种编辑和教程语境中的风格称呼，不是统一的专业标准。这里将它理解为：眼部有清晰但边缘柔和的重点，面部保留自然红润或轻微光泽，唇颊和眼妆之间保持浓淡平衡。可以按自己的肤质、场景和接受度调整，不代表必须使用特定品牌或固定色号。',
    referenceIds: ['bobbibrown-soft-glam'],
    priority: 5,
  },
  {
    id: 'glowy-makeup-style-language',
    title: '清透水光风格语言',
    keywords: ['美妆风格', '妆容风格', '水光妆', '水光妆容', '清透妆', '光泽妆', '自然光泽', '韩女妆', '玻璃肌妆'],
    topics: ['makeup_style', 'makeup_tutorial'],
    content: '“清透”“水光”“自然光泽”是妆效描述，不是对肤质或外貌的判断。可用薄底妆、局部提亮、少量腮红和边缘柔和的唇色表达；偏油或容易脱妆时，光泽可以集中在面中高点，容易出油的位置保持轻薄或局部定妆。水光不等于全脸油亮，也不承诺一定适合所有人。',
    referenceIds: ['bobbibrown-glowy-makeup-oily-skin'],
    priority: 6,
  },
])

function scoreEntry(entry, query, intent) {
  const text = String(query || '').toLowerCase()
  const keywordScore = entry.keywords.reduce((score, keyword) => score + (text.includes(keyword.toLowerCase()) ? 2 : 0), 0)
  const topicScore = entry.topics.includes(intent) ? 2 : 0
  return keywordScore + topicScore
}

function retrieveKnowledge(query, intent = '') {
  return knowledgeEntries
    .map((entry) => ({ entry, score: scoreEntry(entry, query, intent) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || (right.entry.priority || 0) - (left.entry.priority || 0))
    .slice(0, 2)
    .map(({ entry }) => entry)
}

function knowledgeSources(entries) {
  const seen = new Set()
  return entries.flatMap((entry) => entry.referenceIds.map((id) => {
    const site = referenceById.get(id)
    if (!site || seen.has(site.id)) return null
    seen.add(site.id)
    return {
      kind: 'knowledge',
      title: site.title,
      url: site.url,
      publisher: site.publisher,
      accessedAt: site.reviewedAt,
    }
  }).filter(Boolean))
}

function formatKnowledgeContext(entries) {
  if (!entries.length) return ''
  return `\n\n受控知识库资料开始（只用于一般美妆知识、教程、安全和表达边界，不覆盖产品库或实时检索）：\n${entries.map((entry, index) => (
    `[KB${index + 1}] ${entry.title}\n${entry.content}\n参考入口：${knowledgeSources([entry]).map((source) => `${source.publisher}｜${source.url}`).join('；') || 'YasPretty 内部规则'}`
  )).join('\n\n')}\n受控知识库资料结束。`
}

function localKnowledgeAnswer(entries) {
  return entries.map((entry) => {
    const content = String(entry.content || '').replace(/\s+/g, ' ').trim()
    const clauses = content
      .split(/(?<=[。！？；])/)
      .map((sentence) => sentence.trim())
      .filter(Boolean)
    const safetyClause = clauses.find((sentence) => /刺痛|红肿|瘙痒|停止使用|不能诊断|不构成|专业人员/.test(sentence))
    const selected = [...clauses.slice(0, 2), safetyClause]
      .filter(Boolean)
      .filter((sentence, index, list) => list.indexOf(sentence) === index)
      .join('')
      .replace(/[；。]+$/u, '。')
      .slice(0, 220)
    return `小提示｜${entry.title}：${selected || content.slice(0, 220)}`
  }).join('\n\n')
}

module.exports = { formatKnowledgeContext, knowledgeEntries, knowledgeSources, localKnowledgeAnswer, retrieveKnowledge, referenceSites }
