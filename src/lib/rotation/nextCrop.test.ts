import { describe, expect, it } from 'vitest'
import fallback from '../../data/fallback-cusco.json'
import { parseClimatology } from '../../services/nasa/power'
import { assessNextCrop, bestNextCrops } from './nextCrop'

const clim = parseClimatology(fallback, 'fallback')
const base = { prev: 'papa' as const, month: 10, irrigation: false, elevation: 3361 }
const fac = (r: ReturnType<typeof assessNextCrop>, f: string) => r.factors.find((x) => x.factor === f)!

describe('¿qué siembro después? (Cusco, datos NASA)', () => {
  it('mango después de papa en Cusco: mala idea por altitud y clima', () => {
    const r = assessNextCrop({ ...base, next: 'mango' }, clim)
    expect(r.verdict).toBe('bad')
    expect(fac(r, 'land').level).toBe('bad')
    expect(fac(r, 'time').code).toBe('timePerennial')
  })

  it('habas después de papa en noviembre: buena idea, devuelve nitrógeno', () => {
    const r = assessNextCrop({ ...base, next: 'habas' }, clim)
    expect(r.verdict).toBe('good')
    expect(fac(r, 'soil').code).toBe('soilGiver')
    expect(fac(r, 'soil').great).toBe(true)
  })

  it('papa después de papa: mala idea por el suelo', () => {
    const r = assessNextCrop({ ...base, next: 'papa' }, clim)
    expect(fac(r, 'soil').code).toBe('soilSame')
    expect(r.verdict).toBe('bad')
  })

  it('ají después de papa: misma familia', () => {
    expect(fac(assessNextCrop({ ...base, next: 'aji' }, clim), 'soil').code).toBe('soilFamily')
  })

  it('papa en julio sin riego: heladas y sequía', () => {
    const r = assessNextCrop({ ...base, prev: 'habas', next: 'papa', month: 6 }, clim)
    expect(r.verdict).not.toBe('good')
    expect(fac(r, 'time').code).toBe('timeDry')
  })

  it('con riego, la siembra en mes seco ya no espera la lluvia', () => {
    const r = assessNextCrop({ ...base, prev: 'habas', next: 'cebada', month: 6, irrigation: true }, clim)
    expect(fac(r, 'time').code).toBe('timeOk')
  })

  it('sugiere alternativas buenas y no repite el cultivo elegido', () => {
    const alts = bestNextCrops(base, clim, 'mango')
    expect(alts.length).toBeGreaterThan(0)
    expect(alts.every((a) => a.next !== 'mango' && a.verdict !== 'bad')).toBe(true)
    expect(alts.some((a) => a.next === 'papa')).toBe(false)
  })
})
