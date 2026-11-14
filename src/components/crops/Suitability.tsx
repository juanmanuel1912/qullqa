import { useEffect, useMemo, useState } from 'react'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import { fetchClimatology } from '@/services/nasa'
import type { Climatology } from '@/services/nasa/types'
import { CROPS, cropById, type CropId } from '@/lib/crops/catalog'
import { assessCrop, type SuitReason, type Suitability, type Verdict } from '@/lib/crops/suitability'
import { DEMO_FARMS } from '@/lib/farms/demo'
import { useProducts } from '@/lib/farms/products'
import { VARIETIES } from '@/lib/agro'
import { Notice, Skeleton } from '@/components/common'

export const VERDICT_STYLE: Record<Verdict, string> = {
  good: 'bg-green-100 text-green-800',
  fair: 'bg-inti-100 text-inti-900',
  bad: 'bg-red-50 text-red-700',
}
const VERDICT_ICON: Record<Verdict, string> = { good: '✅', fair: '⚠️', bad: '❌' }

/** Texto de una razón (las de la papa reutilizan las claves sreason.*). */
export function useReasonText() {
  const { t } = useI18n()
  return (r: SuitReason) =>
    r.code.startsWith('s_') ? t(`sreason.${r.code.slice(2)}` as Key, r.vars) : t(`suit.${r.code}` as Key, r.vars)
}

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const { t } = useI18n()
  return (
    <span className={`inline-block shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${VERDICT_STYLE[verdict]}`}>
      {VERDICT_ICON[verdict]} {t(`suit.${verdict}` as Key)}
    </span>
  )
}

