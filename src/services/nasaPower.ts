/**
 * T2.1 — NASA POWER con la API del design.md.
 * Delega en src/services/nasa/power.ts (probado) y convierte al formato de src/types.
 */
import type { ClimatologyMonth, ClimatologyResponse, DailyDataPoint, DailyDataResponse } from '../types';
import { cacheGetStale, cacheSet } from './nasa/cache';
import { CUSCO, fetchClimatology, fetchDaily } from './nasa/power';
import type { Climatology, DailyRecord, MonthlyClimate } from './nasa/types';

export { CUSCO };

const DAYS_IN_MONTH = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
/** NASA POWER da la radiación en MJ/m²/día; el design.md la pide en kWh/m²/día. */
const MJ_PER_KWH = 3.6;
const round2 = (x: number) => Math.round(x * 100) / 100;

// ---------- Conversión entre formatos ----------

export function toClimatologyMonth(m: MonthlyClimate): ClimatologyMonth {
  return {
    month: m.month + 1,
    T2M: m.t2m,
    T2M_MIN: m.t2mMin,
    T2M_MAX: m.t2mMax,
    PRECTOTCORR: m.precipMmMonth,
    ALLSKY_SFC_SW_DWN: round2(m.solar / MJ_PER_KWH),
    GWETROOT: m.gwetRoot,
  };
}

/** ClimatologyMonth[] (formato UI) → Climatology (formato del modelo). */
export function fromClimatologyMonths(months: ClimatologyMonth[], lat = 0, lon = 0): Climatology {
  const sorted = [...months].sort((a, b) => a.month - b.month);
  return {
    lat,
    lon,
    elevation: null,
    source: 'nasa',
    fetchedAt: new Date().toISOString(),
    months: sorted.map((c) => ({
      month: c.month - 1,
      t2m: c.T2M,
      t2mMin: c.T2M_MIN,
      t2mMax: c.T2M_MAX,
      precipMmMonth: c.PRECTOTCORR,
      precipMmDay: c.PRECTOTCORR / DAYS_IN_MONTH[c.month - 1],
      gwetRoot: c.GWETROOT,
      solar: c.ALLSKY_SFC_SW_DWN * MJ_PER_KWH,
    })),
  };
}

export function toDailyDataPoint(d: DailyRecord): DailyDataPoint | null {
  if (d.t2m === null || d.t2mMin === null || d.t2mMax === null || d.precip === null) return null;
  return {
    date: d.date,
    T2M: d.t2m,
    T2M_MIN: d.t2mMin,
    T2M_MAX: d.t2mMax,
    PRECTOTCORR: d.precip,
    ALLSKY_SFC_SW_DWN: d.solar === null ? 0 : round2(d.solar / MJ_PER_KWH),
    GWETROOT: d.gwetRoot ?? 0,
  };
}

export function fromDailyDataPoints(points: DailyDataPoint[]): DailyRecord[] {
  return points.map((p) => ({
    date: p.date,
    t2m: p.T2M,
    t2mMin: p.T2M_MIN,
    t2mMax: p.T2M_MAX,
    precip: p.PRECTOTCORR,
    gwetRoot: p.GWETROOT,
    solar: p.ALLSKY_SFC_SW_DWN * MJ_PER_KWH,
  }));
}

// ---------- API pública (design.md §1.1) ----------

/**
 * Climatología de 12 meses (`month` 1-12, `PRECTOTCORR` en mm/mes).
 * Nunca falla: caché → NASA → caché vieja → Cusco. Si `source === 'fallback'`, avisar al usuario.
 */
export async function getClimatology(lat: number, lon: number): Promise<ClimatologyResponse> {
  const c = await fetchClimatology(lat, lon);
  return {
    lat: c.lat,
    lon: c.lon,
    climatic_data: c.months.map(toClimatologyMonth),
    cacheTimestamp: Date.parse(c.fetchedAt),
    source: c.source,
    elevation: c.elevation,
  };
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Datos diarios (por defecto los últimos 30 días). Los últimos 2-3 días aún no existen en NASA
 * y se omiten. Nunca falla: si NASA no responde devuelve `data: []`.
 */
export async function getDaily(lat: number, lon: number, startDate?: string, endDate?: string): Promise<DailyDataResponse> {
  const end = endDate ? new Date(`${endDate}T00:00:00Z`) : new Date(`${isoDay(new Date())}T00:00:00Z`);
  const start = startDate ? new Date(`${startDate}T00:00:00Z`) : new Date(end.getTime() - 30 * 86_400_000);
  try {
    const s = await fetchDaily(lat, lon, start, end);
    return {
      lat,
      lon,
      data: s.days.map(toDailyDataPoint).filter((d): d is DailyDataPoint => d !== null),
      cacheTimestamp: Date.parse(s.fetchedAt),
    };
  } catch {
    return { lat, lon, data: [] };
  }
}

export function getCachedData(cacheKey: string): ClimatologyResponse | DailyDataResponse | null {
  return cacheGetStale<ClimatologyResponse | DailyDataResponse>(cacheKey);
}

export function setCachedData(cacheKey: string, data: ClimatologyResponse | DailyDataResponse): void {
  cacheSet(cacheKey, data);
}
