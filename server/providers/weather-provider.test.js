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
})
