import { Link } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import { IncaStory } from '@/components/incas/IncaStory'
import { Attribution, IconArrow, IconPlanet, Mountains, Pleiades, ProgressRing, Skeleton, Starfield } from '@/components/common'
import { VARIETIES } from '@/lib/agro'

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

      <StatusCard />
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