/** "¿Qué puedo sembrar en {mes}?": todos los cultivos evaluados para la chacra activa. */
export function WhatToPlant({ month }: { month: number }) {
  const { profile, climatology, forecast } = useQullqa()
  const { t, L, month: monthName, fmtShort } = useI18n()
  const reasonText = useReasonText()
  const results = useMemo(
    () =>
      climatology
        ? CROPS.map((c) =>
            assessCrop(c.id, month, climatology, { variety: VARIETIES[profile.variety].name, elevation: forecast?.elevation }),
          ).sort(
            (a, b) => ['good', 'fair', 'bad'].indexOf(a.verdict) - ['good', 'fair', 'bad'].indexOf(b.verdict),
          )
        : [],
    [climatology, month, profile.variety, forecast?.elevation],
  )
  if (!climatology) return null

  return (
    <section className="card space-y-3">
      <div>
        <h2 className="text-lg font-extrabold">🌱 {t('cal.whatToPlant', { month: monthName(month) })}</h2>
        <p className="text-sm text-tierra-700">{t('cal.whatToPlantSub', { place: profile.placeName })}</p>
      </div>
      <ul className="divide-y divide-tierra-100">
        {results.map((s) => {
          const crop = cropById(s.crop)
          const main = s.reasons.find((r) => r.level === 'bad') ?? s.reasons.find((r) => r.level === 'warn') ?? s.reasons[0]
          return (
            <li key={s.crop} className="flex items-start gap-3 py-2.5">
              <span className="text-2xl" aria-hidden="true">
                {crop.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold">{L(crop.name)}</span>
                  <VerdictBadge verdict={s.verdict} />
                </div>
                {main && <p className="text-xs text-tierra-700">{reasonText(main)}</p>}
                <p className="text-xs font-bold text-inti-800">
                  {s.harvestDate
                    ? t('cal.harvestShort', { date: fmtShort(s.harvestDate) })
                    : s.yearsToFirstHarvest !== null
                      ? t('cal.firstHarvest', { years: s.yearsToFirstHarvest })
                      : ''}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

interface ProductOption {
  key: string
  label: string
  crop: CropId
  variety?: string
}

/** "¿Es buena idea sembrar?": producto + chacra + mes → veredicto estimado. */
export function PlantChecker({ initialMonth }: { initialMonth: number }) {
  const { profile, climatology, forecast } = useQullqa()
  const { t, L, month: monthName, fmtLong } = useI18n()
  const reasonText = useReasonText()
  const { items } = useProducts()

  const products: ProductOption[] = useMemo(() => {
    const mine: ProductOption[] = [
      ...items.map((p) => ({ key: `p:${p.id}`, label: `${cropById(p.crop).emoji} ${p.name}${p.variety ? ` (${p.variety})` : ''}`, crop: p.crop, variety: p.variety })),
      ...DEMO_FARMS.map((f) => ({ key: `f:${f.id}`, label: `🥔 ${VARIETIES[f.variety].name} · ${f.name}`, crop: 'papa' as CropId, variety: VARIETIES[f.variety].name })),
    ]
    return mine
  }, [items])
  const others: ProductOption[] = CROPS.map((c) => ({ key: `c:${c.id}`, label: `${c.emoji} ${L(c.name)}`, crop: c.id }))

  const [productKey, setProductKey] = useState(products[0]?.key ?? others[0].key)
  const [fieldId, setFieldId] = useState<string>('active')
  const [month, setMonth] = useState(initialMonth)
  const [fieldClim, setFieldClim] = useState<Climatology | null>(null)

  const field = DEMO_FARMS.find((f) => f.id === fieldId)
  useEffect(() => {
    if (!field) {
      setFieldClim(null)
      return
    }
    const ctrl = new AbortController()
    setFieldClim(null)
    fetchClimatology(field.lat, field.lon, ctrl.signal)
      .then(setFieldClim)
      .catch(() => undefined)
    return () => ctrl.abort()
  }, [field])

  const clim = field ? fieldClim : climatology
  const product = [...products, ...others].find((p) => p.key === productKey) ?? others[0]
  const result: Suitability | null = clim
    ? assessCrop(product.crop, month, clim, { variety: product.variety, elevation: field ? null : forecast?.elevation })
    : null
  const select = 'mt-1 block min-h-[44px] w-full rounded-2xl border-2 border-tierra-200 bg-white px-3 text-sm'

  return (
    <section className="card space-y-3">
      <div>
        <h2 className="text-lg font-extrabold">🔎 {t('check.title')}</h2>
        <p className="text-sm text-tierra-700">{t('check.subtitle')}</p>
      </div>
      <label className="block text-sm font-semibold text-tierra-700">
        {t('check.product')}
        <select className={select} value={productKey} onChange={(e) => setProductKey(e.target.value)}>
          <optgroup label={t('check.myProducts')}>
            {products.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </optgroup>
          <optgroup label={t('check.otherCrops')}>
            {others.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </optgroup>
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-sm font-semibold text-tierra-700">
          {t('check.field')}
          <select className={select} value={fieldId} onChange={(e) => setFieldId(e.target.value)}>
            <option value="active">{t('check.activeField', { place: profile.placeName })}</option>
            {DEMO_FARMS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.code})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold text-tierra-700">
          {t('check.month')}
          <select className={select} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, m) => (
              <option key={m} value={m}>
                {monthName(m)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!result ? (
        <div className="space-y-2">
          <p className="text-xs text-tierra-600">{t('check.loading')}</p>
          <Skeleton className="h-24" />
        </div>
      ) : (
        <div className={`space-y-2 rounded-2xl p-4 ${VERDICT_STYLE[result.verdict]}`} aria-live="polite">
          <p className="text-lg font-extrabold">
            {VERDICT_ICON[result.verdict]} {t(`suit.${result.verdict}` as Key)}
          </p>
          <ul className="space-y-1 text-sm">
            {result.reasons.map((r, i) => (
              <li key={i}>
                {r.level === 'ok' ? '✓' : r.level === 'warn' ? '!' : '✕'} {reasonText(r)}
              </li>
            ))}
          </ul>
          <p className="text-sm font-bold">
            {result.harvestDate && result.cycleDays !== null
              ? t('chat.l.harvest', { date: fmtLong(result.harvestDate), days: result.cycleDays })
              : result.yearsToFirstHarvest !== null
                ? t('cal.firstHarvest', { years: result.yearsToFirstHarvest })
                : ''}
          </p>
        </div>
      )}
      <Notice tone="info">{t('check.example')}</Notice>
    </section>
  )
}
