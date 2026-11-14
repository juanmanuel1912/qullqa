import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, type Key } from '@/i18n'
import { DISHES, PLANTING_STEPS, POTATOES, PROCESSES, ZONES, type PotatoInfo, type PotatoKind } from '@/lib/potato/catalog'
import { Attribution, IconArrow } from '@/components/common'

type Tab = 'varieties' | 'zones' | 'planting' | 'kitchen' | 'chuno'
const TABS: Tab[] = ['varieties', 'zones', 'planting', 'kitchen', 'chuno']

export default function PotatoScreen() {
  const { t, lang } = useI18n()
  const [tab, setTab] = useState<Tab>('varieties')
  const num = (n: number) => n.toLocaleString(lang === 'en' ? 'en-US' : 'es-PE')

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <p className="eyebrow text-inti-700">{t('pot.kicker')}</p>
        <h1 className="mt-1 font-display text-3xl text-noche-800">{t('pot.title')}</h1>
        <p className="mt-1 text-[15px] text-tierra-700">{t('pot.subtitle')}</p>
      </header>

      {/* Cifras */}
      <section className="grid grid-cols-3 gap-2">
        {[
          [`${num(3000)}+`, t('pot.fact.varieties')],
          [num(711313), t('pot.fact.families')],
          [lang === 'en' ? 'May 30' : '30 mayo', t('pot.fact.day')],
        ].map(([big, small]) => (
          <div key={big} className="rounded-2xl bg-noche-800 p-3 text-white">
            <p className="font-display text-xl leading-none text-inti-300">{big}</p>
            <p className="mt-1.5 text-[11px] font-semibold leading-snug text-noche-100">{small}</p>
          </div>
        ))}
      </section>

      {/* Pestañas */}
      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" role="tablist">
        {TABS.map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`chip shrink-0 ${tab === k ? 'border-noche-800 bg-noche-800 text-white' : 'border-tierra-200 bg-white text-tierra-800'}`}
          >
            {t(`pot.tab.${k}` as Key)}
          </button>
        ))}
      </nav>

      {tab === 'varieties' && <Varieties />}
      {tab === 'zones' && <Zones />}
      {tab === 'planting' && <Planting />}
      {tab === 'kitchen' && <Kitchen />}
      {tab === 'chuno' && <Chuno />}

      <p className="text-center text-xs text-tierra-500">{t('pot.sources')}</p>
      <Attribution />
    </div>
  )
}

function PotatoIcon({ p, size = 44 }: { p: PotatoInfo; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true" className="shrink-0">
      <ellipse cx="22" cy="23" rx="18" ry="14" fill={p.skin} />
      <path d="M22 23 m-18 0 a18 14 0 0 1 18 -14 l0 14 z" fill={p.flesh} opacity="0.95" />
      <circle cx="12" cy="20" r="1.4" fill="#54402a" opacity="0.5" />
      <circle cx="30" cy="28" r="1.4" fill="#54402a" opacity="0.5" />
      <circle cx="27" cy="16" r="1.1" fill="#54402a" opacity="0.5" />
    </svg>
  )
}

const KIND_STYLE: Record<PotatoKind, string> = {
  improved: 'bg-noche-50 text-noche-700',
  native: 'bg-green-50 text-green-800',
  bitter: 'bg-tierra-100 text-tierra-800',
}

