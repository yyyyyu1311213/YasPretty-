const FLOW_ID = 'xiaoy-guided-intake-v1'
const MAX_INITIAL_QUERY = 1000
const { isBeginnerRequest, isBeginnerQuestion, wantsDirectAnswer, goalFromText, beginnerNext, advanceBeginner } = require('./beginner-guidance.cjs')

const option = (label, value) => ({ label, value })
const routeOptions = [
  option('自然修饰', 'natural_refinement'),
  option('日常彩妆', 'daily_makeup'),
  option('按需求搭配、不区分性别', 'neutral_makeup'),
  option('先按原问题直接回答', 'route-direct'),
]

// Older clients may still submit the pre-v2 route values. Accept them at the
// boundary, then keep all new decisions on the answer-first route vocabulary.
const canonicalRouteSelection = (value) => ({
  'route-men': 'natural_refinement',
  'route-women': 'daily_makeup',
  'route-general': 'neutral_makeup',
}[value] || value)

function makeQuestion(step, route, selections, options, initialQuery = '') {
  return {
    flowId: FLOW_ID,
    step,
    route,
    selections,
    options,
    ...(initialQuery ? { initialQuery: String(initialQuery).slice(0, MAX_INITIAL_QUERY) } : {}),
  }
}

function normalizedText(value) {
  return String(value || '').normalize('NFKC').toLowerCase().replace(/[\s，。！？、；：,.!?;:]/g, '')
}

function isFreshConversation(messages = []) {
  const visibleWelcomeOnly = messages.length === 1
    && messages[0].role === 'assistant'
    && String(messages[0].content || '').includes('先用一句话告诉我你想解决什么')
  const previous = messages.filter((message) => message.role === 'user' || message.id !== 'welcome')
  return visibleWelcomeOnly || messages.some((message) => message.id === 'welcome') && previous.length === 0
}

function shouldBeginGuidedIntake(query, messages = [], intent = '') {
  const text = normalizedText(query)
  if (!text || !isFreshConversation(messages)) return false
  if (['unsupported_sensitive', 'external_research', 'product_fact', 'product_comparison', 'makeup_plan', 'plan_adjustment', 'greeting_help'].includes(intent)) return false
  if (/^(你好|嗨|hello|hi|在吗)$/.test(text)) return false
  if (/天气|气温|下雨|最新|新闻|促销|多少钱|价格|成分|规格|保质期|上市|官网/.test(text)) return false
  // Ordinary product and knowledge questions are answered first. A vague
  // beginner request still needs one small, request-scoped choice to produce a
  // useful lesson, so it may enter the bounded intake without asking identity.
  return (isBeginnerRequest(text) || Boolean(goalFromText(text)))
    && !isBaseMakeupRecommendation(text)
}

function summarizeRequest(query) {
  const summary = String(query || '').replace(/\s+/g, ' ').trim()
  return summary.length > 72 ? `${summary.slice(0, 72)}…` : summary
}

function isBaseMakeupRecommendation(query) {
  return /推荐|选什么|怎么选|想买|想选|想做|打算做|准备做|找.*(?:粉底|底妆|素颜霜|气垫)/.test(query)
    && /底妆|粉底|气垫|素颜霜/.test(query)
}

function skinResult(initialQuery, route, selections, skin) {
  return { kind: isBaseMakeupRecommendation(initialQuery) ? 'continue' : 'skin-knowledge',
    query: initialQuery, route, selections, summary: skin.summary, requestConditions: { skin },
    promptContext: `${promptContext(route, selections)}；本次肤质仅依据日常自述，肤质暂不确定时不使用保存画像的肤质条件，不再追问。` }
}

function askSkin(initialQuery, route, selections, step, need = 'oil') {
  return { kind: 'ask', answer: need === 'cheeks'
    ? '两颊平时会紧绷、干燥或起皮吗？'
    : `${isBaseMakeupRecommendation(initialQuery) ? `我们继续选${/气垫/.test(initialQuery) ? '气垫' : '底妆'}。` : ''}没关系，不用先给自己贴标签。平时到下午，你脸上通常哪里容易出油？`,
    question: skinTypeQuestion(route, selections, initialQuery, step, need) }
}

