import { describe, expect, it } from 'vitest'
import fallback from '../../data/fallback-cusco.json'
import { parseClimatology } from '../../services/nasa/power'
import { pestRisks } from './pestRisk'

const cusco = parseClimatology(fallback, 'fallback')

describe('riesgo de plagas (Cusco, ~3 400 m)', () => {
  it('rancha alta en enero (lluvioso y templado), baja en julio (seco)', () => {
    const jan = pestRisks(cusco, 3400, 0).find((r) => r.pest === 'rancha')!
    const jul = pestRisks(cusco, 3400, 6).find((r) => r.pest === 'rancha')!
    expect(jan.level).toBe('high')
    expect(jul.level).toBe('low')
  })

  it('gorgojo: en su zona de altura y activo con el inicio de lluvias', () => {
    const oct = pestRisks(cusco, 3400, 9).find((r) => r.pest === 'gorgojo')!
    expect(oct.inZone).toBe(true)
    expect(oct.level).not.toBe('low')
  })

  it('fuera de la zona de altura el riesgo baja', () => {
    const coast = pestRisks(cusco, 200, 9).find((r) => r.pest === 'gorgojo')!
    expect(coast.inZone).toBe(false)
    expect(coast.level).not.toBe('high')
  })
})
