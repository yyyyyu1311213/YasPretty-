const path = require('node:path')
const dotenv = require('dotenv')
const { z } = require('zod')

dotenv.config({ path: path.resolve(__dirname, '..', '.env'), quiet: true })

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return value
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}, z.boolean())

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  FISHTALK_PORT: z.coerce.number().int().min(1).max(65535).default(8787),
  YASPRETTY_HOST: z.string().trim().min(1).default('127.0.0.1'),
  ZHIPU_API_KEY: z.string().trim().default(''),
  ZHIPU_MODEL: z.string().trim().min(1).default('glm-4-flash'),
  ZHIPU_SEARCH_ENGINE: z.enum(['search_std', 'search_pro', 'search_pro_sogou', 'search_pro_quark']).default('search_std'),
  ZHIPU_MAX_TOKENS: z.coerce.number().int().min(128).max(16384).default(4096),
  UPSTREAM_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(20000),
  API_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(10000).default(60),
  AI_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(1000).default(20),
  AI_DAILY_LIMIT: z.coerce.number().int().min(1).max(100000).default(200),
  TRUST_PROXY: booleanFromEnv.default(false),
}).passthrough()

function loadConfig(overrides = {}) {
  const result = envSchema.safeParse({ ...process.env, ...overrides })
  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join('.') || 'environment').join(', ')
    throw new Error(`服务端环境变量无效：${fields}`)
  }

  const env = result.data
  return {
    nodeEnv: env.NODE_ENV,
    host: env.YASPRETTY_HOST,
    port: env.FISHTALK_PORT,
    zhipuApiKey: env.ZHIPU_API_KEY,
    zhipuModel: env.ZHIPU_MODEL,
    zhipuSearchEngine: env.ZHIPU_SEARCH_ENGINE,
    zhipuMaxTokens: env.ZHIPU_MAX_TOKENS,
    upstreamTimeoutMs: env.UPSTREAM_TIMEOUT_MS,
    apiRateLimitMax: env.API_RATE_LIMIT_MAX,
    aiRateLimitMax: env.AI_RATE_LIMIT_MAX,
    aiDailyLimit: env.AI_DAILY_LIMIT,
    trustProxy: env.TRUST_PROXY,
  }
}

module.exports = { loadConfig }
