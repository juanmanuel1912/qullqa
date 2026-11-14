import { Link } from 'react-router-dom'
import { CROP_MEDIA } from '@/lib/media/gallery'
import { MediaGallery } from '@/components/media/MediaGallery'
import { useI18n } from '@/i18n'
import { CROPS, type CropInfo } from '@/lib/crops/catalog'
import { Attribution, IconArrow, Notice } from '@/components/common'

/** Mini calendario de 12 meses: siembra (verde) y cosecha (dorado). */
export function SeasonBar({ crop }: { crop: CropInfo }) {
  const { t, monthShort } = useI18n()
  return (
    <div>
      <div className="grid grid-cols-12 gap-0.5" role="img" aria-label={t('crops.season')}>
        {Array.from({ length: 12 }, (_, m) => {
          const sow = crop.sowMonths.includes(m)
          const harvest = crop.harvestMonths.includes(m)
          return (
            <div key={m} className="text-center">
              <div className={`h-6 rounded ${sow ? 'bg-good' : harvest ? 'bg-inti' : 'bg-tierra-100'}`} title={monthShort(m)} />
              <span className="text-[9px] font-bold text-tierra-500">{monthShort(m).charAt(0)}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-1 flex gap-3 text-[11px] font-bold text-tierra-700">
        {crop.sowMonths.length > 0 ? (
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-good" /> {t('crops.sow')}
          </span>
        ) : (
          <span>{t('crops.perennial')}</span>
        )}
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded bg-inti" /> {t('crops.harvest')}
        </span>
      </div>
    </div>
  )
}

/** Ficha de un cultivo (vista previa). `showOpen`: botón a la sección completa si está disponible. */
export function CropCard({ crop: c, showOpen = true }: { crop: CropInfo; showOpen?: boolean }) {
  const { t, L } = useI18n()
  return (
    <article className={`card space-y-3 ${c.status === 'available' ? 'ring-2 ring-good/50' : ''}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl" style={{ background: `${c.color}33` }} aria-hidden="true">
          {c.emoji}
        </span>
        <div className="flex-1">
          <p className="text-lg font-extrabold leading-tight">{L(c.name)}</p>
          <p className="text-xs italic text-tierra-500">{c.scientific}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
              c.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-inti-100 text-inti-900'
            }`}
          >
            {c.status === 'available' ? `✓ ${t('crops.available')}` : t('crops.soon')}
          </span>
        </div>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
        <dt className="font-bold text-tierra-600">{t('crops.varieties')}</dt>
        <dd>{c.varieties}</dd>
        <dt className="font-bold text-tierra-600">{t('crops.regions')}</dt>
        <dd>
          {L(c.regions)} · {c.altitude}
        </dd>
        <dt className="font-bold text-tierra-600">{t('crops.cycle')}</dt>
        <dd>{L(c.cycle)}</dd>
        <dt className="font-bold text-tierra-600">{t('crops.uses')}</dt>
        <dd>{L(c.uses)}</dd>
      </dl>

      <div>
        <p className="mb-1 text-xs font-extrabold uppercase tracking-wider text-tierra-600">{t('crops.season')}</p>
        <SeasonBar crop={c} />
      </div>

      <p className="text-sm text-tierra-800">{L(c.note)}</p>

      {CROP_MEDIA[c.id] && <MediaGallery items={CROP_MEDIA[c.id]!} />}
      <Link to={`/mapa-peru?producto=${c.id}`} className="btn-ghost min-h-[44px] w-full text-sm">
        🗺️ {t('crops.whereMap')}
      </Link>

      {showOpen && c.status === 'available' && (
        <Link to="/papas" className="btn-primary min-h-[44px] w-full text-sm">
          {t('crops.open')} <IconArrow size={16} />
        </Link>
      )}
    </article>
  )
}

export default function CropsScreen() {
  const { t } = useI18n()
  return (
    <div className="space-y-4">
      <header className="pt-2">
        <h1 className="font-display text-3xl text-noche-800">{t('crops.title')}</h1>
        <p className="mt-1 text-[15px] text-tierra-700">{t('crops.subtitle')}</p>
      </header>

      <Notice tone="info">{t('crops.demo')}</Notice>

      {/* Lo que tendrá cada cultivo */}
      <section className="rounded-3xl bg-noche-800 p-5 text-white">
        <p className="font-display text-lg">{t('crops.features')}</p>
        <ul className="mt-2 space-y-1.5 text-sm text-noche-100">
          {(['f1', 'f2', 'f3', 'f4'] as const).map((k, i) => (
            <li key={k} className="flex gap-2">
              <span aria-hidden="true">{['📅', '📚', '🗺️', '🤝'][i]}</span>
              {t(`crops.${k}`)}
            </li>
          ))}
        </ul>
      </section>

      <ul className="space-y-3">
        {CROPS.map((c) => (
          <li key={c.id}>
            <CropCard crop={c} />
          </li>
        ))}
      </ul>

      <Attribution />
    </div>
  )
}
