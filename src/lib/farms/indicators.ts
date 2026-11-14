/**
 * Indicadores clave de una chacra a partir del clima NASA POWER y la altitud:
 * piso ecológico, temperatura, heladas y lluvia. Son los datos con los que
 * el agricultor decide qué sembrar.
 */
import type { Climatology } from '../../services/nasa/types'

/**
 * Las 8 regiones naturales del Perú (Javier Pulgar Vidal, 1941), por altitud.
 * En la parte baja se separa costa (seca) de selva (lluviosa) con la lluvia NASA.
 */
export type AltZone = 'chala' | 'yunga' | 'quechua' | 'suni' | 'puna' | 'janca' | 'rupaRupa' | 'omagua'

export const ZONES: { id: AltZone; range: [number, number]; emoji: string; color: string }[] = [
  { id: 'chala', range: [0, 500], emoji: '🏖️', color: '#f2b705' },
  { id: 'yunga', range: [500, 2300], emoji: '🌄', color: '#e8590c' },
  { id: 'quechua', range: [2300, 3500], emoji: '🌽', color: '#2f9e44' },
  { id: 'suni', range: [3500, 4000], emoji: '🥔', color: '#8b6f47' },
  { id: 'puna', range: [4000, 4800], emoji: '🦙', color: '#5d6699' },
  { id: 'janca', range: [4800, 6768], emoji: '🏔️', color: '#adb5bd' },
  { id: 'rupaRupa', range: [400, 1000], emoji: '☕', color: '#087f5b' },
  { id: 'omagua', range: [80, 400], emoji: '🍌', color: '#0b7285' },
]

export const zoneInfo = (id: AltZone) => ZONES.find((z) => z.id === id)!

/** Lluvia anual (mm) a partir de la cual consideramos clima de selva en la parte baja */
const WET_MM = 1200

export function altitudeZone(elevation: number, annualRainMm: number): AltZone {
  if (elevation >= 4800) return 'janca'
  if (elevation >= 4000) return 'puna'
  if (elevation >= 3500) return 'suni'
  if (elevation >= 2300) return 'quechua'
  if (annualRainMm >= WET_MM) return elevation >= 400 ? 'rupaRupa' : 'omagua'
  return elevation >= 500 ? 'yunga' : 'chala'
}

export interface FarmIndicators {
  elevation: number
  zone: AltZone
  /** Temperatura media anual (°C) */
  meanTemp: number
  coldest: { month: number; t: number }
  warmest: { month: number; t: number }
  /** Meses con mínima bajo 0 °C */
  frostMonths: number[]
  /** Mínima más fría del año (°C) */
  minTemp: number
  annualRain: number
  /** Meses con ≥ 40 mm: temporada de lluvias */
  rainyMonths: number[]
  /** Meses con < 25 mm: secos */
  dryMonths: number[]
}

const r1 = (n: number) => Math.round(n * 10) / 10

export function farmIndicators(clim: Climatology, elevation: number): FarmIndicators {
  const m = clim.months
  const annualRain = Math.round(m.reduce((s, x) => s + x.precipMmMonth, 0))
  const byT = [...m].sort((a, b) => a.t2m - b.t2m)
  return {
    elevation: Math.round(elevation),
    zone: altitudeZone(elevation, annualRain),
    meanTemp: r1(m.reduce((s, x) => s + x.t2m, 0) / m.length),
    coldest: { month: byT[0].month, t: r1(byT[0].t2m) },
    warmest: { month: byT[byT.length - 1].month, t: r1(byT[byT.length - 1].t2m) },
    frostMonths: m.filter((x) => x.t2mMin < 0).map((x) => x.month),
    minTemp: r1(Math.min(...m.map((x) => x.t2mMin))),
    annualRain,
    rainyMonths: m.filter((x) => x.precipMmMonth >= 40).map((x) => x.month),
    dryMonths: m.filter((x) => x.precipMmMonth < 25).map((x) => x.month),
  }
}

/** Gradiente térmico estándar: la temperatura baja ~6.5 °C por cada 1 000 m de altura */
export const LAPSE_RATE = 6.5 / 1000

/**
 * NASA POWER promedia celdas de ~50 km: en los Andes la altura de la celda puede
 * diferir cientos de metros de la chacra (un valle entre cerros). Ajustamos las
 * temperaturas a la altura real del punto con el gradiente estándar.
 * Devuelve el clima ajustado y la corrección aplicada (°C).
 */
export function adjustToElevation(clim: Climatology, elevation: number | null): { clim: Climatology; deltaC: number; gridElevation: number | null } {
  const grid = clim.elevation
  if (grid == null || elevation == null || !Number.isFinite(elevation)) return { clim, deltaC: 0, gridElevation: grid }
  // Limitamos la corrección a ±1 500 m para evitar errores con puntos mal ubicados
  const diff = Math.max(-1500, Math.min(1500, grid - elevation))
  const deltaC = Math.round(diff * LAPSE_RATE * 10) / 10
  if (deltaC === 0) return { clim, deltaC: 0, gridElevation: grid }
  return {
    clim: {
      ...clim,
      months: clim.months.map((m) => ({ ...m, t2m: m.t2m + deltaC, t2mMin: m.t2mMin + deltaC, t2mMax: m.t2mMax + deltaC })),
    },
    deltaC,
    gridElevation: grid,
  }
}
