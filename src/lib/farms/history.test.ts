import { describe, expect, it } from 'vitest'
import { aYearAgo, addDays, expectedHarvest, exampleRecords, lastHarvested, previousSameCrop, recordProgress, summaryByYear, yieldTHa, type FieldRecord } from './history'

const today = '2026-11-14'
const rec = (r: Partial<FieldRecord>): FieldRecord => ({
  id: Math.random().toString(36), farmId: 'f1', crop: 'papa', sowDate: today, areaHa: 0.5, harvestDate: null, yieldKg: null, quality: null, notes: '', ...r,
})

describe('historial de siembra y cosecha', () => {
  it('estima la cosecha según el ciclo del cultivo', () => {
    expect(expectedHarvest({ crop: 'papa', sowDate: '2026-01-01' })).toBe(addDays('2026-01-01', 152))
    // árboles: años a la primera cosecha
    expect(expectedHarvest({ crop: 'cafe', sowDate: '2026-01-01' }).slice(0, 4)).toBe('2029')
  })

  it('calcula el avance de lo que está en la chacra', () => {
    const p = recordProgress(rec({ sowDate: addDays(today, -76) }), today)
    expect(p.status).toBe('growing')
    expect(p.progress).toBeCloseTo(0.5, 1)
    expect(recordProgress(rec({ sowDate: addDays(today, -200) }), today).status).toBe('ready')
    expect(recordProgress(rec({ sowDate: addDays(today, -200), harvestDate: addDays(today, -40) }), today).status).toBe('harvested')
  })

  it('encuentra lo que se hizo hace un año', () => {
    const rs = [rec({ sowDate: addDays(today, -370), harvestDate: addDays(today, -220) }), rec({ sowDate: addDays(today, -200) })]
    expect(aYearAgo(rs, today)).toHaveLength(1)
  })

  it('compara el rendimiento con la cosecha anterior del mismo cultivo', () => {
    const old = rec({ sowDate: '2024-11-01', harvestDate: '2025-04-01', yieldKg: 6000 })
    const now = rec({ sowDate: '2025-11-01', harvestDate: '2026-04-01', yieldKg: 8000 })
    expect(previousSameCrop([old, now], now)?.id).toBe(old.id)
    expect(yieldTHa(now)).toBe(16)
    expect(lastHarvested([old, now], 'f1')?.id).toBe(now.id)
  })

  it('el ejemplo tiene cosechas pasadas y una siembra en curso', () => {
    const rs = exampleRecords(today).map((r, i) => ({ ...r, id: String(i) }))
    expect(rs.filter((r) => !r.harvestDate)).toHaveLength(1)
    expect(aYearAgo(rs, today).length).toBeGreaterThan(0)
    expect(summaryByYear(rs).length).toBeGreaterThanOrEqual(2)
  })
})