function beginGuidedIntake(query, messages = [], intent = '') {
  if (!shouldBeginGuidedIntake(query, messages, intent)) return null
  const initialQuery = String(query).trim().slice(0, MAX_INITIAL_QUERY)
  const summary = summarizeRequest(initialQuery)
  return {
    kind: 'ask',
    answer: `收到，你刚才提到「${summary}」。我会结合这条需求继续，不需要重复描述。先选一种希望的建议路线：`,
    question: makeQuestion(1, null, [], routeOptions, initialQuery),
  }
}

function matchOption(query, question) {
  const text = normalizedText(query)
  const exact = question.options.find((item) => text === normalizedText(item.value) || text === normalizedText(item.label))
  if (exact) return exact.value

  if (question.step === 1) {
    if (text === 'route-men') return 'route-men'
    if (text === 'route-women') return 'route-women'
    if (text === 'route-general') return 'route-general'
    if (/跳过/.test(text)) return 'route-direct'
    if (/不知道|不清楚|不确定|随便|按需求|不区分|都可以/.test(text)) return 'route-general'
    if (/男生|男士|男性|男妆|男生日常/.test(text)) return 'route-men'
    if (/女生|女士|女性|女生日常/.test(text)) return 'route-women'
    if (/不区分性别|不想说性别|按需求/.test(text)) return 'route-general'
    if (/原问题|直接回答|直接提问|直接问/.test(text)) return 'route-direct'
    if (/自然修饰|natural_refinement/.test(text)) return 'natural_refinement'
    if (/日常彩妆|daily_makeup/.test(text)) return 'daily_makeup'
    if (/不区分性别|按需求/.test(text)) return 'neutral_makeup'
    if (/完整妆容|全妆|妆容方案|做一套妆/.test(text)) return 'route-plan'
    if (/肤质|肤色|色调|底妆|色号/.test(text)) return 'route-skin'
    if (/其他问题/.test(text)) return 'route-direct'
    return null
  }

  if (/不确定|不知道|说不清|跳过|都不清楚|还不清楚|先按原问题/.test(text)) {
    return question.options.find((item) => /unknown|skip/.test(item.value))?.value || question.options.at(-1)?.value
  }
  if (/偏亮|更亮|比脖子白/.test(text)) return 'tone-brighter'
  if (/接近|差不多|一致/.test(text)) return 'tone-close'
  if (/偏深|更深|比脖子深/.test(text)) return 'tone-deeper'
  if (/偏粉|偏冷|冷调/.test(text)) return 'undertone-cool'
  if (/偏黄|偏暖|暖调/.test(text)) return 'undertone-warm'
  if (/中性/.test(text)) return 'undertone-neutral'
  if (/自然|不明显|淡/.test(text)) return 'finish-natural'
  if (/柔和|温和|整洁/.test(text)) return 'finish-soft'
  if (/清晰|立体|明显/.test(text)) return 'finish-defined'
  if (/两分钟|很快|赶时间/.test(text)) return 'tempo-quick'
  if (/五分钟|5分钟|几分钟/.test(text)) return 'tempo-five'
  if (/眉|眉毛/.test(text)) return 'focus-men-brow'
  if (/修容|轮廓/.test(text)) return 'focus-men-contour'
  if (/素颜霜|底妆|肤色修饰/.test(text)) return 'focus-men-base'
  if (/整套|整体|快速|全流程/.test(text)) return 'focus-men-routine'
  if (/通勤|上班/.test(text)) return 'scene-commute'
  if (/约会|聚会/.test(text)) return 'scene-date'
  if (/拍照|视频|镜头/.test(text)) return 'scene-photo'
  if (/面试|答辩|正式/.test(text)) return 'scene-formal'
  return null
}

