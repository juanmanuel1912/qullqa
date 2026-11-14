/**
 * Historial de siembra y cosecha: el cuaderno de campo del agricultor.
 * Cada registro es una siembra; cuando se cosecha se completa con la fecha y lo cosechado.
 * DEMO: se guarda solo en este teléfono (localStorage).
 */
import { useCallback, useState } from 'react'
import { NEXT_CROPS, type NextCropId } from '../rotation/nextCrop'

export type HarvestQuality = 'good' | 'normal' | 'bad'

export interface FieldRecord {
  id: string
  /** Chacra de "Mis chacras" (o null si no la registró) */
  farmId: string | null
  crop: NextCropId
  /** Fecha de siembra 'YYYY-MM-DD' */
  sowDate: string
  areaHa: number | null
  /** Fecha de cosecha 'YYYY-MM-DD' (null = sigue en la chacra) */
  harvestDate: string | null
  /** Lo cosechado en kg */
  yieldKg: number | null
  quality: HarvestQuality | null
  notes: string
}

export type FieldRecordInput = Omit<FieldRecord, 'id'>

const KEY = 'qullqa:v1:history'
const DAY = 86_400_000

const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`)
export const isoDate = (d: Date) => d.toISOString().slice(0, 10)
export const addDays = (iso: string, days: number) => isoDate(new Date(toDate(iso).getTime() + days * DAY))
export const daysBetween = (a: string, b: string) => Math.round((toDate(b).getTime() - toDate(a).getTime()) / DAY)

/** Días de siembra a cosecha (anuales) o a la primera cosecha (árboles) */
export function cycleDays(crop: NextCropId): number {
  const c = NEXT_CROPS[crop]
  return Math.round(c.perennial ? c.cycle * 365.25 : c.cycle * 30.4)
}

/** Fecha estimada de cosecha según el cultivo */
export const expectedHarvest = (r: Pick<FieldRecord, 'crop' | 'sowDate'>) => addDays(r.sowDate, cycleDays(r.crop))

export interface RecordProgress {
  status: 'growing' | 'ready' | 'harvested'
  /** Días desde la siembra (hasta hoy o hasta la cosecha) */
  days: number
  /** 0..1 del ciclo */
  progress: number
  expected: string
  /** Días que faltan para la cosecha estimada (negativo = ya pasó) */
  daysLeft: number
}

export function recordProgress(r: FieldRecord, today: string): RecordProgress {
  const expected = expectedHarvest(r)
  const end = r.harvestDate ?? today
  const days = Math.max(0, daysBetween(r.sowDate, end))
  const progress = Math.min(1, days / cycleDays(r.crop))
  const daysLeft = daysBetween(today, expected)
  const status = r.harvestDate ? 'harvested' : daysLeft <= 0 ? 'ready' : 'growing'
  return { status, days, progress, expected, daysLeft }
}

/** Rendimiento en toneladas por hectárea (si hay área y cosecha) */
export function yieldTHa(r: FieldRecord): number | null {
  if (!r.yieldKg || !r.areaHa) return null
  return Math.round((r.yieldKg / 1000 / r.areaHa) * 10) / 10
}

/** Más reciente primero */
export const sortRecords = (rs: FieldRecord[]) => [...rs].sort((a, b) => b.sowDate.localeCompare(a.sowDate))

/** "Hace un año": lo que se sembró o cosechó cerca de esta fecha el año pasado (± 45 días) */
export function aYearAgo(rs: FieldRecord[], today: string, windowDays = 45): FieldRecord[] {
  const ref = addDays(today, -365)
  const near = (iso: string | null) => iso != null && Math.abs(daysBetween(ref, iso)) <= windowDays
  return sortRecords(rs.filter((r) => near(r.sowDate) || near(r.harvestDate)))
}

/** Resumen por año de siembra */
export function summaryByYear(rs: FieldRecord[]) {
  const years = new Map<number, { year: number; sown: number; harvested: number; kg: number; crops: NextCropId[] }>()
  for (const r of rs) {
    const y = Number(r.sowDate.slice(0, 4))
    const s = years.get(y) ?? { year: y, sown: 0, harvested: 0, kg: 0, crops: [] }
    s.sown++
    if (r.harvestDate) s.harvested++
    s.kg += r.yieldKg ?? 0
    if (!s.crops.includes(r.crop)) s.crops.push(r.crop)
    years.set(y, s)
  }
  return [...years.values()].sort((a, b) => b.year - a.year)
}

/** Comparar con la cosecha anterior del mismo cultivo (en la misma chacra si se sabe) */
export function previousSameCrop(rs: FieldRecord[], r: FieldRecord): FieldRecord | null {
  return (
    sortRecords(rs).find(
      (x) => x.id !== r.id && x.crop === r.crop && x.harvestDate != null && x.yieldKg != null && x.sowDate < r.sowDate && (!r.farmId || x.farmId === r.farmId),
    ) ?? null
  )
}

/** Lo último cosechado en una chacra (para la rotación) */
export function lastHarvested(rs: FieldRecord[], farmId: string): FieldRecord | null {
  return [...rs].filter((r) => r.farmId === farmId && r.harvestDate).sort((a, b) => b.harvestDate!.localeCompare(a.harvestDate!))[0] ?? null
}

/** Ejemplo para ver cómo funciona (la chacra de Sisa Ccori, Cusco) */
export function exampleRecords(today: string): FieldRecordInput[] {
  const d = (days: number) => addDays(today, -days)
  return [
    { farmId: null, crop: 'cebada', sowDate: d(1100), areaHa: 0.5, harvestDate: d(960), yieldKg: 1100, quality: 'normal', notes: 'Ejemplo · Example' },
    { farmId: null, crop: 'papa', sowDate: d(740), areaHa: 0.5, harvestDate: d(590), yieldKg: 6500, quality: 'normal', notes: 'Ejemplo · Example' },
    { farmId: null, crop: 'habas', sowDate: d(560), areaHa: 0.5, harvestDate: d(390), yieldKg: 900, quality: 'good', notes: 'Ejemplo · Example' },
    { farmId: null, crop: 'papa', sowDate: d(375), areaHa: 0.5, harvestDate: d(225), yieldKg: 8200, quality: 'good', notes: 'Ejemplo · Example' },
    { farmId: null, crop: 'quinua', sowDate: d(115), areaHa: 0.5, harvestDate: null, yieldKg: null, quality: null, notes: 'Ejemplo · Example' },
  ]
}

export function loadHistory(): FieldRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as FieldRecord[]
  } catch {
    /* ignorar */
  }
  return []
}

export function useHistory() {
  const [records, setRecords] = useState<FieldRecord[]>(loadHistory)
  const persist = useCallback((fn: (r: FieldRecord[]) => FieldRecord[]) => {
    const next = fn(loadHistory())
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* ignorar */
    }
    setRecords(next)
  }, [])

  /** Devuelve el id del primer registro agregado */
  const add = (...items: FieldRecordInput[]): string => {
    const stamp = Date.now().toString(36)
    persist((prev) => [...prev, ...items.map((r, i) => ({ ...r, id: `r-${stamp}-${i}` }))])
    return `r-${stamp}-0`
  }
  const update = (id: string, patch: Partial<FieldRecordInput>) => persist((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const remove = (id: string) => persist((prev) => prev.filter((r) => r.id !== id))

  return { records, add, update, remove }
}
