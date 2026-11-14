/**
 * Tiempo actual y pronóstico de 7 días (Open-Meteo: gratis, sin clave, CORS abierto).
 * NASA POWER no tiene pronóstico (sus datos llegan con ~3 días de retraso), así que
 * el "hoy y mañana" viene de Open-Meteo y la historia/clima normal de NASA POWER.
 */
import { cacheGet, cacheGetStale, cacheSet, HOUR, locationKey } from '../nasa/cache'

export interface CurrentWeather {
  time: string
  tempC: number
  humidity: number
  precipMm: number
  windKmh: number
  code: number
  isDay: boolean
}

export interface DayForecast {
  /** YYYY-MM-DD (hora local del lugar) */
  date: string
  tMax: number
  tMin: number
  rainMm: number
  /** Probabilidad máxima de lluvia (%) */
  rainProb: number
  code: number
  /** Evapotranspiración de referencia FAO (mm) */
  et0: number
}

export interface Forecast {
  lat: number
  lon: number
  timezone: string
  elevation: number | null
  current: CurrentWeather
  days: DayForecast[]
  fetchedAt: string
  source: 'live' | 'cache'
}

interface OMResponse {
  timezone?: string
  elevation?: number
  current?: Record<string, number | string>
  daily?: Record<string, (number | string)[]>
}

export function forecastUrl(lat: number, lon: number): string {
  const q = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code,et0_fao_evapotranspiration',
    timezone: 'auto',
    forecast_days: '7',
  })
  return `https://api.open-meteo.com/v1/forecast?${q}`
}

const num = (v: unknown, fallback = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)

export function parseForecast(json: unknown, lat: number, lon: number): Forecast {
  const r = json as OMResponse
  if (!r.current || !r.daily?.time) throw new Error('Pronóstico sin datos')
  const d = r.daily
  return {
    lat,
    lon,
    timezone: r.timezone ?? 'UTC',
    elevation: r.elevation ?? null,
    current: {
      time: String(r.current.time ?? ''),
      tempC: num(r.current.temperature_2m),
      humidity: num(r.current.relative_humidity_2m),
      precipMm: num(r.current.precipitation),
      windKmh: num(r.current.wind_speed_10m),
      code: num(r.current.weather_code),
      isDay: num(r.current.is_day, 1) === 1,
    },
    days: d.time.map((t, i) => ({
      date: String(t),
      tMax: num(d.temperature_2m_max?.[i]),
      tMin: num(d.temperature_2m_min?.[i]),
      rainMm: num(d.precipitation_sum?.[i]),
      rainProb: num(d.precipitation_probability_max?.[i]),
      code: num(d.weather_code?.[i]),
      et0: num(d.et0_fao_evapotranspiration?.[i]),
    })),
    fetchedAt: new Date().toISOString(),
    source: 'live',
  }
}

/** Caché de 1 hora; sin conexión devuelve el último pronóstico guardado. Lanza error si no hay nada. */
export async function fetchForecast(lat: number, lon: number, signal?: AbortSignal): Promise<Forecast> {
  const key = `forecast:${locationKey(lat, lon)}`
  const fresh = cacheGet<Forecast>(key, HOUR)
  if (fresh) return { ...fresh, source: 'cache' }
  try {
    const res = await fetch(forecastUrl(lat, lon), { signal })
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
    const f = parseForecast(await res.json(), lat, lon)
    cacheSet(key, f)
    return f
  } catch (err) {
    const stale = cacheGetStale<Forecast>(key)
    if (stale && !signal?.aborted) return { ...stale, source: 'cache' }
    throw err
  }
}

/** Código WMO → ícono y clave i18n (wx.*). */
export function weatherIcon(code: number, isDay = true): { emoji: string; key: string } {
  if (code === 0) return { emoji: isDay ? '☀️' : '🌙', key: 'clear' }
  if (code <= 2) return { emoji: isDay ? '🌤️' : '☁️', key: 'partly' }
  if (code === 3) return { emoji: '☁️', key: 'cloudy' }
  if (code === 45 || code === 48) return { emoji: '🌫️', key: 'fog' }
  if (code >= 51 && code <= 57) return { emoji: '🌦️', key: 'drizzle' }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { emoji: '🌧️', key: 'rain' }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { emoji: '🌨️', key: 'snow' }
  if (code >= 95) return { emoji: '⛈️', key: 'storm' }
  return { emoji: '🌥️', key: 'cloudy' }
}