function needFromRequest(query) {
  const text = String(query || '')
  if (/肤质|皮肤类型/.test(text) && /不清楚|不知道|不确定|说不清|怎么(?:判断|分辨|看)|(?:推荐|想(?:买|选|找)|怎么选).*(?:粉底|气垫|底妆|素颜霜)/.test(text)) return 'skin-type'
  if (/肤色|明暗|深浅|色号/.test(text) && /不清楚|不知道|不确定|说不清|没试过|怎么(?:判断|选|看)/.test(text)) return 'shade-depth'
  if (/冷暖|底调|色调/.test(text) && /不清楚|不知道|不确定|说不清|没试过|怎么(?:判断|看)/.test(text)) return 'undertone'
  return null
}

function multipleUncertainNeeds(query) {
  const text = String(query || '')
  if (!/不清楚|不知道|不确定|说不清|没试过/.test(text)) return []
  return [
    /肤质|皮肤类型/.test(text) && 'focus-skin-type',
    /肤色|明暗|深浅|色号/.test(text) && 'focus-shade-depth',
    /冷暖|底调|色调/.test(text) && 'focus-undertone',
  ].filter(Boolean)
}

function skinTypeQuestion(route, selections, initialQuery, step = 2, need = 'oil') {
  if (need === 'cheeks') return makeQuestion(step, route, selections, [
    option('经常会', 'cheek-often'), option('偶尔会', 'cheek-sometimes'),
    option('基本不会', 'cheek-never'), option('说不清', 'cheek-unknown'),
  ], initialQuery)
  return makeQuestion(step, route, selections, [
    option('全脸都容易油', 'skin-oily'),
    option('主要是额头和鼻子', 'skin-zone'),
    option('不太出油', 'skin-low-oil'),
    option('没注意过，换个问法', 'skin-unknown'),
  ], initialQuery)
}

function needQuestion(need, route, selections, initialQuery, step = 2) {
  if (need === 'skin-type') return skinTypeQuestion(route, selections, initialQuery, step)
  if (need === 'shade-depth') return makeQuestion(step, route, selections, [
    option('以往试色常觉得偏亮', 'tone-brighter'),
    option('大致接近颈部', 'tone-close'),
    option('以往试色常觉得偏深', 'tone-deeper'),
    option('没试过或不确定', 'tone-unknown'),
  ], initialQuery)
  return makeQuestion(step, route, selections, [
    option('偏粉或偏冷更协调', 'undertone-cool'),
    option('偏黄或偏暖更协调', 'undertone-warm'),
    option('两边都可以', 'undertone-neutral'),
    option('没有把握，先跳过', 'undertone-unknown'),
  ], initialQuery)
}

function focusQuestion(route, selections, initialQuery) {
  return makeQuestion(2, route, selections, [
    option('素颜霜/底妆的自然度', 'focus-men-base'),
    option('眉毛整理与眉形', 'focus-men-brow'),
    option('轻修容与轮廓', 'focus-men-contour'),
    option('快速日常自然流程', 'focus-men-routine'),
    option('按原问题直接回答', 'focus-skip'),
  ], initialQuery)
}

function complexionFocusQuestion(route, selections, initialQuery) {
  return makeQuestion(2, route, selections, [
    option('先了解自己的日常肤质', 'focus-skin-type'),
    option('先看肤色明暗/底妆深浅', 'focus-shade-depth'),
    option('先看冷暖色调倾向', 'focus-undertone'),
    option('先按原问题直接回答', 'focus-skip'),
  ], initialQuery)
}

function detailQuestion(route, selections, initialQuery, focus) {
  if (focus === 'focus-men-base') return skinTypeQuestion(route, selections, initialQuery, 3)
  if (focus === 'focus-skin-type') return needQuestion('skin-type', route, selections, initialQuery, 3)
  if (focus === 'focus-shade-depth') return needQuestion('shade-depth', route, selections, initialQuery, 3)
  if (focus === 'focus-undertone') return needQuestion('undertone', route, selections, initialQuery, 3)
  if (focus === 'focus-men-routine') return makeQuestion(3, route, selections, [
    option('尽量两分钟内', 'tempo-quick'), option('五分钟左右', 'tempo-five'), option('时间不固定', 'tempo-flexible'),
  ], initialQuery)
  return makeQuestion(3, route, selections, [
    option('尽量自然、不明显', 'finish-natural'), option('眉形更整洁', 'finish-soft'),
    option('轮廓更清晰', 'finish-defined'), option('还不确定，先给基础方向', 'finish-unknown'),
  ], initialQuery)
}