function Varieties() {
  const { t, L } = useI18n()
  const [filter, setFilter] = useState<'all' | PotatoKind>('all')
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return POTATOES.filter((p) => (filter === 'all' || p.kind === filter) && (!term || `${p.name} ${L(p.uses)} ${L(p.where)}`.toLowerCase().includes(term)))
  }, [filter, q, L])

  return (
    <section className="space-y-3">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('pot.search')}
        aria-label={t('pot.search')}
        className="block min-h-[48px] w-full rounded-2xl border-2 border-tierra-200 bg-white px-4 text-base"
      />
      <div className="flex flex-wrap gap-2">
        {(['all', 'improved', 'native', 'bitter'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`chip ${filter === k ? 'border-inti bg-inti-100 text-noche-800' : 'border-tierra-200 bg-white text-tierra-700'}`}
          >
            {t(`pot.filter.${k}` as Key)}
          </button>
        ))}
      </div>

      {list.length === 0 && <p className="py-6 text-center text-sm text-tierra-600">{t('pot.noResults')}</p>}

      <ul className="space-y-3">
        {list.map((p) => (
          <li key={p.id} className="card space-y-3">
            <div className="flex items-start gap-3">
              <PotatoIcon p={p} />
              <div className="flex-1">
                <p className="text-lg font-extrabold leading-tight">{p.name}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${KIND_STYLE[p.kind]}`}>{t(`pot.kind.${p.kind}` as Key)}</span>
                  {p.mostSold && <span className="rounded-full bg-inti-100 px-2.5 py-0.5 text-xs font-bold text-inti-900">⭐ {t('pot.mostSold')}</span>}
                </div>
              </div>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
              <dt className="font-bold text-tierra-600">{t('pot.grows')}</dt>
              <dd>
                {L(p.where)} · {p.altitude[0].toLocaleString()}–{p.altitude[1].toLocaleString()} m
              </dd>
              <dt className="font-bold text-tierra-600">{t('pot.uses')}</dt>
              <dd>{L(p.uses)}</dd>
            </dl>
            <p className="text-sm leading-relaxed text-tierra-800">{L(p.note)}</p>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl bg-inti-50 p-4 text-sm text-tierra-900">
        <p>{t('pot.catalogNote', { n: POTATOES.length })}</p>
        <a href="https://genebank.cipotato.org/" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 font-bold text-noche-600 underline">
          {t('pot.catalogLink')} <IconArrow size={16} />
        </a>
      </div>
    </section>
  )
}

function Zones() {
  const { t, L } = useI18n()
  return (
    <section className="space-y-3">
      <p className="text-[15px] text-tierra-800">{t('pot.zonesIntro')}</p>
      {/* Montaña con pisos altitudinales */}
      <div className="card overflow-hidden p-0">
        <svg viewBox="0 0 320 150" className="block w-full" role="img" aria-label={t('pot.tab.zones')}>
          <rect width="320" height="150" fill="#eef0f8" />
          {ZONES.map((z, i) => {
            const top = 18 + i * 32
            const half = 66 + i * 30
            return <path key={z.id} d={`M${160 - half - 16} ${top + 32} L${160 - half} ${top} L${160 + half} ${top} L${160 + half + 16} ${top + 32} Z`} fill={z.color} />
          })}
          <path d="M150 18 L160 4 L170 18 Z" fill="#fff" />
          {ZONES.map((z, i) => (
            <text key={z.id} x="160" y={38 + i * 32} textAnchor="middle" fontSize="10.5" fontWeight="800" fill={i < 2 ? '#fff' : '#1a1a2e'}>
              {L(z.name)} · {z.altitude}
            </text>
          ))}
        </svg>
      </div>
      {ZONES.map((z) => (
        <article key={z.id} className="card flex gap-3">
          <span className="mt-1 h-10 w-2 shrink-0 rounded-full" style={{ background: z.color }} />
          <div>
            <p className="font-extrabold">
              {L(z.name)} <span className="font-semibold text-tierra-500">· {z.altitude}</span>
            </p>
            <p className="mt-1 text-sm text-tierra-800">{L(z.text)}</p>
            <p className="mt-1.5 text-xs font-bold text-inti-800">🥔 {z.examples}</p>
          </div>
        </article>
      ))}
      <p className="rounded-2xl bg-tierra-100 p-4 text-sm text-tierra-900">{t('pot.regions')}</p>
    </section>
  )
}

function Planting() {
  const { t, L } = useI18n()
  return (
    <section className="space-y-3">
      <p className="text-[15px] text-tierra-800">{t('pot.plantIntro')}</p>
      <ol className="space-y-2">
        {PLANTING_STEPS.map((s, i) => (
          <li key={i} className="card flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-inti font-extrabold text-noche-800">{i + 1}</span>
            <div>
              <p className="font-extrabold">{L(s.title)}</p>
              <p className="mt-0.5 text-sm text-tierra-800">{L(s.text)}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link to="/calendario" className="btn-primary w-full">
        {t('pot.plantCalendar')} <IconArrow size={18} />
      </Link>
    </section>
  )
}

function Kitchen() {
  const { t, L } = useI18n()
  return (
    <section className="space-y-3">
      <p className="text-[15px] text-tierra-800">{t('pot.kitchenIntro')}</p>
      <ul className="grid gap-2">
        {DISHES.map((d) => (
          <li key={d.name} className="card flex gap-3">
            <span className="text-3xl" aria-hidden="true">
              {d.emoji}
            </span>
            <div>
              <p className="font-extrabold">{d.name}</p>
              <p className="mt-0.5 text-xs font-bold text-inti-800">
                {t('pot.dishPotato')}: {L(d.potato)}
              </p>
              <p className="mt-1 text-sm text-tierra-800">{L(d.text)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Chuno() {
  const { t, L } = useI18n()
  return (
    <section className="space-y-3">
      <p className="text-[15px] text-tierra-800">{t('pot.chunoIntro')}</p>
      {PROCESSES.map((s, i) => (
        <article key={i} className={`rounded-3xl p-5 shadow-card ${i < 2 ? 'bg-noche-800 text-white' : 'bg-white'}`}>
          <p className="font-display text-lg">{L(s.title)}</p>
          <p className={`mt-1 text-sm leading-relaxed ${i < 2 ? 'text-noche-100' : 'text-tierra-800'}`}>{L(s.text)}</p>
        </article>
      ))}
    </section>
  )
}
