/**
 * Riesgo de plagas en un mes, estimado con la altitud y el clima NASA de la chacra.
 * Reglas sencillas y explicables (no es un pronóstico fitosanitario).
 */
import type { Climatology } from '../../services/nasa/types'
import { PESTS, PEST_ORDER, type PestId } from '../../data/pests'

export type RiskLevel = 'low' | 'medium' | 'high'

export interface PestRisk {
  pest: PestId
  level: RiskLevel
  /** La altitud de la chacra está en la zona donde esta plaga hace más daño */
  inZone: boolean
}

export function pestRisks(clim: Climatology, elevation: number, month: number): PestRisk[] {
  const m = clim.months[month]
  const prev = clim.months[(month + 11) % 12]
  return PEST_ORDER.map((id) => {
    const p = PESTS[id]
    const inZone = elevation >= p.altRange[0] && elevation <= p.altRange[1]
    let level: RiskLevel = 'low'
    if (id === 'rancha') {
      const mild = m.t2m >= 7 && m.t2m <= 22
      level = m.precipMmMonth >= 80 && mild ? 'high' : m.precipMmMonth >= 40 && mild ? 'medium' : 'low'
    } else if (id === 'gorgojo') {
      // Salen con las primeras lluvias: el mes en que la lluvia sube con fuerza
      const rainsStart = m.precipMmMonth >= 40 && m.precipMmMonth > prev.precipMmMonth * 1.5
      level = rainsStart ? 'high' : m.precipMmMonth >= 40 ? 'medium' : 'low'
    } else {
      level = m.t2m >= 12 && m.precipMmMonth < 40 ? 'high' : m.precipMmMonth < 60 ? 'medium' : 'low'
    }
    if (!inZone) level = level === 'high' ? 'medium' : 'low'
    return { pest: id, level, inZone }
  })
}
