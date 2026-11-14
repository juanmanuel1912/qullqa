/**
 * El Niño / La Niña con datos oficiales de NOAA (Climate Prediction Center).
 * - ONI: anomalía de temperatura del mar en Niño 3.4 (Pacífico central), media de 3 meses.
 * - Niño 1+2: anomalía mensual frente a la costa de Perú y Ecuador (la que mira el ENFEN).
 * NOAA no permite CORS: en producción Vercel hace de intermediario (/api/enso/*, ver vercel.json)
 * y en desarrollo lo hace Vite (vite.config.ts). Sin conexión se usa /enso-fallback.json.
 */
import { cacheGet, cacheGetStale, cacheSet, HOUR } from '../nasa/cache'

export interface OniPoint {
  /** Trimestre: 'DJF', 'JFM', … 'NDJ' */
  season: string
  year: number
  anom: number
}

export interface Nino12Point {
  year: number
  /** 1-12 */
  month: number
  anom: number
}

export interface EnsoData {
  oni: OniPoint[]
  nino12: Nino12Point[]
  source: 'live' | 'cache' | 'fallback'
  fetchedAt: string
}

const KEEP = 36

export function parseOni(text: string): OniPoint[] {
  return text
    .split('\n')
    .map((l) => l.trim().split(/\s+/))
    .filter((p) => p.length >= 4 && /^[A-Z]{3}$/.test(p[0]) && /^\d{4}$/.test(p[1]))
    .map((p) => ({ season: p[0], year: Number(p[1]), anom: Number(p[3]) }))
    .filter((p) => Number.isFinite(p.anom))
    .slice(-KEEP)
}

export function parseNino12(text: string): Nino12Point[] {
  return text
    .split('\n')
    .map((l) => l.trim().split(/\s+/))
    .filter((p) => p.length >= 4 && /^\d{4}$/.test(p[0]))
    .map((p) => ({ year: Number(p[0]), month: Number(p[1]), anom: Number(p[3]) }))
    .filter((p) => Number.isFinite(p.anom) && p.anom > -99)
    .slice(-KEEP)
}

async function getText(url: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`NOAA ${res.status}`)
  return res.text()
}

/** Nunca falla: NOAA en vivo → caché → instantánea incluida en la app. */
export async function fetchEnso(signal?: AbortSignal): Promise<EnsoData> {
  const key = 'enso:noaa'
  const fresh = cacheGet<EnsoData>(key, 12 * HOUR)
  if (fresh) return { ...fresh, source: 'cache' }
  try {
    const [oniText, ninoText] = await Promise.all([getText('/api/enso/oni', signal), getText('/api/enso/nino12', signal)])
    const data: EnsoData = { oni: parseOni(oniText), nino12: parseNino12(ninoText), source: 'live', fetchedAt: new Date().toISOString() }
    if (data.oni.length === 0 || data.nino12.length === 0) throw new Error('NOAA sin datos')
    cacheSet(key, data)
    return data
  } catch (err) {
    if (signal?.aborted) throw err
    const stale = cacheGetStale<EnsoData>(key)
    if (stale) return { ...stale, source: 'cache' }
    const res = await fetch('/enso-fallback.json', { signal })
    const snap = (await res.json()) as Omit<EnsoData, 'source'>
    return { ...snap, source: 'fallback' }
  }
}
