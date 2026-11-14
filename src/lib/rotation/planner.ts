/**
 * Planificador de rotación de cultivos (reto "Field Shift").
 * Compara estrategias de rotación con valores agronómicos generales (CIP, FAO, INIA)
 * y el clima NASA POWER de la chacra. Es una herramienta de apoyo: no reemplaza
 * el criterio del agricultor ni un análisis de suelo.
 */
import type { Climatology } from '../../services/nasa/types'

export type RotCropId = 'papa' | 'oca' | 'habas' | 'tarwi' | 'cebada' | 'quinua' | 'avenaVicia' | 'descanso'

/** Puntajes 0–3 (valores generales, relativos entre cultivos andinos) */
export interface RotCrop {
  id: RotCropId
  emoji: string
  /** Fija nitrógeno del aire (leguminosa) */
  nFixer: boolean
  /** Hospeda las plagas de la papa (gorgojo de los Andes, nematodos) */
  potatoHost: boolean
  /** Aporte de nitrógeno al suelo */
  nitrogen: number
  /** Aporte de materia orgánica (raíces y rastrojo) */
  organic: number
  /** Protección contra la erosión (cobertura y raíces) */
  erosion: number
  /** Demanda de agua en la temporada (0 = ninguna, 3 = alta) */
  water: number
  /** Ingreso esperado (0 = ninguno, 3 = alto) */
  income: number
  /** Tolera heladas */
  frostTolerant: boolean
  /** Altitud habitual (m) */
  altitude: [number, number]
}

export const ROT_CROPS: Record<RotCropId, RotCrop> = {
  papa: { id: 'papa', emoji: '🥔', nFixer: false, potatoHost: true, nitrogen: 0, organic: 1, erosion: 0, water: 3, income: 3, frostTolerant: false, altitude: [0, 4200] },
  oca: { id: 'oca', emoji: '🟣', nFixer: false, potatoHost: false, nitrogen: 0, organic: 1, erosion: 1, water: 2, income: 2, frostTolerant: false, altitude: [2800, 4000] },
  habas: { id: 'habas', emoji: '🫘', nFixer: true, potatoHost: false, nitrogen: 3, organic: 2, erosion: 1, water: 2, income: 2, frostTolerant: true, altitude: [2000, 3900] },
  tarwi: { id: 'tarwi', emoji: '🌼', nFixer: true, potatoHost: false, nitrogen: 3, organic: 2, erosion: 2, water: 1, income: 2, frostTolerant: true, altitude: [2000, 3800] },
  cebada: { id: 'cebada', emoji: '🌾', nFixer: false, potatoHost: false, nitrogen: 0, organic: 3, erosion: 3, water: 1, income: 1, frostTolerant: true, altitude: [0, 4000] },
  quinua: { id: 'quinua', emoji: '🌾', nFixer: false, potatoHost: false, nitrogen: 0, organic: 1, erosion: 1, water: 1, income: 3, frostTolerant: true, altitude: [2500, 4000] },
  avenaVicia: { id: 'avenaVicia', emoji: '🌱', nFixer: true, potatoHost: false, nitrogen: 2, organic: 3, erosion: 3, water: 1, income: 1, frostTolerant: true, altitude: [2000, 4000] },
  descanso: { id: 'descanso', emoji: '🌿', nFixer: false, potatoHost: false, nitrogen: 1, organic: 3, erosion: 2, water: 0, income: 0, frostTolerant: true, altitude: [0, 4500] },
}

export type StrategyId = 'current' | 'traditional' | 'legume'

export interface Strategy {
  id: StrategyId
  /** Un cultivo por campaña (año) */
  years: RotCropId[]
}

export const STRATEGIES: Strategy[] = [
  { id: 'current', years: ['papa', 'papa', 'papa', 'papa'] },
  { id: 'traditional', years: ['papa', 'oca', 'habas', 'cebada', 'descanso', 'descanso'] },
  { id: 'legume', years: ['papa', 'tarwi', 'quinua', 'avenaVicia'] },
]

export type Priority = 'balanced' | 'soil' | 'water' | 'income'
export type Criterion = 'soil' | 'pests' | 'water' | 'erosion' | 'income' | 'climate'
export const CRITERIA: Criterion[] = ['soil', 'pests', 'water', 'erosion', 'income', 'climate']

