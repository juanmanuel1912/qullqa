import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useI18n, type Key } from '@/i18n'
import { DEMO_FARMS } from '@/lib/farms/demo'
import type { Farm } from '@/lib/farms/demo'
import { fetchClimatology, fetchDaily } from '@/services/nasa'
import type { Climatology, DailyRecord } from '@/services/nasa/types'
import { fetchForecast, type Forecast } from '@/services/weather/openMeteo'
import { getCropStatus, projectDateForGdd, recommendSowing, VARIETIES } from '@/lib/agro'
import { todayUtc, addDaysIso, todayIso } from '@/utils/format'
import { Attribution, ProgressRing, Skeleton } from '@/components/common'

export default function FarmDetailScreen() {
  const { farmId } = useParams()
  const navigate = useNavigate()
  const { t, L, fmtLong: fmt } = useI18n()
  
  const farm = DEMO_FARMS.find((f: Farm) => f.id === farmId)
  const [climatology, setClimatology] = useState<Climatology | null>(null)
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [daily, setDaily] = useState<DailyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const today = todayUtc()
  const variety = farm ? VARIETIES[farm.variety] : null

  useEffect(() => {
    if (!farm) return
    const ctrl = new AbortController()
    setLoading(true)

    Promise.all([
      fetchClimatology(farm.lat, farm.lon, ctrl.signal),
      fetchForecast(farm.lat, farm.lon, ctrl.signal),
      fetchDaily(
        farm.lat,
        farm.lon,
        new Date(`${addDaysIso(todayIso(), -35)}T00:00:00Z`),
        new Date(`${todayIso()}T00:00:00Z`),
        ctrl.signal
      ),
    ])
      .then(([clim, fore, daily_data]) => {
        setClimatology(clim)
        setForecast(fore)
        setDaily(daily_data.days)
      })
      .catch(() => undefined)
      .finally(() => setLoading(false))

    return () => ctrl.abort()
  }, [farm?.id])

  if (!farm) return <div className="p-4">{t('error.title')}</div>

  let cropStatus = null
  let ring = null
  if (climatology && farm.plantingDate && variety) {
    const sow = new Date(`${farm.plantingDate}T00:00:00Z`)
    const harvest = projectDateForGdd(sow, 0, variety.gddToHarvest, climatology)
    if (harvest && harvest > today) {
      cropStatus = getCropStatus({ sowingDate: sow, variety: farm.variety, climatology, daily, today })
      ring = cropStatus.progress
    }
  }

  const next7Days = forecast?.days.slice(0, 7) ?? []

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 -mx-4 bg-gradient-to-b from-noche-800 to-noche-700 px-4 pt-2 text-white">
        <button onClick={() => navigate('/tierras')} className="text-inti-300 font-bold text-sm mb-2">
          ← {t('alerts.back')}
        </button>
        <h1 className="text-3xl font-display font-bold">{farm.name}</h1>
        <p className="text-sm text-inti-200">{farm.place}, {L(farm.country)}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 px-4 mt-4">
        <div className="stat">
          <p className="stat-value">{farm.areaHa}</p>
          <p className="stat-label">ha</p>
        </div>
        <div className="stat">
          <p className="stat-value">{farm.areaHa > 5 ? '🚜' : '🥾'}</p>
          <p className="stat-label text-xs">{variety?.name}</p>
        </div>
        {ring !== null && (
          <div className="stat flex flex-col items-center">
            <ProgressRing value={ring} size={48} stroke={6}>
              <span className="text-xs font-extrabold">{Math.round(ring * 100)}%</span>
            </ProgressRing>
          </div>
        )}
      </div>

      <div className="px-4 space-y-4">
        {/* 1. Productos */}
        <section className="card space-y-3">
          <h2 className="text-lg font-extrabold flex items-center gap-2">🥔 Productos</h2>
          {farm.products && farm.products.length > 0 ? (
            <ul className="space-y-2">
              {farm.products.map((p: any, i: number) => (
                <li key={i} className="flex justify-between items-center p-2 bg-tierra-50 rounded-lg">
                  <div>
                    <p className="font-bold text-sm">{p.name}</p>
                    {p.estimatedYield && (
                      <p className="text-xs text-tierra-600">
                        Est. {p.estimatedYield} {p.unit}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-tierra-600">Sin productos registrados</p>
          )}
        </section>

        {/* 2. Clima */}
        <section className="card space-y-3">
          <h2 className="text-lg font-extrabold flex items-center gap-2">🌦️ Clima</h2>
          {loading ? (
            <Skeleton className="h-24" />
          ) : climatology ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs font-bold text-blue-700">Promedio anual</p>
                  <p className="text-xl font-bold text-blue-900">
                    {Math.round(climatology.months.reduce((sum, m) => sum + m.t2m, 0) / climatology.months.length)}°C
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs font-bold text-green-700">Lluvia anual</p>
                  <p className="text-xl font-bold text-green-900">
                    {Math.round(climatology.months.reduce((sum, m) => sum + m.precipMmMonth, 0))} mm
                  </p>
                </div>
              </div>

              {/* 7-day forecast */}
              {next7Days.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-tierra-600">Pronóstico 7 días</p>
                  <div className="flex gap-1 overflow-x-auto pb-2">
                    {next7Days.map((day: any, i: number) => {
                      const icon =
                        day.code === 0 || day.code === 1 ? '☀️' :
                        day.code === 2 || day.code === 3 ? '⛅' :
                        day.code === 45 || day.code === 48 ? '🌫️' :
                        day.code >= 50 && day.code < 70 ? '🌧️' :
                        day.code >= 70 && day.code < 90 ? '❄️' :
                        day.code >= 80 && day.code < 83 ? '🌧️' :
                        day.code >= 85 ? '⛈️' : '🌤️'
                      return (
                        <div
                          key={i}
                          className="flex-shrink-0 w-16 rounded-lg bg-white border border-sky-200 p-2 text-center text-xs"
                        >
                          <p className="font-bold text-sky-900">{i === 0 ? 'Hoy' : `+${i}d`}</p>
                          <p className="text-lg mt-1">{icon}</p>
                          <p className="text-xs font-semibold text-sky-800">
                            {Math.round(day.tMax)}° / {Math.round(day.tMin)}°
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-tierra-600">{t('loading')}</p>
          )}
        </section>

        {/* 3. Siembra & Cosecha */}
        {climatology && (
          <section className="card space-y-3">
            <h2 className="text-lg font-extrabold flex items-center gap-2">📅 Siembra & Cosecha</h2>
            <div className="space-y-2">
              {farm.plantingDate ? (
                <>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs font-bold text-green-700">Sembrada</p>
                    <p className="text-sm font-bold text-green-900">{fmt(new Date(`${farm.plantingDate}T00:00:00Z`))}</p>
                  </div>
                  {cropStatus && (
                    <>
                      <div className="bg-sky-50 p-3 rounded-lg">
                        <p className="text-xs font-bold text-sky-700">Etapa actual</p>
                        <p className="text-sm font-bold text-sky-900">{t(`stage.${cropStatus.stage.id}` as Key)}</p>
                      </div>
                      {cropStatus.harvestDate && (
                        <div className="bg-amber-50 p-3 rounded-lg">
                          <p className="text-xs font-bold text-amber-700">Cosecha estimada</p>
                          <p className="text-sm font-bold text-amber-900">{fmt(cropStatus.harvestDate)}</p>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-tierra-600">Aún no sembrada</p>
                  {variety && (
                    <div className="bg-inti-50 p-3 rounded-lg">
                      <p className="text-xs font-bold text-inti-700">Siembra recomendada</p>
                      <p className="text-sm font-bold text-inti-900">
                        {fmt(recommendSowing(climatology, farm.variety, today).best.sowDate)}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {/* 4. Ganado */}
        {farm.cattle !== undefined && (
          <section className="card space-y-3">
            <h2 className="text-lg font-extrabold flex items-center gap-2">🐄 Ganadería</h2>
            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-sm font-bold text-amber-900">{farm.cattle} vacunos</p>
            </div>
          </section>
        )}

        {/* 5. Personal */}
        {farm.staff && farm.staff.length > 0 && (
          <section className="card space-y-3">
            <h2 className="text-lg font-extrabold flex items-center gap-2">👥 Personal a cargo</h2>
            <ul className="space-y-2">
              {farm.staff.map((p: any, i: number) => (
                <li key={i} className="flex justify-between p-2 bg-tierra-50 rounded-lg">
                  <div>
                    <p className="font-bold text-sm">{p.name}</p>
                    <p className="text-xs text-tierra-600">{p.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 6. Información adicional */}
        {farm.note && (
          <section className="card space-y-3">
            <h2 className="text-lg font-extrabold flex items-center gap-2">ℹ️ Información</h2>
            <p className="text-sm text-tierra-700">{L(farm.note)}</p>
          </section>
        )}

        {/* 7. Ventana de cosecha */}
        <section className="card space-y-3">
          <h2 className="text-lg font-extrabold flex items-center gap-2">📦 Ventana de cosecha</h2>
          <p className="text-sm font-bold text-noche-800">{L(farm.harvestWindow)}</p>
        </section>
      </div>

      <Attribution />
    </div>
  )
}
