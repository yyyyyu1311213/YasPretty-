const { knowledgeEntries, knowledgeSources, knowledgeEvidence } = require('../../knowledge/beauty-knowledge.cjs')

// Request goals, not identity or saved profile attributes. Reuses the intake question contract.
const goalOptions = [
  ['简单日常入门', 'goal-daily'], ['底妆怎么上', 'goal-base'], ['眉毛怎么画', 'goal-brow'],
  ['眼妆或唇妆', 'goal-eye-lip'], ['完整妆容', 'goal-full'], ['还没想好', 'goal-unknown'],
].map(([label, value]) => ({ label, value }))
const timeOptions = [
  ['5分钟以内', 'time-five'], ['10分钟左右', 'time-ten'], ['愿意慢慢学', 'time-learn'],
].map(([label, value]) => ({ label, value }))

const isBeginnerRequest = (text) => /(?:想|不会|不太会|学|入门|新手|零基础).*(?:化妆|妆容|自然修饰|日常彩妆)|(?:化妆|妆容).*(?:入门|新手|零基础)|^(?:男生|女生|男士|女士)?(?:怎么|如何)化妆[？?。！!]*$/.test(text)
const isBeginnerQuestion = (question) => question?.flowId === 'xiaoy-guided-intake-v1'
  && question.options?.some(({ value }) => /^(goal-|time-)/.test(value))
const wantsDirectAnswer = (text) => /先按原问题|直接(?:回答|推荐|给建议)|不用(?:再)?问了?|别(?:再)?继续问了?|先按这些条件回答|你先说结论|不清楚的地方你自己假设|换(?:个)?(?:话题|问题)|我想问的是|^(?:route-direct|focus-skip)$/.test(text)
const uncertain = (text) => /^(?:我)?(?:还|暂时|也)?(?:没想好|不知道|不清楚|不确定|随便|都可以|跳过|先跳过)[。！!？?]*$/.test(text.trim())
const purchase = (text) => /推荐|购买|想买|想选|想找|选什么|怎么选/.test(text) && /粉底|底妆|气垫|素颜霜|眉笔|眉粉|产品|口红/.test(text)

function goalFromText(text) {
  if (purchase(text)) return null
  if (/完整妆容|全妆|妆容方案|整套妆/.test(text)) return 'goal-full'
  if (/眉毛|眉形|眉妆/.test(text)) return 'goal-brow'
  if (/眼妆|唇妆|眼影|口红/.test(text)) return 'goal-eye-lip'
  if (/底妆|粉底|气垫/.test(text) && /上|涂|画|化|学/.test(text)) return 'goal-base'
  if (/简单日常|日常入门|日常|自然修饰|自然妆|面试|答辩|通勤|上班|约会|拍照/.test(text) && /妆|修饰|怎么化|如何化/.test(text)) return 'goal-daily'
  return null
}

function timeFromText(text) {
  const matches = [...String(text).matchAll(/(\d{1,2}|五|十|两|二)\s*分钟|慢慢学|时间不限/g)]
  const last = matches.at(-1)
  if (!last) return null
  if (!last[1]) return 'time-learn'
  const minutes = ({ 五: 5, 十: 10, 两: 2, 二: 2 })[last[1]] || Number(last[1])
  return minutes <= 5 ? 'time-five' : minutes <= 10 ? 'time-ten' : 'time-learn'
}

function beginnerNext({ initialQuery, route = 'general', selections = [], updates = [], step = 2, direct = false }, makeQuestion) {
  route ||= 'general'
  const query = [initialQuery, ...updates].join('；').slice(0, 2000)
  const goal = selections.findLast((value) => /^goal-/.test(value) && value !== 'goal-unknown')
    || goalFromText(query) || (direct ? 'goal-daily' : null)
  const time = selections.findLast((value) => /^time-/.test(value)) || timeFromText(query)
  const context = { query, initialQuery, route, selections, updates, stopGuidance: direct,
    promptContext: `本次选择${route === 'men' ? '自然修饰' : route === 'women' ? '日常彩妆' : '按需求搭配、不区分性别'}路线，保留原需求和已知条件；不推断身份。` }
  if (!goal && !direct && step <= 3) return { kind: 'ask', answer: '好，我们从一点开始。你现在最想学什么？',
    question: { ...makeQuestion(step, route, selections, goalOptions, initialQuery), ...(updates.length ? { updates } : {}) } }
  if (goal === 'goal-daily' && !time && !direct && step <= 3) return { kind: 'ask', answer: '每天大概愿意花多久？不确定也可以跳过，我会先给简单的练习。',
    question: { ...makeQuestion(step, route, selections, timeOptions, initialQuery), ...(updates.length ? { updates } : {}) } }
  if (goal === 'goal-full') return { ...context, kind: 'plan' }
  return { ...context, kind: 'beginner', goal: goal || 'goal-daily', time: time || 'time-five' }
}

