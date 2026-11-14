/**
 * Idiomas de Qullqa: inglés (principal), español y quechua (beta).
 * - t('clave', { var }) para textos de la interfaz.
 * - L({ en, es, qu? }) para contenido largo escrito en línea (catálogo de papas).
 * El quechua cae al español si falta una traducción.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { en, type Key } from './en'
import { es } from './es'
import { qu } from './qu'

export type Lang = 'en' | 'es' | 'qu'
export const LANGS: { id: Lang; short: string; name: string }[] = [
  { id: 'en', short: 'EN', name: 'English' },
  { id: 'es', short: 'ES', name: 'Español' },
  { id: 'qu', short: 'QU', name: 'Runasimi' },
]

export type Vars = Record<string, string | number>
export interface Localized {
  en: string
  es: string
  qu?: string
}

const LANG_KEY = 'qullqa:v1:lang'

function loadLang(): Lang {
  try {
    const v = localStorage.getItem(LANG_KEY)
    if (v === 'en' || v === 'es' || v === 'qu') return v
  } catch {
    /* sin almacenamiento */
  }
  return 'en'
}

const fill = (s: string, vars?: Vars) => (vars ? s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`)) : s)

/** Traducción sin React (útil fuera de componentes y en tests). */
export function translate(lang: Lang, key: Key, vars?: Vars): string {
  const s = lang === 'en' ? en[key] : lang === 'es' ? es[key] : (qu[key] ?? es[key])
  return fill(s ?? en[key], vars)
}

/** Contenido en línea: quechua → español → inglés. */
export function pick(lang: Lang, text: Localized): string {
  if (lang === 'qu') return text.qu ?? text.es
  return text[lang]
}

const dateLocale = (lang: Lang) => (lang === 'en' ? 'en-US' : 'es-PE')
const asDate = (d: Date | string) => (typeof d === 'string' ? new Date(`${d.slice(0, 10)}T00:00:00Z`) : d)

interface I18n {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: Key, vars?: Vars) => string
  L: (text: Localized) => string
  month: (i: number) => string
  monthShort: (i: number) => string
  /** '1 de noviembre de 2026' / 'November 1, 2026' (en UTC) */
  fmtLong: (d: Date | string) => string
  /** '1 nov' / 'Nov 1' */
  fmtShort: (d: Date | string) => string
  /** Hora local '7:10 p. m.' / '7:10 PM' */
  fmtTime: (d: Date) => string
  /** Une una lista: 'a, b y c' / 'a, b and c' */
  list: (items: string[]) => string
}

const Ctx = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang)

  useEffect(() => {
    document.documentElement.lang = lang === 'qu' ? 'qu' : lang
    document.title = translate(lang, 'app.title')
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(LANG_KEY, l)
    } catch {
      /* ignorar */
    }
  }, [])

  const value = useMemo<I18n>(() => {
    const t = (key: Key, vars?: Vars) => translate(lang, key, vars)
    const month = (i: number) => t(`month.${i}` as Key)
    const monthShort = (i: number) => t(`monthShort.${i}` as Key)
    return {
      lang,
      setLang,
      t,
      L: (text) => pick(lang, text),
      month,
      monthShort,
      fmtLong: (d) => {
        const x = asDate(d)
        // En quechua las frases largas caen al español: la fecha también va en español.
        return x.toLocaleDateString(dateLocale(lang), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
      },
      fmtShort: (d) => {
        const x = asDate(d)
        const m = translate(lang === 'qu' ? 'es' : lang, `monthShort.${x.getUTCMonth()}` as Key)
        return lang === 'en' ? `${m} ${x.getUTCDate()}` : `${x.getUTCDate()} ${m.toLowerCase()}`
      },
      fmtTime: (d) => d.toLocaleTimeString(dateLocale(lang), { hour: 'numeric', minute: '2-digit' }),
      list: (items) => {
        if (items.length < 2) return items.join('')
        const and = lang === 'en' ? ' and ' : ' y '
        return `${items.slice(0, -1).join(', ')}${and}${items[items.length - 1]}`
      },
    }
  }, [lang, setLang])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n(): I18n {
  const c = useContext(Ctx)
  if (!c) throw new Error('useI18n debe usarse dentro de I18nProvider')
  return c
}

export type { Key }
