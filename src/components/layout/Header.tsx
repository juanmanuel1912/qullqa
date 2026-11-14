import { Link } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { LANGS, useI18n } from '@/i18n'
import { IconPin, Pleiades } from '@/components/common'

export function Header() {
  const { profile } = useQullqa()
  const { lang, setLang, t } = useI18n()
  return (
    <header className="sticky top-0 z-40 bg-noche-800/95 text-white backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-2 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-1.5" aria-label="Qullqa">
          <Pleiades className="h-7 w-10" glow={false} />
          <span className="font-display text-xl tracking-wide">Qullqa</span>
        </Link>
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to="/chacra"
            className="flex min-w-0 items-center gap-1 rounded-full bg-noche-600 px-2.5 py-1.5 text-xs font-bold text-inti-200"
          >
            <IconPin size={14} className="shrink-0" />
            <span className="truncate">{profile.placeName}</span>
          </Link>
          <div role="radiogroup" aria-label={t('lang.label')} className="flex shrink-0 rounded-full bg-noche-600 p-0.5">
            {LANGS.map((l) => (
              <button
                key={l.id}
                role="radio"
                aria-checked={lang === l.id}
                aria-label={l.name}
                title={l.name}
                onClick={() => setLang(l.id)}
                className={`min-h-[32px] min-w-[34px] rounded-full px-1.5 text-[11px] font-extrabold transition ${
                  lang === l.id ? 'bg-inti text-noche-800' : 'text-noche-100'
                }`}
              >
                {l.short}
              </button>
            ))}
          </div>
        </div>
      </div>
      {lang === 'qu' && <p className="bg-inti-200 px-4 py-1 text-center text-[11px] font-bold text-noche-800">{t('lang.quBeta')}</p>}
    </header>
  )
}