function advanceBeginner(question, text, makeQuestion) {
  if (!isBeginnerQuestion(question)) return null
  if (/换(?:个)?(?:话题|问题)|我想问的是|不聊|天气|新闻|电脑|手机|比较|对比|推荐|想买|想选|怎么选|成分|多少钱/.test(text)) return null
  const option = question.options.find(({ value, label }) => value === text || label === text)
  const updates = option || uncertain(text) || wantsDirectAnswer(text) && !/预算|皮|妆效|面试|通勤/.test(text) ? question.updates || []
    : [...(question.updates || []), text.slice(0, 1000)].slice(-4)
  let selected = option?.value || goalFromText(text) || timeFromText(text)
  if (selected === 'goal-unknown' || uncertain(text) && question.options[0].value.startsWith('goal-')) selected = 'goal-daily'
  const selections = (question.selections || []).filter((value) => !selected || !value.startsWith(selected.split('-')[0] + '-'))
  if (selected) selections.push(selected)
  return beginnerNext({ ...question, selections, updates, step: question.step + 1,
    direct: wantsDirectAnswer(text) || uncertain(text) && question.options[0].value.startsWith('time-') }, makeQuestion)
}

function beginnerAnswer(guidance, conditions = {}) {
  const { goal, time, route, query } = guidance
  const ids = goal === 'goal-base' ? ['foundation-application-basics', 'concealer-and-foundation-order']
    : goal === 'goal-brow' ? ['mens-natural-brows']
      : goal === 'goal-eye-lip' ? ['quick-everyday-makeup', 'soft-glam-style-language']
        : ['quick-everyday-makeup', 'foundation-application-basics', 'mens-natural-brows',
          ...(time === 'time-five' ? [] : ['concealer-and-foundation-order']), ...(route === 'men' ? ['mens-natural-base'] : [])]
  const entries = ids.map((id) => knowledgeEntries.find((entry) => entry.id === id)).filter(Boolean)
  const technique = (id, index = 0) => entries.find((entry) => entry.id === id)?.techniques[index]
  let lead
  let steps
  if (goal === 'goal-base') {
    lead = '先练薄涂和边缘衔接，今天不用追求高遮盖。'
    steps = [technique('foundation-application-basics'), technique('concealer-and-foundation-order')]
  } else if (goal === 'goal-brow') {
    lead = '从保留原有眉毛开始，先梳理，再补真正的空隙。'
    steps = entries[0]?.techniques || []
  } else if (goal === 'goal-eye-lip') {
    lead = '先选眼部或唇色中的一个重点练习。现有资料能支持浓淡与边缘的方向，尚不足以给出完整眼线、眼影分区或唇形描画教程。'
    steps = [technique('quick-everyday-makeup'), technique('soft-glam-style-language')]
  } else {
    lead = time === 'time-five' ? '按5分钟以内的时间，先练两件事：薄底妆和眉毛整理；做完就可以停，不要求完成全妆。'
      : time === 'time-ten' ? '按10分钟左右安排：薄底妆、眉毛，再练局部遮瑕；先把边缘处理自然。'
        : '愿意慢慢学的话，把薄底妆、眉毛和局部遮瑕分开练；每次观察一个步骤的用量与边缘，再逐步组合。'
    steps = [technique('foundation-application-basics'), technique('mens-natural-brows'),
      ...(time === 'time-five' ? [] : [technique('mens-natural-brows', 1), technique('concealer-and-foundation-order')])]
    if (route === 'men') steps[0] += ` ${technique('mens-natural-base', 2)}`
  }
  const scene = conditions.scene || query.match(/面试|答辩|通勤|上班|约会|拍照/)?.[0]
  const constraints = [scene && `${scene}场景`, conditions.budget !== undefined && `预算${conditions.budget}元以内`,
    conditions.skin, conditions.skinLabel, conditions.finish,
    conditions.excludedBrands?.length && `排除${conditions.excludedBrands.join('、')}`].filter(Boolean)
  const limits = goal === 'goal-brow' ? entries[0]?.limitations || []
    : ['这些是通用手法，具体产品适配与颜色仍需结合实际试用；不需要为了开始练习先买齐产品。']
  const safety = [...new Set(entries.flatMap((entry) => entry.safetyBoundaries))]
  return { answer: `${constraints.length ? `结合你已说明的${constraints.join('、')}。\n\n` : ''}${lead}\n\n${steps.filter(Boolean).map((text, index) => `${index + 1}. ${text}`).join('\n\n')}\n\n${limits.join('')}${safety.length ? `\n\n${safety.join('')}` : ''}`,
    beginnerContext: { version: 1, initialQuery: guidance.initialQuery.slice(0, 1000), route: route || 'general', goal,
      time: timeFromText([guidance.initialQuery, ...(guidance.updates || [])].join('；'))
        || guidance.selections?.findLast((value) => value.startsWith('time-')) || (goal === 'goal-daily' ? time : null),
      updates: guidance.updates || [], conditions: conversationConditions(conditions), lastStep: goal.slice(5) },
    answerMode: 'knowledge', sources: knowledgeSources(entries), knowledgeEvidence: knowledgeEvidence(entries),
    knowledgeIds: entries.map(({ id }) => id), status: goal === 'goal-eye-lip' ? 'partial' : 'answered',
    missing: goal === 'goal-eye-lip' ? ['缺少完整眼线、眼影分区及唇形描画的受控步骤。'] : [] }
}

