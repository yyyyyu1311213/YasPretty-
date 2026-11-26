import { describe, expect, it, vi } from 'vitest'
import weatherModule from './weather-provider.cjs'

const { createWeatherProvider, weatherCodeLabel, windDirectionLabel } = weatherModule

function response(body, ok = true) {
  return {
    ok,
    async json() { return body },
  }
}

function fetchFixture() {
  return vi.fn(async (url) => {
    if (url.startsWith('https://geocoding-api.open-meteo.com')) {
      return response({
        results: [{ name: '保定', latitude: 38.87, longitude: 115.46, country: '中国', country_code: 'CN', admin1: '河北省' }],
      })
    }
    return response({
      timezone: 'Asia/Shanghai',
      current: {
        temperature_2m: 8,
        apparent_temperature: 6,
        weather_code: 2,
        wind_speed_10m: 12,
        wind_direction_10m: 45,
      },
      daily: {
        time: ['2026-11-07', '2026-11-08', '2026-11-09'],
        weather_code: [2, 61, 3],
        temperature_2m_max: [10, 9, 11],
        temperature_2m_min: [4, 2, 5],
        precipitation_probability_max: [30, 70, 10],
        wind_speed_10m_max: [12, 18, 9],
        wind_direction_10m_dominant: [45, 90, 0],
      },
    })
  })
}

describe('Open-Meteo weather provider', () => {
  it('resolves a city and returns validated daily weather facts', async () => {
    const provider = createWeatherProvider({
      fetchImpl: fetchFixture(),
      now: () => new Date('2026-11-07T00:00:00.000Z'),
    })

    const result = await provider.forecast({ city: '保定', date: '2026-11-07' })

    expect(result).toMatchObject({
      city: '保定',
      date: '2026-11-07',
      condition: '局部多云',
      temperature: { min: 4, max: 10 },
      precipitationProbability: 30,
      wind: { direction: '东北风', speed: 12 },
      source: { publisher: 'Open-Meteo' },
    })
  })

  it('rejects an empty geocoding result instead of inventing weather', async () => {
    const provider = createWeatherProvider({
      fetchImpl: vi.fn(async () => response({ results: [] })),
    })

    await expect(provider.forecast({ city: '不存在的城市', date: '2026-11-07' }))
      .rejects.toMatchObject({ code: 'WEATHER_PROVIDER_UNAVAILABLE' })
  })

  it('maps weather and wind codes deterministically', () => {
    expect(weatherCodeLabel(61)).toBe('小雨')
    expect(windDirectionLabel(45)).toBe('东北风')
    expect(windDirectionLabel(360)).toBe('北风')
  })

  it.each(['AbortError', 'TypeError'])('recovers once from %s and returns only validated weather', async (name) => {
    const failure = Object.assign(new Error('private upstream detail'), { name })
    const fetchImpl = fetchFixture().mockRejectedValueOnce(failure)
    const waitImpl = vi.fn(async () => {})
    const provider = createWeatherProvider({ fetchImpl, waitImpl })
    const result = await provider.forecast({ city: '石家庄', date: '2026-11-07' })
    expect(result.temperature).toEqual({ min: 4, max: 10 })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(waitImpl).toHaveBeenCalledExactlyOnceWith(250)
  })

  it.each([429, 503])('retries transient HTTP %s once', async (status) => {
    const fetchImpl = fetchFixture().mockResolvedValueOnce({ ok: false, status })
    const provider = createWeatherProvider({ fetchImpl, waitImpl: async () => {} })
    await expect(provider.forecast({ city: '石家庄', date: '2026-11-07' })).resolves.toMatchObject({ city: '石家庄市' })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('stops after the shared retry budget and exposes a safe failure', async () => {
    const fetchImpl = vi.fn(async () => { throw Object.assign(new Error('private upstream detail'), { name: 'AbortError' }) })
    const provider = createWeatherProvider({ fetchImpl, waitImpl: async () => {} })
    await expect(provider.forecast({ city: '石家庄', date: '2026-11-07' })).rejects.toMatchObject({ code: 'WEATHER_PROVIDER_UNAVAILABLE', message: '天气数据源响应超时。' })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it.each([{ ok: false, status: 400 }, response({ daily: {} })])('does not retry permanent or malformed responses', async (result) => {
    const fetchImpl = vi.fn(async () => result)
    const provider = createWeatherProvider({ fetchImpl, waitImpl: vi.fn() })
    await expect(provider.forecast({ city: '石家庄', date: '2026-11-07' })).rejects.toMatchObject({ code: 'WEATHER_PROVIDER_UNAVAILABLE' })
    expect(fetchImpl).toHaveBeenCalledOnce()
  })

  it('shares one retry across geocoding and the forecast request', async () => {
    const fetchImpl = fetchFixture()
      .mockRejectedValueOnce(new TypeError('connect failed'))
      .mockResolvedValueOnce(response({ results: [{ name: '保定', latitude: 38.87, longitude: 115.46, country_code: 'CN' }] }))
      .mockRejectedValueOnce(new TypeError('forecast failed'))
    const provider = createWeatherProvider({ fetchImpl, waitImpl: async () => {} })
    await expect(provider.forecast({ city: '保定', date: '2026-11-07' })).rejects.toMatchObject({ code: 'WEATHER_PROVIDER_UNAVAILABLE' })
    expect(fetchImpl).toHaveBeenCalledTimes(3)
  })
  it('also retries a timeout while reading the response body', async () => {
    const fetchImpl = fetchFixture().mockResolvedValueOnce({ ok: true, json: async () => { throw Object.assign(new Error('body timed out'), { name: 'AbortError' }) } })
    const provider = createWeatherProvider({ fetchImpl, waitImpl: async () => {} })
    await expect(provider.forecast({ city: '石家庄', date: '2026-11-07' })).resolves.toMatchObject({ temperature: { min: 4, max: 10 } })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })
})
