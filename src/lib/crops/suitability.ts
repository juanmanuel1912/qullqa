/**
 * ¿Es buena idea sembrar este cultivo en este mes y lugar?
 * - Papa: modelo real de grados-día con clima NASA (evaluateSowingMonth).
 * - Otros cultivos: reglas sencillas con el clima NASA del lugar (altitud, temperatura,
 *   heladas, lluvia y temporada habitual). Es una ESTIMACIÓN de ejemplo para el MVP.
 */
import type { Climatology } from '../../services/nasa/types'
import { evaluateSowingMonth } from '../agro/sowing'
import type { VarietyId } from '../agro/varieties'
import { cropById, type CropId } from './catalog'

export type Verdict = 'good' | 'fair' | 'bad'

/** Razón traducible: clave i18n `suit.<code>` con variables */
export interface SuitReason {
  code: string
  vars?: Record<string, string | number>
  /** Peso: 'ok' suma, 'warn' advierte, 'bad' descarta */
  level: 'ok' | 'warn' | 'bad'
}

export interface Suitability {
  crop: CropId
  month: number
  verdict: Verdict
  /** Fecha estimada de cosecha (anuales) */
  harvestDate: Date | null
  /** Años hasta la primera cosecha (perennes) */
  yearsToFirstHarvest: number | null
  /** Duración del ciclo en días (si se conoce) */
  cycleDays: number | null
  reasons: SuitReason[]
}

/** Convierte el texto de la variedad del agricultor al modelo de papa disponible. */
export function potatoModelFor(variety: string | undefined): VarietyId {
  const v = (variety ?? '').toLowerCase()
  if (v.includes('canch')) return 'canchan'
  if (v.includes('huayro') || v.includes('wayru')) return 'huayro'
  if (v.includes('russet')) return 'russet'
  return 'yungay'
}

const addMonths = (d: Date, n: number) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 15))

export function assessCrop(
  cropId: CropId,
  month: number,
  clim: Climatology,
  /** elevation: altitud exacta del punto (m). La de la celda NASA (~50 km) es un promedio. */
  opts: { variety?: string; year?: number; elevation?: number | null } = {},
): Suitability {
  const crop = cropById(cropId)
  const year = opts.year ?? new Date().getUTCFullYear()
  const elevation = Math.round(opts.elevation ?? clim.elevation ?? 0)
  const reasons: SuitReason[] = []

  // --- Papa: modelo completo
  if (cropId === 'papa') {
    const e = evaluateSowingMonth(clim, potatoModelFor(opts.variety), month, year)
    const verdict: Verdict = e.score >= 60 ? 'good' : e.score >= 40 ? 'fair' : 'bad'
    reasons.push({ code: 'potatoModel', vars: { score: e.score }, level: verdict === 'bad' ? 'bad' : 'ok' })
    for (const c of e.codes) reasons.push({ code: `s_${c.code}`, vars: { v: c.value ?? '' }, level: 'ok' })
    return { crop: cropId, month, verdict, harvestDate: e.harvestDate, yearsToFirstHarvest: null, cycleDays: e.cycleDays, reasons }
  }

  const r = crop.req
  // 1. Altitud
  if (elevation < r.altitude[0] - 200 || elevation > r.altitude[1] + 200) {
    reasons.push({ code: 'altBad', vars: { elev: elevation, min: r.altitude[0], max: r.altitude[1] }, level: 'bad' })
  } else {
    reasons.push({ code: 'altOk', vars: { elev: elevation }, level: 'ok' })
  }

  // 2. Meses del ciclo (perennes: el año entero)
  const span = r.perennial ? 12 : Math.max(1, Math.round(r.cycleMonths))
  const cycle = Array.from({ length: span }, (_, i) => (month + i) % 12)
  const meanT = cycle.reduce((s, m) => s + clim.months[m].t2m, 0) / cycle.length
  const t = Math.round(meanT * 10) / 10
  if (meanT >= r.minMeanTemp) reasons.push({ code: 'tempOk', vars: { t }, level: 'ok' })
  else if (meanT >= r.minMeanTemp - 2) reasons.push({ code: 'tempLow', vars: { t, min: r.minMeanTemp }, level: 'warn' })
  else reasons.push({ code: 'tempLow', vars: { t, min: r.minMeanTemp }, level: 'bad' })

  // 3. Heladas
  if (r.frostSensitive) {
    const frost = cycle.filter((m) => clim.months[m].t2mMin < 0)
    if (frost.length >= 3) reasons.push({ code: 'frost', vars: { n: frost.length }, level: 'bad' })
    else if (frost.length > 0) reasons.push({ code: 'frost', vars: { n: frost.length }, level: 'warn' })
    else reasons.push({ code: 'noFrost', level: 'ok' })
  }

  // 4. Temporada habitual
  if (r.perennial) {
    reasons.push({ code: 'perennial', vars: { years: Math.round(r.cycleMonths / 12) }, level: 'ok' })
  } else if (crop.sowMonths.includes(month)) {
    reasons.push({ code: 'inSeason', level: 'ok' })
  } else {
    reasons.push({ code: 'offSeason', level: 'warn' })
  }

  // 5. Lluvia del mes de siembra
  const rain = clim.months[month].precipMmMonth
  if (rain < 30) reasons.push({ code: 'dry', vars: { mm: rain }, level: 'warn' })

  const bad = reasons.some((x) => x.level === 'bad')
  const warns = reasons.filter((x) => x.level === 'warn').length
  const verdict: Verdict = bad ? 'bad' : warns >= 2 ? 'fair' : warns === 1 ? 'fair' : 'good'

  return {
    crop: cropId,
    month,
    verdict,
    harvestDate: r.perennial ? null : addMonths(new Date(Date.UTC(year, month, 1)), Math.round(r.cycleMonths)),
    yearsToFirstHarvest: r.perennial ? Math.round((r.cycleMonths / 12) * 10) / 10 : null,
    cycleDays: r.perennial ? null : Math.round(r.cycleMonths * 30.4),
    reasons,
  }
}
