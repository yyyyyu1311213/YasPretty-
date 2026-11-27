const { assistantResponseSchema } = require('../schemas.cjs')
const { AppError } = require('../errors.cjs')
const { knowledgeSources, knowledgeEvidence, retrieveKnowledge } = require('../knowledge/beauty-knowledge.cjs')
const { intentRouter, classifyIntent, needsOnlineResearch, hasSkinDiscomfort, isCatalogSizeQuestion } = require('./assistant/intent-router.cjs')
const { resolveProducts, questionForSelection } = require('./assistant/product-resolver.cjs')
const { extractParameters, extractGuidedParameters, planInput } = require('./assistant/parameters.cjs')
const { selectRecommendations, searchSources } = require('./assistant/tools.cjs')
const { buildResearchRequest, filterResearchResults } = require('./assistant/research-request.cjs')
const { researchMessages, researchAnswer } = require('./assistant/research-answer.cjs')
const { buildSystemPrompt, searchFallbackAnswer, recommendationAnswer, clarificationAnswer, planAnswer, validateAnswer, organizeCatalogAnswer } = require('./assistant/response.cjs')
const { createProductFactsIndex } = require('../knowledge/product-facts-index.cjs')
const { catalogSize } = require('../knowledge/product-facts-adapter.cjs')
const { answerProductFacts } = require('./assistant/fact-answer.cjs')
const { answerKnowledge } = require('./assistant/knowledge-answer.cjs')
const { advanceGuidedIntake, beginGuidedIntake } = require('./assistant/guided-intake.cjs')
const { isBeginnerRequest, goalFromText, wantsDirectAnswer, beginnerNext, beginnerAnswer, continueBeginner, beginnerFollowupAnswer } = require('./assistant/beginner-guidance.cjs')
const { decomposeQuestions } = require('./assistant/questions.cjs')
const { requestBudget, boundedProvider, combineAnswers } = require('./assistant/compound-answer.cjs')
const { SHANGHAI_TIME_ZONE, buildDialogueDecision } = require('./assistant/dialogue-decision.cjs')

function isWeatherQuestion(text) {
  return /(天气|气温|温度|下雨|降雨)/.test(String(text || ''))
}

function isMakeupApplicationOrRecommendation(query, intent) {
  if (intent === 'makeup_plan' || intent === 'catalog_recommendation') return true
  return /上妆|化妆|底妆|粉底|气垫|遮瑕|修容|腮红|唇妆|眼妆|眉妆|睫毛膏/.test(String(query || ''))
}

function extractWeatherLocation(text, profileCity = '') {
  const savedCity = String(profileCity || '').trim()
  if (!isWeatherQuestion(text)) return ''
  const normalized = String(text || '').replace(/[^\p{Script=Han}]/gu, '')
  const marker = normalized.search(/天气|气温|温度|下雨|降雨|预报/u)
  if (marker < 0) return ''
  const candidate = normalized.slice(0, marker)
    .replace(/^(?:请问|帮我|查一下|查询|今天|明天|后天|现在|目前|近期)+/u, '')
    .replace(/(?:今天|明天|后天|现在|目前|近期|的|会不会|怎么样|如何)+$/u, '')
    .trim()
  return candidate.length >= 2 && candidate.length <= 12 ? candidate : savedCity
}

function chinaDateParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: SHANGHAI_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now)
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const year = Number(value.year)
  const month = Number(value.month)
  const day = Number(value.day)
  return {
    iso: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    label: `${year}年${month}月${day}日`,
    shortLabel: `${month}月${day}日`,
  }
}

function weatherDateParts(query, now = new Date()) {
  const base = chinaDateParts(now)
  const offset = /后天/.test(String(query || '')) ? 2 : /明天|明日/.test(String(query || '')) ? 1 : 0
  const [year, month, day] = base.iso.split('-').map(Number)
  return chinaDateParts(new Date(Date.UTC(year, month - 1, day + offset, 12)))
}

