/**
 * Asistente local (sin IA): responde con los datos de la app cuando no hay conexión
 * con Claude. Entiende preguntas como "si siembro mango en abril…", "¿cuándo riego?",
 * "¿qué siembro en marzo?", "El Niño", "heladas", "¿cuándo cosecho?".
 */
import type { Key, Vars } from '@/i18n'
import type { Climatology } from '../../services/nasa/types'
import type { CropStatus, EnsoStatus, WeekPlan } from '../agro'
import { CROPS, cropById, type CropId } from '../crops/catalog'
import { assessCrop } from '../crops/suitability'
import type { Localized } from '@/i18n'

/** Palabra completa con soporte de tildes (\b de JS no reconoce "í" como letra). */
const word = (alts: string) => new RegExp(`(^|[^\\p{L}])(${alts})(?=$|[^\\p{L}])`, 'u')

const CROP_WORDS: [RegExp, CropId][] = [
  [word('papas?|potato(es)?'), 'papa'],
  [word('ma[ií]z|choclos?|corn|maize|sara'), 'maiz'],
  [word('paltas?|aguacates?|avocados?'), 'palta'],
  [word('aj[ií]|aj[ií]es|rocotos?|chil[ie]s?|peppers?|uchu'), 'aji'],
  [word('quinua|quinoa|kinwa'), 'quinua'],
  [word('mangos?'), 'mango'],
  [word('caf[eé]s?|coffee'), 'cafe'],
  [word('cacaos?|cocoa|chocolate'), 'cacao'],
]
const MONTHS: string[][] = [
  ['enero', 'january'],
  ['febrero', 'february'],
  ['marzo', 'march'],
  ['abril', 'april'],
  ['mayo', 'may'],
  ['junio', 'june'],
  ['julio', 'july'],
  ['agosto', 'august'],
  ['septiembre', 'setiembre', 'september'],
  ['octubre', 'october'],
  ['noviembre', 'november'],
  ['diciembre', 'december'],
]

export function detectCrop(q: string): CropId | null {
  for (const [re, id] of CROP_WORDS) if (re.test(q)) return id
  return null
}

export function detectMonth(q: string): number | null {
  for (let m = 0; m < 12; m++) if (word(MONTHS[m].join('|')).test(q)) return m
  return null
}

export interface LocalDeps {
  t: (key: Key, vars?: Vars) => string
  L: (text: Localized) => string
  month: (i: number) => string
  fmtLong: (d: Date | string) => string
  list: (items: string[]) => string
  place: string
  variety: string
  clim: Climatology | null
  /** Altitud exacta del punto (Open-Meteo), mejor que la de la celda NASA */
  elevation?: number | null
  crop: CropStatus | null
  weekPlan: WeekPlan | null
  enso: EnsoStatus | null
  today: Date
}

