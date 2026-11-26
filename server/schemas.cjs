const { z } = require('zod')

const profileSchema = z.object({
  skin: z.string().trim().max(20).optional(),
  finish: z.string().trim().max(20).optional(),
  scene: z.string().trim().max(30).optional(),
  budget: z.number().finite().min(0).max(100000).optional(),
  category: z.string().trim().max(30).optional(),
  coverage: z.string().trim().max(20).optional(),
  tone: z.string().trim().max(20).optional(),
  city: z.string().trim().max(40).optional(),
}).strict()

const guidedQuestionSchema = z.object({
  flowId: z.string().trim().min(1).max(80),
  step: z.number().int().min(1).max(5),
  route: z.enum(['men', 'women', 'general', 'skin', 'plan']).nullable(),
  selections: z.array(z.string().trim().min(1).max(80)).max(4),
  initialQuery: z.string().trim().max(1000).optional(),
  updates: z.array(z.string().trim().min(1).max(1000)).max(4).optional(),
  options: z.array(z.object({
    label: z.string().trim().min(1).max(80),
    value: z.string().trim().min(1).max(80),
  }).strict()).min(2).max(6),
}).strict()

const beginnerContextSchema = z.object({
  version: z.literal(1),
  initialQuery: z.string().trim().min(1).max(1000),
  route: z.enum(['men', 'women', 'general', 'skin', 'plan']),
  goal: z.enum(['goal-base', 'goal-brow', 'goal-eye-lip', 'goal-daily']),
  time: z.enum(['time-five', 'time-ten', 'time-learn']).nullable(),
  updates: z.array(z.string().trim().min(1).max(1000)).max(4),
  conditions: profileSchema.omit({ city: true }).extend({ excludedBrands: z.array(z.string().trim().min(1).max(120)).max(120).optional() }).optional(),
  lastStep: z.enum(['base', 'brow', 'eye-lip', 'daily', 'color', 'finish', 'done']),
}).strict()

const conversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(4000),
  productIds: z.array(z.string().trim().min(1).max(120)).max(3).optional(),
  question: guidedQuestionSchema.optional(),
  beginnerContext: beginnerContextSchema.optional(),
}).strict()

const assistantRequestSchema = z.object({
  query: z.string().trim().min(1).max(2000),
  messages: z.array(conversationMessageSchema).max(12).default([]),
  profile: profileSchema.default({}),
}).strict()

const sourceSchema = z.object({
  kind: z.enum(['web', 'knowledge', 'weather']).default('web'),
  title: z.string().trim().min(1).max(300),
  url: z.string().url().max(2000),
  publisher: z.string().trim().max(200).default(''),
  accessedAt: z.string().datetime(),
}).strict()

const productSourceSchema = z.object({
  title: z.string().trim().min(1).max(300),
  url: z.string().url().max(2000).nullable(),
  publisher: z.string().trim().max(200).default(''),
  accessedAt: z.string().date(),
  supports: z.array(z.string().trim().min(1).max(160)).max(12).default([]),
}).strict()

const productRecordSchema = z.object({
  id: z.string().trim().min(1).max(120),
  brand: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(240),
  category: z.string().trim().min(1).max(30),
  price: z.number().finite().nonnegative().nullable(),
  priceCurrency: z.string().trim().length(3),
  priceVerifiedAt: z.string().date().nullable(),
  informationSources: z.array(productSourceSchema).max(8),
  imageSource: z.object({
    url: z.string().url().nullable(),
    sourcePageUrl: z.string().url().max(2000).nullable(),
    rightsholder: z.string().trim().min(1).max(200),
    authorizationStatus: z.enum(['pending', 'verified', 'rejected']),
    acquiredAt: z.string().date(),
    sourcePriority: z.enum(['brand_official', 'retailer', 'media', 'project_owner_provided']),
    publicUseDecision: z.enum(['public_with_source_notice', 'internal_review_pending_source']),
    note: z.string().trim().min(1).max(300),
  }).strict(),
  imageAuthorizationStatus: z.enum(['pending', 'verified', 'rejected']),
  verificationStatus: z.enum(['pending', 'verified', 'rejected', 'not_applicable']),
  factVerificationStatus: z.enum(['pending', 'verified', 'rejected', 'not_applicable']),
  publicStatus: z.string().trim().min(1).max(80),
  recommendationReady: z.boolean(),
}).passthrough()

const knowledgeEvidenceSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(160),
  version: z.string().min(1).max(40),
  reviewedAt: z.string().date(),
  conditions: z.array(z.string().min(1).max(300)).max(4),
  limitations: z.array(z.string().min(1).max(500)).max(8),
  safetyBoundaries: z.array(z.string().min(1).max(500)).max(4).optional(),
  sources: z.array(sourceSchema.omit({ kind: true }).extend({ supports: z.array(z.string().min(1).max(300)).max(8) })).max(4),
  stepIds: z.array(z.string().min(1).max(50)).max(8).optional(),
}).strict()

const assistantCoverageSchema = z.object({
  question: z.string().min(1).max(2000),
  intent: z.string().min(1).max(40),
  status: z.enum(['answered', 'partial', 'unavailable', 'clarification']),
  knowledgeIds: z.array(z.string().min(1).max(100)).max(8),
  productIds: z.array(z.string().min(1).max(120)).max(6),
  missing: z.array(z.string().min(1).max(300)).max(24),
}).strict()

