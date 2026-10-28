const { z } = require('zod')
const { AppError } = require('../errors.cjs')

const chatResponseSchema = z.object({
  choices: z.array(z.object({
    message: z.object({ content: z.string().trim().min(1) }).passthrough(),
  }).passthrough()).min(1),
}).passthrough()

const searchResponseSchema = z.object({
  choices: z.array(z.object({
    message: z.object({
      tool_calls: z.array(z.object({
        type: z.string(),
        search_result: z.array(z.object({
          title: z.string().optional(),
          link: z.string().optional(),
          content: z.string().optional(),
        }).passthrough()).optional(),
      }).passthrough()).optional(),
    }).passthrough(),
  }).passthrough()).min(1),
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

function createZhipuProvider({ apiKey, model, timeoutMs, fetchImpl = globalThis.fetch }) {
  async function request(pathname, payload, responseSchema) {
    if (!apiKey) {
      throw new AppError('PROVIDER_NOT_CONFIGURED', '智能服务暂未配置，请使用站内推荐或稍后再试。', 503)
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeoutMs)
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
          if (response.status >= 500 && attempt === 0) {
            await wait(150)
            continue
          }
          if (response.status === 401 || response.status === 403) {
            throw new AppError('PROVIDER_AUTH_ERROR', '智能服务配置无效，请联系项目维护者。', 503)
          }
          if (response.status === 429) {
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
        return parsed.data
      } catch (error) {
        if (error instanceof AppError) throw error
        const timedOut = error?.name === 'AbortError'
        if (!timedOut && attempt === 0) {
          await wait(150)
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

    async chat(messages) {
      const data = await request('/api/paas/v4/chat/completions', {
        model,
        temperature: 0.55,
        stream: false,
        messages,
      }, chatResponseSchema)
      return data.choices[0].message.content.trim()
    },

    async search(query) {
      const data = await request('/api/paas/v4/tools', {
        tool: 'web-search-pro',
        messages: [{ role: 'user', content: query }],
        stream: false,
      }, searchResponseSchema)

      const calls = data.choices[0].message.tool_calls || []
      const searchCall = calls.find((call) => call.type === 'search_result')
      const seen = new Set()
      const accessedAt = new Date().toISOString()
      const results = (searchCall?.search_result || []).map((result) => {
        const title = String(result.title || '').replace(/（发布时间[^）]*）\s*$/, '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 300)
        const url = safeUrl(result.link || '')
        const content = String(result.content || '').replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 650)
        let publisher = ''
        try { publisher = new URL(url).hostname.replace(/^www\./, '') } catch { /* filtered below */ }
        return { title, url, content, publisher, accessedAt }
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
