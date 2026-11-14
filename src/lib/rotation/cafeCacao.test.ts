import { describe, expect, it } from 'vitest'
import fallback from '../../data/fallback-cusco.json'
import { parseClimatology } from '../../services/nasa/power'
import { assessNextCrop } from './nextCrop'
import { adjustToElevation } from '../farms/indicators'
import { adviseNow } from '../../components/rotation/ClimateNowPanel'
import { PERU_ZONES } from '../farms/peruZones'
import { CROP_MEDIA } from '../media/gallery'

const clim = parseClimatology(fallback, 'fallback')

describe('café y cacao', () => {
  it('en Cusco (3 361 m) no se puede sembrar café ni cacao', () => {
    for (const next of ['cafe', 'cacao'] as const) {
      const r = assessNextCrop({ prev: 'papa', next, month: 10, irrigation: false, elevation: 3361 }, clim)
      expect(r.verdict).toBe('bad')
      expect(r.factors.find((f) => f.factor === 'land')?.level).toBe('bad')
    }
  })

  it('a 1 500 m, más cálido y con riego, el café ya es posible', () => {
    const warm = adjustToElevation({ ...clim, elevation: 3000 }, 1500).clim
    const r = assessNextCrop({ prev: 'descanso', next: 'cafe', month: 10, irrigation: true, elevation: 1500 }, warm)
    expect(r.verdict).not.toBe('bad')
    expect(r.factors.find((f) => f.factor === 'land')?.level).toBe('ok')
  })

  it('el mapa tiene zonas de café y cacao, con fotos y videos', () => {
    expect(PERU_ZONES.filter((z) => z.products.includes('cafe')).length).toBeGreaterThanOrEqual(4)
    expect(PERU_ZONES.filter((z) => z.products.includes('cacao')).length).toBeGreaterThanOrEqual(4)
    expect(CROP_MEDIA.cafe?.some((m) => m.kind === 'video')).toBe(true)
    expect(CROP_MEDIA.cacao?.some((m) => m.kind === 'video')).toBe(true)
  })
})

describe('consejo para esta semana (pronóstico + NASA)', () => {
  it('si viene helada, los cultivos sensibles esperan', () => {
    const input = { prev: 'papa' as const, irrigation: false, elevation: 3361, month: 10 }
    const calm = adviseNow(clim, input, { frostDays: 0, rainMm: 30 })
    const frost = adviseNow(clim, input, { frostDays: 2, rainMm: 30 })
    expect(calm.find((a) => a.crop === 'habas')?.group).toBe('now')
    // Las habas toleran helada; la oca no
    expect(frost.find((a) => a.crop === 'habas')?.group).toBe('now')
    expect(frost.find((a) => a.crop === 'oca')?.wait ?? frost.find((a) => a.crop === 'oca')?.group).not.toBe('now')
  })

  it('semana seca sin riego: esperar la lluvia', () => {
    const r = adviseNow(clim, { prev: 'papa', irrigation: false, elevation: 3361, month: 10 }, { frostDays: 0, rainMm: 0 })
    expect(r.find((a) => a.crop === 'habas')?.wait).toBe('dry')
  })
})