const WEIGHTS: Record<Priority, Record<Criterion, number>> = {
  balanced: { soil: 1, pests: 1, water: 1, erosion: 1, income: 1, climate: 1 },
  soil: { soil: 2.5, pests: 1.5, water: 0.5, erosion: 2, income: 0.5, climate: 1 },
  water: { soil: 1, pests: 1, water: 2.5, erosion: 1, income: 0.5, climate: 1.5 },
  income: { soil: 0.5, pests: 1, water: 0.5, erosion: 0.5, income: 2.5, climate: 1.5 },
}

/** Clima de la chacra que usa el planificador (NASA POWER). */
export interface FarmSeason {
  elevation: number
  /** Lluvia de la temporada de cultivo (meses con ≥ 40 mm) */
  seasonRainMm: number
  /** Meses de la temporada con mínima bajo 0 °C */
  seasonFrostMonths: number
  /** Meses (0-11) de la temporada de lluvias, cuando crece el cultivo */
  growingMonths: number[]
  /** Meses secos (< 25 mm) en que la tierra suele quedar sin cultivo */
  bareMonths: number[]
}

export function farmSeason(clim: Climatology, elevation: number): FarmSeason {
  const growing = clim.months.filter((m) => m.precipMmMonth >= 40).map((m) => m.month)
  return {
    elevation,
    seasonRainMm: Math.round(clim.months.filter((m) => growing.includes(m.month)).reduce((s, m) => s + m.precipMmMonth, 0)),
    seasonFrostMonths: clim.months.filter((m) => growing.includes(m.month) && m.t2mMin < 0).length,
    growingMonths: growing,
    bareMonths: clim.months.filter((m) => m.precipMmMonth < 25).map((m) => m.month),
  }
}

/** Qué tan bien se adapta un cultivo a la chacra (0–3). */
export function cropFit(crop: RotCrop, s: FarmSeason): number {
  let fit = 3
  if (s.elevation < crop.altitude[0] - 200 || s.elevation > crop.altitude[1] + 200) fit -= 2
  if (!crop.frostTolerant && s.seasonFrostMonths > 0) fit -= 1
  // Agua: demanda alta con poca lluvia de temporada
  if (crop.water >= 3 && s.seasonRainMm < 450) fit -= 1
  if (crop.water >= 2 && s.seasonRainMm < 300) fit -= 1
  return Math.max(0, fit)
}

export interface StrategyResult {
  strategy: Strategy
  /** 0–3 por criterio */
  scores: Record<Criterion, number>
  /** 0–100 según la prioridad elegida */
  total: number
  potatoShare: number
  legumeYears: number
  /** Cultivos que no se adaptan bien a esta chacra */
  poorFit: RotCropId[]
}

export function evaluateStrategy(strategy: Strategy, season: FarmSeason, priority: Priority): StrategyResult {
  const crops = strategy.years.map((id) => ROT_CROPS[id])
  const avg = (f: (c: RotCrop) => number) => crops.reduce((s, c) => s + f(c), 0) / crops.length
  const potatoYears = crops.filter((c) => c.potatoHost).length
  let consecutive = 0
  crops.forEach((c, i) => {
    const next = crops[(i + 1) % crops.length]
    if (c.potatoHost && next.potatoHost) consecutive++
  })
  const potatoShare = potatoYears / crops.length

  const scores: Record<Criterion, number> = {
    soil: (avg((c) => c.nitrogen) + avg((c) => c.organic)) / 2,
    // Romper el ciclo de plagas: menos papa y nunca papa tras papa
    pests: Math.max(0, 3 * (1 - potatoShare) - (consecutive > 0 ? 1 : 0)),
    water: 3 - avg((c) => c.water),
    erosion: avg((c) => c.erosion),
    income: avg((c) => c.income),
    climate: avg((c) => cropFit(c, season)),
  }
  const w = WEIGHTS[priority]
  const sumW = CRITERIA.reduce((s, k) => s + w[k], 0)
  const total = Math.round((CRITERIA.reduce((s, k) => s + scores[k] * w[k], 0) / (3 * sumW)) * 100)

  return {
    strategy,
    scores,
    total,
    potatoShare,
    legumeYears: crops.filter((c) => c.nFixer).length,
    poorFit: [...new Set(crops.filter((c) => cropFit(c, season) <= 1).map((c) => c.id))],
  }
}

export function compareStrategies(season: FarmSeason, priority: Priority): StrategyResult[] {
  return STRATEGIES.map((s) => evaluateStrategy(s, season, priority)).sort((a, b) => b.total - a.total)
}
