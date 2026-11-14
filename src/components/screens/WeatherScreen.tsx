import { Link } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import { VARIETIES } from '@/lib/agro'
import { altitudeZone, zoneInfo } from '@/lib/farms/indicators'
import { weatherIcon } from '@/services/weather/openMeteo'
import { Attribution, IconArrow, Notice, Skeleton, Starfield } from '@/components/common'

const ACTION_STYLE: Record<string, string> = {
  frost: 'bg-blue-100 text-blue-800',
  heavyRain: 'bg-noche-100 text-noche-700',
  irrigate: 'bg-inti-200 text-inti-900',
  noIrrigate: 'bg-green-100 text-green-800',
  ok: 'text-tierra-400',
}

export default function WeatherScreen() {
  const { profile, forecast, forecastLoading, weekPlan, sowing, crop, climatology } = useQullqa()
  const { t, lang, month, fmtLong, list } = useI18n()
  const locale = lang === 'en' ? 'en-US' : 'es-PE'

  const dayName = (iso: string, i: number) => {
    if (i === 0) return t('wx.today')
    if (i === 1) return t('wx.tomorrow')
    return new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale, { weekday: 'short', timeZone: 'UTC' })
  }
  const shortDay = (iso: string) =>
    new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale, { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' })
  const days = (isos: string[]) => list(isos.map(shortDay))

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <p className="eyebrow text-inti-700">{profile.placeName}</p>
        <h1 className="mt-1 font-display text-3xl text-noche-800">{t('wx.title')}</h1>
        <p className="mt-1 text-[15px] text-tierra-700">{t('wx.subtitle')}</p>
      </header>

      {forecastLoading && !forecast && <Skeleton className="h-48" />}
      {!forecastLoading && !forecast && <Notice tone="warning">{t('wx.noForecast')}</Notice>}

      {forecast && weekPlan && (
        <>
          {/* Ahora */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-noche-700 to-noche-800 p-5 text-white shadow-card">
            {!forecast.current.isDay && <Starfield className="opacity-60" />}
            <div className="relative flex items-center justify-between">
              <div>
                <p className="eyebrow text-inti-300">{t('wx.now')}</p>
                <p className="font-display text-6xl leading-none">{Math.round(forecast.current.tempC)}°</p>
                <p className="mt-1 font-bold">{t(`wx.${weatherIcon(forecast.current.code, forecast.current.isDay).key}` as Key)}</p>
              </div>
              <span className="text-7xl" aria-hidden="true">
                {weatherIcon(forecast.current.code, forecast.current.isDay).emoji}
              </span>
            </div>
            <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                [t('wx.humidity'), `${Math.round(forecast.current.humidity)}%`],
                [t('wx.wind'), `${Math.round(forecast.current.windKmh)} km/h`],
                [t('wx.rainToday'), `${forecast.days[0]?.rainMm.toFixed(1) ?? 0} mm`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-noche-600/80 p-2.5">
                  <p className="text-[11px] font-bold text-noche-200">{label}</p>
                  <p className="text-lg font-extrabold">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Altura y piso ecológico del lugar */}
          <AltitudeCard elevation={forecast.elevation ?? climatology?.elevation ?? null} annualRain={climatology ? climatology.months.reduce((s, m) => s + m.precipMmMonth, 0) : 800} />

          {/* Qué hacer */}
          <section className="card space-y-2">
            <h2 className="text-lg font-extrabold">{t('wx.todo')}</h2>
            <ul className="space-y-2 text-[15px]">
              {weekPlan.frostDays.length > 0 && <li className="rounded-2xl bg-blue-50 p-3 text-blue-900">{t('wx.frost', { days: days(weekPlan.frostDays) })}</li>}
              {weekPlan.heavyRainDays.length > 0 && (
                <li className="rounded-2xl bg-noche-50 p-3 text-noche-800">{t('wx.heavyRain', { days: days(weekPlan.heavyRainDays) })}</li>
              )}
              {weekPlan.irrigateOn.length > 0 ? (
                <li className="rounded-2xl bg-inti-50 p-3 text-inti-900">{t('wx.irrigateOn', { days: days(weekPlan.irrigateOn) })}</li>
              ) : (
                <li className="rounded-2xl bg-green-50 p-3 text-green-900">{t('wx.noIrrigate')}</li>
              )}
              {weekPlan.frostDays.length === 0 && weekPlan.heavyRainDays.length === 0 && (
                <li className="rounded-2xl bg-green-50 p-3 text-green-900">{t('wx.calm')}</li>
              )}
            </ul>
            {weekPlan.normalRain !== null && (
              <p className="pt-1 text-sm text-tierra-700">
                {/* Solo lluvia: la temperatura del pronóstico (altitud del pueblo) no es comparable con la celda NASA (altitud media). */}
                {t('wx.vsNormal', { rain: weekPlan.weekRain, normal: weekPlan.normalRain })}
              </p>
            )}
          </section>

          {/* 7 días */}
          <section className="card">
            <h2 className="mb-3 text-lg font-extrabold">{t('wx.next7')}</h2>
            <ul className="divide-y divide-tierra-100">
              {forecast.days.map((d, i) => {
                const icon = weatherIcon(d.code)
                const action = weekPlan.days[i]?.action ?? 'ok'
                return (
                  <li key={d.date} className="flex items-center gap-2 py-2.5">
                    <span className="w-16 shrink-0 text-sm font-bold capitalize">{dayName(d.date, i)}</span>
                    <span className="text-2xl" title={t(`wx.${icon.key}` as Key)} aria-label={t(`wx.${icon.key}` as Key)}>
                      {icon.emoji}
                    </span>
                    <span className="w-14 shrink-0 text-xs font-bold text-noche-500">
                      {d.rainProb > 0 ? `💧${Math.round(d.rainProb)}%` : ''}
                      {d.rainMm >= 0.5 && <span className="block text-[10px] text-tierra-500">{d.rainMm.toFixed(0)} mm</span>}
                    </span>
                    <span className="flex-1 text-right text-sm">
                      <strong>{Math.round(d.tMax)}°</strong> <span className={d.tMin <= 0 ? 'font-bold text-blue-700' : 'text-tierra-500'}>{Math.round(d.tMin)}°</span>
                    </span>
                    <span className={`w-[76px] shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-bold ${ACTION_STYLE[action]}`}>
                      {t(`wx.action.${action}` as Key)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      )}

      {/* Temporada (NASA) */}
      {sowing && (
        <section className="card space-y-2">
          <h2 className="text-lg font-extrabold">{t('wx.season')}</h2>
          {crop ? (
            <p className="text-[15px]">
              {t('wx.cropNow', {
                variety: VARIETIES[profile.variety].name,
                stage: t(`stage.${crop.stage.id}` as Key),
                n: crop.daysToHarvest ?? '—',
              })}
            </p>
          ) : (
            <>
              <p className="text-[15px]">{t('wx.sowWindow', { months: list(sowing.window.map((w) => month(w.month))) })}</p>
              {sowing.daysUntil === 0 && sowing.best.harvestDate && (
                <p className="text-[15px] text-tierra-700">{t('wx.harvestAround', { date: fmtLong(sowing.best.harvestDate) })}</p>
              )}
            </>
          )}
        </section>
      )}

      {/* Noticias */}
      <section className="space-y-2">
        <h2 className="text-lg font-extrabold">{t('wx.news')}</h2>
        <Link to="/nino" className="card flex items-center gap-3 p-4 ring-2 ring-marte-400">
          <span className="text-2xl" aria-hidden="true">
            🌊
          </span>
          <span className="flex-1">
            <span className="block font-extrabold">{t('wx.ninoLink')}</span>
            <span className="text-sm text-tierra-700">{t('wx.ninoLinkSub')}</span>
          </span>
          <IconArrow size={18} className="text-tierra-400" />
        </Link>
        <Link to="/alertas" className="card flex items-center gap-3 p-4">
          <span className="text-2xl" aria-hidden="true">
            🪲
          </span>
          <span className="flex-1">
            <span className="block font-extrabold">{t('home.alertsTitle')}</span>
            <span className="text-sm text-tierra-700">{t('home.alertsText')}</span>
          </span>
          <IconArrow size={18} className="text-tierra-400" />
        </Link>
        {[
          ['https://earthobservatory.nasa.gov/', '🛰️', t('wx.newsNasa'), t('wx.newsNasaSub')],
          ['https://www.senamhi.gob.pe/', '⚠️', t('wx.newsSenamhi'), t('wx.newsSenamhiSub')],
        ].map(([href, icon, title, sub]) => (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-3 p-4">
            <span className="text-2xl" aria-hidden="true">
              {icon}
            </span>
            <span className="flex-1">
              <span className="block font-extrabold">{title}</span>
              <span className="text-sm text-tierra-700">{sub}</span>
            </span>
            <IconArrow size={18} className="text-tierra-400" />
          </a>
        ))}
      </section>

      <p className="text-center text-xs text-tierra-500">{t('wx.sources')}</p>
      <Attribution />
    </div>
  )
}

/** Altura del lugar y su región natural (piso ecológico): define qué se puede sembrar. */
function AltitudeCard({ elevation, annualRain }: { elevation: number | null; annualRain: number }) {
  const { t } = useI18n()
  if (elevation == null) return null
  const elev = Math.round(elevation)
  const zone = altitudeZone(elev, annualRain)
  const z = zoneInfo(zone)
  return (
    <section className="card space-y-2">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl" style={{ background: `${z.color}33` }} aria-hidden="true">
          {z.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-tierra-600">⛰️ {t('wx.altitude')}</p>
          <p className="text-2xl font-extrabold leading-tight text-noche-800">{elev.toLocaleString()} m</p>
          <p className="text-sm font-bold" style={{ color: z.color }}>
            {t(`zone.${zone}.name` as Key)} · {z.range[0].toLocaleString()}–{z.range[1].toLocaleString()} m
          </p>
        </div>
      </div>
      <p className="rounded-2xl bg-noche-50 p-3 text-sm text-noche-800">💡 {t(`zone.${zone}.text` as Key)}</p>
      <p className="text-xs text-tierra-700">{t('wx.altitudeWhy')}</p>
      <div className="flex flex-wrap gap-3 text-sm font-extrabold text-noche-700">
        <Link to="/rotacion" className="underline">
          🔄 {t('wx.altitudeRot')}
        </Link>
        <Link to="/mapa-peru" className="underline">
          🗺️ {t('wx.altitudeMap')}
        </Link>
      </div>
    </section>
  )
}
