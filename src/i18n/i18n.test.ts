import { describe, expect, it } from 'vitest'
import { en } from './en'
import { es } from './es'
import { qu } from './qu'
import { pick, translate } from './index'

describe('idiomas', () => {
  it('español tiene exactamente las mismas claves que inglés', () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort())
  })

  it('quechua solo usa claves que existen', () => {
    const keys = new Set(Object.keys(en))
    expect(Object.keys(qu).filter((k) => !keys.has(k))).toEqual([])
  })

  it('los textos usan las mismas variables en los tres idiomas', () => {
    const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',')
    for (const k of Object.keys(en) as (keyof typeof en)[]) {
      expect([k, vars(es[k])]).toEqual([k, vars(en[k])])
      const q = qu[k]
      if (q) expect([k, vars(q)]).toEqual([k, vars(en[k])])
    }
  })

  it('reemplaza variables y cae al español en quechua', () => {
    expect(translate('en', 'status.daysLeft', { n: 5 })).toBe('5 days to go')
    expect(translate('qu', 'status.daysLeft', { n: 5 })).toBe("5 p'unchawraq")
    expect(translate('qu', 'farm.gps')).toBe(es['farm.gps'])
    expect(pick('qu', { en: 'a', es: 'b' })).toBe('b')
  })
})
