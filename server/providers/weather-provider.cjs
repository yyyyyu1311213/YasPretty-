const { z } = require('zod')
const { AppError } = require('../errors.cjs')

const OPEN_METEO_GEOCODING = 'https://geocoding-api.open-meteo.com/v1/search'
const OPEN_METEO_FORECAST = 'https://api.open-meteo.com/v1/forecast'

const geocodingResponseSchema = z.object({
  results: z.array(z.object({
    name: z.string().trim().min(1),
    latitude: z.number().finite(),
    longitude: z.number().finite(),
    country: z.string().optional(),
    country_code: z.string().optional(),
    admin1: z.string().optional(),
  }).passthrough()).default([]),
}).passthrough()

const forecastResponseSchema = z.object({
  timezone: z.string().trim().min(1),
  current: z.object({
    temperature_2m: z.number().finite().optional(),
    apparent_temperature: z.number().finite().optional(),
    weather_code: z.number().int().optional(),
    wind_speed_10m: z.number().finite().optional(),
    wind_direction_10m: z.number().finite().optional(),
  }).passthrough().optional(),
  daily: z.object({
    time: z.array(z.string().trim().min(1)).min(1),
    weather_code: z.array(z.number().int()),
    temperature_2m_max: z.array(z.number().finite().nullable()),
    temperature_2m_min: z.array(z.number().finite().nullable()),
    precipitation_probability_max: z.array(z.number().finite().nullable()).optional(),
    wind_speed_10m_max: z.array(z.number().finite().nullable()).optional(),
    wind_direction_10m_dominant: z.array(z.number().finite().nullable()).optional(),
  }).passthrough(),
}).passthrough()

const WEATHER_CODES = new Map([
  [0, '晴'], [1, '大致晴'], [2, '局部多云'], [3, '阴'],
  [45, '雾'], [48, '雾凇'], [51, '小毛毛雨'], [53, '毛毛雨'], [55, '较强毛毛雨'],
  [56, '冻毛毛雨'], [57, '较强冻毛毛雨'], [61, '小雨'], [63, '中雨'], [65, '大雨'],
  [66, '小冻雨'], [67, '强冻雨'], [71, '小雪'], [73, '中雪'], [75, '大雪'],
  [77, '雪粒'], [80, '小阵雨'], [81, '阵雨'], [82, '强阵雨'], [85, '小阵雪'],
  [86, '强阵雪'], [95, '雷雨'], [96, '雷雨伴小冰雹'], [99, '雷雨伴强冰雹'],
])

const WIND_DIRECTIONS = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风']

// Stable city-center coordinates avoid a second cold-start request for common queries.
const CITY_COORDINATES = Object.freeze({
  北京: [39.9042, 116.4074], 上海: [31.2304, 121.4737], 广州: [23.1291, 113.2644],
  深圳: [22.5431, 114.0579], 杭州: [30.2741, 120.1551], 成都: [30.5728, 104.0668],
  昆明: [25.0389, 102.7183], 石家庄: [38.0428, 114.5149], 西安: [34.3416, 108.9398],
  南京: [32.0603, 118.7969], 武汉: [30.5928, 114.3055], 重庆: [29.563, 106.5516],
  天津: [39.3434, 117.3616], 郑州: [34.7466, 113.6254], 济南: [36.6512, 117.1201],
  哈尔滨: [45.8038, 126.5349], 长春: [43.8171, 125.3235], 沈阳: [41.8057, 123.4315],
  大连: [38.914, 121.6147], 福州: [26.0745, 119.2965], 厦门: [24.4798, 118.0894],
  南宁: [22.817, 108.3669], 贵阳: [26.647, 106.6302], 海口: [20.044, 110.1983],
  乌鲁木齐: [43.8256, 87.6168], 兰州: [36.0611, 103.8343], 合肥: [31.8206, 117.2272],
  南昌: [28.6829, 115.8582], 长沙: [28.2282, 112.9388], 太原: [37.8706, 112.5489],
  呼和浩特: [40.8426, 111.7492], 银川: [38.4872, 106.2309], 西宁: [36.6171, 101.7782],
  拉萨: [29.6525, 91.1721],
})

function weatherCodeLabel(code) {
  return WEATHER_CODES.get(code) || '天气状况待核验'
}

