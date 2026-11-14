/**
 * "¿Qué siembro después?" — el agricultor dice qué tuvo en la chacra y qué quiere
 * sembrar ahora; Qullqa responde "buena idea / con cuidado / mala idea" explicando
 * por qué con 6 factores sencillos: tu tierra (altitud), clima, tiempo, agua, suelo
 * (rotación) y el producto. Clima de NASA POWER; requisitos generales (FAO, INIA, CIP).
 * Es una estimación de apoyo, no reemplaza el criterio local.
 */
import type { Climatology } from '../../services/nasa/types'

export type NextCropId =
  | 'papa'
  | 'oca'
  | 'habas'
  | 'tarwi'
  | 'cebada'
  | 'quinua'
  | 'avenaVicia'
  | 'maiz'
  | 'aji'
  | 'palta'
  | 'mango'
  | 'cafe'
  | 'cacao'

export type PrevCropId = NextCropId | 'descanso'

type Family = 'solanacea' | 'legume' | 'cereal' | 'tuber' | 'quinoa' | 'cover' | 'tree'
/** Cuánto saca del suelo: heavy = mucho, giver = devuelve nitrógeno */
type Feeder = 'heavy' | 'medium' | 'light' | 'giver'

export interface NextCrop {
  id: NextCropId
  emoji: string
  family: Family
  feeder: Feeder
  altitude: [number, number]
  /** Temperatura media mínima para crecer bien (°C) */
  minMeanTemp: number
  frostSensitive: boolean
  /** Meses de siembra a cosecha (anuales) o años a la primera cosecha (árboles) */
  cycle: number
  perennial: boolean
  /** Agua que necesita (mm por campaña; árboles: mm por año) */
  waterMm: number
}

export const NEXT_CROPS: Record<NextCropId, NextCrop> = {
  papa: { id: 'papa', emoji: '🥔', family: 'solanacea', feeder: 'heavy', altitude: [2000, 4200], minMeanTemp: 6, frostSensitive: true, cycle: 5, perennial: false, waterMm: 500 },
  oca: { id: 'oca', emoji: '🟣', family: 'tuber', feeder: 'medium', altitude: [2800, 4000], minMeanTemp: 6, frostSensitive: true, cycle: 7, perennial: false, waterMm: 450 },
  habas: { id: 'habas', emoji: '🫘', family: 'legume', feeder: 'giver', altitude: [2000, 3900], minMeanTemp: 5, frostSensitive: false, cycle: 6, perennial: false, waterMm: 350 },
  tarwi: { id: 'tarwi', emoji: '🌼', family: 'legume', feeder: 'giver', altitude: [2000, 3800], minMeanTemp: 6, frostSensitive: false, cycle: 7, perennial: false, waterMm: 350 },
  cebada: { id: 'cebada', emoji: '🌾', family: 'cereal', feeder: 'light', altitude: [0, 4000], minMeanTemp: 4, frostSensitive: false, cycle: 5, perennial: false, waterMm: 300 },
  quinua: { id: 'quinua', emoji: '🌾', family: 'quinoa', feeder: 'medium', altitude: [2500, 4000], minMeanTemp: 5, frostSensitive: false, cycle: 6, perennial: false, waterMm: 300 },
  avenaVicia: { id: 'avenaVicia', emoji: '🌱', family: 'cover', feeder: 'giver', altitude: [2000, 4000], minMeanTemp: 4, frostSensitive: false, cycle: 5, perennial: false, waterMm: 250 },
  maiz: { id: 'maiz', emoji: '🌽', family: 'cereal', feeder: 'heavy', altitude: [0, 3500], minMeanTemp: 10, frostSensitive: true, cycle: 6, perennial: false, waterMm: 500 },
  aji: { id: 'aji', emoji: '🌶️', family: 'solanacea', feeder: 'heavy', altitude: [0, 2500], minMeanTemp: 16, frostSensitive: true, cycle: 6, perennial: false, waterMm: 600 },
  palta: { id: 'palta', emoji: '🥑', family: 'tree', feeder: 'medium', altitude: [0, 2700], minMeanTemp: 15, frostSensitive: true, cycle: 3, perennial: true, waterMm: 1000 },
  mango: { id: 'mango', emoji: '🥭', family: 'tree', feeder: 'medium', altitude: [0, 1500], minMeanTemp: 20, frostSensitive: true, cycle: 4, perennial: true, waterMm: 900 },
  cafe: { id: 'cafe', emoji: '☕', family: 'tree', feeder: 'medium', altitude: [800, 2000], minMeanTemp: 17, frostSensitive: true, cycle: 3, perennial: true, waterMm: 1400 },
  cacao: { id: 'cacao', emoji: '🍫', family: 'tree', feeder: 'medium', altitude: [0, 1200], minMeanTemp: 22, frostSensitive: true, cycle: 4, perennial: true, waterMm: 1500 },
}

