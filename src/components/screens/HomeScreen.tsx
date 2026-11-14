import { Link } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import { IncaStory } from '@/components/incas/IncaStory'
import { Attribution, IconArrow, IconPlanet, Mountains, Pleiades, ProgressRing, Skeleton, Starfield } from '@/components/common'
import { VARIETIES } from '@/lib/agro'
import { weatherIcon } from '@/services/weather/openMeteo'
import { useEnso } from '@/hooks/useEnso'
import { useLocateFarm } from '@/hooks/useLocateFarm'

export function HomeScreen() {
  const { profile } = useQullqa()
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      {/* Portada: cielo andino con las Pléyades */}
      <section className="relative -mx-4 -mt-4 overflow-hidden bg-noche-800 px-6 pb-16 pt-8 text-white">
        <Starfield />
        <Pleiades className="absolute right-3 top-4 w-36 opacity-95" />
        <div className="relative max-w-[78%]">
          <p className="eyebrow text-inti-300">{t('home.greeting')}</p>
          <h1 className="mt-3 font-display text-[2rem] leading-[1.1]">{t('home.title')}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-noche-100">{t('home.subtitle')}</p>
        </div>
        <Link to={profile.onboarded ? '/calendario' : '/chacra'} className="btn-primary relative mt-6 w-full text-lg">
          {profile.onboarded ? t('home.openCalendar') : t('home.start')}
          <IconArrow size={20} />
        </Link>
        <Link to="/cielo" className="btn relative mt-2 w-full border-2 border-noche-400 text-white hover:bg-noche-700">
          {t('home.sky')}
        </Link>
        <Mountains className="absolute inset-x-0 bottom-0 h-12 w-full" />
      </section>

      {!profile.onboarded && <LocationBanner />}
      <EnsoBanner />
      <WeatherCard />
      <StatusCard />
      <Link to="/rotacion" className="card flex items-center gap-4 py-4 ring-2 ring-good/40">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-2xl" aria-hidden="true">
          🔄
        </span>
        <div className="flex-1">
          <p className="font-display text-lg leading-tight">{t('home.rotTitle')}</p>
          <p className="mt-0.5 text-sm text-tierra-700">{t('home.rotText')}</p>
        </div>
        <IconArrow className="shrink-0 text-tierra-500" />
      </Link>
      <Link to="/tierras" className="card flex items-center gap-4 py-4 ring-2 ring-inti-300">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-inti-100 text-2xl" aria-hidden="true">
          🗺️
        </span>
        <div className="flex-1">
          <p className="font-display text-lg leading-tight">{t('home.myFarmsTitle')}</p>
          <p className="mt-0.5 text-sm text-tierra-700">{t('home.myFarmsText')}</p>
        </div>
        <IconArrow className="shrink-0 text-tierra-500" />
      </Link>
      <Link to="/historial" className="card flex items-center gap-4 py-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tierra-100 text-2xl" aria-hidden="true">
          📒
        </span>
        <div className="flex-1">
          <p className="font-display text-lg leading-tight">{t('home.histTitle')}</p>
          <p className="mt-0.5 text-sm text-tierra-700">{t('home.histText')}</p>
        </div>
        <IconArrow className="shrink-0 text-tierra-500" />
      </Link>
      <Link to="/alertas" className="card flex items-center gap-4 py-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-2xl" aria-hidden="true">
          🪲
        </span>
        <div className="flex-1">
          <p className="font-display text-lg leading-tight">{t('home.alertsTitle')}</p>
          <p className="mt-0.5 text-sm text-tierra-700">{t('home.alertsText')}</p>
        </div>
        <IconArrow className="shrink-0 text-tierra-500" />
      </Link>
      <IncaStory />

      {/* Papas */}
      <Link to="/papas" className="card flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-inti-100 text-3xl" aria-hidden="true">
          🥔
        </span>
        <div className="flex-1">
          <p className="font-display text-lg leading-tight">{t('home.potatoTitle')}</p>
          <p className="mt-0.5 text-sm text-tierra-700">{t('home.potatoText')}</p>
        </div>
        <IconArrow className="shrink-0 text-tierra-500" />
      </Link>

      <Link to="/cultivos" className="card flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-2xl" aria-hidden="true">
          🌽🥑
        </span>
        <div className="flex-1">
          <p className="font-display text-lg leading-tight">{t('home.cropsTitle')}</p>
          <p className="mt-0.5 text-sm text-tierra-700">{t('home.cropsText')}</p>
        </div>
        <IconArrow className="shrink-0 text-tierra-500" />
      </Link>

      <ApodCard />

      {/* Marte */}
      <Link to="/marte" className="relative block overflow-hidden rounded-3xl bg-gradient-to-br from-marte-700 to-noche-800 p-5 text-white shadow-card">
        <Starfield className="opacity-60" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-marte-500/40">
            <IconPlanet size={30} />
          </span>
          <div className="flex-1">
            <p className="font-display text-lg">{t('home.marsTitle')}</p>
            <p className="text-sm text-noche-100">{t('home.marsText')}</p>
          </div>
          <IconArrow className="shrink-0" />
        </div>
      </Link>

      <Attribution />
    </div>
  )
}

