import { Link } from 'react-router-dom'
import { useI18n, type Key } from '@/i18n'
import { useMyFarms } from '@/lib/farms/myFarms'
import { NEXT_CROPS } from '@/lib/rotation/nextCrop'
import { IconArrow } from '@/components/common'

/** "Mis chacras": las chacras reales del agricultor (arriba de las de ejemplo). */
export function MyFarmsSection() {
  const { t } = useI18n()
  const { farms } = useMyFarms()

  return (
    <section className="space-y-2">
      <h2 className="font-display text-2xl text-noche-800">🌾 {t('myf.title')}</h2>
      {farms.length === 0 ? (
        <div className="card space-y-2 text-center">
          <p className="text-4xl" aria-hidden="true">
            🏡
          </p>
          <p className="font-extrabold">{t('myf.emptyTitle')}</p>
          <p className="text-sm text-tierra-700">{t('myf.emptyText')}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {farms.map((f) => (
            <li key={f.id}>
              <Link to={`/mis-chacras/${f.id}`} className="card flex items-center gap-3 p-4 ring-2 ring-inti-200">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-inti-100 text-2xl" aria-hidden="true">
                  {f.products[0] ? NEXT_CROPS[f.products[0]].emoji : '🌱'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-extrabold">{f.name}</p>
                  <p className="truncate text-xs text-tierra-600">
                    📍 {f.placeName}
                    {f.elevation != null && <> · ⛰️ {f.elevation.toLocaleString()} m</>}
                    {f.areaHa != null && <> · {f.areaHa} ha</>}
                  </p>
                  <p className="mt-0.5 truncate text-sm" aria-label={f.products.map((c) => t(`rotcrop.${c}` as Key)).join(', ')}>
                    {f.products.map((c) => NEXT_CROPS[c].emoji).join(' ')}
                  </p>
                </div>
                <IconArrow className="shrink-0 text-tierra-500" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Link to="/mis-chacras/nueva" className="btn-primary px-3 text-sm">
          ➕ {t('myf.add')}
        </Link>
        <Link to="/mapa-peru" className="btn-ghost px-3 text-sm">
          🗺️ {t('myf.mapBtn')}
        </Link>
      </div>
    </section>
  )
}