export function answerLocally(question: string, d: LocalDeps): string {
  const q = question.toLowerCase()
  const { t } = d
  const crop = detectCrop(q)
  const month = detectMonth(q)
  const elev = Math.round(d.elevation ?? d.clim?.elevation ?? 0)
  const reasonText = (code: string, vars?: Vars) => (code.startsWith('s_') ? t(`sreason.${code.slice(2)}` as Key, vars) : t(`suit.${code}` as Key, vars))

  // Si habla de sembrar o nombra un mes, evaluamos el cultivo; si no, primero el tema
  // (El Niño, riego, heladas, cosecha) aunque mencione un cultivo: "¿cómo afecta El Niño a mi papa?"
  const planting = /sembr|siembr|plant|cultiv|tarpu/.test(q)
  const topic = /ni[ñn][oa]|reg(ar|ad|o|ue)|riego|irrigat|water|helad|frost|qasa|cosech|harvest|allay/.test(q)

  // 1. ¿Es buena idea sembrar X (en Y)?
  if (crop && d.clim && (planting || month !== null || !topic)) {
    const m = month ?? d.today.getUTCMonth()
    const s = assessCrop(crop, m, d.clim, { variety: crop === 'papa' ? d.variety : undefined, elevation: d.elevation })
    const info = cropById(crop)
    const lines = [
      t('chat.l.head', { verdict: t(`suit.${s.verdict}` as Key), crop: d.L(info.name), month: d.month(m), place: d.place, elev }),
      ...s.reasons.map((r) => `- ${reasonText(r.code, r.vars)}`),
    ]
    if (s.harvestDate && s.cycleDays !== null) lines.push(t('chat.l.harvest', { date: d.fmtLong(s.harvestDate), days: s.cycleDays }))
    if (s.yearsToFirstHarvest !== null) lines.push(t('suit.perennial', { years: s.yearsToFirstHarvest }))
    if (s.verdict === 'bad') lines.push(t('chat.l.where', { regions: d.L(info.regions), alt: info.altitude }))
    return lines.join('\n')
  }

  // 2. ¿Qué puedo sembrar en Y?
  if (month !== null && d.clim) {
    const order = { good: 0, fair: 1, bad: 2 }
    const rows = CROPS.map((c) => ({ c, s: assessCrop(c.id, month, d.clim!, { variety: c.id === 'papa' ? d.variety : undefined, elevation: d.elevation }) }))
      .sort((a, b) => order[a.s.verdict] - order[b.s.verdict])
      .map(({ c, s }) => `- ${c.emoji} ${d.L(c.name)}: ${t(`suit.${s.verdict}` as Key)}`)
    return [t('chat.l.whatPlant', { month: d.month(month), place: d.place }), ...rows].join('\n')
  }

  // 3. Riego
  if (/reg(ar|ad|o|ue)|riego|irrigat|water/.test(q)) {
    if (!d.weekPlan) return t('chat.l.noForecast')
    const lines: string[] = []
    lines.push(d.weekPlan.irrigateOn.length ? t('wx.irrigateOn', { days: d.list(d.weekPlan.irrigateOn.map((x) => d.fmtLong(x))) }) : t('wx.noIrrigate'))
    if (d.weekPlan.frostDays.length) lines.push(t('wx.frost', { days: d.list(d.weekPlan.frostDays.map((x) => d.fmtLong(x))) }))
    if (d.weekPlan.normalRain !== null) lines.push(t('wx.vsNormal', { rain: d.weekPlan.weekRain, normal: d.weekPlan.normalRain }))
    return lines.join('\n')
  }

  // 4. El Niño
  if (/ni[ñn][oa]/.test(q)) {
    if (!d.enso) return t('nino.whatText')
    const head =
      d.enso.phase === 'neutral'
        ? t('nino.headlineNeutral')
        : t('nino.headline', { phase: t(`nino.phase.${d.enso.phase}` as Key), strength: d.enso.strength ? t(`nino.strength.${d.enso.strength}` as Key) : '' })
    const highlands = elev > 2000
    return [
      `${head} (ONI ${d.enso.oni.anom > 0 ? '+' : ''}${d.enso.oni.anom.toFixed(1)} °C).`,
      t(highlands ? 'nino.impactSouth.text' : 'nino.impactCoast.text'),
      `- ${t(highlands ? 'nino.prep.h1' : 'nino.prep.c1')}`,
      `- ${t(highlands ? 'nino.prep.h3' : 'nino.prep.c2')}`,
      `- ${t('nino.prep.b1')}`,
    ].join('\n')
  }

  // 5. Heladas
  if (/helad|frost|qasa/.test(q) && d.clim) {
    const m = d.today.getUTCMonth()
    return t('chat.l.frost', { month: d.month(m), t: d.clim.months[m].t2mMin.toFixed(1) })
  }

  // 6. Cosecha
  if (/cosech|harvest|allay/.test(q)) {
    if (d.crop && d.crop.harvestDate) return t('chat.l.harvestCrop', { variety: d.variety, date: d.fmtLong(d.crop.harvestDate), n: d.crop.daysToHarvest ?? '—' })
    return t('chat.l.noCrop')
  }

  return t('chat.l.unknown')
}
