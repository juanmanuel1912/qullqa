import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useI18n, type Key } from '@/i18n'
import { PERU_ZONES } from '@/lib/farms/peruZones'
import { zoneInfo, ZONES, type AltZone } from '@/lib/farms/indicators'
import { loadMyFarms } from '@/lib/farms/myFarms'
import { IconArrow, Notice, Skeleton } from '@/components/common'
import { NEXT_CROPS, type NextCropId } from '@/lib/rotation/nextCrop'
import { CROP_MEDIA } from '@/lib/media/gallery'
import { MediaGallery, NasaZoneImages } from '@/components/media/MediaGallery'

const PeruZonesMap = lazy(() => import('@/components/map/PeruZonesMap'))

/** Orden de los pisos de la costa a la cordillera y luego a la selva */
const ZONE_ORDER: AltZone[] = ['chala', 'yunga', 'quechua', 'suni', 'puna', 'janca', 'rupaRupa', 'omagua']

/** Productos para filtrar el mapa */
const FILTERS: NextCropId[] = ['papa', 'maiz', 'quinua', 'habas', 'palta', 'mango', 'cafe', 'cacao']

export default function PeruMapScreen() {
  const { t, L } = useI18n()
  const [params, setParams] = useSearchParams()
  const initial = params.get('producto') as NextCropId | null
  const [filter, setFilter] = useState<NextCropId | null>(initial && FILTERS.includes(initial) ? initial : null)
  const visible = useMemo(() => PERU_ZONES.filter((z) => !filter || z.products.includes(filter)), [filter])
  const [selected, setSelected] = useState<string | null>(() => visible[0]?.id ?? 'sagrado')
  const farms = useMemo(loadMyFarms, [])

  const pickFilter = (f: NextCropId | null) => {
    setFilter(f)
    const first = PERU_ZONES.find((z) => !f || z.products.includes(f))
    setSelected(f ? (first?.id ?? null) : 'sagrado')
    setParams(f ? { producto: f } : {}, { replace: true })
  }

  const zonePoints = useMemo(
    () => visible.map((z) => ({ id: z.id, lat: z.lat, lon: z.lon, label: `${z.crops[0].emoji} ${z.name}`, color: zoneInfo(z.zone).color })),
    [visible],
  )
  const farmPoints = useMemo(() => farms.map((f) => ({ id: f.id, lat: f.lat, lon: f.lon, label: f.name, color: '#d4af37' })), [farms])
  const zone = PERU_ZONES.find((z) => z.id === selected)
  const farm = farms.find((f) => f.id === selected)

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <p className="eyebrow text-inti-700">🇵🇪 {t('pmap.eyebrow')}</p>
        <h1 className="mt-1 font-display text-3xl text-noche-800">{t('pmap.title')}</h1>
        <p className="mt-1 text-[15px] text-tierra-700">{t('pmap.subtitle')}</p>
      </header>

      {/* Filtrar por producto */}
      <div>
        <h2 className="mb-1.5 text-sm font-extrabold text-tierra-700">{t('pmap.filter')}</h2>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label={t('pmap.filter')}>
          <button role="radio" aria-checked={!filter} onClick={() => pickFilter(null)} className={`chip shrink-0 ${!filter ? 'border-noche-800 bg-noche-800 text-white' : 'border-tierra-200 bg-white text-tierra-800'}`}>
            🇵🇪 {t('pmap.all')}
          </button>
          {FILTERS.map((f) => (
            <button
              key={f}
              role="radio"
              aria-checked={filter === f}
              onClick={() => pickFilter(f)}
              className={`chip shrink-0 ${filter === f ? 'border-noche-800 bg-noche-800 text-white' : 'border-tierra-200 bg-white text-tierra-800'}`}
            >
              {NEXT_CROPS[f].emoji} {t(`rotcrop.${f}` as Key)}
            </button>
          ))}
        </div>
        {filter && <p className="mt-1 text-xs font-bold text-tierra-600">{t('pmap.filtered', { n: visible.length, crop: t(`rotcrop.${filter}` as Key) })}</p>}
      </div>

      <Suspense fallback={<Skeleton className="h-[26rem]" />}>
        <PeruZonesMap zones={zonePoints} farms={farmPoints} selected={selected} onSelect={setSelected} ariaLabel={t('pmap.title')} />
      </Suspense>
      <p className="text-xs text-tierra-600">👆 {t('pmap.tap')}</p>

      {/* Zona elegida */}
      {zone && (
        <article className="card space-y-3" aria-live="polite">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="eyebrow" style={{ color: zoneInfo(zone.zone).color }}>
                {zoneInfo(zone.zone).emoji} {t(`zone.${zone.zone}.name` as Key)} · {L(zone.region)}
              </p>
              <h2 className="font-display text-2xl leading-tight">{zone.name}</h2>
            </div>
            <span className="shrink-0 rounded-full bg-tierra-100 px-2.5 py-1 text-xs font-extrabold text-tierra-800">⛰️ {zone.altitude} m</span>
          </div>
          <p className="text-sm text-tierra-800">🌡️ {L(zone.climate)}</p>
          <div>
            <h3 className="mb-1.5 text-sm font-extrabold text-tierra-700">{t('pmap.crops')}</h3>
            <div className="flex flex-wrap gap-1.5">
              {zone.crops.map((c) => (
                <span key={c.name.en} className="chip border-green-200 bg-green-50 text-green-900">
                  {c.emoji} {L(c.name)}
                </span>
              ))}
            </div>
          </div>
          <p className="rounded-2xl bg-noche-50 p-3 text-sm text-noche-800">💡 {t(`zone.${zone.zone}.text` as Key)}</p>
          <NasaZoneImages lat={zone.lat} lon={zone.lon} name={zone.name} />
          <MediaGallery items={(filter ? [filter, ...zone.products.filter((p) => p !== filter)] : zone.products).flatMap((p) => CROP_MEDIA[p] ?? []).slice(0, 6)} />
        </article>
      )}
      {farm && (
        <Link to={`/mis-chacras/${farm.id}`} className="card flex items-center gap-3 ring-2 ring-inti-300">
          <span className="text-3xl" aria-hidden="true">
            ⭐
          </span>
          <div className="flex-1">
            <p className="font-display text-lg leading-tight">{farm.name}</p>
            <p className="text-sm text-tierra-700">{t('pmap.openFarm')}</p>
          </div>
          <IconArrow className="shrink-0 text-tierra-500" />
        </Link>
      )}

      {/* Pisos ecológicos */}
      <section className="card space-y-3">
        <div>
          <h2 className="text-lg font-extrabold">⛰️ {t('pmap.zonesTitle')}</h2>
          <p className="text-sm text-tierra-700">{t('pmap.zonesText')}</p>
        </div>
        <ul className="space-y-2">
          {ZONE_ORDER.map((id) => {
            const z = ZONES.find((x) => x.id === id)!
            return (
              <li key={id} className="flex gap-3 rounded-2xl bg-tierra-50 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: `${z.color}33` }} aria-hidden="true">
                  {z.emoji}
                </span>
                <div className="min-w-0">
                  <p className="font-extrabold">
                    {t(`zone.${id}.name` as Key)} <span className="text-xs font-bold text-tierra-500">· {z.range[0].toLocaleString()}–{z.range[1].toLocaleString()} m</span>
                  </p>
                  <p className="text-xs text-tierra-800">{t(`zone.${id}.text` as Key)}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <Link to="/mis-chacras/nueva" className="btn-primary w-full">
        ➕ {t('myf.add')}
      </Link>
      <Notice tone="info">{t('pmap.note')}</Notice>
      <p className="text-center text-xs text-tierra-500">{t('pmap.source')}</p>
    </div>
  )
}