function formatWeatherAnswer(weather, now = new Date()) {
  const today = chinaDateParts(now).iso === weather.date
  const lines = [
    `${weather.city}｜${weather.dateLabel || weather.date}`,
    '',
    `天气：${weather.condition}`,
    `气温：${weather.temperature.min}～${weather.temperature.max}℃`,
  ]
  if (today && Number.isFinite(weather.current?.temperature)) {
    lines.push(`当前气温：${weather.current.temperature}℃`)
  }
  if (Number.isFinite(weather.precipitationProbability)) {
    lines.push(`降雨概率：约 ${weather.precipitationProbability}%`)
  }
  const wind = [weather.wind.direction, Number.isFinite(weather.wind.speed) ? `约 ${weather.wind.speed} km/h` : '']
    .filter(Boolean).join('，')
  if (wind) lines.push(`风力：${wind}`)
  lines.push('', `数据来源：${weather.source.publisher}（获取于 ${weather.source.retrievedAt}）`)
  lines.push(...weather.limitations)
  return lines.join('\n')
}

function buildSearchRequest(query, profile, now = new Date()) {
  if (!isWeatherQuestion(query)) return { query, options: {} }
  const location = extractWeatherLocation(query, profile?.city)
  const date = chinaDateParts(now)
  return {
    query: `${date.label} ${location} 今日天气 实时气温 最高温 最低温`,
    options: { count: 10, recency: 'oneDay', contentSize: 'high' },
    weather: { location, date },
  }
}

function filterCurrentWeatherResults(results, weather) {
  if (!weather) return results
  const { location, date } = weather
  return results.filter((result) => {
    const text = `${result.title || ''} ${result.content || ''}`
    const hasLocation = text.includes(location)
    const hasCurrentDate = result.publishDate === date.iso
      || text.includes(date.label)
      || text.includes(date.shortLabel)
    return hasLocation && hasCurrentDate
  })
}

const MAKEUP_FOLLOWUP_OFFER = '如果你还想搭配完整妆容，我可以继续按自然修饰、日常彩妆或不区分性别的方向搭配。'

function routePreferenceFromGuidance(guidance, recommendation = {}) {
  if (recommendation.routePreference && recommendation.routePreference !== 'unspecified') return recommendation.routePreference
  const selected = guidance?.selections || []
  if (selected.includes('natural_refinement')) return 'natural_refinement'
  if (selected.includes('daily_makeup')) return 'daily_makeup'
  if (selected.includes('neutral_makeup')) return 'neutral_makeup'
  return guidance?.route === 'men' ? 'natural_refinement'
    : guidance?.route === 'women' ? 'daily_makeup'
      : guidance?.route === 'general' ? 'neutral_makeup' : 'unspecified'
}

