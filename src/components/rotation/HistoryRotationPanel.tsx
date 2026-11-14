import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, type Key } from '@/i18n'
import type { Climatology } from '@/services/nasa/types'
import { exampleRecords, isoDate, recordProgress, useHistory, type FieldRecord } from '@/lib/farms/history'
import { planFromHistory, type HistoryOption } from '@/lib/farms/historyPlan'
import { loadMyFarms } from '@/lib/farms/myFarms'
import { NEXT_CROPS, prevEmoji, type NextCropId } from '@/lib/rotation/nextCrop'
import { usePlans, type SavedPlan } from '@/lib/farms/savedPlans'
import { useQullqa } from '@/context/QullqaContext'
import { ShareButtons } from '@/components/common'
import { usePlanShareText } from '@/components/plans/PlanCard'
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
  const { profile } = useQullqa()
  const { save } = usePlans()
  const shareText = usePlanShareText()
  /** La próxima siembra que elige el agricultor (por defecto, la mejor) */
  const [chosen, setChosen] = useState<NextCropId | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [planName, setPlanName] = useState('')
  useEffect(() => {
    setChosen(null)
    setSavedId(null)
  }, [example])

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
  const plan = useMemo(() => planFromHistory(recs, climatology, opts, today, chosen ?? undefined), [recs, climatology, opts.irrigation, opts.elevation, opts.soil, today, chosen]) // eslint-disable-line react-hooks/exhaustive-deps

  const name = (id: string) => t(`rotcrop.${id}` as Key)
  const when = (m: number, y: number) => `${month(m)} ${y}`
  const best = plan.options.filter((o) => o.verdict === 'good' && !NEXT_CROPS[o.crop].perennial).slice(0, 3)
  const wait = plan.options.filter((o) => o.note === 'recent' && o.verdict !== 'good' && !NEXT_CROPS[o.crop].perennial)
  const cur = plan.current ? recordProgress(plan.current, today) : null
  const pickedCrop = chosen ?? best[0]?.crop
  const defaultName = example ? t('plans.exampleName') : (farm?.name ?? profile.placeName)
  const draft: SavedPlan = {
    id: 'draft',
    name: planName.trim() || defaultName,
    farmId: example ? null : (farm?.id ?? null),
    placeName: farm?.placeName ?? profile.placeName,
    elevation: opts.elevation || null,
    createdAt: new Date().toISOString(),
    current: plan.current ? { crop: plan.current.crop, sowDate: plan.current.sowDate, harvestDate: plan.freeDate } : null,
    steps: plan.sequence.map((c) => ({ ...c, doneDate: null, doneRecordId: null })),
    waits: wait.filter((o) => o.againFrom != null && o.crop !== plan.current?.crop).map((o) => ({ crop: o.crop, from: o.againFrom! })),
  }
  const choose = (c: NextCropId) => {
    setChosen(c)
    setSavedId(null)
  }
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
          {pickedCrop && (
            <li className="flex w-[5.5rem] shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-good p-2 text-center">
              <p className="text-2xl" aria-hidden="true">
                {NEXT_CROPS[pickedCrop].emoji}
              </p>
              <p className="truncate text-xs font-extrabold text-good">{name(pickedCrop)}?</p>
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
        <p className="text-xs text-tierra-600">👆 {t('hplan.chooseHint')}</p>
        <ul className="space-y-1.5" role="radiogroup" aria-label={t('hplan.step3', { prev: name(plan.prev) })}>
          {best.map((o, i) => (
            <OptionRow
              key={o.crop}
              o={o}
              rank={i}
              prev={plan.prev}
              when={when(o.sowMonth, o.sowYear)}
              soilText={soilReason(o, plan.prev, text)}
              selected={pickedCrop === o.crop}
              onChoose={() => choose(o.crop)}
            />
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

      {/* 5. Guardar el plan y compartirlo */}
      {plan.sequence.length > 0 && (
        <div className="space-y-2 rounded-3xl bg-noche-50 p-3">
          <h3 className="text-sm font-extrabold text-noche-800">5️⃣ {t('hplan.step5')}</h3>
          {savedId ? (
            <>
              <p className="rounded-2xl bg-green-100 p-3 text-sm font-bold text-green-900">✅ {t('hplan.saved', { name: draft.name })}</p>
              <Link to="/planes" className="btn-dark w-full text-sm">
                📋 {t('hplan.openPlans')}
              </Link>
            </>
          ) : (
            <>
              <label className="block text-xs font-extrabold text-tierra-700">
                {t('hplan.planName')}
                <input
                  className="mt-1 block min-h-[44px] w-full rounded-2xl border-2 border-tierra-200 bg-white px-3 text-sm font-semibold"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder={defaultName}
                  maxLength={60}
                />
              </label>
              <button onClick={() => setSavedId(save({ ...draft }))} className="btn-primary w-full">
                💾 {t('hplan.save')}
              </button>
            </>
          )}
          <p className="text-xs font-extrabold text-tierra-700">📲 {t('plans.shareTitle')}</p>
          <ShareButtons text={shareText(draft)} path="/planes" compact />
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

function OptionRow({
  o,
  rank,
  prev,
  when,
  soilText,
  selected,
  onChoose,
}: {
  o: HistoryOption
  rank: number
  prev: string
  when: string
  soilText: string
  selected: boolean
  onChoose: () => void
}) {
  const { t } = useI18n()
  const great = o.plan.best.factors.some((f) => f.great)
  return (
    <li
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onChoose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onChoose()
        }
      }}
      className={`cursor-pointer rounded-2xl p-3 ${VERDICT_STYLE[o.verdict].box} ${selected ? 'ring-4 ring-noche-800' : 'opacity-90'}`}
    >
      <p className="font-extrabold text-noche-800">
        {rank === 0 ? '🥇' : rank === 1 ? '🥈' : '🥉'} {NEXT_CROPS[o.crop].emoji} {t(`rotcrop.${o.crop}` as Key)}{' '}
        {great && <span className="text-xs text-good">⭐ {t('myf.great')}</span>}
        <span className={`float-right rounded-full px-2 py-0.5 text-[11px] ${selected ? 'bg-noche-800 text-white' : 'bg-white text-tierra-700'}`}>
          {selected ? `✔ ${t('hplan.chosen')}` : t('hplan.choose')}
        </span>
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
