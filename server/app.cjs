const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const Fastify = require('fastify')
const { LogController } = Fastify
const helmet = require('@fastify/helmet')
const rateLimit = require('@fastify/rate-limit')
const fastifyStatic = require('@fastify/static')
const { loadConfig } = require('./config.cjs')
const { AppError, publicError } = require('./errors.cjs')
const {
  assistantRequestSchema,
  makeupPlanRequestSchema,
  makeupPlanResponseSchema,
  weatherQuerySchema,
} = require('./schemas.cjs')
const { createZhipuProvider } = require('./providers/zhipu-provider.cjs')
const { createOpenMeteoProvider } = require('./providers/open-meteo-provider.cjs')
const { createAssistantService } = require('./services/assistant-service.cjs')
const { createMakeupPlanService } = require('./services/makeup-plan-service.cjs')

const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')

function parseInput(schema, value) {
  const result = schema.safeParse(value)
  if (result.success) return result.data
  throw new AppError('VALIDATION_ERROR', '请求参数不符合要求。', 400, {
    details: result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  })
}

function createDailyQuota(limit) {
  let activeDate = ''
  const counts = new Map()
  return {
    consume(identifier) {
      const today = new Date().toISOString().slice(0, 10)
      if (today !== activeDate) {
        activeDate = today
        counts.clear()
      }
      const next = (counts.get(identifier) || 0) + 1
      if (next > limit) {
        throw new AppError('DAILY_QUOTA_EXCEEDED', '今日智能服务额度已用完，请明天再试。', 429)
      }
      counts.set(identifier, next)
    },
  }
}

async function loadProducts() {
  const moduleUrl = pathToFileURL(path.join(ROOT, 'src', 'data', 'products.js')).href
  const module = await import(moduleUrl)
  return module.products
}

async function buildApp(options = {}) {
  const config = options.config || loadConfig()
  const logger = options.logger === undefined ? {
    level: config.nodeEnv === 'production' ? 'info' : 'warn',
    redact: {
      paths: ['req.headers.authorization', 'headers.authorization', 'ZHIPU_API_KEY', 'zhipuApiKey'],
      censor: '[REDACTED]',
    },
  } : options.logger

  const app = Fastify({
    logger,
    bodyLimit: 64 * 1024,
    trustProxy: config.trustProxy,
    logController: new LogController({ disableRequestLogging: true }),
  })

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        upgradeInsecureRequests: null,
      },
    },
  })
  await app.register(rateLimit, {
    global: false,
    keyGenerator: (request) => request.ip,
    errorResponseBuilder: () => new AppError(
      'RATE_LIMITED',
      '请求过于频繁，请稍后再试。',
      429,
    ),
  })

  const products = options.products || await loadProducts()
  const zhipuProvider = options.providers?.zhipu || createZhipuProvider({
    apiKey: config.zhipuApiKey,
    model: config.zhipuModel,
    timeoutMs: config.upstreamTimeoutMs,
  })
  const weatherProvider = options.providers?.weather || createOpenMeteoProvider({
    timeoutMs: config.upstreamTimeoutMs,
  })
  const assistantService = createAssistantService({ zhipuProvider, products })
  const makeupPlanService = createMakeupPlanService({ zhipuProvider, products })
  const dailyQuota = createDailyQuota(config.aiDailyLimit)

  app.addHook('onSend', async (request, reply, payload) => {
    if (request.url.startsWith('/api/') || request.url.startsWith('/proxy/') || request.url.startsWith('/memory')) {
      reply.header('Cache-Control', 'no-store')
    }
    return payload
  })

  app.addHook('onResponse', async (request, reply) => {
    request.log.info({
      requestId: request.id,
      method: request.method,
      route: request.routeOptions?.url || 'unmatched',
      statusCode: reply.statusCode,
    }, 'request completed')
  })

  app.setErrorHandler((error, request, reply) => {
    if (reply.sent) return

    let statusCode = 500
    let code = 'INTERNAL_ERROR'
    let message = '服务暂时不可用，请稍后再试。'
    let details

    if (error instanceof AppError || error?.name === 'AppError') {
      statusCode = error.statusCode
      code = error.code
      message = error.message
      details = error.details
    } else if (error.statusCode === 429) {
      statusCode = 429
      code = 'RATE_LIMITED'
      message = '请求过于频繁，请稍后再试。'
    } else if (error.code === 'FST_ERR_CTP_BODY_TOO_LARGE') {
      statusCode = 413
      code = 'PAYLOAD_TOO_LARGE'
      message = '请求内容过大。'
    } else if (error.code === 'FST_ERR_CTP_INVALID_JSON_BODY') {
      statusCode = 400
      code = 'INVALID_JSON'
      message = '请求内容不是合法 JSON。'
    }

    if (statusCode >= 500) request.log.error({ requestId: request.id, code }, 'request failed')
    return reply.status(statusCode).send(publicError(statusCode, code, message, request.id, details))
  })

  app.get('/api/health', {
    config: { rateLimit: { max: config.apiRateLimitMax, timeWindow: '1 minute' } },
  }, async () => ({
    ok: true,
    status: 'ready',
    services: {
      assistant: Boolean(zhipuProvider.configured),
      weather: true,
    },
  }))

  app.get('/api/weather', {
    config: { rateLimit: { max: config.apiRateLimitMax, timeWindow: '1 minute' } },
  }, async (request) => {
    const { city } = parseInput(weatherQuerySchema, request.query)
    const weather = await weatherProvider.lookup(city)
    return { ok: true, ...weather }
  })

  app.post('/api/assistant', {
    config: { rateLimit: { max: config.aiRateLimitMax, timeWindow: '1 minute' } },
  }, async (request) => {
    const input = parseInput(assistantRequestSchema, request.body)
    if (!zhipuProvider.configured) {
      throw new AppError('PROVIDER_NOT_CONFIGURED', '智能服务暂未配置，请使用站内推荐或稍后再试。', 503)
    }
    dailyQuota.consume(request.ip)
    const result = await assistantService.answer(input)
    return { ok: true, ...result }
  })

  app.post('/api/makeup-plans', {
    config: { rateLimit: { max: config.apiRateLimitMax, timeWindow: '1 minute' } },
  }, async (request) => {
    const input = parseInput(makeupPlanRequestSchema, request.body)
    if (zhipuProvider.configured) dailyQuota.consume(request.ip)
    const plan = await makeupPlanService.create(input)
    return makeupPlanResponseSchema.parse({ ok: true, plan })
  })

  const retiredEndpoint = (request, reply) => reply.status(410).send(publicError(
    410,
    'LEGACY_ENDPOINT_REMOVED',
    '该旧接口已停用，请使用 YasPretty /api 接口。',
    request.id,
  ))
  app.all('/proxy/*', retiredEndpoint)
  app.all('/memory', retiredEndpoint)
  app.all('/memory/*', retiredEndpoint)

  const serveStatic = options.serveStatic !== false && fs.existsSync(path.join(DIST, 'index.html'))
  if (serveStatic) {
    await app.register(fastifyStatic, { root: DIST, prefix: '/' })
  }

  app.setNotFoundHandler((request, reply) => {
    if (serveStatic && request.method === 'GET' && !request.url.startsWith('/api/')) {
      return reply.sendFile('index.html')
    }
    return reply.status(404).send(publicError(404, 'NOT_FOUND', '接口不存在。', request.id))
  })

  return app
}

module.exports = { buildApp, createDailyQuota, parseInput }