function routeName(route) {
  return route === 'men' || route === 'natural_refinement' ? '自然修饰'
    : route === 'women' || route === 'daily_makeup' ? '日常彩妆'
      : '按需求搭配、不区分性别'
}

function selectedCondition(value) {
  const labels = {
    'skin-oily': '用户自述全脸容易出油', 'skin-combination': '用户自述T区油、两颊偏干',
    'skin-dry': '用户自述洗脸后常紧绷或起皮', 'skin-sensitive': '用户自述容易刺痛或泛红',
    'skin-unknown': '用户暂不确定肤质，不据此筛定适配肤质',
    'tone-brighter': '以往试色常觉得偏亮', 'tone-close': '以往试色大致接近颈部',
    'tone-deeper': '以往试色常觉得偏深', 'tone-unknown': '底妆明暗暂不确定',
    'undertone-cool': '用户自述偏冷倾向', 'undertone-warm': '用户自述偏暖倾向',
    'undertone-neutral': '用户自述中性倾向', 'undertone-unknown': '冷暖倾向暂不确定',
    'finish-natural': '偏好自然、不明显', 'finish-soft': '偏好柔和、整洁',
    'finish-defined': '偏好更清晰的轮廓', 'finish-unknown': '妆效偏好暂不确定',
    'tempo-quick': '时间尽量短', 'tempo-five': '约五分钟', 'tempo-flexible': '时间不固定',
    'scene-commute': '通勤场景', 'scene-date': '约会或聚会场景', 'scene-photo': '拍照或视频场景',
    'scene-formal': '面试、答辩或正式场景',
  }
  return labels[value] || value
}

function focusLabel(focus) {
  return ({
    'focus-men-base': '素颜霜或底妆', 'focus-men-brow': '眉毛整理与眉形',
    'focus-men-contour': '轻修容与面部明暗', 'focus-men-routine': '快速日常自然流程',
    'focus-skin-type': '自述肤质', 'focus-shade-depth': '肤色明暗/底妆深浅', 'focus-undertone': '冷暖色调倾向',
  })[focus] || ''
}

function promptContext(route, selections) {
  const focus = selections[1]
  const detail = selections[2]
  const parts = [`用户本次主动选择的建议路线：${routeName(route)}`]
  if (focusLabel(focus)) parts.push(`关注重点：${focusLabel(focus)}`)
  if (detail) parts.push(`用户补充：${selectedCondition(detail)}`)
  parts.push('这是本次请求的妆容方向偏好，不代表身份判断，也不写入长期画像；只依据用户实际自述。')
  return parts.join('；')
}

function guidedQuery(initialQuery, route, selections) {
  const focus = selections[1]
  const detail = selections[2]
  const routeContext = `用户主动选择${routeName(route)}路线。`
  if (focus === 'focus-men-brow') return `${routeContext}用户原始需求：${initialQuery}。眉毛整理、眉形与眉眼关系教程。`
  if (focus === 'focus-men-contour') return `${routeContext}用户原始需求：${initialQuery}。轻修容与面部明暗晕染教程。`
  if (focus === 'focus-men-base') return `${routeContext}用户原始需求：${initialQuery}。素颜霜或底妆选择。${detail ? selectedCondition(detail) : ''}`
  if (focus === 'focus-men-routine') return `${routeContext}用户原始需求：${initialQuery}。快速日常自然妆容方案。${detail ? selectedCondition(detail) : ''}`
  if (focus === 'focus-skin-type') return `${routeContext}用户原始需求：${initialQuery}。肤质自述与日常观察。${detail ? selectedCondition(detail) : ''}`
  if (focus === 'focus-shade-depth') return `${routeContext}用户原始需求：${initialQuery}。底妆明度、色号初筛和自然光试色。${detail ? selectedCondition(detail) : ''}`
  if (focus === 'focus-undertone') return `${routeContext}用户原始需求：${initialQuery}。底妆冷暖色调初筛与试色。${detail ? selectedCondition(detail) : ''}`
  const condition = detail || focus
  return `${routeContext}用户原始需求：${initialQuery}。${condition ? selectedCondition(condition) : ''}`
}

