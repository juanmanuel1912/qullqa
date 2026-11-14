import { describe, expect, it } from 'vitest'
import fallback from '../../data/fallback-cusco.json'
import { parseClimatology } from '../../services/nasa/power'
import { compareStrategies, cropFit, evaluateStrategy, farmSeason, ROT_CROPS, STRATEGIES } from './planner'

const clim = parseClimatology(fallback, 'fallback')
const cusco = farmSeason(clim, 3361)

describe('planificador de rotación (Cusco, datos NASA)', () => {
  it('detecta la temporada de lluvias y los meses secos (tierra pelada)', () => {
    expect(cusco.growingMonths).toContain(0) // enero
    expect(cusco.bareMonths).toEqual(expect.arrayContaining([5, 6, 7])) // junio–agosto
    expect(cusco.seasonRainMm).toBeGreaterThan(400)
  })

  it('papa tras papa: peor para plagas y suelo, mejor ingreso', () => {
    const current = evaluateStrategy(STRATEGIES[0], cusco, 'balanced')
    const trad = evaluateStrategy(STRATEGIES[1], cusco, 'balanced')
    expect(current.scores.pests).toBe(0)
    expect(trad.scores.pests).toBeGreaterThan(current.scores.pests)
    expect(trad.scores.soil).toBeGreaterThan(current.scores.soil)
    expect(current.scores.income).toBeGreaterThan(trad.scores.income)
  })

  it('con prioridad equilibrada o suelo, la rotación actual queda última', () => {
    for (const p of ['balanced', 'soil'] as const) {
      const ranked = compareStrategies(cusco, p)
      expect(ranked[ranked.length - 1].strategy.id).toBe('current')
    }
  })

  it('el tarwi y la quinua no se adaptan a la costa baja', () => {
    const coast = { ...cusco, elevation: 100 }
    expect(cropFit(ROT_CROPS.tarwi, coast)).toBeLessThanOrEqual(1)
    expect(cropFit(ROT_CROPS.quinua, coast)).toBeLessThanOrEqual(1)
  })
})
