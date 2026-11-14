/**
 * Cliente de NASA POWER (https://power.larc.nasa.gov) — sin API key, con CORS abierto.
 * - Climatología mensual 2001-2025 → calendario y proyección de cosecha.
 * - Datos diarios → grados-día reales acumulados desde la siembra.
 */
import { cacheGet, cacheGetStale, cacheSet, DAY, HOUR, locationKey } from './cache';
import type { Climatology, DailyRecord, DailySeries, MonthlyClimate } from './types';

const BASE = 'https://power.larc.nasa.gov/api/temporal';
const FILL_VALUE = -999;
const MONTH_KEYS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as const;
const DAYS_IN_MONTH = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const CLIMATE_PARAMS = ['T2M', 'T2M_MIN', 'T2M_MAX', 'PRECTOTCORR', 'GWETROOT', 'ALLSKY_SFC_SW_DWN'] as const;
export const DAILY_PARAMS = ['T2M', 'T2M_MIN', 'T2M_MAX', 'PRECTOTCORR', 'GWETROOT'] as const;

/** Cusco: ubicación por defecto si no hay GPS. */
export const CUSCO = { lat: -13.5319, lon: -71.9754 } as const;
export const FALLBACK_URL = '/fallback-cusco.json';

type ParamTable = Record<string, Record<string, number>>;

interface PowerResponse {
  geometry?: { coordinates?: number[] };
  properties?: { parameter?: ParamTable };
}

const clean = (v: number | undefined): number | null =>
  v === undefined || v === null || Number.isNaN(v) || v <= FILL_VALUE ? null : v;

export function climatologyUrl(lat: number, lon: number): string {
  const q = new URLSearchParams({
    parameters: CLIMATE_PARAMS.join(','),
    community: 'AG',
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    format: 'JSON',
  });
  return `${BASE}/climatology/point?${q}`;
}

export function dailyUrl(lat: number, lon: number, start: Date, end: Date): string {
  const q = new URLSearchParams({
    parameters: DAILY_PARAMS.join(','),
    community: 'AG',
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    start: toPowerDate(start),
    end: toPowerDate(end),
    format: 'JSON',
  });
  return `${BASE}/daily/point?${q}`;
}

/** Date → 'YYYYMMDD' (UTC) */
export function toPowerDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

/** Convierte la respuesta cruda de climatología POWER en 12 meses. */
export function parseClimatology(json: unknown, source: Climatology['source']): Climatology {
  const res = json as PowerResponse;
  const p = res.properties?.parameter;
  if (!p?.T2M) throw new Error('Respuesta de NASA POWER sin datos de climatología');
  const [lon, lat, elev] = res.geometry?.coordinates ?? [];
  const get = (param: string, key: string, fallback = 0): number => clean(p[param]?.[key]) ?? fallback;

  const months: MonthlyClimate[] = MONTH_KEYS.map((key, month) => {
    const precipMmDay = get('PRECTOTCORR', key);
    return {
      month,
      t2m: get('T2M', key),
      t2mMin: get('T2M_MIN', key),
      t2mMax: get('T2M_MAX', key),
      precipMmDay,
      precipMmMonth: Math.round(precipMmDay * DAYS_IN_MONTH[month]),
      gwetRoot: get('GWETROOT', key),
      solar: get('ALLSKY_SFC_SW_DWN', key),
    };
  });

  return {
    lat: lat ?? 0,
    lon: lon ?? 0,
    elevation: elev ?? null,
    months,
    source,
    fetchedAt: new Date().toISOString(),
  };
}

/** Convierte la respuesta cruda diaria de POWER en una lista ordenada de días. */
export function parseDaily(json: unknown, source: DailySeries['source']): DailySeries {
  const res = json as PowerResponse;
  const p = res.properties?.parameter;
  if (!p?.T2M) throw new Error('Respuesta de NASA POWER sin datos diarios');
  const [lon, lat] = res.geometry?.coordinates ?? [];

  const days: DailyRecord[] = Object.keys(p.T2M)
    .sort()
    .map((k) => ({
      date: `${k.slice(0, 4)}-${k.slice(4, 6)}-${k.slice(6, 8)}`,
      t2m: clean(p.T2M?.[k]),
      t2mMin: clean(p.T2M_MIN?.[k]),
      t2mMax: clean(p.T2M_MAX?.[k]),
      precip: clean(p.PRECTOTCORR?.[k]),
      gwetRoot: clean(p.GWETROOT?.[k]),
    }));

  return { lat: lat ?? 0, lon: lon ?? 0, days, source, fetchedAt: new Date().toISOString() };
}

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`NASA POWER respondió ${res.status}`);
  return res.json();
}

/**
 * Climatología mensual de un punto. Orden: caché fresca (30 días) → NASA → caché vencida → JSON de Cusco.
 * Nunca lanza error: siempre devuelve datos (revisa `source` para avisar al usuario).
 */
export async function fetchClimatology(lat: number, lon: number, signal?: AbortSignal): Promise<Climatology> {
  const key = `clim:${locationKey(lat, lon)}`;
  const fresh = cacheGet<Climatology>(key, 30 * DAY);
  if (fresh) return { ...fresh, source: 'cache' };

  try {
    const data = parseClimatology(await getJson(climatologyUrl(lat, lon), signal), 'nasa');
    cacheSet(key, data);
    return data;
  } catch (err) {
    if (signal?.aborted) throw err;
    const stale = cacheGetStale<Climatology>(key);
    if (stale) return { ...stale, source: 'cache' };
    return parseClimatology(await getJson(FALLBACK_URL, signal), 'fallback');
  }
}

/**
 * Datos diarios entre dos fechas (máx. recomendado ~1 año por llamada).
 * Caché de 6 horas. Si falla y no hay caché, lanza error (no hay respaldo diario).
 */
export async function fetchDaily(
  lat: number,
  lon: number,
  start: Date,
  end: Date,
  signal?: AbortSignal,
): Promise<DailySeries> {
  const key = `daily:${locationKey(lat, lon)}:${toPowerDate(start)}-${toPowerDate(end)}`;
  const fresh = cacheGet<DailySeries>(key, 6 * HOUR);
  if (fresh) return { ...fresh, source: 'cache' };

  try {
    const data = parseDaily(await getJson(dailyUrl(lat, lon, start, end), signal), 'nasa');
    cacheSet(key, data);
    return data;
  } catch (err) {
    const stale = cacheGetStale<DailySeries>(key);
    if (stale && !signal?.aborted) return { ...stale, source: 'cache' };
    throw err;
  }
}