function answerKind(route, selections) {
  const focus = selections[1]
  if (focus === 'focus-men-brow' || focus === 'focus-men-contour') return 'knowledge'
  if (focus === 'focus-men-routine' || route === 'plan') return 'plan'
  if (focus === 'focus-skin-type' || focus === 'focus-shade-depth' || focus === 'focus-undertone') return 'knowledge'
  if (['skin-oily', 'skin-combination', 'skin-dry', 'skin-sensitive', 'skin-unknown', 'tone-brighter', 'tone-close', 'tone-deeper', 'tone-unknown', 'undertone-cool', 'undertone-warm', 'undertone-neutral', 'undertone-unknown'].includes(focus)) return 'knowledge'
  return 'continue'
}

function legacyQuestion(route, selections, initialQuery) {
  const focus = selections[1]
  if (route === 'skin') {
    if (focus === 'focus-skin-type') return skinTypeQuestion(route, selections, initialQuery, 3)
    if (focus === 'focus-shade-depth') return makeQuestion(3, route, selections, [
      option('以前试色常觉得偏亮', 'tone-brighter'), option('大致接近颈部', 'tone-close'),
      option('常觉得偏深', 'tone-deeper'), option('没试过/不确定', 'tone-unknown'),
    ], initialQuery)
    return needQuestion('undertone', route, selections, initialQuery)
  }
  if (route === 'plan') return makeQuestion(3, route, selections, [
    option('自然轻透', 'style-natural'), option('柔和、有气色', 'style-soft'),
    option('妆感更明显', 'style-defined'), option('还不确定', 'style-unknown'),
  ], initialQuery)
  return detailQuestion(route, selections, initialQuery, focus)
}

