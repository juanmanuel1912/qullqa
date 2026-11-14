import { useMemo, useState } from 'react'
import type { Climatology } from '@/services/nasa/types'
import { useI18n, type Key } from '@/i18n'
import {
  assessNextCrop,
  bestNextCrops,
  goodMonthsFor,
  NEXT_CROPS,
  NEXT_IDS,
  PREV_IDS,
  prevEmoji,
  type FactorResult,
  type Factor,
  type NextCropId,
  type NextVerdict,
  type PrevCropId,
} from '@/lib/rotation/nextCrop'

const FACTOR_ICON: Record<Factor, string> = { land: '🏔️', climate: '🌡️', time: '📅', water: '💧', soil: '🪱', product: '🧺' }
const LEVEL_ICON = { ok: '✅', warn: '⚠️', bad: '❌' } as const
const LEVEL_BG = { ok: 'bg-green-50', warn: 'bg-inti-50', bad: 'bg-red-50' } as const
const VERDICT_STYLE: Record<NextVerdict, { emoji: string; box: string; text: string }> = {
  good: { emoji: '👍', box: 'bg-green-50 ring-2 ring-good', text: 'text-green-800' },
  fair: { emoji: '🤔', box: 'bg-inti-50 ring-2 ring-inti-300', text: 'text-inti-900' },
  bad: { emoji: '👎', box: 'bg-red-50 ring-2 ring-red-300', text: 'text-red-800' },
}

