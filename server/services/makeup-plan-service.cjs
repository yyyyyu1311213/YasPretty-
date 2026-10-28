const {
  makeupPlanSchema,
  makeupRequestSchema,
  userProfileSchema,
} = require('../schemas.cjs')

const BASE_CATEGORIES = new Set(['粉底液', '气垫'])
const EYE_CATEGORIES = new Set(['眼影', '睫毛膏', '眼线', '眉笔'])

function normalize(value) {
  return String(value || '').trim().toLowerCase()
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function productMatchesHardConditions(product, profile) {
  if (product.recommendationReady === false) return false
  if (profile.skinType !== 'unknown' && !product.skins.includes(profile.skinType)) return false
  if (profile.budgetTotal > 0 && product.price > profile.budgetTotal) return false
  if (profile.finishPreferences.length && !profile.finishPreferences.includes(product.finish)) return false
  if (profile.excludedBrands.some((brand) => normalize(product.brand) === normalize(brand))) return false
  return true
}

function scoreCandidate(product, profile, request) {
  let score = 44
  const matchedConditions = []
  const tradeoffs = []

  if (profile.skinType !== 'unknown' && product.skins.includes(profile.skinType)) {
    score += 20
    matchedConditions.push(`适合自述肤质：${profile.skinType}`)
  }
  if (profile.finishPreferences.includes(product.finish)) {
    score += 16
    matchedConditions.push(`符合妆效偏好：${product.finish}`)
  }
  if (request.scene && product.scenes.includes(request.scene)) {
    score += 10
    matchedConditions.push(`资料标注场景包含：${request.scene}`)
  } else if (request.scene) {
    tradeoffs.push(`资料未标注“${request.scene}”场景，需自行观察持妆表现`)
  }
  if (request.wearHours && product.wear >= request.wearHours) {
    score += 7
    matchedConditions.push(`参考持妆 ${product.wear} 小时，达到 ${request.wearHours} 小时目标`)
  } else if (request.wearHours) {
    tradeoffs.push(`参考持妆 ${product.wear} 小时，低于 ${request.wearHours} 小时目标`)
  }
  if (profile.budgetTotal > 0) {
    const budgetRatio = Math.max(0, 1 - product.price / profile.budgetTotal)
    score += Math.round(budgetRatio * 5)
    matchedConditions.push(`参考价 ${product.price} 元在预算内`)
  }
  if (profile.undertone !== 'unknown' && product.shades.some((shade) => shade.tone === profile.undertone)) {
    score += 5
    matchedConditions.push(`有${profile.undertone}代表色号`)
  }
  if (product.cautions?.length) tradeoffs.push(product.cautions[0])
  if (product.rating && product.rating >= 4.5) tradeoffs.push('页面评分为编辑示例维度，不代表真实用户统计')

  return {
    score: Math.min(100, Math.max(0, score)),
    matchedConditions: unique(matchedConditions).slice(0, 8),
    tradeoffs: unique(tradeoffs).slice(0, 8),
  }
}

function selectCandidates(userProfileInput, makeupRequestInput, products) {
  const userProfile = userProfileSchema.parse(userProfileInput || {})
  const makeupRequest = makeupRequestSchema.parse(makeupRequestInput || {})
  const candidates = products
    .filter((product) => productMatchesHardConditions(product, userProfile))
    .map((product) => ({
      product,
      evidence: scoreCandidate(product, userProfile, makeupRequest),
    }))
    .sort((left, right) => right.evidence.score - left.evidence.score)

  return {
    userProfile,
    makeupRequest,
    candidates,
    candidateEvidence: candidates.slice(0, 12).map(({ product, evidence }) => ({
      productId: product.id,
      ...evidence,
    })),
  }
}

function firstProduct(candidates, predicate) {
  return candidates.find(({ product }) => predicate(product))?.product || null
}

function colorDirection(profile, request) {
  if (profile.undertone === '冷调') return '偏冷的玫瑰、豆沙或灰粉方向，先少量叠加'
  if (profile.undertone === '暖调') return '偏暖的杏桃、奶茶或砖红方向，注意与底妆边界自然'
  if (request.style.includes('浓') || request.style.includes('氛围')) return '根据场合选择低饱和棕、莓果或砖红方向'
  return '低饱和裸粉、杏桃或棕调方向，优先少量叠加并观察整体平衡'
}

function buildSteps(selection) {
  const { userProfile: profile, makeupRequest: request, candidates } = selection
  const base = firstProduct(candidates, (product) => BASE_CATEGORIES.has(product.category))
  const concealer = firstProduct(candidates, (product) => product.category === '遮瑕')
  const powder = firstProduct(candidates, (product) => product.category === '散粉')
  const eyeProduct = firstProduct(candidates, (product) => EYE_CATEGORIES.has(product.category))
  const baseReasons = selection.candidateEvidence.find((item) => item.productId === base?.id)?.matchedConditions || []
  const concealerReasons = selection.candidateEvidence.find((item) => item.productId === concealer?.id)?.matchedConditions || []
  const powderReasons = selection.candidateEvidence.find((item) => item.productId === powder?.id)?.matchedConditions || []
  const noProduct = '当前资料库没有该品类的已核验站内产品，只提供手法与颜色方向。'

  return [
    {
      id: 'prep',
      category: '妆前',
      goal: '让底妆有均匀、可调整的起点',
      technique: profile.skinType === '油皮' || profile.skinType === '混油皮'
        ? '薄涂保湿，T 区等候成膜后再上底妆；不要一次叠太多妆前。'
        : '分区保湿，干燥处等候吸收后再上底妆，避免厚重打底。',
      texture: '轻薄乳液或凝露',
      colorDirection: '不涉及颜色',
      primaryProductId: null,
      alternativeProductIds: [],
      reasons: ['依据自述肤质安排分区妆前，不进行医疗判断。'],
      cautions: ['如果出现刺痛、红肿或明显不适，应停止使用并咨询合格专业人员。'],
    },
    {
      id: 'base',
      category: '底妆',
      goal: '均匀肤色并保留适度真实肌理',
      technique: base ? '从面中向外少量点涂，再用海绵或刷具薄薄铺开；需要遮盖处分次叠加。' : '先在面中少量试用，确认色号与妆效后再扩大范围。',
      texture: base?.finish || '轻薄液体或气垫质地',
      colorDirection: profile.undertone === 'unknown' ? '先在自然光下比较明度和冷暖，不把文字建议当作最终试色。' : `${profile.undertone}方向，先试最接近肤色的一枚代表色号。`,
      primaryProductId: base?.id || null,
      alternativeProductIds: candidates.filter(({ product }) => BASE_CATEGORIES.has(product.category) && product.id !== base?.id).slice(0, 2).map(({ product }) => product.id),
      reasons: base ? unique(['确定性筛选通过预算、排除品牌和肤质等硬条件', ...baseReasons]).slice(0, 5) : [noProduct],
      cautions: base?.cautions?.slice(0, 2) || ['当前没有可映射的站内底妆产品，请先完成产品资料核验。'],
    },
    {
      id: 'conceal',
      category: '局部遮瑕',
      goal: '只处理需要修饰的局部，避免全脸变厚',
      technique: concealer ? '点涂在局部，等待片刻后用边缘余量晕开；眼下从少量开始。' : '用少量底妆余量局部叠加，先观察是否真的需要专门遮瑕。',
      texture: concealer?.finish || '薄层遮瑕质地',
      colorDirection: '眼下通常可比底妆亮半级，但仍需在自然光下确认。',
      primaryProductId: concealer?.id || null,
      alternativeProductIds: candidates.filter(({ product }) => product.category === '遮瑕' && product.id !== concealer?.id).slice(0, 2).map(({ product }) => product.id),
      reasons: concealer ? unique(['候选通过硬条件筛选', ...concealerReasons]).slice(0, 5) : [noProduct],
      cautions: concealer?.cautions?.slice(0, 2) || ['敏感或不适部位不要强行遮盖。'],
    },
    {
      id: 'set',
      category: '定妆',
      goal: '在需要的位置增加稳定度，而不是把全脸压成同一种质感',
      technique: powder ? '用少量散粉按压 T 区、鼻翼或容易移位的位置，干燥处少量或跳过。' : '使用现有定妆方式少量按压，先观察妆面变化。',
      texture: powder?.finish || '轻薄粉体',
      colorDirection: '透明或接近肤色的方向，避免过量造成泛白。',
      primaryProductId: powder?.id || null,
      alternativeProductIds: candidates.filter(({ product }) => product.category === '散粉' && product.id !== powder?.id).slice(0, 2).map(({ product }) => product.id),
      reasons: powder ? unique(['根据带妆时长和场景评分', ...powderReasons]).slice(0, 5) : [noProduct],
      cautions: powder?.cautions?.slice(0, 2) || ['干皮或局部起皮时不要全脸反复叠粉。'],
    },
    {
      id: 'eyes-brows',
      category: '眉眼',
      goal: '建立轮廓，但保留适合日常的轻重关系',
      technique: request.style.includes('浓') || request.style.includes('氛围') ? '眉尾和眼尾逐步加深，边缘用刷具晕开；先完成一侧再对照。' : '用贴近眉毛和睫毛根部的颜色轻轻填补空隙，眼尾只加一点深度。',
      texture: eyeProduct?.finish || '细粉或柔滑笔触',
      colorDirection: colorDirection(profile, request),
      primaryProductId: eyeProduct?.id || null,
      alternativeProductIds: candidates.filter(({ product }) => EYE_CATEGORIES.has(product.category) && product.id !== eyeProduct?.id).slice(0, 2).map(({ product }) => product.id),
      reasons: eyeProduct
        ? unique(['候选通过预算、排除品牌等硬条件；眉形与眼影颜色仍需用户自行纠正', ...(selection.candidateEvidence.find((item) => item.productId === eyeProduct.id)?.matchedConditions || [])]).slice(0, 5)
        : ['当前没有已核验的眉妆、眼影、睫毛膏或眼线站内产品，只提供方法与颜色方向。'],
      cautions: eyeProduct?.cautions?.slice(0, 2) || ['眼周出现刺痛、红肿或不适时立即停止使用。'],
    },
    {
      id: 'cheeks',
      category: '腮红',
      goal: '把气色放在面部结构需要的位置',
      technique: '微笑后从颧骨高点向外上方少量晕开，先轻后重，避免一开始集中在鼻翼附近。',
      texture: '粉状或膏状均可，优先选择容易少量叠加的质地',
      colorDirection: colorDirection(profile, request),
      primaryProductId: firstProduct(candidates, (product) => product.category === '腮红')?.id || null,
      alternativeProductIds: candidates.filter(({ product }) => product.category === '腮红').slice(1, 3).map(({ product }) => product.id),
      reasons: firstProduct(candidates, (product) => product.category === '腮红')
        ? ['站内记录已通过官网名称、品类、色号和参考价格核验；颜色仍受光线影响。']
        : ['当前产品库暂无已核验腮红产品，只提供可纠正的手法与颜色方向。'],
      cautions: firstProduct(candidates, (product) => product.category === '腮红')?.cautions?.slice(0, 2) || ['颜色方向受光线影响明显，完成后请在自然光下复核。'],
    },
    {
      id: 'lips',
      category: '唇妆',
      goal: '让整体色彩完成闭环',
      technique: '先薄涂一层确认边界，再决定是否叠加；需要更自然时用指腹轻拍边缘。',
      texture: '根据场景选择润泽或柔雾质地',
      colorDirection: colorDirection(profile, request),
      primaryProductId: firstProduct(candidates, (product) => product.category === '唇妆')?.id || null,
      alternativeProductIds: candidates.filter(({ product }) => product.category === '唇妆').slice(1, 3).map(({ product }) => product.id),
      reasons: firstProduct(candidates, (product) => product.category === '唇妆')
        ? ['站内记录已通过官网名称、品类、色号和参考价格核验；色彩仍需结合唇色复核。']
        : ['当前产品库暂无已核验唇妆产品，不输出具体商品或价格。'],
      cautions: firstProduct(candidates, (product) => product.category === '唇妆')?.cautions?.slice(0, 2) || ['唇部干燥、破损或不适时先暂停使用相关产品。'],
    },
  ]
}

function buildLocalPlan(selection, fallbackReason = '当前使用本地规则模板，没有调用第三方模型。', now = new Date()) {
  const { userProfile, makeupRequest, candidates, candidateEvidence } = selection
  const steps = buildSteps(selection)
  const recommendedProductIds = unique([
    ...steps.map((step) => step.primaryProductId),
    ...candidates.slice(0, 3).map(({ product }) => product.id),
  ]).slice(0, 6)
  const limitations = [
    fallbackReason,
    '部分站内产品的价格、评分、外部事实或图片授权仍待核验；带有官网来源的新增彩妆也不等于已获得素材再利用授权。',
    '不上传照片也可以完成本方案；本阶段没有进行人脸分析或医疗判断。',
  ]
  if (makeupRequest.weatherEnabled) limitations.push('已开启天气选项，但本次没有提供天气上下文，未将实时天气因素写入方案。')

  return makeupPlanSchema.parse({
    id: `plan-${Date.now().toString(36)}`,
    title: `${makeupRequest.scene}${makeupRequest.style}妆容方案`,
    summary: `根据${userProfile.skinType === 'unknown' ? '当前自述条件' : userProfile.skinType}、${makeupRequest.scene}和${makeupRequest.style}偏好，先用少量底妆建立均匀度，再按需要局部遮瑕、定妆和补足眉眼腮红唇色。`,
    inputsSnapshot: { userProfile, makeupRequest },
    weatherAdjustment: makeupRequest.weatherEnabled ? '未取得实时天气，暂不调整配方或持妆建议。' : '用户未启用天气调整。',
    steps,
    recommendedProductIds,
    candidateEvidence,
    confidence: candidates.length ? 0.72 : 0.42,
    limitations,
    sourceMode: 'local',
    createdAt: now.toISOString(),
    schemaVersion: 'makeup-plan.v1',
  })
}

const modelDraftSchema = makeupPlanSchema.pick({
  title: true,
  summary: true,
  weatherAdjustment: true,
  steps: true,
  recommendedProductIds: true,
  confidence: true,
  limitations: true,
})

function extractJson(raw) {
  const text = String(raw || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  try {
    return JSON.parse(text)
  } catch {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start < 0 || end <= start) return null
    try { return JSON.parse(text.slice(start, end + 1)) } catch { return null }
  }
}

function productDigest(candidates) {
  return candidates.slice(0, 12).map(({ product, evidence }) => ({
    id: product.id,
    brand: product.brand,
    name: product.name,
    category: product.category,
    finish: product.finish,
    price: product.price,
    skins: product.skins,
    scenes: product.scenes,
    evidence,
  }))
}

function buildPlanPrompt(selection) {
  return `你是 YasPretty 的结构化妆容方案编排器。只返回一个 JSON 对象，不要 Markdown，不要解释。
规则：
1. 只能使用候选清单中的 product id；不得创造产品、价格、色号、来源或功效事实。
2. 用户的肤质、预算、妆效偏好和排除品牌是硬条件，不能越过。
3. 方案必须包含妆前、底妆、局部遮瑕、定妆、眉眼、腮红、唇妆 7 个步骤；没有对应站内产品时 primaryProductId 必须为 null，只写手法和颜色方向。
4. 不做医疗诊断、敏感属性推断或绝对化承诺；使用“建议”“先试”“受光线影响”等表达。
5. 不要把编辑示例评分写成真实用户统计。

用户画像：${JSON.stringify(selection.userProfile)}
妆容需求：${JSON.stringify(selection.makeupRequest)}
候选产品和确定性 evidence：${JSON.stringify(productDigest(selection.candidates))}

JSON 必须包含：title、summary、weatherAdjustment、steps、recommendedProductIds、confidence、limitations。每个 step 必须包含 id、category、goal、technique、texture、colorDirection、primaryProductId、alternativeProductIds、reasons、cautions。`
}

function validateModelDraft(draft, selection, products) {
  const parsed = modelDraftSchema.safeParse(draft)
  if (!parsed.success) return null
  const allowed = new Set(selection.candidates.map(({ product }) => product.id))
  const ids = [
    ...parsed.data.recommendedProductIds,
    ...parsed.data.steps.flatMap((step) => [step.primaryProductId, ...step.alternativeProductIds]),
  ].filter(Boolean)
  if (ids.some((id) => !allowed.has(id) || !products.some((product) => product.id === id))) return null
  return parsed.data
}

function createAssistantPlan(draft, selection, now) {
  const plan = makeupPlanSchema.parse({
    ...draft,
    id: `plan-${Date.now().toString(36)}`,
    inputsSnapshot: { userProfile: selection.userProfile, makeupRequest: selection.makeupRequest },
    candidateEvidence: selection.candidateEvidence,
    sourceMode: 'model',
    createdAt: now.toISOString(),
    schemaVersion: 'makeup-plan.v1',
  })
  return plan
}

function createMakeupPlanService({ zhipuProvider, products, clock = () => new Date() }) {
  return {
    async create(input) {
      const selection = selectCandidates(input.userProfile, input.makeupRequest, products)
      if (!zhipuProvider?.configured) return buildLocalPlan(selection)

      try {
        const prompt = buildPlanPrompt(selection)
        let draft = validateModelDraft(extractJson(await zhipuProvider.chat([{ role: 'system', content: prompt }])), selection, products)
        if (!draft) {
          const repair = await zhipuProvider.chat([
            { role: 'system', content: `${prompt}\n上一次输出无法通过 schema。请只修复 JSON 结构和候选 product id，仍然只返回 JSON。` },
          ])
          draft = validateModelDraft(extractJson(repair), selection, products)
        }
        if (draft) return createAssistantPlan(draft, selection, clock())
      } catch {
        // Provider errors intentionally degrade to the deterministic local plan.
      }
      return buildLocalPlan(selection, '结构化模型输出不可用，已回退到本地规则模板。', clock())
    },
  }
}

module.exports = {
  buildLocalPlan,
  buildPlanPrompt,
  createMakeupPlanService,
  selectCandidates,
}