async function advanceGuidedIntakeCore(query, messages = [], profile = {}) {
  const { assessSkin, readSkinObservation, observationFromChoice, asksSkinGuidance, isSkinUncertain, isSkinSkip,
    isSkinQuestion, skinConversationContext, leavesSkinGuidance, advanceSkinObservation, skinQuestionSpec, SKIN_GUIDANCE_MAX_ROUNDS } = await import('../../../src/features/assistant/skinObservation.js')
  const last = messages.at(-1)
  const current = last?.role === 'assistant' ? last.question : null
  // Goal replies belong to the pending request, including a freely typed new focus.
  const beginner = advanceBeginner(current, query, makeQuestion)
  if (beginner) return beginner
  if (leavesSkinGuidance(query)) return null
  const context = skinConversationContext(messages)
  const initial = context?.initialQuery || query
  const observation = readSkinObservation(query)
  const hasObservation = Object.keys(observation).length > 0
  const readCurrentSkin = (text) => (current?.updates || []).reduce((value, update) => readSkinObservation(update, value), readSkinObservation(text))
  const finishSkin = (original, route, selections, value, skipped = false) => skinResult(original, route || 'general', selections, assessSkin(value, skipped))
  const startSkin = (original, route, selections, step) => {
    const value = readCurrentSkin(original)
    const assessment = assessSkin(value)
    if (!assessment.need || step > SKIN_GUIDANCE_MAX_ROUNDS) return skinResult(original, route || 'general', selections, assessment)
    const spec = skinQuestionSpec(assessment.need)
    return { kind: 'ask', answer: assessment.need === 'oil' ? askSkin(original, route, selections, step).answer : spec.answer,
      question: makeQuestion(step, route || 'general', selections, spec.options, original) }
  }

  // Consume a whole skin answer before general intent routing or compound splitting.
  if (isSkinQuestion(current)) {
    const progress = advanceSkinObservation(current, query)
    if (!progress) return null
    if (progress.question) return { kind: 'ask', answer: progress.answer, question: progress.question }
    return skinResult(progress.initialQuery, current.route || 'general', progress.selections, progress.assessment)
  }

  const help = /^(?:你)?帮我看看(?:吧)?[。？?！!]*$/.test(query)
  const skinReply = context && (context.askingSkin || context.baseSelection || asksSkinGuidance(initial))
    && !wantsDirectAnswer(query)
    && (asksSkinGuidance(query) || isSkinUncertain(query) || isSkinSkip(query) || hasObservation || help)
  if (skinReply) {
    const original = hasObservation ? `${initial}；${query}`.slice(0, MAX_INITIAL_QUERY) : initial
    if (isSkinSkip(query)) return finishSkin(`${initial}；${query}`.slice(0, MAX_INITIAL_QUERY), current?.route, current?.selections || [], readSkinObservation(initial), true)
    return startSkin(original, current?.route, current?.selections || [], current ? current.step + 1 : 1)
  }
  if (!current && !(isFreshConversation(messages) && isBaseMakeupRecommendation(query))
    && (asksSkinGuidance(query) || hasObservation && !isBaseMakeupRecommendation(query) && !observation.explicit)) {
    return startSkin(query, 'general', [], 1)
  }
  if (current?.flowId !== FLOW_ID || current.step < 1 || current.step > 3) return null
  const originalQuery = current.initialQuery || messages.find((message) => message.role === 'user')?.content || ''
  if (wantsDirectAnswer(query)) {
    if (!isBaseMakeupRecommendation(originalQuery) && (isBeginnerRequest(originalQuery) || goalFromText(originalQuery) && !/素颜霜|修容|轮廓/.test(originalQuery))) {
      return beginnerNext({ ...current, initialQuery: originalQuery, direct: true }, makeQuestion)
    }
    const kind = answerKind(current.route, current.selections || [])
    return { kind, route: current.route || 'general', selections: current.selections || [], query: originalQuery,
      knowledgeQuery: guidedQuery(originalQuery, current.route, current.selections || []), stopGuidance: true,
      promptContext: `${promptContext(current.route, current.selections || [])}；用户要求按已有信息直接回答，不再提问。` }
  }
  const matched = matchOption(query, current)
  const selected = canonicalRouteSelection(matched)
  if (!selected || !current.options.some((item) => canonicalRouteSelection(item.value) === selected)) {
    if (current.step === 1 && isBeginnerRequest(originalQuery) && /预算|分钟|慢慢学|皮|妆效|面试|通勤/.test(query)) {
      return beginnerNext({ initialQuery: originalQuery, route: 'general', selections: ['neutral_makeup'], updates: [query.slice(0, 1000)] }, makeQuestion)
    }
    return null
  }

  const initialQuery = current.initialQuery || messages.find((message) => message.role === 'user')?.content || ''
  if (current.step === 1) {
    if (selected === 'route-direct') return isBeginnerRequest(initialQuery)
      ? beginnerNext({ initialQuery, direct: true }, makeQuestion)
      : { kind: 'continue', query: initialQuery, stopGuidance: true, promptContext: '用户选择直接按原问题回答，不再追问。' }
    const route = selected === 'natural_refinement' ? 'men'
      : selected === 'daily_makeup' ? 'women'
        : selected === 'neutral_makeup' ? 'general'
          : selected === 'route-skin' ? 'skin'
            : selected === 'route-plan' ? 'plan' : null
    if (!route) return null

    // Every route can continue a beginner request. A known goal skips goal selection.
    if ((isBeginnerRequest(initialQuery) || goalFromText(initialQuery)) && !isBaseMakeupRecommendation(initialQuery)
      && !needFromRequest(initialQuery) && !asksSkinGuidance(initialQuery) && !/素颜霜|修容|轮廓/.test(initialQuery)) {
      return beginnerNext({ initialQuery, route, selections: [selected], updates: current.updates || [] }, makeQuestion)
    }

    const originalObservation = readCurrentSkin(initialQuery)
    const assessment = assessSkin(originalObservation)
    const alreadyDescribedSkin = assessment.values.length || assessment.kind === 'balanced' || originalObservation.conflicting
    const multipleNeeds = multipleUncertainNeeds(initialQuery).filter((need) => need !== 'focus-skin-type' || !alreadyDescribedSkin)
    if (multipleNeeds.length > 1) {
      return { kind: 'ask', answer: `收到，按你选的${routeName(route)}路线，我会接着处理「${summarizeRequest(initialQuery)}」。先选一个最想弄清楚的方面：`,
        question: complexionFocusQuestion(route, [selected], initialQuery) }
    }

    const need = needFromRequest(initialQuery)
    if (alreadyDescribedSkin && isBaseMakeupRecommendation(initialQuery)) {
      if (assessment.need) return startSkin(initialQuery, route, [selected], 2)
      return skinResult(initialQuery, route, [selected], assessment)
    }
    if (need && !(need === 'skin-type' && alreadyDescribedSkin)) {
      if (need === 'skin-type') return startSkin(initialQuery, route, [selected], 2)
      const question = needQuestion(need, route, [selected], initialQuery)
      return { kind: 'ask', answer: `收到，按你选的${routeName(route)}路线，我会继续围绕「${summarizeRequest(initialQuery)}」。再选一个你目前能确认的情况；不确定可以跳过。`, question }
    }

    if (isBaseMakeupRecommendation(initialQuery) && !profile.skin && !alreadyDescribedSkin) {
      return startSkin(initialQuery, route, [selected], 2)
    }

    if (route === 'men' && /推荐|购买|想买|想找|哪个产品|哪款/.test(initialQuery)
      && /眉笔|眉粉|眉胶|眉妆|修容/.test(initialQuery)) {
      return { kind: 'continue', route, selections: [selected], query: initialQuery, promptContext: promptContext(route, [selected]) }
    }

    if (route === 'men' && !/眉|修容|轮廓|素颜霜|底妆|肤质|肤色|色调|妆容方案|完整妆容/.test(initialQuery)) {
      return { kind: 'ask', answer: `收到，按你选的自然修饰路线，我会结合「${summarizeRequest(initialQuery)}」继续。你想先看哪一项？`,
        question: focusQuestion(route, [selected], initialQuery) }
    }

    if (route === 'men' && /眉|眉毛|眉形|修容|轮廓|阴影|高光/.test(initialQuery)) {
      const query = /眉|眉毛|眉形/.test(initialQuery)
        ? `${initialQuery} 眉毛怎么画、眉形与眉眼关系`
        : `${initialQuery} 修容与面部明暗立体感观感`
      return { kind: 'knowledge', route, selections: [selected], query: initialQuery, knowledgeQuery: query,
        promptContext: promptContext(route, [selected]) }
    }

    return { kind: 'continue', route, selections: [selected], query: initialQuery, promptContext: promptContext(route, [selected]) }
  }

  const selections = [...(current.selections || []), selected]
  if (current.step === 2) {
    if (current.route === 'men' && selected === 'focus-men-base' && !isBaseMakeupRecommendation(initialQuery)) {
      return { kind: 'knowledge', route: current.route, selections, query: initialQuery,
        knowledgeQuery: `${initialQuery} 底妆教程`, promptContext: promptContext(current.route, selections) }
    }
    const isLegacyFocus = current.route === 'skin' || current.route === 'plan'
    const isNeedChoice = /^(?:skin-|tone-|undertone-)/.test(selected)
    if (!isLegacyFocus && current.route === 'men' && selected === 'focus-men-base' && !profile.skin) {
      return startSkin(initialQuery, current.route, selections, 3)
    }
    if (isLegacyFocus) {
      const question = legacyQuestion(current.route, selections, initialQuery)
      return { kind: 'ask', answer: '收到。再补充一个最有帮助的信息；不清楚可以选“不确定”。', question }
    }
    if (['focus-skin-type', 'focus-shade-depth', 'focus-undertone'].includes(selected)) {
      const need = selected === 'focus-skin-type' ? 'skin-type' : selected === 'focus-shade-depth' ? 'shade-depth' : 'undertone'
      if (need === 'skin-type') return startSkin(initialQuery, current.route, selections, 3)
      return { kind: 'ask', answer: `收到，你想先了解${focusLabel(selected)}。再按日常感受选一个；没有把握可以跳过。`,
        question: needQuestion(need, current.route, selections, initialQuery, 3) }
    }
    if (isNeedChoice) {
      const baseRequest = isBaseMakeupRecommendation(initialQuery)
      if (baseRequest && /^skin-/.test(selected)) return finishSkin(initialQuery, current.route, selections, observationFromChoice(selected), selected === 'skin-unknown')
      return { kind: 'knowledge', route: current.route, selections, query: initialQuery,
        knowledgeQuery: guidedQuery(initialQuery, current.route, selections), promptContext: promptContext(current.route, selections) }
    }

    if (selected === 'focus-skip') return { kind: 'continue', route: current.route, selections, query: initialQuery, promptContext: promptContext(current.route, selections) }
    if (current.route === 'men' && selected === 'focus-men-base' && profile.skin) {
      return { kind: 'continue', route: current.route, selections, query: initialQuery, promptContext: promptContext(current.route, selections) }
    }
    if (selected === 'focus-men-base' && !profile.skin) {
      return startSkin(initialQuery, current.route, selections, 3)
    }
    const question = ['men', 'women', 'general'].includes(current.route)
      ? detailQuestion(current.route, selections, initialQuery, selected)
      : legacyQuestion(current.route, selections, initialQuery)
    return { kind: 'ask', answer: '收到，我按你选的重点继续。再补充一个最有帮助的信息；不清楚可以跳过。', question }
  }

  const baseRequest = isBaseMakeupRecommendation(initialQuery)
  if (selected === 'skin-unknown' && baseRequest) {
    return finishSkin(initialQuery, current.route, selections, {}, true)
  }

  const kind = answerKind(current.route, selections)
  return { kind, route: current.route, selections, query: initialQuery,
    knowledgeQuery: guidedQuery(initialQuery, current.route, selections), promptContext: promptContext(current.route, selections) }
}