/** Aviso de El Niño / La Niña (NOAA). Si está neutral, un acceso discreto. */
function EnsoBanner() {
  const { status } = useEnso()
  const { t } = useI18n()
  if (!status) return null
  const active = status.phase !== 'neutral' || status.coastalPhase !== 'neutral'
  if (!active) {
    return (
      <Link to="/nino" className="flex items-center justify-between rounded-2xl bg-noche-50 px-4 py-3 text-sm font-bold text-noche-700">
        🌊 {t('home.ninoInfo')} <IconArrow size={16} />
      </Link>
    )
  }
  const phase = status.phase !== 'neutral' ? status.phase : status.coastalPhase
  const strength = status.phase !== 'neutral' ? status.strength : status.coastalStrength
  return (
    <Link to="/nino" className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-marte-700 to-marte-500 p-4 text-white shadow-card">
      <span className="text-3xl" aria-hidden="true">
        {phase === 'lanina' ? '❄️' : '🌊'}
      </span>
      <div className="flex-1">
        <p className="font-extrabold leading-tight">
          ⚠️ {t('home.ninoAlert', { phase: t(`nino.phase.${phase}` as Key), strength: strength ? t(`nino.strength.${strength}` as Key) : '' })}
        </p>
        <p className="text-sm text-white/90">{t('home.ninoCta')}</p>
      </div>
      <IconArrow className="shrink-0" />
    </Link>
  )
}

/** Clima de ahora y el consejo principal de la semana. */
function WeatherCard() {
  const { profile, forecast, weekPlan } = useQullqa()
  const { t } = useI18n()
  if (!forecast || !weekPlan) return null
  const icon = weatherIcon(forecast.current.code, forecast.current.isDay)
  const tip = weekPlan.frostDays.length
    ? t('wx.action.frost')
    : weekPlan.irrigateOn.length
      ? t('wx.action.irrigate')
      : weekPlan.heavyRainDays.length
        ? t('wx.action.heavyRain')
        : null
  return (
    <Link to="/clima" className="card flex items-center gap-4 py-4">
      <span className="text-5xl" aria-hidden="true">
        {icon.emoji}
      </span>
      <div className="flex-1">
        <p className="text-xl font-extrabold">{t('home.weatherNow', { t: Math.round(forecast.current.tempC), place: profile.placeName })}</p>
        <p className="text-sm text-tierra-700">
          {t(`wx.${icon.key}` as Key)} · 💧 {Math.round(forecast.days[0]?.rainProb ?? 0)}%
          {tip && <span className="ml-1 rounded-full bg-inti-100 px-2 py-0.5 text-xs font-bold text-inti-900">{tip}</span>}
        </p>
      </div>
      <span className="flex items-center gap-1 text-sm font-bold text-noche-600">
        {t('home.weatherCta')} <IconArrow size={16} />
      </span>
    </Link>
  )
}

