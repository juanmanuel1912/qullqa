import { describe, expect, it } from 'vitest'
import fallback from '../../data/fallback-cusco.json'
import { parseClimatology } from '../../services/nasa/power'
import { parseForecast, weatherIcon, type DayForecast } from '../../services/weather/openMeteo'
import { cropKc, planWeek } from './weekPlan'

const clim = parseClimatology(fallback, 'fallback')
const day = (date: string, p: Partial<DayForecast> = {}): DayForecast => ({
  date,
  tMax: 20,
  tMin: 6,
  rainMm: 0,
  rainProb: 0,
  code: 0,
  et0: 5,
  ...p,
})

describe('plan de la semana', () => {
  it('pide regar cuando se acumula déficit y no viene lluvia', () => {
    const days = ['01', '02', '03', '04', '05', '06', '07'].map((d) => day(`2026-11-${d}`))
    const plan = planWeek(days, 0.5, clim)
    expect(plan.irrigateOn.length).toBeGreaterThan(0)
    expect(plan.normalRain).toBe(Math.round(clim.months[10].precipMmDay * 7))
  })

  it('no pide regar si llueve pronto', () => {
    const days = [
      day('2026-11-01'),
      day('2026-11-02'),
      day('2026-11-03', { rainMm: 12, rainProb: 90, code: 61 }),
      day('2026-11-04', { rainMm: 12, rainProb: 90, code: 61 }),
    ]
    expect(planWeek(days, 0.5).irrigateOn).toEqual([])
  })

  it('marca heladas y lluvias fuertes', () => {
    const plan = planWeek([day('2026-07-01', { tMin: -3 }), day('2026-07-02', { rainMm: 25, rainProb: 95 })], null)
    expect(plan.frostDays).toEqual(['2026-07-01'])
    expect(plan.heavyRainDays).toEqual(['2026-07-02'])
  })

  it('Kc de la papa sube en plena tuberización', () => {
    expect(cropKc(0.05)).toBe(0.5)
    expect(cropKc(0.6)).toBe(1.15)
    expect(cropKc(0.95)).toBe(0.75)
  })
})

describe('Open-Meteo', () => {
  it('parsea el pronóstico', () => {
    const f = parseForecast(
      {
        timezone: 'America/Lima',
        elevation: 3347,
        current: { time: '2026-11-14T11:45', temperature_2m: 21.4, relative_humidity_2m: 33, precipitation: 0, weather_code: 1, wind_speed_10m: 4.8, is_day: 1 },
        daily: {
          time: ['2026-11-14'],
          temperature_2m_max: [21.8],
          temperature_2m_min: [8.8],
          precipitation_sum: [10.9],
          precipitation_probability_max: [88],
          weather_code: [81],
          et0_fao_evapotranspiration: [4.27],
        },
      },
      -13.53,
      -71.97,
    )
    expect(f.current.tempC).toBe(21.4)
    expect(f.days[0]).toMatchObject({ rainMm: 10.9, rainProb: 88 })
    expect(weatherIcon(81).key).toBe('rain')
  })
})
