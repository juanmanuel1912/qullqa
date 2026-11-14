import { describe, expect, it } from 'vitest'
import fallback from '../../data/fallback-cusco.json'
import { parseClimatology } from '../../services/nasa'
import { adjustToElevation } from '../farms/indicators'
import { appCropNeeds, APP_CROPS, fitHere } from './fit'
import { CROP_PRESETS } from './customCrops'

const elev = 3360
const clim = adjustToElevation(parseClimatology(fallback, 'fallback'), elev).clim

describe('¿puedo sembrarlo aquí? (altura + clima)', () => {
  it('en Cusco: papa, habas y quinua sí; cacao, mango y café no', () => {
    const v = Object.fromEntries(APP_CROPS.map((id) => [id, fitHere(appCropNeeds(id), clim, elev).verdict]))
    expect(v.papa).not.toBe('bad')
    expect(v.habas).toBe('good')
    expect(v.quinua).not.toBe('bad')
    expect(v.cacao).toBe('bad')
    expect(v.mango).toBe('bad')
    expect(v.cafe).toBe('bad')
  })

  it('explica por qué no: altura fuera de rango y falta calor', () => {
    const r = fitHere(appCropNeeds('cacao'), clim, elev)
    expect(r.altitude.level).toBe('bad')
    expect(r.climate.level).toBe('bad')
  })

  it('los ejemplos para agregar: olluco y trigo sí; yuca y arroz no', () => {
    const v = Object.fromEntries(CROP_PRESETS.map((p) => [p.key, fitHere(p, clim, elev).verdict]))
    expect(v.olluco).not.toBe('bad')
    expect(v.trigo).not.toBe('bad')
    expect(v.yuca).toBe('bad')
    expect(v.arroz).toBe('bad')
  })

  it('el riego ayuda con el agua pero no con la altura', () => {
    const dry = fitHere({ ...appCropNeeds('cebada'), waterMm: 5000 }, clim, elev)
    expect(dry.water.level).toBe('bad')
    expect(fitHere({ ...appCropNeeds('cebada'), waterMm: 5000 }, clim, elev, true).water.level).toBe('ok')
  })
})