export const NEXT_IDS = Object.keys(NEXT_CROPS) as NextCropId[]
export const PREV_IDS: PrevCropId[] = [...NEXT_IDS, 'descanso']
export const prevEmoji = (id: PrevCropId) => (id === 'descanso' ? '🌿' : NEXT_CROPS[id].emoji)

export type Factor = 'land' | 'climate' | 'time' | 'water' | 'soil' | 'texture' | 'product'
export const FACTORS: Factor[] = ['land', 'climate', 'time', 'water', 'soil', 'texture', 'product']

/** Tipo de tierra: franca (suave y oscura), arcillosa (pegajosa) o arenosa (suelta) */
export type SoilType = 'loam' | 'clay' | 'sandy' | 'unknown'

/** Cultivos que se pudren con exceso de agua en suelos pesados */
const CLAY_SENSITIVE: NextCropId[] = ['papa', 'oca', 'palta', 'tarwi', 'quinua', 'aji']
export type Level = 'ok' | 'warn' | 'bad'

export interface FactorResult {
  factor: Factor
  level: Level
  /** Clave i18n `nc.<code>` */
  code: string
  /** Variables; las que terminan en `Idx` son meses (0-11) que la pantalla traduce */
  vars: Record<string, number>
  /** Combinación especialmente buena (p. ej. leguminosa después de papa) */
  great?: boolean
}

export type NextVerdict = 'good' | 'fair' | 'bad'

export interface NextCropResult {
  prev: PrevCropId
  next: NextCropId
  month: number
  verdict: NextVerdict
  /** Para ordenar alternativas */
  points: number
  factors: FactorResult[]
}

export interface NextCropInput {
  prev: PrevCropId
  next: NextCropId
  /** Mes de siembra (0-11) */
  month: number
  irrigation: boolean
  /** Altitud exacta del punto (m) */
  elevation: number
  /** Tipo de tierra (opcional) */
  soil?: SoilType
}

const r10 = (n: number) => Math.round(n * 10) / 10

