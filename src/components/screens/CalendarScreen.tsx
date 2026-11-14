import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { INCA_MONTHS, VARIETIES } from '@/lib/agro'
import { IncaWheel, LIGHT_COLOR } from '@/components/calendar'
import { Attribution, IconDrop, IconSnow, IconThermo, Pleiades, Skeleton, SourceNotice } from '@/components/common'
import { fmtLong, MONTHS } from '@/utils/format'

export default function CalendarScreen() {
  const { profile, calendar, sowing, climatology, today } = useQullqa()
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

  const best = sowing.best
  const bestInca = INCA_MONTHS[best.month]
  const m = calendar[selected]
  const variety = VARIETIES[profile.variety]

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <p className="eyebrow text-inti-700">
          {profile.placeName} · {variety.name}
        </p>
        <h1 className="mt-1 font-display text-3xl text-noche-800">Calendario inca</h1>
        <p className="mt-1 text-[15px] text-tierra-700">25 años de clima medidos por la NASA, en los 12 meses del calendario andino.</p>
      </header>

      <SourceNotice source={climatology?.source} />

      {/* ¿Cuándo siembro? */}
      <section className="relative overflow-hidden rounded-3xl bg-noche-800 p-5 text-white shadow-card">
        <p className="eyebrow text-inti-300">🌱 ¿Cuándo siembro?</p>
        <p className="mt-2 font-display text-[1.7rem] leading-tight">
          {sowing.daysUntil === 0 ? '¡Siembra este mes!' : `Siembra en ${MONTHS[best.month]}`}
        </p>
        <p className="text-sm font-bold text-inti-300">
          {bestInca.quechua}
          {sowing.daysUntil > 0 && <span className="text-noche-200"> · faltan {sowing.daysUntil} días</span>}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-noche-600 p-3">
            <p className="text-[11px] font-bold text-noche-200">Puntaje</p>
            <p className="text-xl font-extrabold">{best.score}</p>
          </div>
          <div className="rounded-2xl bg-noche-600 p-3">
            <p className="text-[11px] font-bold text-noche-200">Ciclo</p>
            <p className="text-xl font-extrabold">{best.cycleDays ?? '—'} d</p>
          </div>
          <div className="rounded-2xl bg-noche-600 p-3">
            <p className="text-[11px] font-bold text-noche-200">Cosecha</p>
            <p className="text-xl font-extrabold">{best.harvestDate ? MONTHS[best.harvestDate.getUTCMonth()].slice(0, 3) : '—'}</p>
          </div>
        </div>
        {best.harvestDate && (
          <p className="mt-3 text-sm text-noche-100">
            Sembrando el {fmtLong(best.sowDate)}, tu {variety.name} estaría lista cerca del{' '}
            <strong className="text-white">{fmtLong(best.harvestDate)}</strong>.
          </p>
        )}
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {best.reasons.map((r) => (
            <li key={r} className="rounded-full bg-good/25 px-2.5 py-1 text-xs font-bold text-green-100">
              ✓ {r}
            </li>
          ))}
        </ul>
        {sowing.window.length > 1 && (
          <p className="mt-3 text-xs text-noche-200">
            Ventana buena: {sowing.window.map((w) => MONTHS[w.month]).join(', ')}.
          </p>
        )}
      </section>

      {/* Rueda */}
      <section className="card">
        <IncaWheel months={calendar} selected={selected} currentMonth={today.getUTCMonth()} onSelect={setSelected} />
        <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-bold text-tierra-700">
          {(['good', 'caution', 'risk'] as const).map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full" style={{ background: LIGHT_COLOR[k] }} />
              {k === 'good' ? 'Bueno' : k === 'caution' ? 'Cuidado' : 'Riesgo'}
            </span>
          ))}
          <span>🌱 Sembrar</span>
          <span>🥔 Cosechar</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-inti" /> Hoy
          </span>
        </div>
      </section>

      {/* Detalle del mes */}
      <section className="card space-y-4" aria-live="polite">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow" style={{ color: LIGHT_COLOR[m.condition.status] === '#f2b705' ? '#96741f' : LIGHT_COLOR[m.condition.status] }}>
              {m.condition.status === 'good' ? 'Mes bueno' : m.condition.status === 'caution' ? 'Mes con cuidado' : 'Mes de riesgo'}
            </p>
            <h2 className="font-display text-2xl">{m.spanish}</h2>
            <p className="text-sm font-bold text-inti-700">{m.quechua}</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setSelected((selected + 11) % 12)} className="btn-ghost h-11 w-11 px-0" aria-label="Mes anterior">
              ‹
            </button>
            <button onClick={() => setSelected((selected + 1) % 12)} className="btn-ghost h-11 w-11 px-0" aria-label="Mes siguiente">
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="stat">
            <p className="stat-label flex items-center gap-1"><IconDrop size={13} /> Lluvia</p>
            <p className="stat-value">{m.climate.precipMmMonth}<span className="text-sm"> mm</span></p>
          </div>
          <div className="stat">
            <p className="stat-label flex items-center gap-1"><IconThermo size={13} /> Media</p>
            <p className="stat-value">{m.climate.t2m.toFixed(1)}°</p>
          </div>
          <div className={`stat ${m.condition.frostRisk ? 'bg-blue-50' : ''}`}>
            <p className="stat-label flex items-center gap-1"><IconSnow size={13} /> Mínima</p>
            <p className={`stat-value ${m.condition.frostRisk ? 'text-blue-700' : ''}`}>{m.climate.t2mMin.toFixed(1)}°</p>
          </div>
        </div>

        <ul className="space-y-1.5 text-[15px] text-tierra-800">
          {m.condition.reasons.map((r) => (
            <li key={r} className="flex gap-2">
              <span aria-hidden="true">•</span> {r}
            </li>
          ))}
        </ul>

        <div className="rounded-2xl border-2 border-tierra-100 p-4">
          <p className="text-sm font-extrabold">Si siembras en {m.spanish.toLowerCase()}:</p>
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
            <span className="text-sm font-extrabold">{m.sowing.label}</span>
          </div>
          {m.sowing.harvestDate && (
            <p className="mt-2 text-sm text-tierra-700">
              Cosecharías en {MONTHS[m.sowing.harvestDate.getUTCMonth()]} ({m.sowing.cycleDays} días).{' '}
              {m.sowing.frostMonths.length > 0 &&
                `Heladas en ${m.sowing.frostMonths.map((x) => MONTHS[x]).join(', ')}.`}
            </p>
          )}
        </div>

        <div className="flex gap-3 rounded-2xl bg-inti-50 p-4">
          <Pleiades className="h-8 w-12 shrink-0" glow={false} />
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-inti-800">Así lo hacían los incas</p>
            <p className="mt-1 text-[15px] text-tierra-900">{m.ancestral}</p>
          </div>
        </div>
      </section>

      {!profile.plantingDate && (
        <Link to="/chacra" className="btn-ghost w-full">
          ¿Ya sembraste? Regístralo en Mi chacra
        </Link>
      )}

      <Attribution />
    </div>
  )
}
