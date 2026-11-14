import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import { fetchClimatology } from '@/services/nasa'
import type { Climatology } from '@/services/nasa/types'
import { useMyFarms } from '@/lib/farms/myFarms'
import { recordProgress, sortRecords, useHistory, isoDate } from '@/lib/farms/history'
import { adjustToElevation, farmIndicators, zoneInfo } from '@/lib/farms/indicators'
import { planFarm, type CropPlan } from '@/lib/farms/plan'
import { NEXT_CROPS, prevEmoji, type PrevCropId } from '@/lib/rotation/nextCrop'
import { FactorList, useFactorText, VERDICT_STYLE } from '@/components/rotation/NextCropChecker'
import { Attribution, IconArrow, Notice, Skeleton } from '@/components/common'

/** Mi chacra: indicadores clave (NASA) y qué sembrar o no sembrar. */
export default function FarmPlanScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { updateProfile } = useQullqa()
  const { t, month, list, fmtShort } = useI18n()
  const { farms, remove } = useMyFarms()
  const { records } = useHistory()
  const farm = farms.find((f) => f.id === id)
  const [clim, setClim] = useState<Climatology | null>(null)

  useEffect(() => {
    if (!farm) return
    const ctrl = new AbortController()
    setClim(null)
    fetchClimatology(farm.lat, farm.lon, ctrl.signal)
      .then(setClim)
      .catch(() => undefined)
    return () => ctrl.abort()
  }, [farm?.lat, farm?.lon]) // eslint-disable-line react-hooks/exhaustive-deps

  const elevation = farm?.elevation ?? clim?.elevation ?? 0
  // Clima NASA ajustado a la altura real de la chacra
  const adj = useMemo(() => (clim ? adjustToElevation(clim, elevation) : null), [clim, elevation])
  const ind = useMemo(() => (adj ? farmIndicators(adj.clim, elevation) : null), [adj, elevation])
  const plan = useMemo(
    () => (adj && farm ? planFarm({ prev: farm.lastCrop, irrigation: farm.water === 'irrigation', elevation, soil: farm.soil }, adj.clim) : []),
    [adj, farm, elevation],
  )

  if (!farm) {
    return (
      <div className="space-y-4 pt-4">
        <Notice tone="warning">{t('myf.notFound')}</Notice>
        <Link to="/tierras" className="btn-primary w-full">
          {t('myf.back')}
        </Link>
      </div>
    )
  }

  const activate = (to: string) => {
    updateProfile({ lat: farm.lat, lon: farm.lon, placeName: farm.name, onboarded: true })
    navigate(to)
  }
  const groups: { verdict: CropPlan['verdict']; title: Key }[] = [
    { verdict: 'good', title: 'myf.canPlant' },
    { verdict: 'fair', title: 'myf.careful' },
    { verdict: 'bad', title: 'myf.notPlant' },
  ]

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <p className="eyebrow text-inti-700">📍 {farm.placeName}</p>
        <h1 className="mt-1 font-display text-3xl text-noche-800">{farm.name}</h1>
        <p className="mt-1 text-sm text-tierra-700">
          {farm.areaHa != null && <>{farm.areaHa} ha · </>}
          {t(`soil.${farm.soil}` as Key)} · {t(`water.${farm.water}` as Key)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to={`/mis-chacras/${farm.id}/editar`} className="btn-ghost min-h-[40px] px-4 text-sm">
            ✏️ {t('myf.edit')}
          </Link>
          <button onClick={() => activate('/calendario')} className="btn-dark min-h-[40px] px-4 text-sm">
            ⭐ {t('myf.activate')}
          </button>
        </div>
      </header>

      {/* Indicadores clave */}
      <section className="card space-y-3">
        <div>
          <h2 className="text-lg font-extrabold">📊 {t('myf.indicators')}</h2>
          <p className="text-sm text-tierra-700">{t('myf.indicatorsSub')}</p>
        </div>
        {!ind ? (
          <Skeleton className="h-40" />
        ) : (
          <>
            {clim?.source === 'fallback' && <Notice tone="warning">{t('myf.fallback')}</Notice>}
            <div className="grid grid-cols-2 gap-2">
              <Indicator icon="⛰️" label={t('myf.ind.altitude')} value={`${ind.elevation.toLocaleString()} m`} note={`${zoneInfo(ind.zone).emoji} ${t(`zone.${ind.zone}.name` as Key)}`} />
              <Indicator icon="🌡️" label={t('myf.ind.temp')} value={`${ind.meanTemp} °C`} note={t('myf.ind.tempRange', { cold: ind.coldest.t, warm: ind.warmest.t })} />
              <Indicator
                icon="❄️"
                label={t('myf.ind.frost')}
                value={ind.frostMonths.length === 0 ? t('myf.ind.noFrost') : t('myf.ind.frostN', { n: ind.frostMonths.length })}
                note={t('myf.ind.min', { t: ind.minTemp })}
                tone={ind.frostMonths.length >= 4 ? 'bad' : ind.frostMonths.length > 0 ? 'warn' : 'ok'}
              />
              <Indicator
                icon="🌧️"
                label={t('myf.ind.rain')}
                value={`${ind.annualRain.toLocaleString()} mm`}
                note={t('myf.ind.rainyN', { n: ind.rainyMonths.length })}
                tone={ind.annualRain < 300 && farm.water === 'rain' ? 'bad' : ind.annualRain < 500 ? 'warn' : 'ok'}
              />
              <Indicator icon="🟤" label={t('myf.ind.soil')} value={t(`soil.${farm.soil}` as Key)} note={t(`soil.${farm.soil}.hint` as Key)} />
              <Indicator icon="💧" label={t('myf.ind.water')} value={t(`water.${farm.water}` as Key)} note={farm.water === 'rain' ? t('myf.ind.rainOnly') : t('myf.ind.irrigated')} />
            </div>
            <div className="space-y-1.5 rounded-2xl bg-noche-50 p-3 text-sm text-noche-800">
              <p>
                <strong>{t('myf.whatMeans')}</strong> {t(`zone.${ind.zone}.text` as Key)}
              </p>
              {ind.rainyMonths.length > 0 && <p>🌧️ {t('myf.rainSeason', { months: list(ind.rainyMonths.map((m) => month(m))) })}</p>}
              {ind.frostMonths.length > 0 && <p>❄️ {t('myf.frostSeason', { months: list(ind.frostMonths.map((m) => month(m))) })}</p>}
            </div>
            {adj && Math.abs(adj.deltaC) >= 0.5 && adj.gridElevation != null && (
              <p className="text-[11px] text-tierra-600">
                🛰️ {t('myf.adjusted', { grid: Math.round(adj.gridElevation).toLocaleString(), elev: ind.elevation.toLocaleString(), delta: `${adj.deltaC > 0 ? '+' : ''}${adj.deltaC}` })}
              </p>
            )}
          </>
        )}
      </section>

      {/* Lo que produce */}
      <section className="card space-y-2">
        <h2 className="text-lg font-extrabold">🧺 {t('myf.produces')}</h2>
        {farm.products.length === 0 ? (
          <p className="text-sm text-tierra-600">{t('myf.noProducts')}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {farm.products.map((c) => {
              const p = plan.find((x) => x.crop === c)
              return (
                <span key={c} className="chip border-tierra-200 bg-white text-tierra-800">
                  {NEXT_CROPS[c].emoji} {t(`rotcrop.${c}` as Key)} {p && VERDICT_STYLE[p.verdict].emoji}
                </span>
              )
            })}
          </div>
        )}
        <p className="text-sm text-tierra-700">
          🔁 {t('myf.lastWas')} <strong>{prevEmoji(farm.lastCrop)} {t(`rotcrop.${farm.lastCrop}` as Key)}</strong>
        </p>
        <Link to="/perfil" className="text-sm font-extrabold text-noche-700 underline">
          🛒 {t('myf.sell')}
        </Link>
      </section>

      {/* Historial de esta chacra */}
      <section className="card space-y-2">
        <h2 className="text-lg font-extrabold">📒 {t('hist.farmTitle')}</h2>
        {(() => {
          const mine = sortRecords(records.filter((r) => r.farmId === farm.id)).slice(0, 3)
          if (mine.length === 0) return <p className="text-sm text-tierra-600">{t('hist.farmEmpty')}</p>
          const today = isoDate(new Date())
          return (
            <ul className="space-y-1">
              {mine.map((r) => {
                const p = recordProgress(r, today)
                return (
                  <li key={r.id} className="text-sm text-tierra-800">
                    {NEXT_CROPS[r.crop].emoji} <strong>{t(`rotcrop.${r.crop}` as Key)}</strong> ·{' '}
                    {p.status === 'harvested'
                      ? t('hist.farmHarvested', { date: fmtShort(r.harvestDate!), kg: r.yieldKg?.toLocaleString() ?? '—' })
                      : t('hist.farmGrowing', { n: p.days, pct: Math.round(p.progress * 100) })}
                  </li>
                )
              })}
            </ul>
          )
        })()}
        <Link to={`/historial?chacra=${farm.id}`} className="text-sm font-extrabold text-noche-700 underline">
          {t('hist.open')}
        </Link>
      </section>

      {/* Decisión: qué sembrar y qué no */}
      <section className="space-y-3">
        <div>
          <h2 className="font-display text-2xl text-noche-800">🌱 {t('myf.decideTitle')}</h2>
          <p className="text-sm text-tierra-700">{t('myf.decideSub', { last: t(`rotcrop.${farm.lastCrop}` as Key) })}</p>
        </div>
        {!clim ? (
          <Skeleton className="h-64" />
        ) : (
          groups.map((g) => {
            const items = plan.filter((p) => p.verdict === g.verdict)
            if (items.length === 0) return null
            return (
              <div key={g.verdict} className={`rounded-3xl p-3 ${VERDICT_STYLE[g.verdict].box}`}>
                <h3 className={`mb-2 font-extrabold ${VERDICT_STYLE[g.verdict].text}`}>
                  {VERDICT_STYLE[g.verdict].emoji} {t(g.title)} ({items.length})
                </h3>
                <ul className="space-y-1.5">
                  {items.map((p) => (
                    <PlanItem key={p.crop} plan={p} prev={farm.lastCrop} />
                  ))}
                </ul>
              </div>
            )
          })
        )}
      </section>

      <button onClick={() => activate('/rotacion')} className="card flex w-full items-center gap-4 py-4 text-left ring-2 ring-good/40">
        <span className="text-3xl" aria-hidden="true">
          🔄
        </span>
        <div className="flex-1">
          <p className="font-display text-lg leading-tight">{t('myf.rotTitle')}</p>
          <p className="text-sm text-tierra-700">{t('myf.rotText')}</p>
        </div>
        <IconArrow className="shrink-0 text-tierra-500" />
      </button>
      <Link to="/mapa-peru" className="card flex items-center gap-4 py-4">
        <span className="text-3xl" aria-hidden="true">
          🗺️
        </span>
        <div className="flex-1">
          <p className="font-display text-lg leading-tight">{t('pmap.title')}</p>
          <p className="text-sm text-tierra-700">{t('myf.mapText')}</p>
        </div>
        <IconArrow className="shrink-0 text-tierra-500" />
      </Link>

      <Notice tone="info">{t('rot.disclaimer')}</Notice>
      <button
        onClick={() => {
          if (window.confirm(t('myf.confirmDelete', { name: farm.name }))) {
            remove(farm.id)
            navigate('/tierras')
          }
        }}
        className="w-full text-center text-sm font-bold text-tierra-500 underline"
      >
        🗑️ {t('myf.delete')}
      </button>
      <Attribution />
    </div>
  )
}