/** "¿Qué siembro después?": buena o mala idea, explicado con 6 factores sencillos. */
export function NextCropChecker({ climatology, elevation }: { climatology: Climatology; elevation: number }) {
  const { t, month, list } = useI18n()
  const [prev, setPrev] = useState<PrevCropId>('papa')
  const [next, setNext] = useState<NextCropId | null>(null)
  const [sowMonth, setSowMonth] = useState(() => new Date().getUTCMonth())
  const [irrigation, setIrrigation] = useState(false)

  const name = (id: PrevCropId) => t(`rotcrop.${id}` as Key)
  // Cálculos baratos (11 cultivos × 12 meses): se recalculan juntos cuando cambia la elección
  const { result, goodMonths, better } = useMemo(() => {
    if (!next) return { result: null, goodMonths: [] as number[], better: [] as ReturnType<typeof bestNextCrops> }
    const base = { prev, month: sowMonth, irrigation, elevation }
    const result = assessNextCrop({ ...base, next }, climatology)
    const notGood = result.verdict !== 'good'
    return {
      result,
      goodMonths: notGood ? goodMonthsFor({ prev, next, irrigation, elevation }, climatology) : [],
      better: notGood ? bestNextCrops(base, climatology, next) : [],
    }
  }, [next, prev, sowMonth, irrigation, elevation, climatology])

  const factorText = (f: FactorResult) => {
    const vars: Record<string, string | number> = { ...f.vars, crop: name(next!), prev: name(prev) }
    for (const [k, v] of Object.entries(f.vars)) if (k.endsWith('Idx')) vars[k.slice(0, -3)] = month(v)
    return t(`nc.${f.code}` as Key, vars)
  }

  const chip = (active: boolean) =>
    `chip shrink-0 ${active ? 'border-noche-800 bg-noche-800 text-white' : 'border-tierra-200 bg-white text-tierra-800'}`

  return (
    <section className="card space-y-4">
      <div>
        <h2 className="font-display text-2xl leading-tight text-noche-800">🤔 {t('rot.check.title')}</h2>
        <p className="mt-1 text-sm text-tierra-700">{t('rot.check.subtitle')}</p>
      </div>

      {/* 1. Cultivo anterior */}
      <div>
        <h3 className="mb-1.5 text-sm font-extrabold text-tierra-700">{t('rot.check.prev')}</h3>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label={t('rot.check.prev')}>
          {PREV_IDS.map((id) => (
            <button key={id} role="radio" aria-checked={prev === id} onClick={() => setPrev(id)} className={chip(prev === id)}>
              <span aria-hidden="true">{prevEmoji(id)}</span> {name(id)}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Lo que quiere sembrar */}
      <div>
        <h3 className="mb-1.5 text-sm font-extrabold text-tierra-700">{t('rot.check.next')}</h3>
        <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label={t('rot.check.next')}>
          {NEXT_IDS.map((id) => (
            <button
              key={id}
              role="radio"
              aria-checked={next === id}
              onClick={() => setNext(id)}
              className={`flex min-h-[64px] flex-col items-center justify-center rounded-2xl border-2 px-1 py-1.5 text-center text-[11px] font-bold leading-tight transition ${
                next === id ? 'border-noche-800 bg-noche-800 text-white' : 'border-tierra-200 bg-white text-tierra-800'
              }`}
            >
              <span className="text-2xl" aria-hidden="true">
                {NEXT_CROPS[id].emoji}
              </span>
              {name(id)}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Mes y riego */}
      <div className="grid grid-cols-2 items-end gap-2">
        <label className="block text-sm font-extrabold text-tierra-700">
          {t('rot.check.month')}
          <select
            className="mt-1 block min-h-[44px] w-full rounded-2xl border-2 border-tierra-200 bg-white px-3 text-base font-semibold"
            value={sowMonth}
            onChange={(e) => setSowMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, m) => (
              <option key={m} value={m}>
                {month(m)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-2xl border-2 border-tierra-200 px-3 text-sm font-bold text-tierra-800">
          <input type="checkbox" className="h-5 w-5 accent-noche-800" checked={irrigation} onChange={(e) => setIrrigation(e.target.checked)} />
          💧 {t('rot.check.irrigation')}
        </label>
      </div>

      {/* Respuesta */}
      {!result ? (
        <p className="rounded-2xl bg-tierra-50 p-4 text-center text-sm font-semibold text-tierra-700">👆 {t('rot.check.pick')}</p>
      ) : (
        <div className="space-y-3" aria-live="polite">
          <div className={`rounded-3xl p-4 ${VERDICT_STYLE[result.verdict].box}`}>
            <div className="flex items-center gap-3">
              <span className="text-5xl" aria-hidden="true">
                {VERDICT_STYLE[result.verdict].emoji}
              </span>
              <div>
                <p className={`font-display text-2xl leading-tight ${VERDICT_STYLE[result.verdict].text}`}>{t(`rot.check.verdict.${result.verdict}` as Key)}</p>
                <p className="mt-0.5 text-sm text-tierra-800">
                  {t(`rot.check.summary.${result.verdict}` as Key, { crop: name(result.next), prev: name(prev), month: month(sowMonth) })}
                </p>
              </div>
            </div>
            {result.factors.some((f) => f.great) && (
              <p className="mt-2 inline-block rounded-full bg-good px-3 py-1 text-xs font-extrabold text-white">⭐ {t('rot.check.great')}</p>
            )}
          </div>

          <h3 className="text-sm font-extrabold text-tierra-700">{t('rot.check.why')}</h3>
          <ul className="space-y-1.5">
            {result.factors.map((f) => (
              <li key={f.factor} className={`flex gap-2.5 rounded-2xl p-2.5 ${LEVEL_BG[f.level]}`}>
                <span className="text-xl leading-none" aria-hidden="true">
                  {FACTOR_ICON[f.factor]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-tierra-700">
                    {t(`fac.${f.factor}` as Key)} <span aria-label={f.level}>{LEVEL_ICON[f.level]}</span>
                  </p>
                  <p className="text-sm text-tierra-900">{factorText(f)}</p>
                </div>
              </li>
            ))}
          </ul>

          {goodMonths.length > 0 && (
            <p className="rounded-2xl bg-noche-50 p-3 text-sm font-semibold text-noche-800">
              📅 {t('rot.check.goodMonths', { crop: name(result.next), months: list(goodMonths.map((m) => month(m))) })}
            </p>
          )}

          {result.verdict !== 'good' && (
            <div>
              {better.length > 0 ? (
                <>
                  <h3 className="mb-1.5 text-sm font-extrabold text-tierra-700">
                    💡 {t('rot.check.better', { prev: name(prev), month: month(sowMonth) })}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {better.map((b) => (
                      <button key={b.next} onClick={() => setNext(b.next)} className="chip border-good bg-green-50 text-green-900">
                        {NEXT_CROPS[b.next].emoji} {name(b.next)} {b.verdict === 'good' ? '👍' : '🤔'}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="rounded-2xl bg-tierra-50 p-3 text-sm text-tierra-800">{t('rot.check.noBetter', { month: month(sowMonth) })}</p>
              )}
            </div>
          )}

          <p className="text-[11px] text-tierra-500">🛰️ {t('rot.check.source', { elev: elevation.toLocaleString() })}</p>
        </div>
      )}
    </section>
  )
}
