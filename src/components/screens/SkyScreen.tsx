import { useMemo, useState } from 'react'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import { incaDawn, nightWindow, stellariumUrl } from '@/lib/sky/pleiades'
import { Attribution, Pleiades, Starfield } from '@/components/common'
import { SceneStars } from '@/components/incas/IncaScenes'

/** Imágenes reales de las Pléyades tomadas por misiones de la NASA (guardadas en /public/sky). */
const NASA_VIEWS = ['PIA09263', 'PIA13121', 'PIA09262', 'PIA11482', 'PIA06339']

export default function SkyScreen() {
  const { profile, climatology } = useQullqa()
  const { t, fmtTime } = useI18n()
  const who = (id: string) => t(`sky.view.${id}.who` as Key)
  const dir = (d: string) => t(`dir.${d}` as Key)
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
        <p className="eyebrow text-inti-300">{t('sky.kicker')}</p>
        <h1 className="mt-1 font-display text-3xl">{t('sky.title')}</h1>
        <p className="mt-1 text-[15px] text-noche-100">{t('sky.subtitle')}</p>
      </header>

      {/* Esta noche */}
      <section className="relative flex gap-4 rounded-3xl bg-noche-700/90 p-5 ring-1 ring-noche-500">
        <Pleiades className="h-14 w-20 shrink-0" />
        <div>
          <p className="eyebrow text-inti-300">{t('sky.tonight', { place: profile.placeName })}</p>
          {tonight ? (
            <>
              <p className="mt-1 text-lg font-extrabold leading-snug">
                {t('sky.visible', { a: fmtTime(tonight.start), b: fmtTime(tonight.end) })}
              </p>
              <p className="mt-1 text-sm text-noche-100">
                {t('sky.where', {
                  dir: dir(tonight.startDirection),
                  t: fmtTime(tonight.best),
                  dir2: dir(tonight.bestDirection),
                  alt: Math.round(tonight.bestAlt),
                })}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-noche-100">{t('sky.notVisible')}</p>
          )}
          {month === 5 && <p className="mt-2 text-sm font-bold text-inti-300">{t('sky.june')}</p>}
          {(month === 10 || month === 9) && tonight && (
            <p className="mt-2 text-sm font-bold text-green-300">{t('sky.sowingTime')}</p>
          )}
        </div>
      </section>

      {/* Planetario en vivo */}
      <section className="relative overflow-hidden rounded-3xl bg-noche-900 ring-1 ring-noche-500">
        <div className="grid grid-cols-2 gap-1 p-1.5" role="tablist">
          {(
            [
              ['inca', t('sky.modeInca')],
              ['now', t('sky.modeNow')],
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
          {t('sky.closeCard')}
        </p>
        <iframe
          key={skyUrl}
          src={skyUrl}
          title={t('sky.iframe')}
          className="h-[420px] w-full border-0"
          loading="lazy"
          allow="fullscreen"
        />
        <div className="flex items-center justify-between gap-2 p-3 text-xs text-noche-200">
          <span>
            {mode === 'inca' ? t('sky.captionInca') : t('sky.captionNow')} {t('sky.planetarium')}
          </span>
          <a href={skyUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 font-bold text-inti-300 underline">
            {t('sky.fullscreen')}
          </a>
        </div>
      </section>

      {/* Lo que ven los telescopios de la NASA */}
      <section className="relative space-y-3">
        <h2 className="text-lg font-extrabold">{t('sky.nasaViews')}</h2>
        <div className="grid grid-cols-2 gap-2">
          {NASA_VIEWS.map((id, i) => (
            <button
              key={id}
              onClick={() => setZoom(id)}
              className={`overflow-hidden rounded-2xl bg-noche-700 text-left ring-1 ring-noche-500 ${i === 0 ? 'col-span-2' : ''}`}
            >
              <img src={`/sky/${id}.jpg`} alt={who(id)} loading="lazy" className={`w-full object-cover ${i === 0 ? 'h-48' : 'h-28'}`} />
              <span className="block p-3">
                <span className="block text-sm font-extrabold">{who(id)}</span>
                <span className="mt-0.5 block text-xs text-noche-200">{t(`sky.view.${id}.text` as Key)}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Ciencia */}
      <section className="relative overflow-hidden rounded-3xl bg-white text-noche-800">
        <SceneStars />
        <div className="space-y-2 p-5">
          <p className="eyebrow text-inti-700">{t('sky.scienceKicker')}</p>
          <p className="text-[15px] leading-relaxed text-tierra-900">{t('sky.science')}</p>
        </div>
      </section>

      {/* Más de la NASA */}
      <section className="relative grid gap-2">
        <a href="https://science.nasa.gov/skywatching/whats-up/" target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-noche-700/90 p-4 ring-1 ring-noche-500">
          <span className="block font-extrabold">{t('sky.whatsUp')}</span>
          <span className="text-sm text-noche-200">{t('sky.whatsUpSub')}</span>
        </a>
        <a href="https://eyes.nasa.gov/apps/solar-system/" target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-noche-700/90 p-4 ring-1 ring-noche-500">
          <span className="block font-extrabold">{t('sky.eyes')}</span>
          <span className="text-sm text-noche-200">{t('sky.eyesSub')}</span>
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
              {who(zoom)} · NASA/JPL · {zoom}
              <span className="mt-1 block text-xs text-noche-300">{t('sky.tapClose')}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  )
}