/** Tarjeta personalizada: qué hacer ahora según los datos de la NASA. */
function StatusCard() {
  const { profile, sowing, crop, climateLoading, today } = useQullqa()
  const { t, month, fmtLong } = useI18n()
  const variety = VARIETIES[profile.variety]

  if (climateLoading && !sowing) return <Skeleton className="h-40" />

  if (crop) {
    const pick = today.getUTCDate() % 2
    return (
      <Link to="/cultivo" className="card flex items-center gap-4">
        <ProgressRing value={crop.progress} size={92} stroke={10}>
          <span className="text-xl font-extrabold">{Math.round(crop.progress * 100)}%</span>
        </ProgressRing>
        <div className="flex-1">
          <p className="eyebrow text-good">{t('status.cropKicker', { variety: variety.name, stage: t(`stage.${crop.stage.id}` as Key) })}</p>
          <p className="mt-1 text-2xl font-extrabold leading-tight">
            {crop.daysToHarvest === 0 ? t('status.ready') : t('status.daysLeft', { n: crop.daysToHarvest ?? '—' })}
          </p>
          <p className="mt-1 text-sm text-tierra-700">{t(`motivation.${crop.stage.id}.${pick}` as Key)}</p>
        </div>
      </Link>
    )
  }

  if (!sowing) return null
  const best = sowing.best
  return (
    <Link to="/calendario" className="card block">
      <p className="eyebrow text-good">{t('status.according', { place: profile.placeName })}</p>
      {sowing.daysUntil === 0 ? (
        <p className="mt-2 font-display text-2xl leading-tight">{t('status.sowNow')}</p>
      ) : (
        <p className="mt-2 font-display text-2xl leading-tight">
          {t('status.sowIn', { month: month(best.month) })}{' '}
          <span className="text-tierra-500">· {t('status.daysLeft', { n: sowing.daysUntil })}</span>
        </p>
      )}
      {best.harvestDate && (
        <p className="mt-3 text-[15px] text-tierra-800">
          {t('status.ifSow', { variety: variety.name, sow: fmtLong(best.sowDate), harvest: fmtLong(best.harvestDate) })}
        </p>
      )}
      <p className="mt-3 flex items-center gap-1 text-sm font-bold text-noche-600">
        {t('status.viewCalendar')} <IconArrow size={16} />
      </p>
    </Link>
  )
}

function ApodCard() {
  const { apod } = useQullqa()
  const { t } = useI18n()
  if (!apod) return <Skeleton className="h-64" />
  const fallback = apod.source === 'fallback'
  return (
    <section className="overflow-hidden rounded-3xl bg-noche-800 text-white shadow-card">
      <div className="relative aspect-[4/3] bg-noche-700">
        <img
          src={apod.imageUrl}
          alt={apod.title}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/apod-fallback.jpg'
          }}
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold">
          {fallback ? t('apod.nasaImage') : t('apod.today')}
        </span>
      </div>
      <div className="space-y-1 p-5">
        <p className="font-display text-lg leading-snug">{fallback ? t('apod.fallbackTitle') : apod.title}</p>
        <p className="line-clamp-3 text-sm text-noche-100">{fallback ? t('apod.fallbackText') : apod.explanation}</p>
        {apod.copyright && <p className="pt-1 text-xs text-noche-300">© {apod.copyright}</p>}
      </div>
    </section>
  )
}

/** Aviso: la app muestra Cusco como ejemplo hasta que el agricultor elige su chacra. */
function LocationBanner() {
  const { profile } = useQullqa()
  const { t } = useI18n()
  const { status, locate } = useLocateFarm()
  return (
    <section className="card space-y-3 ring-2 ring-inti-300">
      <div className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden="true">
          📍
        </span>
        <div>
          <p className="font-display text-lg leading-tight">{t('home.loc.title', { place: profile.placeName })}</p>
          <p className="mt-0.5 text-sm text-tierra-700">{t('home.loc.text')}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => locate({ onboarded: true })} disabled={status === 'locating'} className="btn-dark px-3 text-sm">
          {status === 'locating' ? t('farm.locating') : `🛰️ ${t('home.loc.gps')}`}
        </button>
        <Link to="/chacra" className="btn-ghost px-3 text-sm">
          🔎 {t('home.loc.pick')}
        </Link>
      </div>
      {status === 'error' && <p className="text-xs font-semibold text-risk">{t('farm.gpsError')}</p>}
    </section>
  )
}
