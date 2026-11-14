import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { VARIETIES } from '@/lib/agro'
import { DEMO_FARMER, DEMO_FARMS } from '@/lib/farms/demo'
import { Attribution, IconArrow, IconPin, Mountains, Notice, ShareButtons, Starfield } from '@/components/common'
import { MyProducts } from '@/components/profile/MyProducts'

/** Perfil público de un agricultor (EJEMPLO estático: más adelante vendrá de una cuenta real). */
export default function ProfileScreen() {
  const { t, L } = useI18n()
  const subject = encodeURIComponent('Qullqa · papa / potatoes')

  return (
    <div className="space-y-4">
      {/* Portada */}
      <section className="relative -mx-4 -mt-4 overflow-hidden bg-noche-800 px-6 pb-14 pt-8 text-center text-white">
        <Starfield className="opacity-70" />
        <span className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-inti font-display text-3xl text-noche-800 ring-4 ring-noche-600">
          {DEMO_FARMER.initials}
        </span>
        <h1 className="relative mt-3 font-display text-2xl">{DEMO_FARMER.name}</h1>
        <p className="relative mt-1 flex items-center justify-center gap-1 text-sm text-noche-100">
          <IconPin size={14} /> {DEMO_FARMER.place}
        </p>
        <p className="relative mx-auto mt-3 max-w-xs text-sm text-noche-100">{t('profile.about')}</p>
        <Mountains className="absolute inset-x-0 bottom-0 h-10 w-full" />
      </section>

      <div className="-mt-2 flex justify-center">
        <ShareButtons text={t('share.profileText', { name: DEMO_FARMER.name, place: DEMO_FARMER.place })} path="/perfil" />
      </div>

      <Notice tone="info">{t('profile.demo')}</Notice>

      {/* Datos de contacto */}
      <section className="card">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="font-bold text-tierra-600">{t('profile.location')}</dt>
          <dd>{DEMO_FARMER.place}</dd>
          <dt className="font-bold text-tierra-600">{t('profile.email')}</dt>
          <dd className="break-all">{DEMO_FARMER.email}</dd>
          <dt className="font-bold text-tierra-600">{t('profile.languages')}</dt>
          <dd>{t('profile.languagesValue')}</dd>
        </dl>
      </section>

      {/* Qué produce y cuándo */}
      <section className="space-y-2">
        <h2 className="text-lg font-extrabold">{t('profile.produces')}</h2>
        {DEMO_FARMS.map((f) => (
          <article key={f.id} className="card flex items-center gap-3 p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-inti-100 text-2xl" aria-hidden="true">
              🥔
            </span>
            <div className="flex-1">
              <p className="font-extrabold">{VARIETIES[f.variety].name}</p>
              <p className="text-xs text-tierra-600">
                {f.name} · {f.place} ({f.code}) · {t('lands.area', { n: f.areaHa })}
              </p>
              <p className="mt-1 inline-block rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-800">
                📅 {t('profile.harvest', { when: L(f.harvestWindow) })}
              </p>
              <div className="mt-2">
                <ShareButtons
                  compact
                  path="/perfil"
                  text={t('share.productText', { product: VARIETIES[f.variety].name, place: f.place, when: L(f.harvestWindow), name: DEMO_FARMER.name })}
                />
              </div>
            </div>
          </article>
        ))}
        <article className="card flex items-center gap-3 p-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-noche-800 text-2xl" aria-hidden="true">
            ❄️
          </span>
          <div className="flex-1">
            <p className="font-extrabold">{t('profile.chuno')}</p>
            <p className="text-xs text-tierra-600">Chakra Sallaq · Cusco (PE)</p>
            <p className="mt-1 inline-block rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-800">
              📅 {t('profile.available', { when: L({ en: 'July–August 2027', es: 'julio–agosto 2027' }) })}
            </p>
          </div>
        </article>
      </section>

      <MyProducts />

      <p className="rounded-2xl bg-tierra-100 p-4 text-sm text-tierra-900">{t('profile.buyers')}</p>

      <a href={`mailto:${DEMO_FARMER.email}?subject=${subject}`} className="btn-primary w-full text-lg">
        ✉️ {t('profile.contact')}
      </a>
      <Link to="/tierras" className="btn-ghost w-full">
        {t('profile.seeLands')} <IconArrow size={18} />
      </Link>

      <Attribution />
    </div>
  )
}