async function continueBeginner(query, messages) {
  const { beginnerFollowup, readBeginnerContext } = await import('../../../src/features/assistant/beginnerContext.js')
  const action = beginnerFollowup(query)
  const context = action && readBeginnerContext(messages)
  if (!context) return null
  const updates = action.type === 'correction' ? [...context.updates, query.slice(0, 1000)].slice(-4) : context.updates
  const step = action.type === 'correction' ? context.lastStep : action.step
    || ({ base: 'brow', brow: 'color', daily: 'color', 'eye-lip': 'finish', color: 'finish', finish: 'done', done: 'done' })[context.lastStep]
  return { kind: 'beginner-followup', initialQuery: context.initialQuery, updates,
    query: [context.initialQuery, ...updates].join('；').slice(0, 2000),
    route: context.route, goal: context.goal, time: timeFromText(query) || context.time,
    previousConditions: context.conditions, correctionQuery: action.type === 'correction' ? query : '',
    context: { ...context, updates, time: timeFromText(query) || context.time, lastStep: step }, step }
}

function beginnerFollowupAnswer(guidance, conditions) {
  guidance = { ...guidance, context: { ...guidance.context, conditions: conversationConditions(conditions) } }
  if (['base', 'daily', 'eye-lip'].includes(guidance.step)) {
    const result = beginnerAnswer({ ...guidance, time: guidance.time || 'time-five', goal: `goal-${guidance.step}` }, conditions)
    return { ...result, beginnerContext: guidance.context }
  }
  const ids = guidance.step === 'brow' ? ['mens-natural-brows']
    : guidance.step === 'color' ? ['quick-everyday-makeup', 'soft-glam-style-language']
      : guidance.step === 'finish' ? ['mens-natural-base', 'quick-everyday-makeup'] : ['quick-everyday-makeup']
  const entries = ids.map((id) => knowledgeEntries.find((entry) => entry.id === id)).filter(Boolean)
  const technique = (id, index = 0) => entries.find((entry) => entry.id === id)?.techniques[index]
  const content = guidance.step === 'brow' ? ['接下来整理眉毛。底妆之后先做这一步：', ...entries[0].techniques]
    : guidance.step === 'color' ? ['接下来可以选一个唇颊或眼部重点；这些是可选项，不必全部加上。',
      technique('quick-everyday-makeup', 1), technique('soft-glam-style-language'),
      '现有资料支持浓淡和边缘的方向，尚不足以给出完整眼线、眼影分区、腮红定位或唇形描画教程；不补造具体画法。']
      : guidance.step === 'finish' ? ['最后检查边缘，按需定妆收尾。',
        guidance.route === 'men' ? technique('mens-natural-base', 2)
          : '检查眉毛附近是否残留粉底，把下颌边缘晕开；出油处按需少量定妆。',
        '没有需要补充的地方就可以结束，不必为了完成所有步骤再叠加。']
        : ['这套基础顺序已经讲完：底妆、眉毛、可选的唇颊或眼部重点，再检查边缘和定妆。',
          '接下来可以按自己的节奏练习；想细看哪一步，直接说步骤名称即可。']
  const constraints = [conditions.scene && `${conditions.scene}场景`, conditions.budget !== undefined && `预算${conditions.budget}元以内`,
    conditions.skin, conditions.finish, conditions.excludedBrands?.length && `排除${conditions.excludedBrands.join('、')}`].filter(Boolean)
  const timeNote = guidance.time === 'time-five' ? '仍按你说的5分钟以内安排；底妆和眉毛做完就可以停，后续重点留到有时间时练。'
    : guidance.time === 'time-ten' ? '仍按10分钟左右安排，额外步骤按剩余时间取舍。' : ''
  const safety = [...new Set(entries.flatMap((entry) => entry.safetyBoundaries))]
  return { answer: [content[0], constraints.length ? `保留你已说明的${constraints.join('、')}。` : '', timeNote,
      ...content.slice(1), ...safety].filter(Boolean).join('\n\n'),
    beginnerContext: guidance.context, answerMode: 'knowledge', sources: knowledgeSources(entries),
    knowledgeEvidence: knowledgeEvidence(entries), knowledgeIds: ids,
    status: guidance.step === 'color' ? 'partial' : 'answered',
    missing: guidance.step === 'color' ? ['缺少完整眼线、眼影分区、腮红定位及唇形描画的受控步骤。'] : [] }
}

function conversationConditions(conditions) {
  return Object.fromEntries(['skin', 'finish', 'scene', 'budget', 'category', 'coverage', 'tone', 'excludedBrands']
    .filter((key) => conditions[key] !== undefined).map((key) => [key, conditions[key]]))
}

module.exports = { isBeginnerRequest, isBeginnerQuestion, wantsDirectAnswer, goalFromText, timeFromText, beginnerNext, advanceBeginner, beginnerAnswer, continueBeginner, beginnerFollowupAnswer }
