import { Link } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { motivationFor, STAGES, VARIETIES } from '@/lib/agro'
import { WeeklyChart } from '@/components/charts/WeeklyChart'
import { Attribution, IconArrow, Notice, ProgressRing, Skeleton, SourceNotice } from '@/components/common'
import { addDaysIso, fmtLong, todayIso } from '@/utils/format'

export default function MyCropScreen() {
  const { profile, updateProfile, crop, weekly, sowing, climatology, dailyLoading, today } = useQullqa()
  const variety = VARIETIES[profile.variety]

  // Aún no sembró
  if (!profile.plantingDate) {
    return (
      <div className="space-y-4">
        <header className="pt-2">
          <h1 className="font-display text-3xl text-noche-800">Mi cultivo</h1>
          <p className="mt-1 text-[15px] text-tierra-700">Registra tu siembra y te acompañamos hasta la cosecha.</p>
        </header>
        <section className="card space-y-4 text-center">
          <p className="text-5xl" aria-hidden="true">🌱</p>
          <p className="font-display text-xl">¿Cuándo sembraste tu {variety.name}?</p>
          <label className="block text-left">
            <span className="text-sm font-semibold text-tierra-700">Fecha de siembra</span>
            <input
              type="date"
              max={todayIso()}
              onChange={(e) => e.target.value && updateProfile({ plantingDate: e.target.value, onboarded: true })}
              className="mt-1 block min-h-[48px] w-full rounded-2xl border-2 border-tierra-200 bg-white px-4 text-base font-bold"
            />
          </label>
          <button onClick={() => updateProfile({ plantingDate: todayIso(), onboarded: true })} className="btn-primary w-full">
            Sembré hoy
          </button>
          <button
            onClick={() => updateProfile({ plantingDate: addDaysIso(todayIso(), -75), onboarded: true })}
            className="btn-ghost w-full"
          >
            Ver un ejemplo (sembrado hace 75 días)
          </button>
          {sowing && (
            <p className="text-sm text-tierra-700">
              ¿Todavía no? La NASA recomienda sembrar desde el <strong>{fmtLong(sowing.best.sowDate)}</strong>.{' '}
              <Link to="/calendario" className="font-bold text-noche-600 underline">Ver calendario</Link>
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

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between pt-2">
        <div>
          <p className="eyebrow text-inti-700">
            {variety.name} · {profile.placeName}
          </p>
          <h1 className="mt-1 font-display text-3xl text-noche-800">Mi cultivo</h1>
        </div>
        <Link to="/chacra" className="text-sm font-bold text-noche-600 underline">
          Cambiar
        </Link>
      </header>

      <SourceNotice source={climatology?.source} />

      {/* Cuenta regresiva */}
      <section className="card flex flex-col items-center text-center">
        <ProgressRing value={crop.progress} size={210} stroke={16}>
          {crop.daysToHarvest === 0 ? (
            <>
              <span className="text-5xl" aria-hidden="true">🥔</span>
              <span className="mt-1 font-display text-xl">¡A cosechar!</span>
            </>
          ) : (
            <>
              <span className="text-xs font-extrabold uppercase tracking-wider text-tierra-500">Faltan</span>
              <span className="font-display text-6xl leading-none text-noche-800">{crop.daysToHarvest ?? '—'}</span>
              <span className="text-sm font-bold text-tierra-700">días para cosechar</span>
            </>
          )}
        </ProgressRing>
        <p className="mt-4 text-[15px] text-tierra-800">
          {notYet ? 'Siembra registrada para hoy.' : `Día ${crop.daysSinceSowing} desde la siembra · ${Math.round(crop.progress * 100)}% del camino.`}
        </p>
        {crop.harvestDate && (
          <p className="mt-1 text-lg font-extrabold">Cosecha estimada: {fmtLong(crop.harvestDate)}</p>
        )}
        <p className="mt-3 rounded-2xl bg-inti-50 px-4 py-3 text-[15px] font-semibold text-inti-900">
          {motivationFor(crop.stage.id, today)}
        </p>
      </section>

      {/* Etapas */}
      <section className="card space-y-4">
        <h2 className="text-lg font-extrabold">Etapa: {crop.stage.name}</h2>
        <ol className="flex items-start justify-between" aria-label="Etapas del cultivo">
          {STAGES.map((s, i) => {
            const done = i < stageIdx
            const current = i === stageIdx
            return (
              <li key={s.id} className="flex flex-1 flex-col items-center gap-1 text-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold ${
                    current ? 'bg-inti text-noche-800 ring-4 ring-inti-200' : done ? 'bg-good text-white' : 'bg-tierra-100 text-tierra-400'
                  }`}
                  aria-current={current ? 'step' : undefined}
                >
                  {done ? '✓' : i + 1}
                </span>
                <span className={`text-[10px] font-bold leading-tight ${current ? 'text-noche-800' : 'text-tierra-500'}`}>
                  {s.quechua}
                </span>
              </li>
            )
          })}
        </ol>
        <div className="rounded-2xl bg-tierra-50 p-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-tierra-600">
            {crop.stage.quechua} · consejo
          </p>
          <p className="mt-1 text-[15px] text-tierra-900">{crop.stage.tip}</p>
        </div>
      </section>

      {/* Alertas */}
      {crop.alerts.length > 0 && (
        <section className="space-y-2" aria-label="Alertas">
          {crop.alerts.map((a) => (
            <Notice key={a.title} tone={a.level === 'danger' ? 'danger' : a.level === 'warning' ? 'warning' : 'success'} title={a.title}>
              {a.message}
            </Notice>
          ))}
        </section>
      )}

      {/* Clima semanal */}
      <section className="card space-y-2">
        <h2 className="text-lg font-extrabold">Clima en tu chacra</h2>
        <p className="text-sm text-tierra-700">Últimas 4 semanas medidas por la NASA y las 2 próximas esperadas.</p>
        <WeeklyChart data={weekly} />
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-tierra-700">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-noche-500" /> Lluvia medida</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-dashed border-noche-400 bg-noche-200" /> Lluvia esperada</span>
          <span className="flex items-center gap-1.5"><span className="h-1 w-4 rounded bg-inti" /> Temperatura</span>
        </div>
      </section>

      {/* Cómo se calcula */}
      <details className="card group">
        <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-extrabold">
          ¿Cómo lo calcula Qullqa?
          <IconArrow size={18} className="transition group-open:rotate-90" />
        </summary>
        <div className="mt-3 space-y-2 text-sm text-tierra-800">
          <p>
            La papa crece según el calor que acumula cada día (<strong>grados-día</strong>). Tu {variety.name} necesita{' '}
            {crop.gddTarget} grados-día y ya lleva <strong>{crop.gddAccumulated}</strong>.
          </p>
          <p>
            Usamos la temperatura diaria real de NASA POWER para tu chacra
            {crop.observedDays > 0 ? ` (${crop.observedDays} días medidos)` : ''}
            {dailyLoading ? ', cargando…' : ''} y, para los días que faltan, el clima promedio de 25 años.
          </p>
        </div>
      </details>

      <button
        onClick={() => updateProfile({ plantingDate: null })}
        className="w-full py-2 text-sm font-bold text-tierra-500 underline"
      >
        Borrar siembra y empezar otra
      </button>

      <Attribution />
    </div>
  )
}
