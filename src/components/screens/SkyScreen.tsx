import { useMemo, useState } from 'react'
import { useQullqa } from '@/context/QullqaContext'
import { incaDawn, nightWindow, stellariumUrl } from '@/lib/sky/pleiades'
import { Attribution, Pleiades, Starfield } from '@/components/common'
import { SceneStars } from '@/components/incas/IncaScenes'

/** Imágenes reales de las Pléyades tomadas por misiones de la NASA (guardadas en /public/sky). */
const NASA_VIEWS = [
  { id: 'PIA09263', who: 'Telescopio Spitzer', text: 'En luz infrarroja, el polvo que rodea a las Siete Hermanas.' },
  { id: 'PIA13121', who: 'Explorador WISE', text: 'Un cúmulo de estrellas jóvenes que viajan juntas por la galaxia.' },
  { id: 'PIA09262', who: 'Telescopio Spitzer', text: 'Las Pléyades "rosadas": nubes de polvo iluminadas por las estrellas.' },
  { id: 'PIA11482', who: 'Nave Cassini, desde Saturno', text: 'Cassini hizo una pausa en Saturno para mirar las mismas estrellas.' },
  { id: 'PIA06339', who: 'Desde la superficie de Marte', text: 'Las Pléyades junto a Fobos y Deimos, las lunas de Marte. ¡Las mismas Qullqa!' },
]

const timeFmt = (d: Date) => d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