function Indicator({ icon, label, value, note, tone }: { icon: string; label: string; value: string; note?: string; tone?: 'ok' | 'warn' | 'bad' }) {
  const bg = tone === 'bad' ? 'bg-red-50' : tone === 'warn' ? 'bg-inti-50' : tone === 'ok' ? 'bg-green-50' : 'bg-tierra-50'
  return (
    <div className={`rounded-2xl p-3 ${bg}`}>
      <p className="text-xs font-bold text-tierra-600">
        {icon} {label}
      </p>
      <p className="mt-0.5 text-lg font-extrabold leading-tight text-noche-800">{value}</p>
      {note && <p className="mt-0.5 text-[11px] leading-snug text-tierra-700">{note}</p>}
    </div>
  )
}

function PlanItem({ plan: p, prev }: { plan: CropPlan; prev: PrevCropId }) {
  const { t, month, list } = useI18n()
  const text = useFactorText()
  const great = p.best.factors.some((f) => f.great)
  return (
    <li>
      <details className="group rounded-2xl bg-white/80 p-2.5">
        <summary className="flex cursor-pointer list-none items-center gap-2.5">
          <span className="text-2xl" aria-hidden="true">
            {NEXT_CROPS[p.crop].emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">
              {t(`rotcrop.${p.crop}` as Key)} {great && <span className="text-xs text-good">⭐ {t('myf.great')}</span>}
            </p>
            <p className="text-xs text-tierra-700">
              {p.verdict === 'good'
                ? t('myf.sowIn', { months: list(p.goodMonths.slice(0, 4).map((m) => month(m))) })
                : p.mainIssue
                  ? text(p.mainIssue, p.crop, prev)
                  : ''}
            </p>
          </div>
          <span className="shrink-0 text-xs font-bold text-tierra-500 group-open:rotate-90">▸</span>
        </summary>
        <div className="mt-2 space-y-2">
          <p className="text-xs font-bold text-tierra-600">{t('myf.evaluated', { month: month(p.best.month) })}</p>
          <FactorList factors={p.best.factors} next={p.crop} prev={prev} />
        </div>
      </details>
    </li>
  )
}
