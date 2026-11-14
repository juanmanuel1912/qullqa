/**
 * ¿Qué sembrar y qué no en MI chacra? Evalúa todos los cultivos en los 12 meses
 * con el clima NASA, la altitud, el tipo de tierra, el agua y el cultivo anterior.
 */
import type { Climatology } from '../../services/nasa/types'
import { assessNextCrop, NEXT_IDS, type FactorResult, type NextCropId, type NextCropResult, type NextVerdict, type PrevCropId, type SoilType } from '../rotation/nextCrop'

export interface CropPlan {
  crop: NextCropId
  verdict: NextVerdict
  /** Mejor resultado del año (mes recomendado) */
  best: NextCropResult
  /** Meses en que es buena idea */
  goodMonths: number[]
  /** El problema principal (rojo primero, luego amarillo) */
  mainIssue?: FactorResult
}

export interface PlanInput {
  prev: PrevCropId
  irrigation: boolean
  elevation: number
  soil: SoilType
}

const RANK: Record<NextVerdict, number> = { good: 2, fair: 1, bad: 0 }

export function planFarm(input: PlanInput, clim: Climatology, fromMonth = new Date().getUTCMonth()): CropPlan[] {
  return NEXT_IDS.map((crop) => {
    // Recorre los meses empezando por el actual: ante empate, gana el más próximo
    const results = Array.from({ length: 12 }, (_, i) => assessNextCrop({ ...input, next: crop, month: (fromMonth + i) % 12 }, clim))
    const best = results.reduce((a, b) => (RANK[b.verdict] > RANK[a.verdict] || (RANK[b.verdict] === RANK[a.verdict] && b.points > a.points) ? b : a))
    const goodMonths = results.filter((r) => r.verdict === 'good').map((r) => r.month)
    const mainIssue = best.factors.find((f) => f.level === 'bad') ?? best.factors.find((f) => f.level === 'warn')
    return { crop, verdict: best.verdict, best, goodMonths, mainIssue }
  }).sort((a, b) => RANK[b.verdict] - RANK[a.verdict] || b.best.points - a.best.points)
}
