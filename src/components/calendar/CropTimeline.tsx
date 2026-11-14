import { useMemo } from 'react'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import { buildTimeline, recommendSowing, STAGES, VARIETIES, VARIETY_LIST, type TaskId } from '@/lib/agro'

const STAGE_COLOR = ['#b8956a', '#40c057', '#d4af37', '#2f9e44', '#e2725b', '#8b6f47']
const TASK_ICON: Record<TaskId, string> = {
  baseFertilizer: '🌱',
  firstHilling: '⛏️',
  secondHilling: '⛏️',
  criticalWater: '💧',
  stopWater: '🍂',
  harvest: '🥔',
}

/** De la siembra a la cosecha: etapas, duración y plan de abonamiento para la chacra activa. */
export function CropTimeline() {
  const { profile, climatology, sowing, today } = useQullqa()
  const { t, fmtLong, fmtShort } = useI18n()

  // Si ya sembró, la línea parte de su fecha; si no, de la fecha recomendada.
  const sowDate = profile.plantingDate ? new Date(`${profile.plantingDate}T00:00:00Z`) : sowing?.best.sowDate ?? null
  const tl = useMemo(
    () => (climatology && sowDate ? buildTimeline(climatology, profile.variety, sowDate) : null),
    [climatology, sowDate?.getTime(), profile.variety], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const others = useMemo(
    () => (climatology ? VARIETY_LIST.map((v) => ({ v, days: recommendSowing(climatology, v.id, today).best.cycleDays })) : []),
    [climatology, today],
  )
  if (!tl || !sowDate) return null

  const variety = VARIETIES[profile.variety]
  const pct = (day: number) => `${(day / tl.totalDays) * 100}%`
  const dateAt = (day: number) => fmtShort(new Date(sowDate.getTime() + day * 86_400_000))

  return (
    <section className="card space-y-4">
      <div>
        <h2 className="font-display text-xl">{t('tl.title')}</h2>
        <p className="mt-1 text-sm text-tierra-700">
          {t('tl.subtitle', { variety: variety.name, date: fmtLong(sowDate), place: profile.placeName })}
        </p>
        <p className="mt-2 inline-block rounded-full bg-noche-800 px-3 py-1 text-sm font-extrabold text-inti-300">
          ⏱️ {t('tl.duration', { days: tl.totalDays, months: tl.months })}
        </p>
      </div>

      {/* Barra de etapas */}
      <div>
        <div className="flex h-5 overflow-hidden rounded-full" role="img" aria-label={t('crop.stages')}>
          {tl.stages.slice(0, -1).map((s, i) => (
            <div
              key={s.id}
              style={{ width: pct(tl.stages[i + 1].day - s.day), background: STAGE_COLOR[i] }}
              title={t(`stage.${s.id}` as Key)}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[11px] font-bold text-tierra-500">
          <span>{dateAt(0)}</span>
          <span>{dateAt(Math.round(tl.totalDays / 2))}</span>
          <span>{dateAt(tl.totalDays)}</span>
        </div>
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-tierra-700">
          {STAGES.slice(0, -1).map((s, i) => (
            <li key={s.id} className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: STAGE_COLOR[i] }} />
              {t(`stage.${s.id}` as Key)}
            </li>
          ))}
        </ul>
      </div>

      {/* Tareas y abonamiento */}
      <div>
        <h3 className="mb-2 font-extrabold">{t('tl.fertTitle')}</h3>
        <ol className="relative space-y-3 border-l-2 border-dashed border-tierra-200 pl-5">
          {tl.tasks.map((task) => (
            <li key={task.id} className="relative">
              <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm ring-2 ring-tierra-200" aria-hidden="true">
                {TASK_ICON[task.id]}
              </span>
              <p className="text-xs font-extrabold uppercase tracking-wider text-inti-800">
                {t('tl.day', { n: task.day })} · {dateAt(task.day)}
              </p>
              <p className="font-extrabold">{t(`task.${task.id}.title` as Key)}</p>
              <p className="text-sm text-tierra-800">{t(`task.${task.id}.text` as Key)}</p>
            </li>
          ))}
        </ol>
        <p className="mt-3 rounded-2xl bg-tierra-50 p-3 text-xs text-tierra-800">{t('tl.fertNote')}</p>
      </div>

      {/* Comparación de variedades */}
      <div>
        <h3 className="mb-2 font-extrabold">{t('tl.compare')}</h3>
        <ul className="space-y-1.5">
          {others.map(({ v, days }) => (
            <li key={v.id} className="flex items-center gap-2 text-sm">
              <span className={`w-20 shrink-0 font-bold ${v.id === profile.variety ? 'text-noche-800' : 'text-tierra-600'}`}>{v.name}</span>
              <span className="h-3 flex-1 overflow-hidden rounded-full bg-tierra-100">
                <span className="block h-full rounded-full bg-inti" style={{ width: `${((days ?? 0) / 200) * 100}%` }} />
              </span>
              <span className="w-28 shrink-0 text-right text-xs font-bold">
                {days !== null ? t('tl.duration', { days, months: Math.round((days / 30.4) * 10) / 10 }) : '—'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
