const { z } = require('zod')
const { AppError } = require('../errors.cjs')

const geocodingSchema = z.object({
  results: z.array(z.object({
    name: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    country_code: z.string().optional(),
    country: z.string().optional(),
    admin1: z.string().optional(),
    timezone: z.string().optional(),
    feature_code: z.string().optional(),
  }).passthrough()).optional(),
}).passthrough()

const currentSchema = z.object({
  time: z.string(),
  temperature_2m: z.number(),
  apparent_temperature: z.number(),
  relative_humidity_2m: z.number(),
  precipitation: z.number(),
  weather_code: z.number(),
  wind_speed_10m: z.number(),
}).passthrough()

const dailySchema = z.object({
  time: z.array(z.string()).min(1),
  weather_code: z.array(z.number()).min(1),
  temperature_2m_max: z.array(z.number()).min(1),
  temperature_2m_min: z.array(z.number()).min(1),
  precipitation_probability_max: z.array(z.number().nullable()).min(1),
}).passthrough()

const forecastSchema = z.object({
  timezone: z.string().optional(),
  current: currentSchema,
  current_units: z.record(z.string(), z.unknown()).default({}),
  daily: dailySchema,
  daily_units: z.record(z.string(), z.unknown()).default({}),
}).passthrough()

function createOpenMeteoProvider({ timeoutMs, fetchImpl = globalThis.fetch }) {
  async function getJson(url, schema) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetchImpl(url, {
        headers: { 'User-Agent': 'YasPretty/1.0' },
        signal: controller.signal,
      })
      if (!response.ok) {
        throw new AppError('WEATHER_UNAVAILABLE', '天气服务暂时不可用，请稍后再试。', 502)
      }
      let data
      try {
        data = await response.json()
      } catch {
        throw new AppError('WEATHER_INVALID_RESPONSE', '天气服务返回了无法解析的内容。', 502)
      }
      const parsed = schema.safeParse(data)
      if (!parsed.success) {
        throw new AppError('WEATHER_INVALID_RESPONSE', '天气服务返回格式异常。', 502)
      }
      return parsed.data
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError(
        error?.name === 'AbortError' ? 'WEATHER_TIMEOUT' : 'WEATHER_UNAVAILABLE',
        error?.name === 'AbortError' ? '天气服务响应超时，请稍后再试。' : '天气服务连接失败，请稍后再试。',
        502,
      )
    } finally {
      clearTimeout(timer)
    }
  }

  return {
    async lookup(city) {
      const geoUrl = new URL('https://geocoding-api.open-meteo.com/v1/search')
      geoUrl.search = new URLSearchParams({ name: city, count: '5', language: 'zh', format: 'json' })
      const geo = await getJson(geoUrl, geocodingSchema)
      const candidates = geo.results || []
      const place = candidates.find((item) => item.country_code === 'CN' && item.feature_code === 'PPLA')
        || candidates.find((item) => item.country_code === 'CN')
        || candidates[0]
      if (!place) {
        throw new AppError('CITY_NOT_FOUND', `没有找到“${city}”，请尝试输入完整城市名。`, 404)
      }

      const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast')
      forecastUrl.search = new URLSearchParams({
        latitude: String(place.latitude),
        longitude: String(place.longitude),
        current: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        timezone: place.timezone || 'auto',
        forecast_days: '3',
      })
      const forecast = await getJson(forecastUrl, forecastSchema)

      return {
        location: {
          name: place.name,
          admin1: place.admin1 || '',
          country: place.country || '',
          timezone: place.timezone || forecast.timezone || '',
        },
        current: forecast.current,
        currentUnits: forecast.current_units,
        daily: forecast.daily,
        dailyUnits: forecast.daily_units,
        source: 'Open-Meteo',
      }
    },
  }
}

module.exports = { createOpenMeteoProvider }
