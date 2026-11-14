import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import { INCA_MONTHS, VARIETIES, type Reason } from '@/lib/agro'
import { IncaWheel, LIGHT_COLOR } from '@/components/calendar'
import { CropTimeline } from '@/components/calendar/CropTimeline'
import { Attribution, IconDrop, IconSnow, IconThermo, Pleiades, Skeleton, SourceNotice } from '@/components/common'

export default function CalendarScreen() {
  const { profile, calendar, sowing, climatology, today } = useQullqa()
  const { t, month, fmtLong, list } = useI18n()
  const [selected, setSelected] = useState(today.getUTCMonth())

  if (!calendar || !sowing) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-44" />
        <Skeleton className="h-80" />
      </div>
    )
  }

  const reason = (prefix: 'reason' | 'sreason', r: Reason) =>
    t(`${prefix}.${r.code}` as Key, { v: r.value === undefined ? '' : Number.isInteger(r.value) ? r.value : r.value.toFixed(1) })

  const best = sowing.best
  const bestInca = INCA_MONTHS[best.month]
  const m = calendar[selected]
  const variety = VARIETIES[profile.variety]
  const status = m.condition.status
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <p className="eyebrow text-inti-700">
          {profile.placeName} · {variety.name}
        </p>
        <h1 className="mt-1 font-display text-3xl text-noche-800">{t('cal.title')}</h1>
        <p className="mt-1 text-[15px] text-tierra-700">{t('cal.subtitle')}</p>
      </header>

      <SourceNotice source={climatology?.source} />

      {/* ¿Cuándo siembro? */}
      <section className="relative overflow-hidden rounded-3xl bg-noche-800 p-5 text-white shadow-card">
        <p className="eyebrow text-inti-300">{t('cal.whenSow')}</p>
        <p className="mt-2 font-display text-[1.7rem] leading-tight">
          {sowing.daysUntil === 0 ? t('status.sowNow') : t('status.sowIn', { month: month(best.month) })}
        </p>
        <p className="text-sm font-bold text-inti-300">
          {bestInca.quechua}
          {sowing.daysUntil > 0 && <span className="text-noche-200"> · {t('status.daysLeft', { n: sowing.daysUntil })}</span>}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-noche-600 p-3">
            <p className="text-[11px] font-bold text-noche-200">{t('cal.score')}</p>
            <p className="text-xl font-extrabold">{best.score}</p>
          </div>
          <div className="rounded-2xl bg-noche-600 p-3">
            <p className="text-[11px] font-bold text-noche-200">{t('cal.cycle')}</p>
            <p className="text-xl font-extrabold">{best.cycleDays !== null ? t('unit.daysShort', { n: best.cycleDays }) : '—'}</p>
          </div>
          <div className="rounded-2xl bg-noche-600 p-3">
            <p className="text-[11px] font-bold text-noche-200">{t('cal.harvest')}</p>
            <p className="text-xl font-extrabold">{best.harvestDate ? t(`monthShort.${best.harvestDate.getUTCMonth()}` as Key) : '—'}</p>
          </div>
        </div>
        {best.harvestDate && (
          <p className="mt-3 text-sm text-noche-100">
            {t('cal.sowingOn', { sow: fmtLong(best.sowDate), variety: variety.name, harvest: fmtLong(best.harvestDate) })}
          </p>
        )}
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {best.codes.map((r) => (
            <li key={r.code} className="rounded-full bg-good/25 px-2.5 py-1 text-xs font-bold text-green-100">
              ✓ {reason('sreason', r)}
            </li>
          ))}
        </ul>
        {sowing.window.length > 1 && (
          <p className="mt-3 text-xs text-noche-200">{t('cal.window', { months: list(sowing.window.map((w) => month(w.month))) })}</p>
        )}
      </section>

      {/* Rueda */}
      <section className="card">
        <IncaWheel months={calendar} selected={selected} currentMonth={today.getUTCMonth()} onSelect={setSelected} />
        <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-bold text-tierra-700">
          {(['good', 'caution', 'risk'] as const).map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full" style={{ background: LIGHT_COLOR[k] }} />
              {t(`light.${k}`)}
            </span>
          ))}
          <span>{t('legend.sow')}</span>
          <span>{t('legend.harvest')}</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-inti" /> {t('legend.today')}
          </span>
        </div>
      </section>

      {/* Detalle del mes */}
      <section className="card space-y-4" aria-live="polite">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow" style={{ color: status === 'caution' ? '#96741f' : LIGHT_COLOR[status] }}>
              {status === 'good' ? t('cal.monthGood') : status === 'caution' ? t('cal.monthCaution') : t('cal.monthRisk')}
            </p>
            <h2 className="font-display text-2xl">{cap(month(selected))}</h2>
            <p className="text-sm font-bold text-inti-700">{m.quechua}</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setSelected((selected + 11) % 12)} className="btn-ghost h-11 w-11 px-0" aria-label={t('cal.prev')}>
              ‹
            </button>
            <button onClick={() => setSelected((selected + 1) % 12)} className="btn-ghost h-11 w-11 px-0" aria-label={t('cal.next')}>
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="stat">
            <p className="stat-label flex items-center gap-1">
              <IconDrop size={13} /> {t('stat.rain')}
            </p>
            <p className="stat-value">
              {m.climate.precipMmMonth}
              <span className="text-sm"> mm</span>
            </p>
          </div>
          <div className="stat">
            <p className="stat-label flex items-center gap-1">
              <IconThermo size={13} /> {t('stat.mean')}
            </p>
            <p className="stat-value">{m.climate.t2m.toFixed(1)}°</p>
          </div>
          <div className={`stat ${m.condition.frostRisk ? 'bg-blue-50' : ''}`}>
            <p className="stat-label flex items-center gap-1">
              <IconSnow size={13} /> {t('stat.min')}
            </p>
            <p className={`stat-value ${m.condition.frostRisk ? 'text-blue-700' : ''}`}>{m.climate.t2mMin.toFixed(1)}°</p>
          </div>
        </div>

        <ul className="space-y-1.5 text-[15px] text-tierra-800">
          {m.condition.codes.map((r) => (
            <li key={r.code} className="flex gap-2">
              <span aria-hidden="true">•</span> {reason('reason', r)}
            </li>
          ))}
        </ul>

        <div className="rounded-2xl border-2 border-tierra-100 p-4">
          <p className="text-sm font-extrabold">{t('cal.ifSow', { month: month(selected) })}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-tierra-100">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${m.sowing.score}%`,
                  background: m.sowing.score >= 60 ? '#2f9e44' : m.sowing.score >= 40 ? '#f2b705' : '#d9480f',
                }}
              />
            </div>
            <span className="text-sm font-extrabold">{t(`sowLabel.${m.sowing.labelCode}` as Key)}</span>
          </div>
          {m.sowing.harvestDate && m.sowing.cycleDays !== null && (
            <p className="mt-2 text-sm text-tierra-700">
              {t('cal.harvestIn', { month: month(m.sowing.harvestDate.getUTCMonth()), n: m.sowing.cycleDays })}{' '}
              {m.sowing.frostMonths.length > 0 && t('cal.frostIn', { months: list(m.sowing.frostMonths.map((x) => month(x))) })}
            </p>
          )}
        </div>

        <div className="flex gap-3 rounded-2xl bg-inti-50 p-4">
          <Pleiades className="h-8 w-12 shrink-0" glow={false} color="#b8922a" />
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-inti-800">{t('incas.title')}</p>
            <p className="mt-1 text-[15px] text-tierra-900">{t(`ancestral.${selected}` as Key)}</p>
          </div>
        </div>
      </section>

      <CropTimeline />

      {!profile.plantingDate && (
        <Link to="/chacra" className="btn-ghost w-full">
          {t('cal.register')}
        </Link>
      )}

      <Attribution />
    </div>
  )
}