export function assessNextCrop(input: NextCropInput, clim: Climatology): NextCropResult {
  const { prev, next, month, irrigation, elevation } = input
  const c = NEXT_CROPS[next]
  const months = clim.months
  const span = c.perennial ? 12 : Math.max(1, Math.round(c.cycle))
  const cycle = Array.from({ length: span }, (_, i) => (month + i) % 12)
  const factors: FactorResult[] = []

  // 1. Tu tierra: altitud
  if (elevation < c.altitude[0] - 200 || elevation > c.altitude[1] + 200) {
    factors.push({ factor: 'land', level: 'bad', code: 'landBad', vars: { elev: elevation, min: c.altitude[0], max: c.altitude[1] } })
  } else {
    factors.push({ factor: 'land', level: 'ok', code: 'landOk', vars: { elev: elevation } })
  }

  // 2. Clima: temperatura media del ciclo y heladas
  const t = r10(cycle.reduce((s, m) => s + months[m].t2m, 0) / cycle.length)
  const frost = c.frostSensitive ? cycle.filter((m) => months[m].t2mMin < 0).length : 0
  if (frost >= 3 || (c.perennial && frost >= 1)) {
    factors.push({ factor: 'climate', level: 'bad', code: 'climFrostBad', vars: { n: frost } })
  } else if (t < c.minMeanTemp - 2) {
    factors.push({ factor: 'climate', level: 'bad', code: 'climCold', vars: { t, min: c.minMeanTemp } })
  } else if (frost > 0) {
    factors.push({ factor: 'climate', level: 'warn', code: 'climFrostWarn', vars: { n: frost } })
  } else if (t < c.minMeanTemp) {
    factors.push({ factor: 'climate', level: 'warn', code: 'climCool', vars: { t, min: c.minMeanTemp } })
  } else {
    factors.push({ factor: 'climate', level: 'ok', code: 'climOk', vars: { t } })
  }

  // 3. Tiempo: ¿llega la lluvia para que brote? ¿cuándo se cosecha?
  if (c.perennial) {
    factors.push({ factor: 'time', level: 'warn', code: 'timePerennial', vars: { years: c.cycle } })
  } else {
    const rainSow = Math.round(months[month].precipMmMonth)
    const days = Math.round(c.cycle * 30.4)
    const harvestIdx = (month + Math.round(c.cycle)) % 12
    if (rainSow < 30 && !irrigation) {
      let whenIdx = -1
      for (let i = 1; i < 12; i++) {
        const m = (month + i) % 12
        if (months[m].precipMmMonth >= 40) {
          whenIdx = m
          break
        }
      }
      factors.push(
        whenIdx >= 0
          ? { factor: 'time', level: 'warn', code: 'timeDry', vars: { mm: rainSow, sowIdx: month, whenIdx } }
          : { factor: 'time', level: 'warn', code: 'timeNoSeason', vars: { mm: rainSow } },
      )
    } else {
      factors.push({ factor: 'time', level: 'ok', code: 'timeOk', vars: { harvestIdx, days } })
    }
  }

  // 4. Agua: lluvia del ciclo (árboles: del año) frente a lo que necesita
  const rain = Math.round(cycle.reduce((s, m) => s + months[m].precipMmMonth, 0))
  const ratio = rain / c.waterMm
  const wv = { rain, need: c.waterMm }
  if (ratio >= 0.9) factors.push({ factor: 'water', level: 'ok', code: 'waterOk', vars: wv })
  else if (irrigation) factors.push({ factor: 'water', level: ratio >= 0.6 ? 'ok' : 'warn', code: 'waterIrr', vars: wv })
  else if (ratio >= 0.6) factors.push({ factor: 'water', level: 'warn', code: 'waterShort', vars: wv })
  else factors.push({ factor: 'water', level: 'bad', code: 'waterBad', vars: wv })

  // 5. Suelo: qué deja el cultivo anterior y qué pide el nuevo
  factors.push(soilFactor(prev, c))

  // 6. Tipo de tierra
  const soil = input.soil ?? 'unknown'
  if (soil === 'loam') factors.push({ factor: 'texture', level: 'ok', code: 'textureLoam', vars: {} })
  else if (soil === 'clay')
    factors.push(CLAY_SENSITIVE.includes(next) ? { factor: 'texture', level: 'warn', code: 'textureClay', vars: {} } : { factor: 'texture', level: 'ok', code: 'textureClayOk', vars: {} })
  else if (soil === 'sandy')
    factors.push(
      c.waterMm >= 450 && !irrigation
        ? { factor: 'texture', level: 'warn', code: 'textureSandy', vars: {} }
        : { factor: 'texture', level: 'ok', code: 'textureSandyOk', vars: {} },
    )

  // 7. El producto
  // Que un árbol ocupa la chacra por años ya lo avisa el factor "tiempo": aquí es informativo
  factors.push({ factor: 'product', level: 'ok', code: `prod.${next}`, vars: { years: c.cycle } })

  const bad = factors.some((f) => f.level === 'bad')
  const warns = factors.filter((f) => f.level === 'warn').length
  const verdict: NextVerdict = bad || warns >= 3 ? 'bad' : warns > 0 ? 'fair' : 'good'
  const points = factors.reduce((s, f) => s + (f.level === 'ok' ? 2 : f.level === 'warn' ? 1 : 0) + (f.great ? 1 : 0), 0)
  return { prev, next, month, verdict, points, factors }
}

function soilFactor(prev: PrevCropId, c: NextCrop): FactorResult {
  const base = { factor: 'soil' as const, vars: {} }
  if (c.perennial) return { ...base, level: 'ok', code: 'soilTree' }
  if (prev === c.id) return { ...base, level: 'bad', code: 'soilSame' }
  const p = prev === 'descanso' ? null : NEXT_CROPS[prev]
  if (p && p.family === 'solanacea' && c.family === 'solanacea') return { ...base, level: 'bad', code: 'soilFamily' }
  if (c.feeder === 'giver') return { ...base, level: 'ok', code: 'soilGiver', great: p?.feeder === 'heavy' || p?.feeder === 'medium' }
  if (!p || p.feeder === 'giver') return { ...base, level: 'ok', code: 'soilAfterGiver', great: c.feeder === 'heavy' }
  if (p.feeder === 'heavy' && c.feeder === 'heavy') return { ...base, level: 'warn', code: 'soilHeavy' }
  return { ...base, level: 'ok', code: 'soilOk' }
}

/** Meses (0-11) en que este cultivo sería buena idea en esta chacra. */
export function goodMonthsFor(input: Omit<NextCropInput, 'month'>, clim: Climatology): number[] {
  return Array.from({ length: 12 }, (_, m) => m).filter((m) => assessNextCrop({ ...input, month: m }, clim).verdict === 'good')
}

/** Las mejores opciones para esta chacra, mes y cultivo anterior. */
export function bestNextCrops(input: Omit<NextCropInput, 'next'>, clim: Climatology, exclude?: NextCropId, n = 3): NextCropResult[] {
  return NEXT_IDS.filter((id) => id !== exclude)
    .map((id) => assessNextCrop({ ...input, next: id }, clim))
    .filter((r) => r.verdict !== 'bad')
    .sort((a, b) => (a.verdict === b.verdict ? b.points - a.points : a.verdict === 'good' ? -1 : 1))
    .slice(0, n)
}