const assistantResponseSchema = z.object({
  answer: z.string().trim().min(1).max(20000),
  sources: z.array(z.union([sourceSchema, require('./knowledge/product-facts-schema.cjs').assistantProductSourceSchema])).max(48),
  usedWebSearch: z.boolean(),
  answerMode: z.enum(['model', 'knowledge', 'search', 'weather', 'clarification', 'local']),
  model: z.string().trim().min(1).max(80).nullable(),
  intent: z.enum(['catalog_recommendation', 'product_comparison', 'product_fact', 'beauty_knowledge', 'makeup_plan', 'plan_adjustment', 'external_question', 'external_research', 'greeting_help', 'unsupported_sensitive', 'clarification', 'compound']).optional(),
  guidedQuestion: guidedQuestionSchema.optional(),
  beginnerContext: beginnerContextSchema.optional(),
  coverage: z.array(assistantCoverageSchema).max(7).optional(),
  knowledgeEvidence: z.array(knowledgeEvidenceSchema).max(8).optional(),
}).strict()

const userProfileSchema = z.object({
  skinType: z.enum(['油皮', '混油皮', '干皮', '混干皮', '敏感肌', 'unknown']).default('unknown'),
  skinTypeSource: z.enum(['self_reported', 'unknown']).default('unknown'),
  undertone: z.enum(['冷调', '中性调', '暖调', 'unknown']).default('unknown'),
  finishPreferences: z.array(z.string().trim().min(1).max(20)).max(4).default([]),
  concerns: z.array(z.string().trim().min(1).max(30)).max(6).default([]),
  budgetTotal: z.number().finite().min(0).max(100000).default(0),
  skillLevel: z.enum(['新手', '熟练', '进阶', 'unknown']).default('unknown'),
  excludedBrands: z.array(z.string().trim().min(1).max(60)).max(12).default([]),
  sensitivities: z.array(z.string().trim().min(1).max(40)).max(8).default([]),
  city: z.string().trim().max(40).default(''),
}).strict()

const makeupRequestSchema = z.object({
  scene: z.string().trim().min(1).max(40).default('日常'),
  style: z.string().trim().min(1).max(40).default('自然'),
  wearHours: z.number().int().min(1).max(24).default(8),
  timeOfDay: z.enum(['早晨', '白天', '夜晚', 'unknown']).default('unknown'),
  photoEnabled: z.boolean().default(false),
  priorities: z.array(z.string().trim().min(1).max(30)).max(6).default([]),
}).strict()

const planStepSchema = z.object({
  id: z.string().trim().min(1).max(50),
  category: z.string().trim().min(1).max(30),
  goal: z.string().trim().min(1).max(300),
  technique: z.string().trim().min(1).max(500),
  texture: z.string().trim().min(1).max(80),
  colorDirection: z.string().trim().min(1).max(120),
  primaryProductId: z.string().trim().min(1).max(120).nullable(),
  alternativeProductIds: z.array(z.string().trim().min(1).max(120)).max(3),
  reasons: z.array(z.string().trim().min(1).max(240)).max(6),
  cautions: z.array(z.string().trim().min(1).max(240)).max(6),
}).strict()

const candidateEvidenceSchema = z.object({
  productId: z.string().trim().min(1).max(120),
  score: z.number().finite().min(0).max(100),
  matchedConditions: z.array(z.string().trim().min(1).max(160)).max(8),
  tradeoffs: z.array(z.string().trim().min(1).max(160)).max(8),
}).strict()

const makeupPlanSchema = z.object({
  id: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(800),
  inputsSnapshot: z.object({
    userProfile: userProfileSchema,
    makeupRequest: makeupRequestSchema,
  }).strict(),
  externalContextSummary: z.string().trim().min(1).max(500),
  steps: z.array(planStepSchema).min(5).max(8),
  recommendedProductIds: z.array(z.string().trim().min(1).max(120)).max(6),
  candidateEvidence: z.array(candidateEvidenceSchema).max(12),
  knowledgeEvidence: z.array(knowledgeEvidenceSchema).max(8).optional(),
  confidence: z.number().finite().min(0).max(1),
  limitations: z.array(z.string().trim().min(1).max(300)).max(10),
  sourceMode: z.enum(['local', 'model']),
  createdAt: z.string().datetime(),
  schemaVersion: z.literal('makeup-plan.v1'),
}).strict()

const makeupPlanRequestSchema = z.object({
  userProfile: userProfileSchema.default({}),
  makeupRequest: makeupRequestSchema.default({}),
}).strict()

const makeupPlanResponseSchema = z.object({
  ok: z.literal(true),
  plan: makeupPlanSchema,
}).strict()

module.exports = {
  assistantRequestSchema,
  assistantResponseSchema,
  candidateEvidenceSchema,
  makeupPlanRequestSchema,
  makeupPlanResponseSchema,
  makeupPlanSchema,
  makeupRequestSchema,
  planStepSchema,
  productRecordSchema,
  userProfileSchema,
}
