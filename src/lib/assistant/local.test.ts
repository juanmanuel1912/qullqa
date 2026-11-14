import { describe, expect, it } from 'vitest'
import fallback from '../../data/fallback-cusco.json'
import { parseClimatology } from '../../services/nasa/power'
import { translate, pick, type Key, type Vars } from '@/i18n'
import { answerLocally, detectCrop, detectMonth } from './local'

const clim = parseClimatology(fallback, 'fallback')
const deps = {
  t: (k: Key, v?: Vars) => translate('es', k, v),
  L: (x: { en: string; es: string }) => pick('es', x),
  month: (i: number) => translate('es', `month.${i}` as Key),
  fmtLong: (d: Date | string) => String(d).slice(0, 10),
  list: (a: string[]) => a.join(', '),
  place: 'Cusco',
  variety: 'Yungay',
  clim,
  crop: null,
  weekPlan: null,
  enso: null,
  today: new Date('2026-11-14'),
}

describe('asistente local', () => {
  it('entiende cultivos y meses con tildes', () => {
    expect(detectCrop('si siembro ají en mayo')).toBe('aji')
    expect(detectCrop('if i plant mango')).toBe('mango')
    expect(detectMonth('si siembro mango en abril')).toBe(3)
    expect(detectMonth('what about september?')).toBe(8)
  })

  it('"si siembro mango en abril" en Cusco: no recomendable, con razones', () => {
    const a = answerLocally('si siembro mango en abril, ¿sería buena idea y cuánto demoraría?', deps)
    expect(a).toContain('No recomendable')
    expect(a).toContain('abril')
    expect(a).toMatch(/3[,.]?5? años|años/)
  })

  it('"¿qué puedo sembrar en marzo?" lista todos los cultivos', () => {
    const a = answerLocally('¿qué puedo sembrar en marzo?', deps)
    expect(a.split('\n').length).toBeGreaterThan(5)
  })

  it('"¿cómo afecta El Niño a mi papa?" responde sobre El Niño, no sobre sembrar', () => {
    const a = answerLocally('¿Cómo afecta El Niño a mi papa?', deps)
    expect(a).not.toContain('Papa sembrado')
    expect(a.length).toBeGreaterThan(40)
  })

  it('"¿cuándo cosecho mi papa?" sin siembra registrada pide registrarla', () => {
    expect(answerLocally('¿cuándo cosecho mi papa?', deps)).toContain('Registra tu siembra')
  })

  it('pregunta desconocida: explica qué puede responder', () => {
    expect(answerLocally('hola', deps)).toContain('Puedo ayudarte')
  })
})
