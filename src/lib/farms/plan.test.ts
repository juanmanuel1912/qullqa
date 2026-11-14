import { describe, expect, it } from 'vitest'
import fallback from '../../data/fallback-cusco.json'
import { parseClimatology } from '../../services/nasa/power'
import { altitudeZone, farmIndicators } from './indicators'
import { planFarm } from './plan'
import { assessNextCrop } from '../rotation/nextCrop'
import { PERU_ZONES } from './peruZones'

const clim = parseClimatology(fallback, 'fallback')

describe('indicadores clave de la chacra (Cusco, NASA POWER)', () => {
  it('Cusco a 3 361 m es región Quechua, con heladas y temporada de lluvias', () => {
    const ind = farmIndicators(clim, 3361)
    expect(ind.zone).toBe('quechua')
    expect(ind.frostMonths.length).toBeGreaterThan(0)
    expect(ind.rainyMonths).toContain(0) // enero
    expect(ind.annualRain).toBeGreaterThan(500)
    expect(ind.coldest.t).toBeLessThan(ind.warmest.t)
  })

  it('pisos ecológicos por altura y lluvia', () => {
    expect(altitudeZone(100, 100)).toBe('chala')
    expect(altitudeZone(1500, 300)).toBe('yunga')
    expect(altitudeZone(3800, 700)).toBe('suni')
    expect(altitudeZone(4300, 600)).toBe('puna')
    expect(altitudeZone(800, 2000)).toBe('rupaRupa')
    expect(altitudeZone(150, 2500)).toBe('omagua')
  })

  it('el mapa del Perú tiene zonas con cultivos', () => {
    expect(PERU_ZONES.length).toBeGreaterThanOrEqual(15)
    expect(PERU_ZONES.every((z) => z.crops.length > 0)).toBe(true)
  })
})

describe('qué sembrar y qué no (plan de la chacra)', () => {
  const base = { prev: 'papa' as const, irrigation: false, elevation: 3361, soil: 'loam' as const }

  it('en Cusco después de papa: habas sí, mango no', () => {
    const plan = planFarm(base, clim, 10)
    const habas = plan.find((p) => p.crop === 'habas')!
    const mango = plan.find((p) => p.crop === 'mango')!
    expect(habas.verdict).toBe('good')
    expect(habas.goodMonths.length).toBeGreaterThan(0)
    expect(mango.verdict).toBe('bad')
    expect(mango.mainIssue?.level).toBe('bad')
    // Ordenado: primero los buenos
    expect(plan[0].verdict).toBe('good')
  })

  it('tierra arcillosa: la papa puede pudrirse; las habas la toleran', () => {
    const papa = assessNextCrop({ prev: 'habas', next: 'papa', month: 10, irrigation: false, elevation: 3361, soil: 'clay' }, clim)
    const habas = assessNextCrop({ prev: 'papa', next: 'habas', month: 10, irrigation: false, elevation: 3361, soil: 'clay' }, clim)
    expect(papa.factors.find((f) => f.factor === 'texture')?.code).toBe('textureClay')
    expect(habas.factors.find((f) => f.factor === 'texture')?.code).toBe('textureClayOk')
  })

  it('sin tipo de tierra no se agrega ese factor', () => {
    const r = assessNextCrop({ prev: 'papa', next: 'habas', month: 10, irrigation: false, elevation: 3361 }, clim)
    expect(r.factors.some((f) => f.factor === 'texture')).toBe(false)
  })
})

describe('ajuste de temperatura a la altura de la chacra', () => {
  it('un valle 865 m más bajo que la celda NASA es ~5.6 °C más cálido', async () => {
    const { adjustToElevation } = await import('./indicators')
    const grid = { ...clim, elevation: 3740 }
    const r = adjustToElevation(grid, 2875)
    expect(r.deltaC).toBeCloseTo(5.6, 1)
    expect(r.clim.months[0].t2m).toBeCloseTo(grid.months[0].t2m + 5.6, 1)
    expect(adjustToElevation(grid, null).deltaC).toBe(0)
  })
})