export default function SkyScreen() {
  const { profile, climatology } = useQullqa()
  const [mode, setMode] = useState<'inca' | 'now'>('inca')
  const [zoom, setZoom] = useState<string | null>(null)

  const tonight = useMemo(() => {
    const from = new Date()
    from.setHours(17, 0, 0, 0) // desde la tarde de hoy
    return nightWindow(from, profile.lat, profile.lon)
  }, [profile.lat, profile.lon])

  const now = new Date()
  const juneYear = now.getMonth() > 5 ? now.getFullYear() + 1 : now.getFullYear()
  const skyUrl = stellariumUrl(
    profile.lat,
    profile.lon,
    climatology?.elevation ?? null,
    mode === 'inca' ? incaDawn(juneYear, profile.lon) : undefined,
  )
  const month = now.getMonth()

  return (
    <div className="relative -mx-4 -mb-28 -mt-4 min-h-[calc(100vh-3.5rem)] space-y-4 overflow-hidden bg-noche-800 px-4 pb-28 pt-6 text-white">
      <Starfield className="opacity-60" />

      <header className="relative">
        <p className="eyebrow text-inti-300">Telescopio Qullqa</p>
        <h1 className="mt-1 font-display text-3xl">Mira el cielo como los incas</h1>
        <p className="mt-1 text-[15px] text-noche-100">
          Busca siete estrellitas juntas: son las Qullqa. Los incas las miraban con sus ojos; hoy también con los telescopios de la NASA.
        </p>
      </header>

      {/* Esta noche */}
      <section className="relative flex gap-4 rounded-3xl bg-noche-700/90 p-5 ring-1 ring-noche-500">
        <Pleiades className="h-14 w-20 shrink-0" />
        <div>
          <p className="eyebrow text-inti-300">Esta noche en {profile.placeName}</p>
          {tonight ? (
            <>
              <p className="mt-1 text-lg font-extrabold leading-snug">
                Se ven de {timeFmt(tonight.start)} a {timeFmt(tonight.end)}
              </p>
              <p className="mt-1 text-sm text-noche-100">
                Aparecen por el {tonight.startDirection}. Lo más alto a las {timeFmt(tonight.best)}, mirando al {tonight.bestDirection} ({Math.round(tonight.bestAlt)}° sobre el horizonte).
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-noche-100">
              Hoy no se ven de noche: están detrás del Sol. Los incas esperaban su regreso al amanecer de junio.
            </p>
          )}
          {month === 5 && <p className="mt-2 text-sm font-bold text-inti-300">¡Es junio! El mes en que los incas las observaban al amanecer.</p>}
          {(month === 10 || month === 9) && tonight && (
            <p className="mt-2 text-sm font-bold text-green-300">Brillan casi toda la noche: tiempo de siembra en los Andes.</p>
          )}
        </div>
      </section>

      {/* Planetario en vivo */}
      <section className="relative overflow-hidden rounded-3xl bg-noche-900 ring-1 ring-noche-500">
        <div className="grid grid-cols-2 gap-1 p-1.5" role="tablist">
          {(
            [
              ['inca', '🌄 Amanecer del Inti Raymi'],
              ['now', '🌙 Ahora mismo'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              role="tab"
              aria-selected={mode === k}
              onClick={() => setMode(k)}
              className={`min-h-[44px] rounded-2xl text-sm font-bold transition ${mode === k ? 'bg-inti text-noche-800' : 'text-noche-100'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="px-4 pb-2 text-xs text-noche-200">
          Cierra la ficha de <strong>Alcíone</strong> (✕) para ver el cielo. Arrastra para mirar alrededor.
        </p>
        <iframe
          key={skyUrl}
          src={skyUrl}
          title="Planetario: las Pléyades desde tu chacra"
          className="h-[420px] w-full border-0"
          loading="lazy"
          allow="fullscreen"
        />
        <div className="flex items-center justify-between gap-2 p-3 text-xs text-noche-200">
          <span>
            {mode === 'inca' ? 'Cielo del 20 de junio, 5:15 a. m., desde tu chacra.' : 'El cielo de ahora sobre tu chacra.'} Planetario Stellarium Web.
          </span>
          <a href={skyUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 font-bold text-inti-300 underline">
            Pantalla completa
          </a>
        </div>
      </section>

      {/* Lo que ven los telescopios de la NASA */}
      <section className="relative space-y-3">
        <h2 className="text-lg font-extrabold">Las Qullqa vistas por la NASA</h2>
        <div className="grid grid-cols-2 gap-2">
          {NASA_VIEWS.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setZoom(v.id)}
              className={`overflow-hidden rounded-2xl bg-noche-700 text-left ring-1 ring-noche-500 ${i === 0 ? 'col-span-2' : ''}`}
            >
              <img src={`/sky/${v.id}.jpg`} alt={`Pléyades: ${v.who}`} loading="lazy" className={`w-full object-cover ${i === 0 ? 'h-48' : 'h-28'}`} />
              <span className="block p-3">
                <span className="block text-sm font-extrabold">{v.who}</span>
                <span className="mt-0.5 block text-xs text-noche-200">{v.text}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Ciencia */}
      <section className="relative overflow-hidden rounded-3xl bg-white text-noche-800">
        <SceneStars />
        <div className="space-y-2 p-5">
          <p className="eyebrow text-inti-700">La ciencia les dio la razón</p>
          <p className="text-[15px] leading-relaxed text-tierra-900">
            En el año 2000, científicos publicaron en la revista <em>Nature</em> que el brillo de las Pléyades en junio depende de nubes
            muy altas que aparecen en los años de El Niño, cuando llueve menos en los Andes. Si las Qullqa se veían opacas, los
            agricultores retrasaban la siembra. ¡Era un pronóstico del clima!
          </p>
        </div>
      </section>

      {/* Más de la NASA */}
      <section className="relative grid gap-2">
        <a href="https://science.nasa.gov/skywatching/whats-up/" target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-noche-700/90 p-4 ring-1 ring-noche-500">
          <span className="block font-extrabold">🗓️ ¿Qué ver en el cielo este mes?</span>
          <span className="text-sm text-noche-200">Guía mensual de la NASA para mirar el cielo</span>
        </a>
        <a href="https://eyes.nasa.gov/apps/solar-system/" target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-noche-700/90 p-4 ring-1 ring-noche-500">
          <span className="block font-extrabold">🪐 Viaja por el sistema solar en 3D</span>
          <span className="text-sm text-noche-200">NASA Eyes on the Solar System</span>
        </a>
      </section>

      <div className="relative">
        <Attribution dark />
      </div>

      {/* Imagen ampliada */}
      {zoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setZoom(null)} role="dialog" aria-modal="true">
          <figure className="max-w-md">
            <img src={`/sky/${zoom}.jpg`} alt="" className="max-h-[75vh] w-full rounded-2xl object-contain" />
            <figcaption className="mt-3 text-center text-sm text-noche-100">
              {NASA_VIEWS.find((v) => v.id === zoom)?.who} · NASA/JPL · {zoom}
              <span className="mt-1 block text-xs text-noche-300">Toca para cerrar</span>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  )
}
