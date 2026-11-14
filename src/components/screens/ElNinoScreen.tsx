import { useMemo } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import { useEnso } from '@/hooks/useEnso'
import { ENSO_HISTORY, type EnsoPhase } from '@/lib/agro'
import { NinoPlate } from '@/components/incas/NinoPlate'
import { Attribution, IconArrow, Notice, Skeleton } from '@/components/common'

/** Mes central de cada trimestre del ONI (DJF → enero …). */
const SEASONS = ['DJF', 'JFM', 'FMA', 'MAM', 'AMJ', 'MJJ', 'JJA', 'JAS', 'ASO', 'SON', 'OND', 'NDJ']

const PHASE_BG: Record<EnsoPhase, string> = {
  elnino: 'from-marte-700 to-noche-800',
  lanina: 'from-noche-500 to-noche-800',
  neutral: 'from-noche-600 to-noche-800',
}

export default function ElNinoScreen() {
  const { profile, climatology } = useQullqa()
  const { t, fmtLong, monthShort } = useI18n()
  const { data, status } = useEnso()
  const highlands = (climatology?.elevation ?? 3000) > 2000

  // Serie mensual: Niño 1+2 por mes y ONI en su mes central
  const series = useMemo(() => {
    if (!data) return []
    const rows = new Map<string, { key: string; label: string; coast?: number; oni?: number }>()
    for (const p of data.nino12.slice(-24)) {
      const key = `${p.year}-${String(p.month).padStart(2, '0')}`
      rows.set(key, { key, label: `${monthShort(p.month - 1)} ${String(p.year).slice(2)}`, coast: p.anom })
    }
    for (const p of data.oni) {
      const m = SEASONS.indexOf(p.season) + 1
      const key = `${p.year}-${String(m).padStart(2, '0')}`
      const row = rows.get(key)
      if (row) row.oni = p.anom
    }
    return [...rows.values()].sort((a, b) => a.key.localeCompare(b.key))
  }, [data, monthShort])

  const phaseName = (p: EnsoPhase) => t(`nino.phase.${p}` as Key)
  const strengthName = (s: string | null) => (s ? t(`nino.strength.${s}` as Key) : '')

  const prepHighlands = ['h1', 'h2', 'h3', 'h4', 'h5']
  const prepCoast = ['c1', 'c2', 'c3']
  const prepFirst = highlands ? prepHighlands : prepCoast
  const prepSecond = highlands ? prepCoast : prepHighlands

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <p className="eyebrow text-inti-700">{t('nino.kicker')}</p>
        <h1 className="mt-1 font-display text-3xl text-noche-800">{t('nino.title')}</h1>
        <p className="mt-1 text-[15px] text-tierra-700">{t('nino.subtitle')}</p>
      </header>

      {/* Estado actual */}
      {!status ? (
        <Skeleton className="h-52" />
      ) : (
        <section className={`rounded-3xl bg-gradient-to-br ${PHASE_BG[status.phase]} p-5 text-white shadow-card`}>
          <p className="eyebrow text-inti-300">{t('nino.now')}</p>
          <p className="mt-2 font-display text-3xl leading-tight">
            {status.phase === 'neutral'
              ? t('nino.headlineNeutral')
              : t('nino.headline', { phase: phaseName(status.phase), strength: strengthName(status.strength) })}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-black/25 p-3">
              <p className="text-[11px] font-bold leading-tight text-noche-100">
                {t('nino.oni', { season: status.oni.season, year: status.oni.year })}
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {status.oni.anom > 0 ? '+' : ''}
                {status.oni.anom.toFixed(2)} °C
              </p>
              <p className="text-xs font-bold text-inti-200">{t(`nino.trend.${status.trend}` as Key)}</p>
            </div>
            <div className="rounded-2xl bg-black/25 p-3">
              <p className="text-[11px] font-bold leading-tight text-noche-100">{t('nino.coastal')}</p>
              <p className="mt-1 text-2xl font-extrabold">
                {status.coastal > 0 ? '+' : ''}
                {status.coastal.toFixed(2)} °C
              </p>
              {status.coastalStrength && (
                <p className="text-xs font-bold text-inti-200">{t('nino.coastalTag', { strength: strengthName(status.coastalStrength) })}</p>
              )}
            </div>
          </div>
          <p className="mt-3 text-xs text-noche-100">{t('nino.approx')}</p>
        </section>
      )}
      {data?.source === 'fallback' && <Notice tone="warning">{t('nino.fallbackNote', { date: fmtLong(data.fetchedAt) })}</Notice>}

      {/* Gráfico */}
      {series.length > 0 && (
        <section className="card space-y-2">
          <h2 className="text-lg font-extrabold">{t('nino.chartTitle')}</h2>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f3eadb" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6e5537' }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fontSize: 10, fill: '#6e5537' }} tickLine={false} axisLine={false} />
                <ReferenceLine y={0.5} stroke="#d9480f" strokeDasharray="4 4" />
                <ReferenceLine y={-0.5} stroke="#3d4577" strokeDasharray="4 4" />
                <Tooltip formatter={(v: number) => `${v > 0 ? '+' : ''}${v.toFixed(2)} °C`} contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line name={t('nino.chartCoast')} dataKey="coast" stroke="#d9480f" strokeWidth={3} dot={false} />
                <Line name={t('nino.chartOni')} dataKey="oni" stroke="#3d4577" strokeWidth={3} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-tierra-600">{t('nino.chartThreshold')}</p>
        </section>
      )}

      {/* Qué es */}
      <section className="card space-y-2">
        <h2 className="text-lg font-extrabold">{t('nino.what')}</h2>
        <p className="text-[15px] leading-relaxed text-tierra-800">{t('nino.whatText')}</p>
      </section>

      {/* Impactos */}
      <section className="space-y-2">
        <h2 className="text-lg font-extrabold">{t('nino.impact')}</h2>
        <p className="text-sm text-tierra-700">
          {t('nino.yourFarm', { place: profile.placeName, zone: t(highlands ? 'nino.zone.highlands' : 'nino.zone.coast') })}
        </p>
        {(['impactSouth', 'impactCoast', 'impactLanina'] as const).map((k) => {
          const mine = (k === 'impactSouth' && highlands) || (k === 'impactCoast' && !highlands)
          return (
            <article key={k} className={`card p-4 ${mine ? 'ring-2 ring-marte-500' : ''}`}>
              <p className="font-extrabold">
                {k === 'impactLanina' ? '❄️' : k === 'impactCoast' ? '🌊' : '☀️'} {t(`nino.${k}.title` as Key)}
              </p>
              <p className="mt-1 text-sm text-tierra-800">{t(`nino.${k}.text` as Key)}</p>
            </article>
          )
        })}
      </section>

      {/* Prevención */}
      <section className="card space-y-3">
        <h2 className="text-lg font-extrabold">{t('nino.prepare')}</h2>
        <ul className="space-y-2">
          {[...prepFirst, 'b1', 'b2', ...prepSecond].map((k, i) => (
            <li key={k} className={`flex gap-2 text-[15px] ${i >= prepFirst.length + 2 ? 'text-tierra-600' : ''}`}>
              <span aria-hidden="true" className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-good text-xs font-bold text-good">
                ✓
              </span>
              {t(`nino.prep.${k}` as Key)}
            </li>
          ))}
        </ul>
      </section>

      {/* Lámina inca */}
      <section className="overflow-hidden rounded-3xl bg-white shadow-card">
        <NinoPlate normalLabel={t('nino.plate.normal')} ninoLabel={t('nino.plate.nino')} />
        <div className="space-y-3 p-5">
          <h2 className="font-display text-xl">{t('nino.incaTitle')}</h2>
          <ol className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-inti font-extrabold text-noche-800">{n}</span>
                <div>
                  <p className="font-extrabold">{t(`nino.inca${n}.title` as Key)}</p>
                  <p className="text-sm text-tierra-800">{t(`nino.inca${n}.text` as Key)}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="rounded-2xl bg-noche-800 p-4 text-sm text-noche-100">🛰️ {t('nino.today')}</p>
        </div>
      </section>

      {/* Historia */}
      <section className="card space-y-2">
        <h2 className="text-lg font-extrabold">{t('nino.history')}</h2>
        <ul className="divide-y divide-tierra-100">
          {ENSO_HISTORY.map((e) => (
            <li key={e.years} className="flex items-center justify-between py-2 text-sm">
              <span className="font-extrabold">{e.years}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${e.kind === 'elnino' ? 'bg-red-50 text-red-800' : 'bg-noche-50 text-noche-700'}`}>
                {phaseName(e.kind)}
                {'coastal' in e && e.coastal ? ` ${t('nino.coastalEvent')}` : ''} · {strengthName(e.strength)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Enlaces oficiales */}
      <section className="space-y-2">
        <h2 className="text-lg font-extrabold">{t('nino.links')}</h2>
        {[
          ['https://enfen.imarpe.gob.pe/', 'nino.link.enfen'],
          ['https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml', 'nino.link.noaa'],
          ['https://sealevel.nasa.gov/', 'nino.link.nasa'],
          ['https://www.gob.pe/institucion/midagri/campa%C3%B1as/2850-seguro-agricola-catastrofico', 'nino.link.sac'],
        ].map(([href, key]) => (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="card flex items-center justify-between gap-3 p-4 text-sm font-bold">
            {t(key as Key)}
            <IconArrow size={16} className="shrink-0 text-tierra-400" />
          </a>
        ))}
      </section>

      <p className="text-center text-xs text-tierra-500">{t('nino.sources')}</p>
      <Attribution />
    </div>
  )
}
