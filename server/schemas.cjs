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

const conversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(4000),
}).strict()

const assistantRequestSchema = z.object({
  query: z.string().trim().min(1).max(2000),
  messages: z.array(conversationMessageSchema).max(12).default([]),
  profile: profileSchema.default({}),
}).strict()

const weatherQuerySchema = z.object({
  city: z.string().trim().min(1).max(40),
}).strict()

const sourceSchema = z.object({
  title: z.string().trim().min(1).max(300),
  url: z.string().url().max(2000),
  publisher: z.string().trim().max(200).default(''),
  accessedAt: z.string().datetime(),
}).strict()

const productSourceSchema = z.object({
  title: z.string().trim().min(1).max(300),
  url: z.string().url().max(2000),
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
    sourcePageUrl: z.string().url().max(2000),
    rightsholder: z.string().trim().min(1).max(200),
    authorizationStatus: z.enum(['pending', 'verified', 'rejected']),
    acquiredAt: z.string().date(),
    sourcePriority: z.enum(['brand_official', 'retailer', 'media']),
    publicUseDecision: z.literal('public_with_source_notice'),
    note: z.string().trim().min(1).max(300),
  }).strict(),
  imageAuthorizationStatus: z.enum(['pending', 'verified', 'rejected']),
  verificationStatus: z.enum(['pending', 'verified', 'rejected', 'not_applicable']),
  factVerificationStatus: z.enum(['pending', 'verified', 'rejected', 'not_applicable']),
  publicStatus: z.string().trim().min(1).max(80),
  recommendationReady: z.boolean(),
}).passthrough()

const assistantResponseSchema = z.object({
  answer: z.string().trim().min(1).max(20000),
  sources: z.array(sourceSchema).max(5),
  usedWebSearch: z.boolean(),
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
  weatherEnabled: z.boolean().default(false),
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
  weatherAdjustment: z.string().trim().min(1).max(500),
  steps: z.array(planStepSchema).min(5).max(8),
  recommendedProductIds: z.array(z.string().trim().min(1).max(120)).max(6),
  candidateEvidence: z.array(candidateEvidenceSchema).max(12),
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
  weatherQuerySchema,
}
