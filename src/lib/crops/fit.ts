/**
 * ¿Puedo sembrar este producto aquí? Con los dos indicadores clave: ALTURA y CLIMA
 * (temperatura, heladas y lluvia de la NASA ajustadas a tu altura).
 * Sirve para los productos de la app y para los que agrega el agricultor.
 */
import type { Climatology } from '../../services/nasa/types'
import { HARD_FROST, NEXT_CROPS, NEXT_IDS, type NextCropId } from '../rotation/nextCrop'

export interface CropNeeds {
  /** Altura donde crece bien (m) */
  altitude: [number, number]
  /** Temperatura media mínima para crecer bien (°C) */
  minMeanTemp: number
  /** ¿Se muere con la helada? */
  frostSensitive: boolean
  /** Meses de siembra a cosecha */
  cycleMonths: number
  /** Planta de varios años (árbol, frutal) */
  perennial: boolean
  /** Agua que necesita (mm por campaña, o por año si es perenne) */
  waterMm: number
}

export type FitLevel = 'ok' | 'warn' | 'bad'
export type FitVerdict = 'good' | 'fair' | 'bad'

export interface FitResult {
  verdict: FitVerdict
  altitude: { level: FitLevel; min: number; max: number; elevation: number }
  climate: { level: FitLevel; need: number; best: number }
  frost: { level: FitLevel; months: number }
  water: { level: FitLevel; need: number; rain: number; irrigation: boolean }
  /** Meses en que conviene sembrar (0-11) */
  bestMonths: number[]
}

const r1 = (n: number) => Math.round(n * 10) / 10

export function fitHere(needs: CropNeeds, clim: Climatology, elevation: number, irrigation = false): FitResult {
  const m = clim.months
  const [lo, hi] = needs.altitude
  const altLevel: FitLevel = elevation >= lo && elevation <= hi ? 'ok' : elevation >= lo - 200 && elevation <= hi + 200 ? 'warn' : 'bad'

  const span = needs.perennial ? 12 : Math.min(12, Math.max(1, Math.round(needs.cycleMonths)))
  const windows = Array.from({ length: 12 }, (_, s) => {
    const idx = Array.from({ length: span }, (_, i) => (s + i) % 12)
    const meanT = idx.reduce((a, i) => a + m[i].t2m, 0) / span
    // En el mes de cosecha la planta ya está madura: esa helada ya no la mata (anuales)
    const growing = needs.perennial || span < 2 ? idx : idx.slice(0, -1)
    const frost = growing.filter((i) => m[i].t2mMin < 0).length
    const hard = growing.filter((i) => m[i].t2mMin <= HARD_FROST).length
    const rain = idx.reduce((a, i) => a + m[i].precipMmMonth, 0)
    // Árboles: ninguna helada. Anuales: sin heladas fuertes (las suaves se aguantan con cuidado)
    const frostOk = !needs.frostSensitive || (needs.perennial ? frost === 0 : hard === 0)
    return { s, meanT, frost, hard, rain, tempOk: meanT >= needs.minMeanTemp, frostOk }
  })
  const climOk = windows.filter((w) => w.tempOk && w.frostOk)
  const best = [...windows].sort((a, b) => Number(b.tempOk && b.frostOk) - Number(a.tempOk && a.frostOk) || b.meanT - a.meanT)[0]
  const bestT = Math.max(...windows.map((w) => w.meanT))

  const climateLevel: FitLevel = windows.some((w) => w.tempOk) ? 'ok' : bestT >= needs.minMeanTemp - 2 ? 'warn' : 'bad'
  const minFrost = Math.min(...windows.map((w) => w.frost))
  const minHard = Math.min(...windows.map((w) => w.hard))
  const frostLevel: FitLevel = !needs.frostSensitive || minFrost === 0 ? 'ok' : needs.perennial ? 'bad' : minHard === 0 ? 'warn' : minHard === 1 ? 'warn' : 'bad'

  const ref = climOk.length ? [...climOk].sort((a, b) => b.rain - a.rain)[0] : best
  const ratio = ref.rain / needs.waterMm
  const waterLevel: FitLevel = ratio >= 0.8 ? 'ok' : irrigation ? 'ok' : ratio >= 0.5 ? 'warn' : 'bad'

  const levels = [altLevel, climateLevel, frostLevel, waterLevel]
  const verdict: FitVerdict = levels.includes('bad') ? 'bad' : levels.includes('warn') ? 'fair' : 'good'
  // Meses para sembrar: clima bien y, si no hay riego, con lluvia suficiente
  const wet = climOk.filter((w) => irrigation || w.rain >= needs.waterMm * 0.8)
  const bestMonths = (wet.length ? wet : climOk).map((w) => w.s)

  return {
    verdict,
    altitude: { level: altLevel, min: lo, max: hi, elevation: Math.round(elevation) },
    climate: { level: climateLevel, need: needs.minMeanTemp, best: r1(bestT) },
    frost: { level: frostLevel, months: m.filter((x) => x.t2mMin < 0).length },
    water: { level: waterLevel, need: needs.waterMm, rain: Math.round(ref.rain), irrigation },
    bestMonths: needs.perennial ? [] : bestMonths,
  }
}

/** Las necesidades de los productos de la app */
export function appCropNeeds(id: NextCropId): CropNeeds {
  const c = NEXT_CROPS[id]
  return { altitude: c.altitude, minMeanTemp: c.minMeanTemp, frostSensitive: c.frostSensitive, cycleMonths: c.perennial ? 12 : c.cycle, perennial: c.perennial, waterMm: c.waterMm }
}

export const APP_CROPS = NEXT_IDS
