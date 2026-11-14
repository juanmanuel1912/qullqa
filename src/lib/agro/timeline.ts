/**
 * Línea de tiempo del cultivo: en qué día llega cada etapa y cuándo abonar,
 * calculado con grados-día y la climatología NASA del lugar.
 */
import type { Climatology } from '../../services/nasa/types'
import { STAGES, type StageId } from './crop'
import { daysBetween, projectDateForGdd } from './gdd'
import { getVariety, type VarietyId } from './varieties'

export interface TimelineStage {
  id: StageId
  /** Día desde la siembra en que empieza la etapa */
  day: number
}

export type TaskId = 'baseFertilizer' | 'firstHilling' | 'secondHilling' | 'criticalWater' | 'stopWater' | 'harvest'

export interface TimelineTask {
  id: TaskId
  /** Día aproximado desde la siembra */
  day: number
}

export interface CropTimeline {
  sowDate: Date
  totalDays: number
  months: number
  stages: TimelineStage[]
  tasks: TimelineTask[]
}

export function buildTimeline(clim: Climatology, variety: VarietyId, sowDate: Date): CropTimeline | null {
  const target = getVariety(variety).gddToHarvest
  const dayAt = (fraction: number) => {
    const d = projectDateForGdd(sowDate, 0, target * fraction, clim)
    return d ? daysBetween(sowDate, d) : null
  }
  const total = dayAt(1)
  if (total === null) return null

  const stages = STAGES.map((s) => ({ id: s.id, day: dayAt(s.from) ?? total }))
  const at = (id: StageId) => stages.find((s) => s.id === id)!.day

  // Prácticas recomendadas en la sierra peruana (INIA): abono de fondo a la siembra,
  // resto del nitrógeno en el primer aporque, segundo aporque al iniciar la tuberización.
  const tasks: TimelineTask[] = [
    { id: 'baseFertilizer', day: 0 },
    { id: 'firstHilling', day: Math.round((at('growth') + at('tuberization')) / 2) },
    { id: 'secondHilling', day: at('tuberization') },
    { id: 'criticalWater', day: Math.round((at('tuberization') + at('bulking')) / 2) },
    { id: 'stopWater', day: at('maturation') },
    { id: 'harvest', day: total },
  ]

  return { sowDate, totalDays: total, months: Math.round((total / 30.4) * 10) / 10, stages, tasks }
}