function createAssistantService({ zhipuProvider: provider, weatherProvider, makeupPlanService, products, verificationRecords = {}, clock = () => new Date() }) {
  const plans = makeupPlanService || require('./makeup-plan-service.cjs').createMakeupPlanService({ zhipuProvider: provider, products, clock })
  const facts = createProductFactsIndex(products, verificationRecords)
  async function answerOne({ query, messages = [], profile = {} }, context = {}) {
      const zhipuProvider = context.provider || provider
      const guidance = context.skinDiscomfort || hasSkinDiscomfort(query) ? null
        : context.guided || (context.skipSkinGuidance ? null : await advanceGuidedIntake(query, messages, profile))
      if (guidance?.query) query = guidance.query
      const intent = guidance?.kind === 'ask' ? 'clarification'
        : guidance?.kind === 'plan' ? 'makeup_plan'
          : ['knowledge', 'skin-knowledge', 'beginner', 'beginner-followup'].includes(guidance?.kind) ? 'beauty_knowledge'
            : guidance?.requestConditions?.skin ? 'catalog_recommendation'
            : await classifyIntent(query, products, zhipuProvider, messages)
      const parameters = guidance?.initialQuery
        ? await extractGuidedParameters(guidance.initialQuery, guidance.updates, profile, products)
        : await extractParameters(query, profile, products, messages)
      parameters.recommendation.routePreference = routePreferenceFromGuidance(guidance, parameters.recommendation)
      if (guidance?.previousConditions) {
        Object.assign(parameters.recommendation, guidance.previousConditions)
        if (guidance.correctionQuery) {
          const correction = await extractGuidedParameters('', [guidance.correctionQuery], {}, products)
          const { brands, productIds, excludedBrands, ...changed } = correction.recommendation
          Object.assign(parameters.recommendation, changed)
          parameters.recommendation.excludedBrands = [...new Set([...(parameters.recommendation.excludedBrands || []), ...excludedBrands])]
        }
      }
      const guidedSkin = guidance?.requestConditions?.skin
      if (guidedSkin?.mode === 'unknown') {
        delete parameters.recommendation.skin
        delete parameters.recommendation.skinValues
        parameters.recommendation.skinSkipped = true
        parameters.recommendation.skinLabel = guidedSkin.label
      } else if (guidedSkin?.values?.length) {
        delete parameters.recommendation.skin
        parameters.recommendation.skinValues = guidedSkin.values
        parameters.recommendation.skinLabel = guidedSkin.label
      }
      if (guidedSkin && (guidedSkin.sensitive || parameters.profile.skin === '敏感肌')) parameters.recommendation.sensitive = true
      const routedQuery = guidance?.promptContext ? `${guidance.promptContext}\n${query}` : query
      const reply = (answer, answerMode = 'local', sources = [], usedWebSearch = false, model = null, evidence = {}) => {
        const followupOffer = evidence.followupOffer || (intent === 'catalog_recommendation' && !guidance?.question ? MAKEUP_FOLLOWUP_OFFER : '')
        const finalAnswer = followupOffer && !answer.includes(followupOffer) ? `${answer}\n\n${followupOffer}` : answer
        return assistantResponseSchema.parse({
        answer: finalAnswer, answerMode, sources, usedWebSearch, model, intent,
        ...(evidence.guidedQuestion ? { guidedQuestion: evidence.guidedQuestion } : {}),
        ...(evidence.beginnerContext ? { beginnerContext: evidence.beginnerContext } : {}),
        knowledgeEvidence: evidence.knowledgeEvidence || [],
        dialogueDecision: buildDialogueDecision({ query, intent, answerMode, sources, guidance, parameters,
          evidence: { ...evidence, followupOffer }, clock }),
        coverage: [{ question: query, intent, status: evidence.status || (answerMode === 'clarification' ? 'clarification' : 'answered'),
          knowledgeIds: evidence.knowledgeIds || [], productIds: [...new Set([...answer.matchAll(/\[\[PRODUCT:([^\]]+)\]\]/g)].map((m) => m[1]))].slice(0, 6),
          missing: evidence.missing || (answerMode === 'clarification' ? ['需要补充明确的对象或条件，当前尚未完成回答。'] : []) }],
      })
      }
      const skinEntries = guidance && (guidedSkin || guidance.question?.options.some(({ value }) => /^(skin-|cheek-)/.test(value)))
        ? retrieveKnowledge('判断肤质', 'beauty_knowledge').filter((entry) => entry.id === 'self-reported-skin-type') : []
      const skinEvidence = { knowledgeEvidence: knowledgeEvidence(skinEntries), knowledgeIds: skinEntries.map((entry) => entry.id) }
      if (guidance?.kind === 'ask') return reply(guidance.answer, 'clarification', knowledgeSources(skinEntries), false, null,
        { ...skinEvidence, guidedQuestion: guidance.question, status: 'clarification', missing: ['等待用户选择；可跳过或直接输入。'] })
      if (guidance?.kind === 'skin-knowledge') return reply(guidance.summary, 'knowledge', knowledgeSources(skinEntries), false, null, skinEvidence)
      if (guidance?.kind === 'beginner-followup') {
        const result = beginnerFollowupAnswer(guidance, parameters.recommendation)
        return reply(result.answer, result.answerMode, result.sources, false, null, result)
      }
      if (guidance?.kind === 'beginner') {
        const result = beginnerAnswer(guidance, parameters.recommendation)
        return reply(result.answer, result.answerMode, result.sources, false, null, result)
      }
      if (guidance?.kind === 'knowledge') {
        const knowledgeQuery = guidance.knowledgeQuery || guidance.query
        const result = await answerKnowledge({ query: knowledgeQuery, intent: 'beauty_knowledge', provider: zhipuProvider, budget: context.budget, products })
        const routePreference = routePreferenceFromGuidance(guidance, parameters.recommendation)
        const routeLabel = routePreference === 'natural_refinement' ? '自然修饰'
          : routePreference === 'daily_makeup' ? '日常彩妆'
            : routePreference === 'neutral_makeup' ? '按需求搭配、不区分性别' : '肤质/底妆'
        const lead = `按你选择的${routeLabel}路线，结合刚才的需求整理参考。`
        const note = guidance.route === 'men' && guidance.selections?.includes('focus-men-base')
          ? '\n\n当前接入的眉毛与修容研究资料不支持素颜霜的具体成分、功效或商品适配判断；商品建议会以站内已核验资料为准。'
          : ''
        return reply(`${lead}\n\n${result.answer}${note}`, result.answerMode, result.sources, false, result.model || null, result)
      }
      if (guidance?.kind === 'plan') {
        const planQuery = `${guidance.promptContext ? `${guidance.promptContext}。` : ''}${guidance.query}`
        const conditions = { ...parameters.recommendation, route: guidance.route }
        const plan = context.provider
          ? await plans.create(planInput(planQuery, parameters.profile, conditions), { provider: zhipuProvider, knowledgeBudget: context.budget })
          : await plans.create(planInput(planQuery, parameters.profile, conditions))
        const evidence = plan.knowledgeEvidence || []
        const sources = [...new Map(evidence.flatMap((item) => item.sources).map(({ supports, ...source }) => [source.url, { ...source, kind: 'knowledge' }])).values()]
        return reply(planAnswer(plan), plan.sourceMode === 'local' ? 'local' : 'model', sources, false, plan.sourceMode === 'model' ? zhipuProvider.modelName || null : null,
          { knowledgeEvidence: evidence, knowledgeIds: evidence.map((item) => item.id) })
      }
      if (intent === 'clarification') return reply('我还不确定你的意思。你想查询某款产品、比较产品、学习手法，还是生成完整妆容？请补充具体需求。', 'clarification')
      if (intent === 'greeting_help') return reply('你好，我是小Y。可以帮你选产品、比较产品、查询资料、学习化妆手法或生成完整妆容。')
      if (intent === 'unsupported_sensitive') {
        const entries = retrieveKnowledge('新产品红肿刺痛不适', 'skin_safety').slice(0, 1)
        return reply(hasSkinDiscomfort(query) || /过敏|治疗|诊断/.test(query)
          ? '先停止使用让你不适的产品，并咨询合格专业人员。现在有明显不适，暂不提供继续上妆或产品推荐。'
          : '我不能协助身份识别、敏感属性推断或披露凭据。可以继续讨论美妆手法和产品资料。', 'knowledge', knowledgeSources(entries), false, null, { knowledgeEvidence: knowledgeEvidence(entries), knowledgeIds: entries.map((entry) => entry.id) })
      }
      if (context.skinDiscomfort && !hasSkinDiscomfort(query) && isMakeupApplicationOrRecommendation(query, intent)) {
        const entries = retrieveKnowledge('新产品红肿刺痛不适', 'unsupported_sensitive', { maxEntries: 1 })
        return reply('本次问题提到皮肤破损或明显不适，应停止使用并咨询合格专业人员；暂不提供继续上妆的操作或方案。当前手法问题尚未完成，请在没有不适的条件下再讨论。', 'clarification', knowledgeSources(entries), false, null,
          { status: 'unavailable', missing: ['当前有皮肤不适，已暂缓上妆手法或方案。'], knowledgeEvidence: knowledgeEvidence(entries), knowledgeIds: entries.map((entry) => entry.id) })
      }
      if (intent === 'plan_adjustment') return reply('请在妆容工作台打开已有方案并修改对应条件后重新生成；聊天中没有可校验的原方案，不能确认局部调整。', 'clarification')
      if (intent === 'makeup_plan') {
        const planQuery = routedQuery
        const plan = context.provider
          ? await plans.create(planInput(planQuery, parameters.profile, parameters.recommendation), { provider: zhipuProvider, knowledgeBudget: context.budget })
          : await plans.create(planInput(planQuery, parameters.profile, parameters.recommendation))
        const evidence = plan.knowledgeEvidence || []
        const sources = [...new Map(evidence.flatMap((item) => item.sources).map(({ supports, ...source }) => [source.url, { ...source, kind: 'knowledge' }])).values()]
        return reply(planAnswer(plan), plan.sourceMode === 'local' ? 'local' : 'model', sources, false, plan.sourceMode === 'model' ? zhipuProvider.modelName || null : null, { knowledgeEvidence: evidence, knowledgeIds: evidence.map((item) => item.id) })
      }
      if (intent === 'catalog_recommendation') {
        const baseCategories = ['粉底液', '气垫', '遮瑕', '散粉', '素颜霜', '隔离', '有色面霜']
        const hasSkinCondition = Boolean(parameters.recommendation.skin || parameters.recommendation.skinValues?.length)
        const skippedSkin = parameters.recommendation.skinSkipped === true || guidance?.selections?.includes('skin-unknown') === true || guidance?.stopGuidance && !hasSkinCondition
        const assumedSkin = !hasSkinCondition && !skippedSkin && (!parameters.recommendation.category || baseCategories.includes(parameters.recommendation.category))
        const selection = selectRecommendations(products, parameters.recommendation, query)
        const skinNote = (skippedSkin || assumedSkin) ? parameters.recommendation.sensitive
          ? '\n\n本次未按干油倾向筛选；仍单独考虑你已说明的敏感倾向。'
          : `\n\n${assumedSkin ? '你没有提供肤质，我先按品类、预算和已知妆效做保守筛选。' : '本次没有按肤质筛选候选，先按已知的品类、预算等条件选择。'}`
          : parameters.recommendation.skinLabel ? '\n\n本次按你提供的日常感受筛选候选。' : ''
        if (guidedSkin) return reply(`${guidance.summary}\n\n${recommendationAnswer(selection, parameters.recommendation, { concise: true })}${skinNote}`,
          'local', knowledgeSources(skinEntries), false, null, skinEvidence)
        const requestProfile = { ...parameters.profile }
        if (skippedSkin || parameters.recommendation.skinValues?.length) delete requestProfile.skin
        const result = await organizeCatalogAnswer({ provider: zhipuProvider, profile: requestProfile, products: selection.map(({ product }) => product), intent, query: routedQuery, messages,
          conditions: parameters.recommendation, fallback: `${!zhipuProvider?.configured ? '智能服务未配置，已使用站内基础规则推荐。\n\n' : ''}${recommendationAnswer(selection, parameters.recommendation)}` })
        return reply(`${result.answer}${skinNote}`, result.answerMode, [], false, result.model,
          assumedSkin ? { assumptions: ['用户未提供肤质，本次按品类、预算和已知妆效保守筛选。'] } : {})
      }
      const question = questionForSelection(query, products, messages)
      if (intent === 'product_fact' || intent === 'product_comparison') {
        if (isCatalogSizeQuestion(query)) return reply(`YasPretty 产品库收录的都是${catalogSize}规格。具体包装是否附替换芯或赠品，要看所选套装的清单。`)
        const resolution = resolveProducts(query, products, messages)
        if (resolution.ambiguous || !resolution.products.length || intent === 'product_comparison' && (resolution.products.length < 2 || resolution.products.length > 3)
          || intent === 'product_fact' && resolution.products.length !== 1) return reply(clarificationAnswer(resolution), 'clarification')
        const result = await answerProductFacts({ products: resolution.products, index: facts, query: question, messages, profile: parameters.profile, provider: zhipuProvider, intent })
        return reply(result.answer, result.answerMode, result.sources, result.usedWebSearch, result.model, result)
      }
      if (isWeatherQuestion(query)) {
        const city = extractWeatherLocation(query, parameters.profile.city)
        if (!city) return reply('请告诉我你想查询的城市，例如“上海今天天气怎么样”。取得城市后我会先联网检索，再基于可见来源回答。', 'clarification')
        if (/昨天|昨日|上周|下周/.test(query)) return reply('目前可以查询今天、明天或后天的天气。请告诉我城市和日期，例如“上海明天天气”。', 'clarification')
        const now = clock()
        const date = weatherDateParts(query, now)
        const weather = await weatherProvider.forecast({ city, date: date.iso })
        return reply(formatWeatherAnswer({ ...weather, dateLabel: date.label }, now), 'weather', [{
          kind: 'weather', title: `${weather.city}${date.label}天气数据`, url: weather.source.url,
          publisher: weather.source.publisher, accessedAt: weather.source.retrievedAt,
        }])
      }
      if (!needsOnlineResearch(question, intent) && (intent === 'beauty_knowledge' || intent === 'external_question' && retrieveKnowledge(query, intent).length)) {
        if (isBeginnerRequest(query) || goalFromText(query) === 'goal-daily') {
          const result = beginnerAnswer(beginnerNext({ initialQuery: query, direct: true }), parameters.recommendation)
          return reply(result.answer, result.answerMode, result.sources, false, null, result)
        }
        const result = await answerKnowledge({ query, intent, provider: zhipuProvider, budget: context.budget, products })
        const safetyNote = context.skinDiscomfort ? '\n\n你提到当前皮肤有不适，不要在不适部位使用或测试工具，也不要继续上妆。' : ''
        return reply(`${result.answer}${safetyNote}`, result.answerMode, result.sources, false, result.model || null, result)
      }
      const useWebSearch = needsOnlineResearch(question, intent)
      // Timely questions use current search evidence. Independent technique questions
      // take the budgeted knowledge branch above, keeping source numbering unambiguous.
      if (!zhipuProvider?.configured) {
        throw new AppError('PROVIDER_NOT_CONFIGURED', '智能服务暂未配置，当前无法回答该问题。', 503)
      }
      const searchRequest = buildResearchRequest(query, clock())
      if (useWebSearch && !searchRequest.query) return reply('请告诉我想搜索的主题，例如“联网搜索人工智能的定义”。', 'clarification')
      const webResults = useWebSearch ? filterResearchResults(await searchSources(zhipuProvider, searchRequest.query, searchRequest.options), searchRequest) : []
      if (useWebSearch && !webResults.length) {
        throw new AppError('SEARCH_NO_CURRENT_SOURCES', '检索未取得目标日期的可核验来源，请稍后重试或调整日期；不会把旧资料当作今日结果。', 502)
      }
      const prompt = buildSystemPrompt(parameters.profile, [], webResults, intent)
      let answer
      let answerMode = 'model'
      try {
        const raw = await zhipuProvider.chat(useWebSearch ? researchMessages(question, webResults) : [
          { role: 'system', content: prompt },
          ...messages.slice(-8).map(({ role, content }) => ({ role, content })),
          { role: 'user', content: question === query ? routedQuery : `我选择：${routedQuery}。请继续回答此前的问题：${question}` },
        ], { timeoutMs: useWebSearch ? 12000 : 20000, maxAttempts: 1 })
        answer = useWebSearch ? researchAnswer(raw, webResults) : validateAnswer(raw, [])
        if (useWebSearch) answerMode = 'search'
      } catch (error) {
        if (webResults.length) {
          answer = searchFallbackAnswer(webResults)
          answerMode = 'search'
        } else {
          throw new AppError('ASSISTANT_UNAVAILABLE', '智能回答未能完成，请稍后重试或补充问题。', 503)
        }
      }
      return reply(answer, answerMode, webResults.map(({ title, url, publisher, accessedAt }) => ({ kind: 'web', title, url, publisher, accessedAt })), useWebSearch, answerMode === 'model' ? zhipuProvider.modelName || null : null,
        answerMode === 'search' ? { status: 'partial', missing: ['当前提供来源摘录，未独立核验网页事实；相关性、完整性和适用范围请查看原文。'] } : {})
  }
  return {
    async answer(input) {
      const { leavesSkinGuidance } = await import('../../src/features/assistant/skinObservation.js')
      const skipSkinGuidance = leavesSkinGuidance(input.query)
      const hasExplicitFollowup = /[;；\n]|另外|此外|还想|顺便|再问|并且|同时|以及/.test(String(input.query || ''))
      if (hasSkinDiscomfort(input.query) && !hasExplicitFollowup) return answerOne(input, { skinDiscomfort: true })
      const topicSwitch = leavesSkinGuidance(input.query)
      // An explicit makeup-plan request is a new topic even when the previous
      // turn was a skin or route question. Let the normal router answer it.
      const currentIntent = intentRouter(input.query, products, input.messages || [])
      if (!hasSkinDiscomfort(input.query) && !topicSwitch
        && currentIntent !== 'unsupported_sensitive' && currentIntent !== 'makeup_plan') {
        const followup = await continueBeginner(input.query, input.messages || [])
        if (followup) return hasSkinDiscomfort(followup.query)
          ? answerOne({ ...input, query: followup.query }, { skinDiscomfort: true }) : answerOne(input, { guided: followup })
        const continued = await advanceGuidedIntake(input.query, input.messages || [], input.profile || {})
        if (continued) return answerOne(input, { guided: continued })
      }
      const initialIntent = intentRouter(input.query, products, input.messages || [])
      const initialGuidance = beginGuidedIntake(input.query, input.messages || [], initialIntent)
      if (initialGuidance) return answerOne(input, { guided: initialGuidance })
      const { questions, deferred } = decomposeQuestions(input.query, products, input.messages || [])
      if (questions.length <= 1 && !deferred.length) return answerOne(input, { skipSkinGuidance })
      const budget = requestBudget(questions.some((query) => intentRouter(query, products, input.messages || []) === 'unsupported_sensitive'))
      const limitedProvider = boundedProvider(provider)
      const results = []
      let messages = input.messages || []
      for (const query of questions) {
        try {
          const result = await answerOne({ ...input, query, messages }, { provider: limitedProvider, budget, skinDiscomfort: hasSkinDiscomfort(input.query), skipSkinGuidance })
          results.push(result)
          const ids = result.coverage[0].productIds
          // Only the preceding subquestion's validated product selection may resolve a pronoun.
          messages = [...(input.messages || []), { role: 'assistant', content: result.answer.slice(0, 4000), productIds: ids.slice(0, 3) }].slice(-8)
        } catch {
          const intent = intentRouter(query, products, messages)
          results.push({ answer: '这一项的服务或检索暂不可用，无法确认；可以稍后单独重试。', answerMode: 'clarification', sources: [], usedWebSearch: false, model: null,
            coverage: [{ question: query, intent, status: 'unavailable', knowledgeIds: [], productIds: [], missing: ['服务、检索或本轮调用预算不足，尚未取得可用证据。'] }], knowledgeEvidence: [] })
        }
      }
      return combineAnswers(results, deferred)
    },
  }
}

module.exports = {
  buildSearchRequest, buildSystemPrompt, chinaDateParts, createAssistantService,
  extractWeatherLocation, filterCurrentWeatherResults, formatWeatherAnswer,
  intentRouter, isWeatherQuestion, needsOnlineResearch, searchFallbackAnswer, weatherDateParts,
}
