/**
 * Plan de la semana: cuándo regar, heladas y lluvias fuertes, a partir del pronóstico
 * y del balance de agua (lluvia − evapotranspiración del cultivo, método FAO-56 simplificado).
 */
import type { DayForecast } from '../../services/weather/openMeteo'
import type { Climatology } from '../../services/nasa/types'

export type DayAction = 'frost' | 'heavyRain' | 'irrigate' | 'noIrrigate' | 'ok'

export interface DayPlan {
  date: string
  action: DayAction
  /** Déficit de agua acumulado al final del día (mm) */
  deficit: number
}

export interface WeekPlan {
  days: DayPlan[]
  /** Fechas en que conviene regar */
  irrigateOn: string[]
  frostDays: string[]
  heavyRainDays: string[]
  /** Lluvia total esperada en 7 días (mm) */
  weekRain: number
  /** Lluvia normal para 7 días en este mes según NASA POWER (mm) */
  normalRain: number | null
  /** Temperatura media esperada vs. la normal de NASA (°C) */
  tempAnomaly: number | null
}

/** Coeficiente de cultivo de la papa (FAO-56) según el avance (0-1). */
export function cropKc(progress: number | null): number {
  if (progress === null) return 0.5 // sin cultivo: suelo desnudo / recién sembrado
  if (progress < 0.15) return 0.5
  if (progress < 0.4) return 0.5 + ((progress - 0.15) / 0.25) * 0.65
  if (progress < 0.9) return 1.15
  return 0.75
}

export const FORECAST_FROST_C = 0
export const HEAVY_RAIN_MM = 15
/** Déficit a partir del cual conviene regar (mm) */
export const IRRIGATE_DEFICIT_MM = 12

export function planWeek(days: DayForecast[], cropProgress: number | null, clim?: Climatology | null): WeekPlan {
  const kc = cropKc(cropProgress)
  let deficit = 0
  const plans: DayPlan[] = []

  days.forEach((d, i) => {
    const etc = d.et0 * kc
    // Solo cuenta la lluvia probable
    const rain = d.rainProb >= 50 ? d.rainMm : d.rainMm * (d.rainProb / 100)
    deficit = Math.max(0, deficit + etc - rain)
    const rainSoon = days.slice(i + 1, i + 3).some((n) => n.rainProb >= 60 && n.rainMm >= 5)
    let action: DayAction = 'ok'
    if (d.tMin <= FORECAST_FROST_C) action = 'frost'
    else if (d.rainMm >= HEAVY_RAIN_MM && d.rainProb >= 60) action = 'heavyRain'
    else if (deficit >= IRRIGATE_DEFICIT_MM && !rainSoon) {
      action = 'irrigate'
      deficit = 0 // se asume riego suficiente
    } else if (rain >= 5) action = 'noIrrigate'
    plans.push({ date: d.date, action, deficit: Math.round(deficit) })
  })

  const weekRain = Math.round(days.reduce((s, d) => s + d.rainMm, 0))
  let normalRain: number | null = null
  let tempAnomaly: number | null = null
  if (clim && days.length) {
    const m = Number(days[0].date.slice(5, 7)) - 1
    normalRain = Math.round(clim.months[m].precipMmDay * days.length)
    const meanT = days.reduce((s, d) => s + (d.tMax + d.tMin) / 2, 0) / days.length
    tempAnomaly = Math.round((meanT - clim.months[m].t2m) * 10) / 10
  }

  return {
    days: plans,
    irrigateOn: plans.filter((p) => p.action === 'irrigate').map((p) => p.date),
    frostDays: plans.filter((p) => p.action === 'frost').map((p) => p.date),
    heavyRainDays: plans.filter((p) => p.action === 'heavyRain').map((p) => p.date),
    weekRain,
    normalRain,
    tempAnomaly,
  }
}
