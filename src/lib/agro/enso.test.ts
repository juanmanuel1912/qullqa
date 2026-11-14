import { describe, expect, it } from 'vitest'
import snapshot from '../../../public/enso-fallback.json'
import { parseNino12, parseOni } from '../../services/enso/noaa'
import { coastalStrength, ensoStatus, oniStrength } from './enso'

describe('El Niño (NOAA)', () => {
  it('parsea el formato de NOAA', () => {
    const oni = parseOni(' SEAS  YR   TOTAL   ANOM\n  JJA 2026  29.09   1.80\n  JAS 2026  29.12   2.16\n')
    expect(oni).toEqual([
      { season: 'JJA', year: 2026, anom: 1.8 },
      { season: 'JAS', year: 2026, anom: 2.16 },
    ])
    const n = parseNino12('YR MON  NINO1+2   ANOM   NINO3\n2026  10   26.12    5.25   29.24\n')
    expect(n).toEqual([{ year: 2026, month: 10, anom: 5.25 }])
  })

  it('clasifica la intensidad', () => {
    expect(oniStrength(0.3)).toBeNull()
    expect(oniStrength(0.7)).toBe('weak')
    expect(oniStrength(-1.2)).toBe('moderate')
    expect(oniStrength(2.4)).toBe('veryStrong')
    expect(coastalStrength(0.5)).toBe('weak')
    expect(coastalStrength(3.5)).toBe('veryStrong')
  })

  it('con la instantánea de NOAA detecta El Niño en curso', () => {
    const s = ensoStatus(snapshot.oni, snapshot.nino12)!
    expect(s).not.toBeNull()
    expect(s.oni.year).toBeGreaterThanOrEqual(2026)
    if (s.oni.anom >= 0.5) expect(s.phase).toBe('elnino')
  })
})
