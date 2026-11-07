const { z } = require('zod')
const { AppError } = require('../errors.cjs')

const chatResponseSchema = z.object({
  choices: z.array(z.object({
    message: z.object({ content: z.string().trim().min(1) }).passthrough(),
  }).passthrough()).min(1),
}).passthrough()

const searchResponseSchema = z.object({
  search_result: z.array(z.object({
    title: z.string().optional(),
    link: z.string().optional(),
    content: z.string().optional(),
    media: z.string().optional(),
    publish_date: z.string().optional(),
  }).passthrough()).default([]),
}).passthrough()

function safeUrl(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : ''
  } catch {
    return ''
  }
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function retryDelay(response, fallbackMs) {
  const value = response.headers?.get?.('retry-after')
  if (value === null || value === undefined || value === '') return fallbackMs
  const seconds = Number(value)
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(2000, Math.round(seconds * 1000))
  return fallbackMs
}

async function upstreamErrorCode(response) {
  try {
    const body = await response.json()
    return String(body?.code || body?.error?.code || '')
  } catch {
    return ''
  }
}

function createZhipuProvider({
  apiKey,
  model,
  searchEngine = 'search_std',
  maxTokens = 4096,
  timeoutMs,
  fetchImpl = globalThis.fetch,
  waitImpl = wait,
  now = () => Date.now(),
}) {
  const quotaCooldowns = new Map()

  async function request(pathname, payload, responseSchema, requestOptions = {}) {
    if (!apiKey) {
      throw new AppError('PROVIDER_NOT_CONFIGURED', '智能服务暂未配置，请使用站内推荐或稍后再试。', 503)
    }

    const cooldownUntil = quotaCooldowns.get(pathname) || 0
    if (cooldownUntil > now()) {
      throw new AppError('PROVIDER_QUOTA_EXHAUSTED', '智能服务当前没有可用额度，请使用站内推荐或联系维护者补充额度。', 503)
    }

    const requestTimeoutMs = requestOptions.timeoutMs || timeoutMs
    const maxAttempts = requestOptions.maxAttempts || 2
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), requestTimeoutMs)
      try {
        const response = await fetchImpl(`https://open.bigmodel.cn${pathname}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })

        if (!response.ok) {
          const upstreamCode = await upstreamErrorCode(response)
          if (response.status >= 500 && attempt < maxAttempts - 1) {
            await waitImpl(retryDelay(response, 250))
            continue
          }
          if (response.status === 401 || response.status === 403) {
            throw new AppError('PROVIDER_AUTH_ERROR', '智能服务配置无效，请联系项目维护者。', 503)
          }
          if (response.status === 429) {
            if (upstreamCode === '1113') {
              quotaCooldowns.set(pathname, now() + 5 * 60 * 1000)
              throw new AppError('PROVIDER_QUOTA_EXHAUSTED', '智能服务当前没有可用额度，请使用站内推荐或联系维护者补充额度。', 503)
            }
            if (attempt < maxAttempts - 1) {
              await waitImpl(retryDelay(response, 500))
              continue
            }
            throw new AppError('PROVIDER_RATE_LIMITED', '智能服务当前繁忙，请稍后再试。', 503)
          }
          throw new AppError('PROVIDER_UNAVAILABLE', '智能服务暂时不可用，请稍后再试。', 502)
        }

        let data
        try {
          data = await response.json()
        } catch {
          throw new AppError('PROVIDER_INVALID_RESPONSE', '智能服务返回了无法解析的内容。', 502)
        }

        const parsed = responseSchema.safeParse(data)
        if (!parsed.success) {
          throw new AppError('PROVIDER_INVALID_RESPONSE', '智能服务返回格式异常。', 502)
        }
        quotaCooldowns.delete(pathname)
        return parsed.data
      } catch (error) {
        if (error instanceof AppError) throw error
        const timedOut = error?.name === 'AbortError'
        if (attempt < maxAttempts - 1) {
          await waitImpl(timedOut ? 300 : 250)
          continue
        }
        throw new AppError(
          timedOut ? 'PROVIDER_TIMEOUT' : 'PROVIDER_UNAVAILABLE',
          timedOut ? '智能服务响应超时，请稍后再试。' : '智能服务连接失败，请稍后再试。',
          502,
        )
      } finally {
        clearTimeout(timer)
      }
    }

    throw new AppError('PROVIDER_UNAVAILABLE', '智能服务暂时不可用，请稍后再试。', 502)
  }

  return {
    configured: Boolean(apiKey),
    modelName: model,

    async chat(messages, options = {}) {
      const data = await request('/api/paas/v4/chat/completions', {
        model,
        temperature: 1,
        top_p: 0.95,
        stream: false,
        max_tokens: maxTokens,
        messages,
      }, chatResponseSchema, options)
      return data.choices[0].message.content.trim()
    },

    async search(query, options = {}) {
      const data = await request('/api/paas/v4/web_search', {
        search_query: String(query || '').trim().slice(0, 70),
        search_engine: searchEngine,
        // The assistant router has already decided this is a current-fact query.
        // Skip a second intent gate so explicit weather/news requests are searched.
        search_intent: false,
        count: options.count || 5,
        search_recency_filter: options.recency || 'noLimit',
        content_size: options.contentSize || 'medium',
      }, searchResponseSchema)

      const seen = new Set()
      const accessedAt = new Date().toISOString()
      const results = data.search_result.map((result) => {
        const title = String(result.title || '').replace(/（发布时间[^）]*）\s*$/, '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 300)
        const url = safeUrl(result.link || '')
        const content = String(result.content || '').replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 650)
        let publisher = String(result.media || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 200)
        if (!publisher) {
          try { publisher = new URL(url).hostname.replace(/^www\./, '') } catch { /* filtered below */ }
        }
        const publishDate = String(result.publish_date || '').trim().slice(0, 30)
        return { title, url, content, publisher, publishDate, accessedAt }
      }).filter((result) => {
        if (!result.title || !result.url || !result.content || seen.has(result.url)) return false
        seen.add(result.url)
        return true
      }).slice(0, 5)

      if (!results.length) {
        throw new AppError('SEARCH_EMPTY', '联网检索没有返回可用来源。', 502)
      }
      return results
    },
  }
}

module.exports = { createZhipuProvider }
