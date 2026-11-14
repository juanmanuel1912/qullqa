/**
 * Buscar un lugar por nombre (pueblo, distrito, ciudad) en todo el mundo.
 * Open-Meteo Geocoding: gratis, sin clave y con CORS abierto (datos de GeoNames).
 */
export interface Place {
  id: number
  name: string
  /** Región / departamento */
  admin1?: string
  /** Provincia */
  admin2?: string
  country?: string
  countryCode?: string
  lat: number
  lon: number
  elevation?: number
}

interface RawResult {
  id: number
  name: string
  admin1?: string
  admin2?: string
  country?: string
  country_code?: string
  latitude: number
  longitude: number
  elevation?: number
}

export function parsePlaces(json: unknown): Place[] {
  const results = (json as { results?: RawResult[] })?.results ?? []
  return results
    .filter((r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude))
    .map((r) => ({
      id: r.id,
      name: r.name,
      admin1: r.admin1,
      admin2: r.admin2,
      country: r.country,
      countryCode: r.country_code,
      lat: r.latitude,
      lon: r.longitude,
      elevation: r.elevation,
    }))
}

export async function searchPlaces(query: string, lang: string, signal?: AbortSignal): Promise<Place[]> {
  const q = query.trim()
  if (q.length < 2) return []
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=${lang === 'en' ? 'en' : 'es'}&format=json`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`geocoding ${res.status}`)
  return parsePlaces(await res.json())
}
