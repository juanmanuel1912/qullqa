import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, type Key } from '@/i18n'
import type { Climatology } from '@/services/nasa/types'
import { exampleRecords, isoDate, recordProgress, useHistory, type FieldRecord } from '@/lib/farms/history'
import { planFromHistory, type HistoryOption } from '@/lib/farms/historyPlan'
import { loadMyFarms } from '@/lib/farms/myFarms'
import { NEXT_CROPS, prevEmoji } from '@/lib/rotation/nextCrop'
import { useFactorText, VERDICT_STYLE } from '@/components/rotation/NextCropChecker'

/**
 * "Tu historial → tu próxima siembra": lee lo que sembraste y cosechaste,
 * lo que está creciendo ahora, y con el clima NASA a tu altura propone qué sembrar después.
 * Si aún no hay historial, muestra un ejemplo (la chacra de Sisa Ccori).
 */
export function HistoryRotationPanel({ climatology, elevation }: { climatology: Climatology; elevation: number }) {
  const { t, monthShort, month, fmtLong } = useI18n()
  const text = useFactorText()
  const { records } = useHistory()
  const today = isoDate(new Date())
  const hasOwn = records.length > 0
  const [showExample, setShowExample] = useState(!hasOwn)
  const example = showExample || !hasOwn

  const recs: FieldRecord[] = useMemo(
    () => (example ? exampleRecords(today).map((r, i) => ({ ...r, id: `ex-${i}` })) : records),
    [example, records, today],
  )
  // Si el registro es de una chacra mía, uso su tierra y su agua
  const farm = useMemo(() => {
    const id = [...recs].reverse().find((r) => r.farmId)?.farmId
    return id ? loadMyFarms().find((f) => f.id === id) : undefined
  }, [recs])
  const opts = { irrigation: farm?.water === 'irrigation', elevation: farm?.elevation ?? elevation, soil: farm?.soil ?? 'unknown' }
  const plan = useMemo(() => planFromHistory(recs, climatology, opts, today), [recs, climatology, opts.irrigation, opts.elevation, opts.soil, today]) // eslint-disable-line react-hooks/exhaustive-deps

  const name = (id: string) => t(`rotcrop.${id}` as Key)
  const when = (m: number, y: number) => `${month(m)} ${y}`
  const best = plan.options.filter((o) => o.verdict === 'good' && !NEXT_CROPS[o.crop].perennial).slice(0, 3)
  const wait = plan.options.filter((o) => o.note === 'recent' && o.verdict !== 'good' && !NEXT_CROPS[o.crop].perennial)
  const cur = plan.current ? recordProgress(plan.current, today) : null
  const shortDate = (iso: string) => `${monthShort(Number(iso.slice(5, 7)) - 1)} ${iso.slice(2, 4)}`

  return (
    <section className="card space-y-4 ring-2 ring-inti-300">
      <div>
        <p className="eyebrow text-inti-700">📒 {t('hplan.eyebrow')}</p>
        <h2 className="font-display text-2xl leading-tight text-noche-800">{t('hplan.title')}</h2>
        <p className="mt-1 text-sm text-tierra-700">{t('hplan.subtitle')}</p>
      </div>

      {hasOwn && (
        <div className="flex rounded-full bg-tierra-100 p-0.5 text-xs font-extrabold" role="radiogroup" aria-label={t('hplan.title')}>
          {[false, true].map((ex) => (
            <button
              key={String(ex)}
              role="radio"
              aria-checked={showExample === ex}
              onClick={() => setShowExample(ex)}
              className={`min-h-[36px] flex-1 rounded-full px-3 ${showExample === ex ? 'bg-noche-800 text-white' : 'text-tierra-700'}`}
            >
              {ex ? `👀 ${t('hplan.example')}` : `📒 ${t('hplan.mine')}`}
            </button>
          ))}
        </div>
      )}
      {example && <p className="rounded-2xl bg-inti-50 p-3 text-xs font-semibold text-inti-900">👀 {t('hplan.exampleNote')}</p>}

      {/* 1. Línea de tiempo */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-extrabold text-tierra-700">1️⃣ {t('hplan.step1')}</h3>
        <ol className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {plan.timeline.map((r) => {
            const growing = !r.harvestDate
            return (
              <li key={r.id} className={`w-[5.5rem] shrink-0 rounded-2xl p-2 text-center ${growing ? 'bg-green-100 ring-2 ring-good' : 'bg-tierra-50'}`}>
                <p className="text-2xl" aria-hidden="true">
                  {NEXT_CROPS[r.crop].emoji}
                </p>
                <p className="truncate text-xs font-extrabold">{name(r.crop)}</p>
                <p className="text-[10px] text-tierra-600">{shortDate(r.sowDate)}</p>
                <p className="text-[10px] font-bold text-tierra-800">
                  {growing ? `🌱 ${Math.round(recordProgress(r, today).progress * 100)}%` : r.yieldKg != null ? `${(r.yieldKg / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} t` : '✓'}
                </p>
              </li>
            )
          })}
          {best[0] && (
            <li className="flex w-[5.5rem] shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-good p-2 text-center">
              <p className="text-2xl" aria-hidden="true">
                {NEXT_CROPS[best[0].crop].emoji}
              </p>
              <p className="truncate text-xs font-extrabold text-good">{name(best[0].crop)}?</p>
              <p className="text-[10px] font-bold text-good">{t('hplan.next')}</p>
            </li>
          )}
        </ol>
      </div>

      {/* 2. Ahora */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-extrabold text-tierra-700">2️⃣ {t('hplan.step2')}</h3>
        <p className="rounded-2xl bg-green-50 p-3 text-sm text-green-900">
          {plan.current && cur
            ? t('hplan.growing', {
                crop: `${NEXT_CROPS[plan.current.crop].emoji} ${name(plan.current.crop)}`,
                days: cur.days,
                pct: Math.round(cur.progress * 100),
                date: fmtLong(plan.freeDate),
              })
            : plan.prev === 'descanso'
              ? t('hplan.rested')
              : t('hplan.free', { crop: `${prevEmoji(plan.prev)} ${name(plan.prev)}` })}
        </p>
      </div>

      {/* 3. Qué sembrar después */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-extrabold text-tierra-700">3️⃣ {t('hplan.step3', { prev: name(plan.prev) })}</h3>
        <ul className="space-y-1.5">
          {best.map((o, i) => (
            <OptionRow key={o.crop} o={o} rank={i} prev={plan.prev} when={when(o.sowMonth, o.sowYear)} soilText={soilReason(o, plan.prev, text)} />
          ))}
        </ul>
      </div>

      {wait.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="text-sm font-extrabold text-tierra-700">⏳ {t('hplan.waitTitle')}</h3>
          <ul className="space-y-1.5">
            {wait.map((o) => (
              <li key={o.crop} className="rounded-2xl bg-inti-50 p-3 text-sm text-tierra-900">
                <strong>
                  {NEXT_CROPS[o.crop].emoji} {name(o.crop)}
                </strong>
                {': '}
                {o.familyCrops.includes(o.crop)
                  ? t('hplan.waitItem', { years: o.familyYears.join(', '), rest: o.rest, from: o.againFrom ?? '' })
                  : t('hplan.waitFamily', { crops: o.familyCrops.map(name).join(', '), years: o.familyYears.join(', '), rest: o.rest, from: o.againFrom ?? '' })}
                {(o.crop === 'papa' || o.crop === 'aji') && <> {t('hplan.waitPests')}</>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Plan de 3 campañas */}
      {plan.sequence.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="text-sm font-extrabold text-tierra-700">4️⃣ {t('hplan.step4')}</h3>
          <ol className="flex flex-wrap items-center gap-1 text-xs font-bold">
            {plan.current && (
              <li className="rounded-full bg-green-100 px-2.5 py-1 text-green-900">
                {NEXT_CROPS[plan.current.crop].emoji} {name(plan.current.crop)} · {t('hplan.now')}
              </li>
            )}
            {plan.sequence.map((c) => (
              <li key={`${c.crop}-${c.sowYear}`} className="flex items-center gap-1">
                <span aria-hidden="true">→</span>
                <span className="rounded-full bg-white px-2.5 py-1 text-tierra-900 ring-1 ring-tierra-200">
                  {NEXT_CROPS[c.crop].emoji} {name(c.crop)} · {monthShort(c.sowMonth)} {c.sowYear}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-xs text-tierra-700">{t('hplan.step4Why')}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link to="/historial" className="btn-primary min-h-[40px] px-4 text-sm">
          📒 {hasOwn ? t('hplan.openHistory') : t('hplan.startHistory')}
        </Link>
      </div>
      <p className="text-[11px] text-tierra-500">{t('hplan.source')}</p>
    </section>
  )
}

function soilReason(o: HistoryOption, prev: Parameters<ReturnType<typeof useFactorText>>[2], text: ReturnType<typeof useFactorText>) {
  const f = o.plan.best.factors.find((x) => x.factor === 'soil')
  return f ? text(f, o.crop, prev) : ''
}

function OptionRow({ o, rank, prev, when, soilText }: { o: HistoryOption; rank: number; prev: string; when: string; soilText: string }) {
  const { t } = useI18n()
  const great = o.plan.best.factors.some((f) => f.great)
  return (
    <li className={`rounded-2xl p-3 ${VERDICT_STYLE[o.verdict].box}`}>
      <p className="font-extrabold text-noche-800">
        {rank === 0 ? '🥇' : rank === 1 ? '🥈' : '🥉'} {NEXT_CROPS[o.crop].emoji} {t(`rotcrop.${o.crop}` as Key)}{' '}
        {great && <span className="text-xs text-good">⭐ {t('myf.great')}</span>}
      </p>
      <p className="text-xs font-bold text-tierra-700">🗓️ {t('hplan.sowWhen', { when })}</p>
      <ul className="mt-1 space-y-0.5 text-xs text-tierra-900">
        <li>📒 {o.note === 'never' ? t('hplan.note.never', { prev: t(`rotcrop.${prev}` as Key) }) : t('hplan.note.rested', { years: o.familyYears.join(', ') })}</li>
        {soilText && <li>🌱 {soilText}</li>}
        <li>🛰️ {t('hplan.climateOk')}</li>
      </ul>
    </li>
  )
}
