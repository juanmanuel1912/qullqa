/**
 * Planificar la próxima siembra a partir del HISTORIAL de la chacra:
 * - qué hay sembrado ahora y cuándo queda libre la chacra,
 * - qué familias de cultivos se sembraron en los últimos años (para cortar plagas y no cansar la tierra),
 * - el clima de la NASA a tu altura (motor de rotación).
 */
import type { Climatology } from '../../services/nasa/types'
import { NEXT_CROPS, type NextCropId, type PrevCropId, type SoilType } from '../rotation/nextCrop'
import { planFarm, type CropPlan } from './plan'
import { addDays, cycleDays, daysBetween, expectedHarvest, type FieldRecord } from './history'

/**
 * Años de descanso entre cultivos de la misma familia en la misma chacra.
 * Papa y ají (solanáceas): 3 años, por el gorgojo de los Andes, los nematodos y la rancha.
 * Leguminosas y abonos verdes alimentan el suelo: pueden volver pronto.
 */
export const REST_YEARS: Record<string, number> = { solanacea: 3, tuber: 2, quinoa: 2, cereal: 1, legume: 1, cover: 0, tree: 0 }

export type HistoryNote = 'rested' | 'recent' | 'never'

export interface HistoryOption {
  crop: NextCropId
  plan: CropPlan
  /** Veredicto final (clima + rotación + historial) */
  verdict: CropPlan['verdict']
  note: HistoryNote
  /** Años en que se sembró esta misma familia en la chacra */
  familyYears: number[]
  /** Cultivos de la misma familia que hay en el historial */
  familyCrops: NextCropId[]
  /** Años de descanso que pide esta familia */
  rest: number
  /** Desde qué año conviene volver a sembrarla (si 'recent') */
  againFrom: number | null
  sowMonth: number
  sowYear: number
}

export interface Campaign {
  crop: NextCropId
  sowMonth: number
  sowYear: number
  harvestDate: string
}

export interface HistoryPlanResult {
  /** Del más antiguo al más reciente */
  timeline: FieldRecord[]
  current: FieldRecord | null
  prev: PrevCropId
  /** Cuándo queda libre la chacra */
  freeDate: string
  options: HistoryOption[]
  /** Plan de las próximas 3 campañas */
  sequence: Campaign[]
}

const RANK = { good: 2, fair: 1, bad: 0 } as const
const familyOf = (c: NextCropId) => NEXT_CROPS[c].family
const pad = (n: number) => String(n).padStart(2, '0')

/** Primer mes bueno a partir de la fecha en que la chacra queda libre */
function firstSow(plan: CropPlan, freeDate: string): { sowMonth: number; sowYear: number } {
  const freeMonth = Number(freeDate.slice(5, 7)) - 1
  const freeYear = Number(freeDate.slice(0, 4))
  const months = plan.goodMonths.length ? plan.goodMonths : [plan.best.month]
  const sowMonth = [...months].sort((a, b) => ((a - freeMonth + 12) % 12) - ((b - freeMonth + 12) % 12))[0]
  return { sowMonth, sowYear: sowMonth >= freeMonth ? freeYear : freeYear + 1 }
}

function evaluate(records: FieldRecord[], prev: PrevCropId, freeDate: string, opts: { irrigation: boolean; elevation: number; soil: SoilType }, clim: Climatology): HistoryOption[] {
  const freeMonth = Number(freeDate.slice(5, 7)) - 1
  return planFarm({ prev, ...opts }, clim, freeMonth)
    .map((plan) => {
      const { sowMonth, sowYear } = firstSow(plan, freeDate)
      const sowDate = `${sowYear}-${pad(sowMonth + 1)}-15`
      const fam = familyOf(plan.crop)
      const same = records.filter((r) => familyOf(r.crop) === fam && fam !== 'tree')
      const familyCrops = [...new Set(same.map((r) => r.crop))]
      const familyYears = [...new Set(same.map((r) => Number(r.sowDate.slice(0, 4))))].sort()
      const rest = REST_YEARS[fam] ?? 1
      const recent = same.filter((r) => daysBetween(r.sowDate, sowDate) < rest * 365 && daysBetween(r.sowDate, sowDate) >= 0)
      const note: HistoryNote = recent.length > 0 ? 'recent' : same.length > 0 ? 'rested' : 'never'
      // El historial baja un escalón: si la familia se sembró hace poco, mejor esperar
      const verdict = note === 'recent' && plan.verdict === 'good' ? 'fair' : note === 'recent' && plan.verdict === 'fair' ? 'bad' : plan.verdict
      const againFrom = note === 'recent' ? Math.max(...recent.map((r) => Number(r.sowDate.slice(0, 4)))) + rest : null
      return { crop: plan.crop, plan, verdict, note, familyYears, familyCrops, rest, againFrom, sowMonth, sowYear }
    })
    .sort((a, b) => RANK[b.verdict] - RANK[a.verdict] || b.plan.best.points - a.plan.best.points)
}

export function planFromHistory(
  records: FieldRecord[],
  clim: Climatology,
  opts: { irrigation: boolean; elevation: number; soil: SoilType },
  today: string,
  /** El agricultor eligió la próxima siembra (si no, la mejor) */
  firstCrop?: NextCropId,
): HistoryPlanResult {
  const timeline = [...records].sort((a, b) => a.sowDate.localeCompare(b.sowDate))
  const current = [...timeline].reverse().find((r) => !r.harvestDate) ?? null
  const lastHarvest = [...timeline].filter((r) => r.harvestDate).sort((a, b) => b.harvestDate!.localeCompare(a.harvestDate!))[0]
  const prev: PrevCropId = current?.crop ?? lastHarvest?.crop ?? 'descanso'
  const expected = current ? expectedHarvest(current) : today
  const freeDate = expected < today ? today : expected

  const options = evaluate(timeline, prev, freeDate, opts, clim)

  // Plan de 3 campañas (solo cultivos de temporada: los árboles ocupan la chacra por años)
  const sequence: Campaign[] = []
  let recs = timeline
  let p = prev
  let free = freeDate
  for (let i = 0; i < 3; i++) {
    const ok = evaluate(recs, p, free, opts, clim).filter((o) => !NEXT_CROPS[o.crop].perennial && o.verdict !== 'bad')
    // Variar: no repetir un cultivo que ya está en el plan
    const chosen = i === 0 && firstCrop ? options.find((o) => o.crop === firstCrop) : undefined
    const pick = chosen ?? ok.find((o) => !sequence.some((c) => c.crop === o.crop)) ?? ok[0]
    if (!pick) break
    const sowDate = `${pick.sowYear}-${pad(pick.sowMonth + 1)}-15`
    const harvestDate = addDays(sowDate, cycleDays(pick.crop))
    sequence.push({ crop: pick.crop, sowMonth: pick.sowMonth, sowYear: pick.sowYear, harvestDate })
    recs = [...recs, { id: `plan-${i}`, farmId: null, crop: pick.crop, sowDate, areaHa: null, harvestDate, yieldKg: null, quality: null, notes: '' }]
    p = pick.crop
    free = harvestDate
  }

  return { timeline, current, prev, freeDate, options, sequence }
}
