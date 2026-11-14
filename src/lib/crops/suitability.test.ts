import { describe, expect, it } from 'vitest'
import fallback from '../../data/fallback-cusco.json'
import { parseClimatology } from '../../services/nasa/power'
import { assessCrop, potatoModelFor } from './suitability'

const cusco = parseClimatology(fallback, 'fallback')

describe('¿es buena idea sembrar? (Cusco, ~3 700 m)', () => {
  it('papa en noviembre: buena (modelo NASA)', () => {
    const s = assessCrop('papa', 10, cusco, { variety: 'Yungay' })
    expect(s.verdict).toBe('good')
    expect(s.harvestDate).not.toBeNull()
  })

  it('mango en abril en Cusco: mala idea (altitud y frío)', () => {
    const s = assessCrop('mango', 3, cusco)
    expect(s.verdict).toBe('bad')
    expect(s.reasons.some((r) => r.code === 'altBad')).toBe(true)
    expect(s.yearsToFirstHarvest).toBeGreaterThan(2)
  })

  it('quinua en octubre: dentro de su rango de altura y temporada', () => {
    const s = assessCrop('quinua', 9, cusco)
    expect(s.verdict).not.toBe('bad')
    expect(s.reasons.some((r) => r.code === 'inSeason')).toBe(true)
  })

  it('reconoce la variedad de papa escrita por el agricultor', () => {
    expect(potatoModelFor('Canchán INIA')).toBe('canchan')
    expect(potatoModelFor('huayro')).toBe('huayro')
    expect(potatoModelFor('otra')).toBe('yungay')
  })
})
