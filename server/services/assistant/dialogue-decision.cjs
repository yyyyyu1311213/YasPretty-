const ISSUE_ID = 'YAS-2026-0065'
const SHANGHAI_TIME_ZONE = 'Asia/Shanghai'
const DECISION_INTENTS = new Set(['catalog_recommendation', 'product_comparison', 'product_fact', 'beauty_knowledge', 'makeup_plan', 'plan_adjustment', 'external_question', 'external_research', 'greeting_help', 'unsupported_sensitive', 'clarification'])

function asIsoDateTime(value, fallback = null) {
  if (typeof value !== 'string') return fallback
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString()
}

function decisionSource(source, createdAt) {
  if (!source) return null
  const kind = source.kind === 'product' ? 'catalog' : source.kind === 'weather' ? 'web' : source.kind
  if (!['user', 'catalog', 'knowledge', 'web'].includes(kind)) return null
  return {
    kind,
    title: source.title || (kind === 'catalog' ? 'YasPretty 站内产品资料' : 'YasPretty 参考资料'),
    url: source.url || null,
    publisher: source.publisher || (kind === 'catalog' ? 'YasPretty' : ''),
    // Date-only catalog and knowledge records do not claim an unrecorded time.
    accessedAt: asIsoDateTime(source.accessedAt),
    supports: Array.isArray(source.supports) ? source.supports.slice(0, 12) : [],
  }
}

function buildDialogueDecision({ query, intent, answerMode, sources = [], guidance, parameters, evidence = {}, clock = () => new Date() }) {
  const createdAt = clock().toISOString()
  const mappedSources = sources.map((source) => decisionSource(source, createdAt)).filter(Boolean)
  const userSource = decisionSource({ kind: 'user', title: '用户当前输入', publisher: '用户',
    accessedAt: createdAt, supports: ['当前请求提供的条件'] }, createdAt)
  const routePreference = parameters?.recommendation?.routePreference
    || (guidance?.route === 'men' ? 'natural_refinement'
      : guidance?.route === 'women' ? 'daily_makeup'
        : guidance?.route === 'general' ? 'neutral_makeup' : 'unspecified')
  if (intent === 'catalog_recommendation' && !mappedSources.some((source) => source.kind === 'catalog')) {
    mappedSources.push(decisionSource({ kind: 'catalog', title: 'YasPretty 站内受控产品库', publisher: 'YasPretty',
      supports: ['产品候选仅来自站内已核验资料'] }, createdAt))
  }
  const assumptions = [...new Set(evidence.assumptions || [])].slice(0, 8)
  const missingFields = [...new Set(evidence.missing || [])].slice(0, 8)
  const decisionMode = evidence.decisionMode || (intent === 'unsupported_sensitive' || answerMode === 'safety' ? 'safety'
    : guidance?.kind === 'ask' ? 'ask_one'
      : answerMode === 'clarification' ? 'clarification'
        : evidence.followupOffer ? 'followup_offer'
          : assumptions.length ? 'answer_with_assumption' : 'answer')
  return {
    schemaVersion: 'xiaoy-dialogue-v2',
    issueId: ISSUE_ID,
    flowVersion: 'answer-first-v1',
    decisionMode,
    // `compound` is an existing assistant response mode, not a dialogue
    // decision intent. Keep the public response backward-compatible while
    // mapping the decision to the valid v2 vocabulary.
    intent: DECISION_INTENTS.has(intent) ? intent : 'clarification',
    confidence: Number.isFinite(evidence.confidence) ? evidence.confidence : guidance?.kind === 'ask' ? 0.82 : 0.9,
    missingFields,
    assumptions,
    routePreference,
    interruptedFlow: Boolean(evidence.interruptedFlow),
    reason: evidence.reason || (guidance?.kind === 'ask' ? '当前只缺少一个会显著影响后续建议的条件。' : '已先处理当前问题，再决定是否提供延伸。'),
    sources: [userSource, ...mappedSources].slice(0, 16),
    createdAt,
    timezone: SHANGHAI_TIME_ZONE,
    ...(evidence.followupOffer ? { followupOffer: evidence.followupOffer } : {}),
  }
}

module.exports = { ISSUE_ID, SHANGHAI_TIME_ZONE, asIsoDateTime, buildDialogueDecision, decisionSource }
