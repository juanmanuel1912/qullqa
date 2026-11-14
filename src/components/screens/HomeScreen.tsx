import { Link } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { INCA_MONTHS, motivationFor, VARIETIES } from '@/lib/agro'
import { IncaStory } from '@/components/incas/IncaStory'
import { Attribution, IconArrow, IconPlanet, Mountains, Pleiades, ProgressRing, Skeleton, Starfield } from '@/components/common'
import { capitalize, fmtLong } from '@/utils/format'

export function HomeScreen() {
  const { profile } = useQullqa()

  return (
    <div className="space-y-4">
      {/* Portada: cielo andino con las Pléyades */}
      <section className="relative -mx-4 -mt-4 overflow-hidden bg-noche-800 px-6 pb-16 pt-8 text-white">
        <Starfield />
        <Pleiades className="absolute right-3 top-4 w-36 opacity-95" />
        <div className="relative max-w-[78%]">
          <p className="eyebrow text-inti-300">Allillanchu · Hola</p>
          <h1 className="mt-3 font-display text-[2rem] leading-[1.1]">
            Siembra mirando las estrellas
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-noche-100">
            Los incas leían las Pléyades para saber cuándo sembrar. Hoy leemos los satélites de la NASA para cuidar tu papa.
          </p>
        </div>
        <Link to={profile.onboarded ? '/calendario' : '/chacra'} className="btn-primary relative mt-6 w-full text-lg">
          {profile.onboarded ? 'Ver mi calendario' : 'Empezar'}
          <IconArrow size={20} />
        </Link>
        <Link to="/cielo" className="btn relative mt-2 w-full border-2 border-noche-400 text-white hover:bg-noche-700">
          🔭 Mira el cielo como los incas
        </Link>
        <Mountains className="absolute inset-x-0 bottom-0 h-12 w-full" />
      </section>

      <StatusCard />
      <IncaStory />
      <ApodCard />

      {/* Marte */}
      <Link to="/marte" className="relative block overflow-hidden rounded-3xl bg-gradient-to-br from-marte-700 to-noche-800 p-5 text-white shadow-card">
        <Starfield className="opacity-60" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-marte-500/40">
            <IconPlanet size={30} />
          </span>
          <div className="flex-1">
            <p className="font-display text-lg">Qullqa en Marte</p>
            <p className="text-sm text-noche-100">¿Cuánto tardaría tu papa en crecer en un invernadero marciano?</p>
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
  const variety = VARIETIES[profile.variety]

  if (climateLoading && !sowing) return <Skeleton className="h-40" />

  if (crop) {
    return (
      <Link to="/cultivo" className="card flex items-center gap-4">
        <ProgressRing value={crop.progress} size={92} stroke={10}>
          <span className="text-xl font-extrabold">{Math.round(crop.progress * 100)}%</span>
        </ProgressRing>
        <div className="flex-1">
          <p className="eyebrow text-good">Tu {variety.name} · {crop.stage.name}</p>
          <p className="mt-1 text-2xl font-extrabold leading-tight">
            {crop.daysToHarvest === 0 ? '¡Lista para cosechar!' : `Faltan ${crop.daysToHarvest} días`}
          </p>
          <p className="mt-1 text-sm text-tierra-700">{motivationFor(crop.stage.id, today)}</p>
        </div>
      </Link>
    )
  }

  if (!sowing) return null
  const best = sowing.best
  const month = INCA_MONTHS[best.month]
  return (
    <Link to="/calendario" className="card block">
      <p className="eyebrow text-good">Según la NASA para {profile.placeName}</p>
      {sowing.daysUntil === 0 ? (
        <p className="mt-2 font-display text-2xl leading-tight">¡Este mes es bueno para sembrar!</p>
      ) : (
        <p className="mt-2 font-display text-2xl leading-tight">
          Siembra en {month.spanish.toLowerCase()} <span className="text-tierra-500">· faltan {sowing.daysUntil} días</span>
        </p>
      )}
      <p className="mt-1 text-sm font-semibold text-inti-700">{month.quechua}</p>
      {best.harvestDate && (
        <p className="mt-3 text-[15px] text-tierra-800">
          Si siembras {variety.name} el {fmtLong(best.sowDate)}, cosecharías cerca del{' '}
          <strong>{fmtLong(best.harvestDate)}</strong>.
        </p>
      )}
      <p className="mt-3 flex items-center gap-1 text-sm font-bold text-noche-600">
        Ver calendario inca <IconArrow size={16} />
      </p>
    </Link>
  )
}

function ApodCard() {
  const { apod } = useQullqa()
  if (!apod) return <Skeleton className="h-64" />
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
          {apod.source === 'fallback' ? 'Imagen NASA' : 'Foto del día · NASA APOD'}
        </span>
      </div>
      <div className="space-y-1 p-5">
        <p className="font-display text-lg leading-snug">{capitalize(apod.title)}</p>
        <p className="line-clamp-3 text-sm text-noche-100">{apod.explanation}</p>
        {apod.copyright && <p className="pt-1 text-xs text-noche-300">© {apod.copyright}</p>}
      </div>
    </section>
  )
}
