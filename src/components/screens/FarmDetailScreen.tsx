import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import { DEMO_FARMS } from '@/lib/farms/demo'
import { fetchClimatology, fetchDaily } from '@/services/nasa'
import type { Climatology, DailyRecord } from '@/services/nasa/types'
import { fetchForecast, weatherIcon, type Forecast } from '@/services/weather/openMeteo'
import { getCropStatus, projectDateForGdd, recommendSowing, VARIETIES } from '@/lib/agro'
import { addDaysIso, todayIso, todayUtc } from '@/utils/format'
import { Attribution, IconArrow, Notice, ProgressRing, Skeleton } from '@/components/common'

/** Detalle de una chacra de ejemplo: productos, clima NASA, siembra/cosecha, ganado y equipo. */
export default function FarmDetailScreen() {
  const { farmId } = useParams()
  const navigate = useNavigate()
  const { updateProfile } = useQullqa()
  const { t, L, fmtLong, fmtShort } = useI18n()

  const farm = DEMO_FARMS.find((f) => f.id === farmId)
  const [climatology, setClimatology] = useState<Climatology | null>(null)
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [daily, setDaily] = useState<DailyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [today] = useState(todayUtc)

  useEffect(() => {
    if (!farm) return
    const ctrl = new AbortController()
    setLoading(true)
    // allSettled: si falla un dato (p. ej. el diario), igual se muestra el resto
    Promise.allSettled([
      fetchClimatology(farm.lat, farm.lon, ctrl.signal),
      fetchForecast(farm.lat, farm.lon, ctrl.signal),
      fetchDaily(
        farm.lat,
        farm.lon,
        new Date(`${farm.plantingDate && farm.plantingDate < addDaysIso(todayIso(), -35) ? farm.plantingDate : addDaysIso(todayIso(), -35)}T00:00:00Z`),
        new Date(`${todayIso()}T00:00:00Z`),
        ctrl.signal,
      ),
    ]).then(([c, f, d]) => {
      if (ctrl.signal.aborted) return
      if (c.status === 'fulfilled') setClimatology(c.value)
      if (f.status === 'fulfilled') setForecast(f.value)
      if (d.status === 'fulfilled') setDaily(d.value.days)
      setLoading(false)
    })
    return () => ctrl.abort()
  }, [farm])

  if (!farm) {
    return (
      <div className="space-y-4 pt-4">
        <Notice tone="warning">{t('error.title')}</Notice>
        <Link to="/tierras" className="btn-ghost w-full">
          ← {t('alerts.back')}
        </Link>
      </div>
    )
  }

  const variety = VARIETIES[farm.variety]
  let crop: ReturnType<typeof getCropStatus> | null = null
  let harvestedOn: Date | null = null
  if (climatology && farm.plantingDate) {
    const sow = new Date(`${farm.plantingDate}T00:00:00Z`)
    const harvest = projectDateForGdd(sow, 0, variety.gddToHarvest, climatology)
    if (harvest && harvest <= today) harvestedOn = harvest
    else crop = getCropStatus({ sowingDate: sow, variety: farm.variety, climatology, daily, today })
  }

  const activate = () => {
    updateProfile({ lat: farm.lat, lon: farm.lon, placeName: farm.place, variety: farm.variety, plantingDate: farm.plantingDate, onboarded: true })
    navigate(farm.plantingDate ? '/cultivo' : '/calendario')
  }

  const annualMean = climatology ? climatology.months.reduce((s, m) => s + m.t2m, 0) / 12 : null
  const annualRain = climatology ? climatology.months.reduce((s, m) => s + m.precipMmMonth, 0) : null

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <section className="-mx-4 -mt-4 bg-noche-800 px-5 pb-5 pt-4 text-white">
        <Link to="/tierras" className="text-sm font-bold text-inti-300">
          ← {t('lands.title')}
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-noche-600 text-sm font-extrabold tracking-wider text-inti-300">{farm.code}</span>
          <div className="flex-1">
            <h1 className="font-display text-2xl leading-tight">{farm.name}</h1>
            <p className="text-sm text-noche-100">
              {farm.place}, {L(farm.country)} · {t('lands.area', { n: farm.areaHa })}
            </p>
          </div>
          {crop && (
            <ProgressRing value={crop.progress} size={56} stroke={7} track="#3d4577">
              <span className="text-xs font-extrabold text-white">{Math.round(crop.progress * 100)}%</span>
            </ProgressRing>
          )}
        </div>
      </section>

      <Notice tone="info">{t('fd.example')}</Notice>

      {/* Siembra y cosecha */}
      <section className="card space-y-2">
        <h2 className="text-lg font-extrabold">📅 {t('fd.season')}</h2>
        <p className="text-sm font-bold text-inti-800">🥔 {variety.name}</p>
        {!climatology ? (
          <Skeleton className="h-16" />
        ) : farm.plantingDate ? (
          <dl className="grid grid-cols-2 gap-2">
            <div className="stat">
              <dt className="stat-label">{t('fd.planted')}</dt>
              <dd className="mt-0.5 text-sm font-extrabold">{fmtLong(farm.plantingDate)}</dd>
            </div>
            {harvestedOn ? (
              <div className="stat">
                <dt className="stat-label">{t('fd.harvest')}</dt>
                <dd className="mt-0.5 text-sm font-extrabold">✅ {fmtLong(harvestedOn)}</dd>
              </div>
            ) : (
              crop && (
                <>
                  <div className="stat">
                    <dt className="stat-label">{t('fd.stage')}</dt>
                    <dd className="mt-0.5 text-sm font-extrabold">{t(`stage.${crop.stage.id}` as Key)}</dd>
                  </div>
                  {crop.harvestDate && (
                    <div className="stat col-span-2">
                      <dt className="stat-label">{t('fd.harvest')}</dt>
                      <dd className="mt-0.5 text-sm font-extrabold">
                        {fmtLong(crop.harvestDate)} · {t('status.daysLeft', { n: crop.daysToHarvest ?? '—' })}
                      </dd>
                    </div>
                  )}
                </>
              )
            )}
          </dl>
        ) : (
          <div className="stat">
            <p className="stat-label">{t('fd.recommended')}</p>
            <p className="mt-0.5 text-sm font-extrabold">{fmtLong(recommendSowing(climatology, farm.variety, today).best.sowDate)}</p>
          </div>
        )}
        {farm.season && (
          <p className="text-xs text-tierra-600">{t('lands.nextSeason', { sow: L(farm.season.sow), harvest: L(farm.season.harvest) })}</p>
        )}
      </section>

      {/* Clima */}
      <section className="card space-y-3">
        <h2 className="text-lg font-extrabold">🌦️ {t('fd.climate')}</h2>
        {loading && !climatology ? (
          <Skeleton className="h-24" />
        ) : (
          <>
            {annualMean !== null && annualRain !== null && (
              <div className="grid grid-cols-2 gap-2">
                <div className="stat">
                  <p className="stat-label">{t('fd.annualMean')}</p>
                  <p className="stat-value">{annualMean.toFixed(1)}°C</p>
                </div>
                <div className="stat">
                  <p className="stat-label">{t('fd.annualRain')}</p>
                  <p className="stat-value">{Math.round(annualRain)} mm</p>
                </div>
              </div>
            )}
            {forecast && (
              <div>
                <p className="mb-2 text-xs font-bold text-tierra-600">{t('wx.next7')}</p>
                <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                  {forecast.days.map((d, i) => {
                    const icon = weatherIcon(d.code)
                    return (
                      <div key={d.date} className="w-[4.2rem] shrink-0 rounded-2xl bg-tierra-50 p-2 text-center text-xs">
                        <p className="font-bold">{i === 0 ? t('wx.today') : fmtShort(d.date)}</p>
                        <p className="text-xl" title={t(`wx.${icon.key}` as Key)}>
                          {icon.emoji}
                        </p>
                        <p className="font-bold">
                          {Math.round(d.tMax)}° <span className={d.tMin <= 0 ? 'text-blue-700' : 'text-tierra-500'}>{Math.round(d.tMin)}°</span>
                        </p>
                        {d.rainMm >= 0.5 && <p className="text-[10px] text-noche-500">💧{d.rainMm.toFixed(0)} mm</p>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Productos */}
      <section className="card space-y-2">
        <h2 className="text-lg font-extrabold">🧺 {t('fd.products')}</h2>
        {farm.products?.length ? (
          <ul className="space-y-1.5">
            {farm.products.map((p) => (
              <li key={p.name.en} className="flex items-center justify-between rounded-2xl bg-tierra-50 px-3 py-2 text-sm">
                <span className="font-bold">{L(p.name)}</span>
                {p.estimatedYield !== undefined && (
                  <span className="text-xs text-tierra-600">{t('fd.estimated', { n: p.estimatedYield.toLocaleString(), unit: p.unit })}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-tierra-600">{t('fd.noProducts')}</p>
        )}
        <p className="text-xs text-tierra-600">
          📦 {t('fd.window')}: <strong>{L(farm.harvestWindow)}</strong>
        </p>
      </section>

      {/* Ganado y equipo */}
      {(farm.cattle !== undefined || farm.staff?.length) && (
        <section className="card space-y-3">
          {farm.cattle !== undefined && (
            <p className="text-sm">
              🐄 <strong>{t('fd.cattle')}:</strong> {t('fd.cattleN', { n: farm.cattle })}
            </p>
          )}
          {farm.staff?.length ? (
            <div>
              <h2 className="mb-1.5 text-sm font-extrabold">👥 {t('fd.staff')}</h2>
              <ul className="space-y-1">
                {farm.staff.map((s) => (
                  <li key={s.name} className="flex justify-between text-sm">
                    <span className="font-bold">{s.name}</span>
                    <span className="text-tierra-600">{L(s.role)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}

      <section className="card space-y-1">
        <h2 className="text-sm font-extrabold">ℹ️ {t('fd.info')}</h2>
        <p className="text-sm text-tierra-800">{L(farm.note)}</p>
      </section>

      <button onClick={activate} className="btn-primary w-full">
        {t('fd.activate')} <IconArrow size={18} />
      </button>

      <Attribution />
    </div>
  )
}
