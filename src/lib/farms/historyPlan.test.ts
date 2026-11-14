import { describe, expect, it } from 'vitest'
import fallback from '../../data/fallback-cusco.json'
import { parseClimatology } from '../../services/nasa'
import { adjustToElevation } from './indicators'
import { exampleRecords, type FieldRecord } from './history'
import { planFromHistory } from './historyPlan'

const today = '2026-11-14'
const base = parseClimatology(fallback, 'fallback')
const clim = adjustToElevation(base, 3360).clim
const recs: FieldRecord[] = exampleRecords(today).map((r, i) => ({ ...r, id: String(i) }))
const opts = { irrigation: false, elevation: 3360, soil: 'unknown' as const }

describe('planificar con el historial', () => {
  const plan = planFromHistory(recs, clim, opts, today)

  it('sabe qué hay sembrado y cuándo queda libre la chacra', () => {
    expect(plan.current?.crop).toBe('quinua')
    expect(plan.prev).toBe('quinua')
    expect(plan.freeDate > today).toBe(true)
  })

  it('pide descanso para la papa: se sembró en los últimos años', () => {
    const papa = plan.options.find((o) => o.crop === 'papa')!
    expect(papa.note).toBe('recent')
    expect(papa.verdict).not.toBe('good')
    expect(papa.againFrom).toBe(2028)
  })

  it('recomienda primero un cultivo que mejora el suelo y arma 3 campañas sin repetir', () => {
    const top = plan.options[0]
    expect(top.verdict).toBe('good')
    expect(plan.sequence.length).toBe(3)
    expect(plan.sequence[0].crop).toBe(top.crop)
    expect(new Set(plan.sequence.map((c) => c.crop)).size).toBe(3)
  })

  it('sin historial: parte de tierra en descanso', () => {
    const p = planFromHistory([], clim, opts, today)
    expect(p.prev).toBe('descanso')
    expect(p.current).toBeNull()
  })
})
