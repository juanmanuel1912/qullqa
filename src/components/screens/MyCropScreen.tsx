import { Link } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import { STAGES, VARIETIES } from '@/lib/agro'
import { WeeklyChart } from '@/components/charts/WeeklyChart'
import { Attribution, IconArrow, Notice, ProgressRing, Skeleton, SourceNotice } from '@/components/common'
import { addDaysIso, todayIso } from '@/utils/format'
import { WhereToSowPanel } from '@/components/crops/WhereToSowPanel'

export default function MyCropScreen() {
  const { profile, updateProfile, crop, weekly, sowing, climatology, dailyLoading, today } = useQullqa()
  const { t, fmtLong } = useI18n()
  const variety = VARIETIES[profile.variety]

  // Aún no sembró
  if (!profile.plantingDate) {
    return (
      <div className="space-y-4">
        <header className="pt-2">
          <h1 className="font-display text-3xl text-noche-800">{t('crop.title')}</h1>
          <p className="mt-1 text-[15px] text-tierra-700">{t('crop.intro')}</p>
        </header>
        <WhereToSowPanel />
        <section className="card space-y-4 text-center">
          <p className="text-5xl" aria-hidden="true">
            🌱
          </p>
          <p className="font-display text-xl">{t('crop.whenPlanted', { variety: variety.name })}</p>
          <label className="block text-left">
            <span className="text-sm font-semibold text-tierra-700">{t('farm.plantingDate')}</span>
            <input
              type="date"
              max={todayIso()}
              onChange={(e) => e.target.value && updateProfile({ plantingDate: e.target.value, onboarded: true })}
              className="mt-1 block min-h-[48px] w-full rounded-2xl border-2 border-tierra-200 bg-white px-4 text-base font-bold"
            />
          </label>
          <button onClick={() => updateProfile({ plantingDate: todayIso(), onboarded: true })} className="btn-primary w-full">
            {t('crop.plantedToday')}
          </button>
          <button onClick={() => updateProfile({ plantingDate: addDaysIso(todayIso(), -75), onboarded: true })} className="btn-ghost w-full">
            {t('crop.example')}
          </button>
          {sowing && (
            <p className="text-sm text-tierra-700">
              {t('crop.notYet', { date: fmtLong(sowing.best.sowDate) })}{' '}
              <Link to="/calendario" className="font-bold text-noche-600 underline">
                {t('crop.seeCalendar')}
              </Link>
            </p>
          )}
        </section>
        <Attribution />
      </div>
    )
  }

  if (!crop || !weekly) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-40" />
      </div>
    )
  }

  const stageIdx = STAGES.findIndex((s) => s.id === crop.stage.id)
  const notYet = crop.daysSinceSowing === 0 && crop.progress === 0
  const fmtV = (v?: number) => (v === undefined ? '' : Number.isInteger(v) ? v : v.toFixed(1))

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between pt-2">
        <div>
          <p className="eyebrow text-inti-700">
            {variety.name} · {profile.placeName}
          </p>
          <h1 className="mt-1 font-display text-3xl text-noche-800">{t('crop.title')}</h1>
        </div>
        <Link to="/chacra" className="text-sm font-bold text-noche-600 underline">
          {t('crop.change')}
        </Link>
      </header>

      <SourceNotice source={climatology?.source} />

      {/* Dónde voy a sembrar: mi altura y mi clima */}
      <WhereToSowPanel />

      {/* Cuenta regresiva */}
      <section className="card flex flex-col items-center text-center">
        <ProgressRing value={crop.progress} size={210} stroke={16}>
          {crop.daysToHarvest === 0 ? (
            <>
              <span className="text-5xl" aria-hidden="true">
                🥔
              </span>
              <span className="mt-1 font-display text-xl">{t('crop.harvestNow')}</span>
            </>
          ) : (
            <>
              <span className="text-xs font-extrabold uppercase tracking-wider text-tierra-500">{t('crop.ringTop')}</span>
              <span className="font-display text-6xl leading-none text-noche-800">{crop.daysToHarvest ?? '—'}</span>
              <span className="text-sm font-bold text-tierra-700">{t('crop.ringBottom')}</span>
            </>
          )}
        </ProgressRing>
        <p className="mt-4 text-[15px] text-tierra-800">
          {notYet ? t('crop.plantedTodayNote') : t('crop.dayOf', { d: crop.daysSinceSowing, p: Math.round(crop.progress * 100) })}
        </p>
        {crop.harvestDate && <p className="mt-1 text-lg font-extrabold">{t('crop.estimated', { date: fmtLong(crop.harvestDate) })}</p>}
        <p className="mt-3 rounded-2xl bg-inti-50 px-4 py-3 text-[15px] font-semibold text-inti-900">
          {t(`motivation.${crop.stage.id}.${today.getUTCDate() % 2}` as Key)}
        </p>
      </section>

      {/* Etapas */}
      <section className="card space-y-4">
        <h2 className="text-lg font-extrabold">{t('crop.stage', { name: t(`stage.${crop.stage.id}` as Key) })}</h2>
        <ol className="flex items-start justify-between" aria-label={t('crop.stages')}>
          {STAGES.map((s, i) => {
            const done = i < stageIdx
            const current = i === stageIdx
            return (
              <li key={s.id} className="flex flex-1 flex-col items-center gap-1 text-center" title={t(`stage.${s.id}` as Key)}>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold ${
                    current ? 'bg-inti text-noche-800 ring-4 ring-inti-200' : done ? 'bg-good text-white' : 'bg-tierra-100 text-tierra-400'
                  }`}
                  aria-current={current ? 'step' : undefined}
                >
                  {done ? '✓' : i + 1}
                </span>
                <span className={`text-[10px] font-bold leading-tight ${current ? 'text-noche-800' : 'text-tierra-500'}`}>{s.quechua}</span>
              </li>
            )
          })}
        </ol>
        <div className="rounded-2xl bg-tierra-50 p-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-tierra-600">{t('crop.tip', { q: crop.stage.quechua })}</p>
          <p className="mt-1 text-[15px] text-tierra-900">{t(`stageTip.${crop.stage.id}` as Key)}</p>
        </div>
      </section>

      {/* Alertas */}
      {crop.alerts.length > 0 && (
        <section className="space-y-2" aria-label={t('crop.alerts')}>
          {crop.alerts.map((a) => (
            <Notice
              key={a.code}
              tone={a.level === 'danger' ? 'danger' : a.level === 'warning' ? 'warning' : 'success'}
              title={t(`alert.${a.code}.title` as Key)}
            >
              {t(`alert.${a.code}.msg` as Key, { v: fmtV(a.value) })}
            </Notice>
          ))}
        </section>
      )}

      {/* Clima semanal */}
      <section className="card space-y-2">
        <h2 className="text-lg font-extrabold">{t('crop.climate')}</h2>
        <p className="text-sm text-tierra-700">{t('crop.climateSub')}</p>
        <WeeklyChart data={weekly} />
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-tierra-700">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-noche-500" /> {t('chart.measured')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-dashed border-noche-400 bg-noche-200" /> {t('chart.expected')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-4 rounded bg-inti" /> {t('chart.temp')}
          </span>
        </div>
      </section>

      {/* Cómo se calcula */}
      <details className="card group">
        <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-extrabold">
          {t('crop.how')}
          <IconArrow size={18} className="transition group-open:rotate-90" />
        </summary>
        <div className="mt-3 space-y-2 text-sm text-tierra-800">
          <p>{t('crop.how1', { variety: variety.name, target: crop.gddTarget, acc: crop.gddAccumulated })}</p>
          <p>
            {t('crop.how2', {
              observed: crop.observedDays > 0 ? t('crop.observed', { n: crop.observedDays }) : '',
              loading: dailyLoading ? t('crop.loadingDaily') : '',
            })}
          </p>
        </div>
      </details>

      <button onClick={() => updateProfile({ plantingDate: null })} className="w-full py-2 text-sm font-bold text-tierra-500 underline">
        {t('crop.reset')}
      </button>

      <Attribution />
    </div>
  )
}