function windDirectionLabel(degrees) {
  if (!Number.isFinite(degrees)) return ''
  const index = Math.round((degrees % 360) / 45) % 8
  return WIND_DIRECTIONS[index]
}

function createRequestError(message, cause) {
  const error = new AppError('WEATHER_PROVIDER_UNAVAILABLE', message, 503)
  if (cause) error.cause = cause
  return error
}

function createWeatherProvider({
  fetchImpl = globalThis.fetch,
  timeoutMs = 8000,
  now = () => new Date(),
} = {}) {
  const geocodeCache = new Map()

  async function getJson(url, schema) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetchImpl(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      if (!response.ok) throw createRequestError('天气数据源暂时不可用。')
      let body
      try {
        body = await response.json()
      } catch (error) {
        throw createRequestError('天气数据源返回了无法解析的内容。', error)
      }
      const parsed = schema.safeParse(body)
      if (!parsed.success) throw createRequestError('天气数据源返回格式异常。')
      return parsed.data
    } catch (error) {
      if (error instanceof AppError) throw error
      throw createRequestError(
        error?.name === 'AbortError' ? '天气数据源响应超时。' : '天气数据源连接失败。',
        error,
      )
    } finally {
      clearTimeout(timer)
    }
  }

  async function geocode(city) {
    const normalizedCity = String(city).trim().replace(/[市地区县]$/u, '')
    const cached = geocodeCache.get(normalizedCity)
    if (cached && cached.expiresAt > Date.now()) return cached.location

    const coordinates = CITY_COORDINATES[normalizedCity]
    if (coordinates) {
      const location = {
        name: `${normalizedCity}市`,
        latitude: coordinates[0],
        longitude: coordinates[1],
        country: '中国',
        country_code: 'CN',
      }
      geocodeCache.set(normalizedCity, { location, expiresAt: Date.now() + 24 * 60 * 60 * 1000 })
      return location
    }

    const params = new URLSearchParams({
      name: normalizedCity.slice(0, 40),
      count: '5',
      language: 'zh',
      format: 'json',
    })
    const data = await getJson(`${OPEN_METEO_GEOCODING}?${params.toString()}`, geocodingResponseSchema)
    const result = data.results.find((item) => item.country_code?.toUpperCase() === 'CN') || data.results[0]
    if (!result) throw createRequestError('没有找到这个城市的天气数据。')
    geocodeCache.set(normalizedCity, { location: result, expiresAt: Date.now() + 24 * 60 * 60 * 1000 })
    return result
  }

  return {
    configured: true,
    providerName: 'Open-Meteo',

    async forecast({ city, date }) {
      const location = await geocode(city)
      const params = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant',
        timezone: 'Asia/Shanghai',
        forecast_days: '3',
      })
      const forecastUrl = `${OPEN_METEO_FORECAST}?${params.toString()}`
      const data = await getJson(forecastUrl, forecastResponseSchema)
      const index = data.daily.time.indexOf(date)
      if (index < 0) throw createRequestError('天气数据源没有返回目标日期。')

      const max = data.daily.temperature_2m_max[index]
      const min = data.daily.temperature_2m_min[index]
      if (max === null || min === null) throw createRequestError('天气数据缺少目标日期的温度。')

      return {
        city: location.name,
        region: location.admin1 || '',
        date,
        condition: weatherCodeLabel(data.daily.weather_code[index]),
        temperature: { min, max },
        precipitationProbability: data.daily.precipitation_probability_max?.[index] ?? null,
        wind: {
          direction: windDirectionLabel(data.daily.wind_direction_10m_dominant?.[index]),
          speed: data.daily.wind_speed_10m_max?.[index] ?? null,
        },
        current: data.current ? {
          temperature: data.current.temperature_2m,
          apparentTemperature: data.current.apparent_temperature,
          condition: weatherCodeLabel(data.current.weather_code),
          windDirection: windDirectionLabel(data.current.wind_direction_10m),
          windSpeed: data.current.wind_speed_10m,
        } : null,
        source: {
          publisher: 'Open-Meteo',
          url: forecastUrl,
          retrievedAt: now().toISOString(),
        },
        limitations: ['天气预报会随时间更新；如遇气象灾害，请以当地气象部门预警为准。'],
      }
    },
  }
}

module.exports = {
  createWeatherProvider,
  weatherCodeLabel,
  windDirectionLabel,
}