async function advanceGuidedIntake(query, messages = [], profile = {}) {
  const last = messages.at(-1)
  const current = last?.role === 'assistant' && last.question?.flowId === FLOW_ID ? last.question : null
  if (!current || isBeginnerQuestion(current)) return advanceGuidedIntakeCore(query, messages, profile)
  const { leavesSkinGuidance } = await import('../../../src/features/assistant/skinObservation.js')
  if (leavesSkinGuidance(query)) return null
  const correction = !current.options.some(({ value, label }) => query === value || query === label)
    && /预算|(?:我是|肤质改为|更正为)(?:混油皮|混干皮|油皮|干皮)|(?:妆效|场景).*(?:改|换)|(?:改为|换成)(?:通勤|面试|约会|哑光|水光)|(?:不要|排除)\s*[\p{L}]/u.test(query)
  const updates = correction ? [...(current.updates || []), query.slice(0, 1000)].slice(-4) : current.updates || []
  const history = updates.length ? [...messages.slice(0, -1), { ...last, question: { ...current, updates } }] : messages
  const result = await advanceGuidedIntakeCore(query, history, profile)
  if (!result && correction) return { kind: 'ask', answer: `已更新本次条件。${current.step === 1 ? '接着选择希望的建议路线：' : last.content}`,
    question: { ...current, updates } }
  if (!result || !updates.length) return result
  if (result.question) result.question.updates = updates
  else {
    result.initialQuery = current.initialQuery
    result.updates = updates
    result.query = [result.query, ...updates].join('；').slice(0, 2000)
  }
  return result
}

module.exports = { FLOW_ID, advanceGuidedIntake, beginGuidedIntake, makeQuestion, shouldBeginGuidedIntake }
