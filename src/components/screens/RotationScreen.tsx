import { useMemo, useState } from 'react'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import { compareStrategies, CRITERIA, farmSeason, ROT_CROPS, type Priority, type StrategyResult } from '@/lib/rotation/planner'
import { Attribution, Notice, Skeleton } from '@/components/common'
import { BareSoilArt, ChooseCropArt, GreenSoilArt } from '@/components/rotation/RotationArt'
import { NextCropChecker } from '@/components/rotation/NextCropChecker'

const PRIORITIES: Priority[] = ['balanced', 'soil', 'water', 'income']
const PRIO_ICON: Record<Priority, string> = { balanced: '⚖️', soil: '🌱', water: '💧', income: '💰' }
const STORY = [
  { n: 1, Art: BareSoilArt, alt: 'rot.svg.bare' as Key },
  { n: 2, Art: ChooseCropArt, alt: 'rot.svg.choose' as Key },
  { n: 3, Art: GreenSoilArt, alt: 'rot.svg.green' as Key },
]
const RULES = [
  { n: 1, icon: '🔁' },
  { n: 2, icon: '🫘' },
  { n: 3, icon: '🟫' },
  { n: 4, icon: '🌿' },
]

export default function RotationScreen() {
  const { profile, climatology, forecast } = useQullqa()
  const { t, list, monthShort, month } = useI18n()
  const [priority, setPriority] = useState<Priority>('balanced')
  const elevation = Math.round(forecast?.elevation ?? climatology?.elevation ?? 0)

  const season = useMemo(() => (climatology ? farmSeason(climatology, elevation) : null), [climatology, elevation])
  const ranked = useMemo(() => (season ? compareStrategies(season, priority) : []), [season, priority])

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <p className="eyebrow text-inti-700">{profile.placeName}</p>
        <h1 className="mt-1 font-display text-3xl text-noche-800">{t('rot.title')}</h1>
        <p className="mt-1 text-[15px] text-tierra-700">{t('rot.subtitle')}</p>
      </header>

      <section className="card space-y-1">
        <h2 className="font-extrabold">🔄 {t('rot.whatTitle')}</h2>
        <p className="text-sm text-tierra-800">{t('rot.whatText')}</p>
      </section>

      {/* La rotación en 3 dibujos */}
      <section className="space-y-2">
        <h2 className="text-lg font-extrabold">{t('rot.story.title')}</h2>
        {STORY.map(({ n, Art, alt }) => (
          <article key={n} className="card flex items-center gap-3 p-3">
            <div className="h-24 w-[8.5rem] shrink-0">
              <Art label={t(alt)} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold leading-snug text-noche-800">{t(`rot.story.${n}.title` as Key)}</h3>
              <p className="mt-0.5 text-xs text-tierra-800">{t(`rot.story.${n}.text` as Key)}</p>
            </div>
          </article>
        ))}
      </section>

      {/* ¿Qué siembro después? */}
      {climatology ? <NextCropChecker climatology={climatology} elevation={elevation} /> : <Skeleton className="h-64" />}

      {/* Reglas sencillas */}
      <section className="card space-y-2">
        <h2 className="font-extrabold">📏 {t('rot.rules.title')}</h2>
        <ol className="space-y-1.5">
          {RULES.map(({ n, icon }) => (
            <li key={n} className="flex gap-2 text-sm text-tierra-900">
              <span className="text-lg leading-none" aria-hidden="true">
                {icon}
              </span>
              {t(`rot.rules.${n}` as Key)}
            </li>
          ))}
        </ol>
      </section>

      {/* Comparar planes completos */}
      <header className="pt-2">
        <h2 className="font-display text-2xl text-noche-800">📊 {t('rot.compare.title')}</h2>
        <p className="mt-1 text-sm text-tierra-700">{t('rot.compare.text')}</p>
      </header>

      {/* Prioridad */}
      <section className="space-y-2">
        <h2 className="text-sm font-extrabold text-tierra-700">{t('rot.priority')}</h2>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('rot.priority')}>
          {PRIORITIES.map((p) => (
            <button
              key={p}
              role="radio"
              aria-checked={priority === p}
              onClick={() => setPriority(p)}
              className={`chip justify-center ${priority === p ? 'border-noche-800 bg-noche-800 text-white' : 'border-tierra-200 bg-white text-tierra-800'}`}
            >
              {PRIO_ICON[p]} {t(`rot.prio.${p}` as Key)}
            </button>
          ))}
        </div>
      </section>

      {!season ? (
        <Skeleton className="h-64" />
      ) : (
        <>
          {/* Tu chacra y meses de tierra pelada */}
          <section className="card space-y-3">
            <p className="text-sm text-tierra-800">
              {t('rot.yourField', { elev: elevation.toLocaleString(), rain: season.seasonRainMm, frost: season.seasonFrostMonths })}
            </p>
            <div>
              <h2 className="mb-1.5 font-extrabold">🟫 {t('rot.bareTitle')}</h2>
              <div className="grid grid-cols-12 gap-0.5" role="img" aria-label={t('rot.bareTitle')}>
                {Array.from({ length: 12 }, (_, m) => {
                  const bare = season.bareMonths.includes(m)
                  const grow = season.growingMonths.includes(m)
                  return (
                    <div key={m} className="text-center">
                      <div className={`h-6 rounded ${grow ? 'bg-good' : bare ? 'bg-tierra-400' : 'bg-tierra-200'}`} />
                      <span className="text-[9px] font-bold text-tierra-500">{monthShort(m).charAt(0)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-1 flex gap-3 text-[11px] font-bold text-tierra-700">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded bg-good" /> {t('rot.monthGrow')}
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded bg-tierra-400" /> {t('rot.monthBare')}
                </span>
              </div>
              {season.bareMonths.length > 0 && (
                <p className="mt-2 text-sm text-tierra-800">{t('rot.bareText', { months: list(season.bareMonths.map((m) => month(m))) })}</p>
              )}
            </div>
          </section>

          {/* Estrategias */}
          {ranked.map((r, i) => (
            <StrategyCard key={r.strategy.id} result={r} best={i === 0} rain={season.seasonRainMm} frost={season.seasonFrostMonths} />
          ))}
        </>
      )}

      <Notice tone="info">{t('rot.disclaimer')}</Notice>
      <Attribution />
    </div>
  )
}

function StrategyCard({ result: r, best, rain, frost }: { result: StrategyResult; best: boolean; rain: number; frost: number }) {
  const { t, list } = useI18n()
  const id = r.strategy.id
  return (
    <article className={`card space-y-3 ${best ? 'ring-2 ring-good' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          {best && <p className="eyebrow text-good">★ {t('rot.best')}</p>}
          <h2 className="font-display text-xl leading-tight">{t(`strategy.${id}.name` as Key)}</h2>
        </div>
        <span className="shrink-0 rounded-2xl bg-noche-800 px-3 py-1.5 text-center text-white">
          <span className="block text-xl font-extrabold leading-none">{r.total}</span>
          <span className="text-[10px] font-bold text-noche-200">/100</span>
        </span>
      </div>

      {/* Secuencia de años */}
      <ol className="flex gap-1.5 overflow-x-auto pb-1">
        {r.strategy.years.map((c, i) => (
          <li key={i} className={`w-[4.6rem] shrink-0 rounded-2xl p-2 text-center ${c === 'papa' ? 'bg-inti-100' : c === 'descanso' ? 'bg-tierra-100' : 'bg-green-50'}`}>
            <p className="text-[10px] font-bold text-tierra-600">{t('rot.year', { n: i + 1 })}</p>
            <p className="text-xl" aria-hidden="true">
              {ROT_CROPS[c].emoji}
            </p>
            <p className="text-[11px] font-bold leading-tight">{t(`rotcrop.${c}` as Key)}</p>
          </li>
        ))}
      </ol>

      {/* Criterios */}
      <ul className="space-y-1.5">
        {CRITERIA.map((k) => (
          <li key={k} className="flex items-center gap-2 text-xs">
            <span className="w-36 shrink-0 font-bold text-tierra-700">{t(`crit.${k}` as Key)}</span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-tierra-100">
              <span
                className="block h-full rounded-full"
                style={{ width: `${(r.scores[k] / 3) * 100}%`, background: r.scores[k] >= 2 ? '#2f9e44' : r.scores[k] >= 1 ? '#f2b705' : '#d9480f' }}
              />
            </span>
          </li>
        ))}
      </ul>

      <p className="text-xs text-tierra-600">
        🥔 {t('rot.potatoShare', { pct: Math.round(r.potatoShare * 100) })}
        {r.legumeYears > 0 && <> · 🫘 {t('rot.legumes', { n: r.legumeYears })}</>}
      </p>
      {r.poorFit.length > 0 && (
        <p className="rounded-2xl bg-inti-50 p-2.5 text-xs font-semibold text-inti-900">
          ⚠️ {t('rot.poorFit', { crops: list(r.poorFit.map((c) => t(`rotcrop.${c}` as Key))) })}
        </p>
      )}

      <details className="group rounded-2xl border-2 border-tierra-100 p-3">
        <summary className="cursor-pointer list-none text-sm font-extrabold text-noche-700">▸ {t('rot.details')}</summary>
        <dl className="mt-2 space-y-2 text-sm">
          {(['why', 'evidence', 'benefits', 'gaps', 'risks'] as const).map((k) => (
            <div key={k}>
              <dt className="font-extrabold text-tierra-700">{t(`rot.${k}` as Key)}</dt>
              <dd className="text-tierra-900">
                {t(`strategy.${id}.${k}` as Key)}
                {k === 'evidence' && <span className="mt-1 block font-semibold text-noche-600">🛰️ {t('rot.evidenceNasa', { rain, frost })}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </details>
    </article>
  )
}
