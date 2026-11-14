/**
 * Planes de siembra guardados: la decisión del planificador de rotación convertida en acción.
 * Cada plan tiene lo que está en la chacra ahora y las próximas siembras (campañas).
 * DEMO: se guarda solo en este teléfono (localStorage).
 */
import { useCallback, useState } from 'react'
import type { NextCropId } from '../rotation/nextCrop'
import { addDays, cycleDays, daysBetween } from './history'

export interface PlanStep {
  crop: NextCropId
  sowMonth: number
  sowYear: number
  harvestDate: string
  /** Cuándo se sembró de verdad (null = todavía no) */
  doneDate: string | null
  /** Registro del historial creado al sembrar */
  doneRecordId: string | null
}

export interface SavedPlan {
  id: string
  name: string
  farmId: string | null
  placeName: string
  elevation: number | null
  createdAt: string
  /** Lo que está creciendo cuando se hizo el plan */
  current: { crop: NextCropId; sowDate: string; harvestDate: string } | null
  steps: PlanStep[]
  /** Cultivos que deben esperar (descanso) */
  waits: { crop: NextCropId; from: number }[]
  example?: boolean
}

export type SavedPlanInput = Omit<SavedPlan, 'id' | 'createdAt'>

const KEY = 'qullqa:v1:plans'
const pad = (n: number) => String(n).padStart(2, '0')

/** Fecha de siembra prevista de un paso (a mitad de mes) */
export const stepSowDate = (s: Pick<PlanStep, 'sowMonth' | 'sowYear'>) => `${s.sowYear}-${pad(s.sowMonth + 1)}-15`

export type StepStatus = 'done' | 'now' | 'soon' | 'later' | 'late'

/** Estado de cada paso: el primero pendiente es el "próximo" */
export function stepStatus(plan: SavedPlan, index: number, today: string): StepStatus {
  const s = plan.steps[index]
  if (s.doneDate) return 'done'
  const firstPending = plan.steps.findIndex((x) => !x.doneDate)
  if (index !== firstPending) return 'later'
  const d = daysBetween(today, stepSowDate(s))
  if (d < -45) return 'late'
  if (d <= 20) return 'now'
  return 'soon'
}

export function nextStep(plan: SavedPlan, today: string): { step: PlanStep; index: number; daysUntil: number; status: StepStatus } | null {
  const index = plan.steps.findIndex((s) => !s.doneDate)
  if (index < 0) return null
  const step = plan.steps[index]
  return { step, index, daysUntil: daysBetween(today, stepSowDate(step)), status: stepStatus(plan, index, today) }
}

/** Ejemplo para entender cómo se ve un plan guardado (la chacra de Sisa Ccori) */
export function examplePlan(today: string): SavedPlan {
  const harvest = addDays(today, 67)
  const firstSow = addDays(harvest, 10)
  const y = Number(firstSow.slice(0, 4))
  const m = Number(firstSow.slice(5, 7)) - 1
  const step = (crop: NextCropId, sowMonth: number, sowYear: number): PlanStep => ({
    crop,
    sowMonth,
    sowYear,
    harvestDate: addDays(`${sowYear}-${pad(sowMonth + 1)}-15`, cycleDays(crop)),
    doneDate: null,
    doneRecordId: null,
  })
  return {
    id: 'example',
    name: 'Chacra de Sisa Ccori',
    farmId: null,
    placeName: 'Cusco',
    elevation: 3360,
    createdAt: `${today}T12:00:00Z`,
    current: { crop: 'quinua', sowDate: addDays(today, -115), harvestDate: harvest },
    steps: [step('habas', m, y), step('cebada', 9, y), step('tarwi', 9, y + 1)],
    waits: [
      { crop: 'papa', from: y + 1 },
      { crop: 'aji', from: y + 1 },
    ],
    example: true,
  }
}

export function loadPlans(): SavedPlan[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as SavedPlan[]
  } catch {
    /* ignorar */
  }
  return []
}

export function usePlans() {
  const [plans, setPlans] = useState<SavedPlan[]>(loadPlans)
  const persist = useCallback((fn: (p: SavedPlan[]) => SavedPlan[]) => {
    const next = fn(loadPlans())
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* ignorar */
    }
    setPlans(next)
  }, [])

  const save = (p: SavedPlanInput): string => {
    const id = `p-${Date.now().toString(36)}`
    persist((prev) => [{ ...p, id, createdAt: new Date().toISOString() }, ...prev])
    return id
  }
  const updateStep = (id: string, index: number, patch: Partial<PlanStep>) =>
    persist((prev) => prev.map((p) => (p.id === id ? { ...p, steps: p.steps.map((s, i) => (i === index ? { ...s, ...patch } : s)) } : p)))
  const remove = (id: string) => persist((prev) => prev.filter((p) => p.id !== id))

  return { plans, save, updateStep, remove }
}
