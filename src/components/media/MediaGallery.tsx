import { useState } from 'react'
import { useI18n } from '@/i18n'
import { commonsFile, commonsPage, commonsThumb, nasaZoneImages, type MediaItem } from '@/lib/media/gallery'

/** Fotos y videos con licencia libre (Wikimedia Commons), con autor y licencia visibles. */
export function MediaGallery({ items, title }: { items: MediaItem[]; title?: string }) {
  const { t, L } = useI18n()
  if (items.length === 0) return null
  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-extrabold text-tierra-700">📸 {title ?? t('media.title')}</h3>
      <ul className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
        {items.map((m) => (
          <li key={m.file} className="w-60 shrink-0 snap-start overflow-hidden rounded-2xl bg-tierra-50">
            {m.kind === 'video' ? <VideoItem item={m} /> : <img src={commonsThumb(m.file, 480)} alt={L(m.caption)} loading="lazy" className="h-40 w-full object-cover" />}
            <div className="p-2">
              <p className="text-xs font-bold leading-snug text-tierra-900">{L(m.caption)}</p>
              <a href={commonsPage(m.file)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-tierra-500 underline">
                {m.author} · {m.license} · Wikimedia Commons
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** El video solo se descarga al tocar "play" (ahorra datos en el celular). */
function VideoItem({ item }: { item: MediaItem }) {
  const { t, L } = useI18n()
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <a href={commonsPage(item.file)} target="_blank" rel="noopener noreferrer" className="relative block">
        <img src={commonsThumb(item.file, 480)} alt={L(item.caption)} loading="lazy" className="h-40 w-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-extrabold text-white">▶ {t('media.openVideo')}</span>
      </a>
    )
  }
  return (
    <video
      controls
      preload="none"
      playsInline
      poster={commonsThumb(item.file, 480)}
      className="h-40 w-full bg-noche-800 object-cover"
      aria-label={L(item.caption)}
      onError={() => setFailed(true)}
    >
      <source src={commonsFile(item.file)} type="video/webm" />
    </video>
  )
}

/** La zona vista desde el espacio: relieve (Blue Marble) y verdor de la vegetación (NDVI MODIS). */
export function NasaZoneImages({ lat, lon, name }: { lat: number; lon: number; name: string }) {
  const { t } = useI18n()
  const [layer, setLayer] = useState<'relief' | 'ndvi'>('relief')
  const urls = nasaZoneImages(lat, lon)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold text-tierra-700">🛰️ {t('media.fromSpace')}</h3>
        <div className="flex rounded-full bg-tierra-100 p-0.5 text-[11px] font-extrabold" role="radiogroup" aria-label={t('media.fromSpace')}>
          {(['relief', 'ndvi'] as const).map((l) => (
            <button
              key={l}
              role="radio"
              aria-checked={layer === l}
              onClick={() => setLayer(l)}
              className={`min-h-[30px] rounded-full px-2.5 ${layer === l ? 'bg-noche-800 text-white' : 'text-tierra-700'}`}
            >
              {t(l === 'relief' ? 'media.relief' : 'media.ndvi')}
            </button>
          ))}
        </div>
      </div>
      <img src={urls[layer]} alt={`${t('media.fromSpace')}: ${name}`} loading="lazy" className="aspect-square w-full rounded-2xl bg-noche-800 object-cover" />
      <p className="text-[11px] text-tierra-600">{t(layer === 'relief' ? 'media.reliefNote' : 'media.ndviNote')}</p>
    </div>
  )
}
