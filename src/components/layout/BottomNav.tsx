import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useI18n, type Key } from '@/i18n'
import { IconCalendar, IconPin, IconPlanet, IconSprout, IconStar } from '@/components/common'

/** Ícono de papa para la pestaña "Papas". */
function IconPotato({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M6.5 18.5c-3-2.5-2.8-8 .7-11.2 3.4-3.1 9.4-3.6 11.6-.4 2.3 3.3.6 9.4-3.4 11.6-3.1 1.7-6.6 1.8-8.9 0z" />
      <circle cx="10" cy="10" r=".6" fill="currentColor" />
      <circle cx="14.5" cy="13" r=".6" fill="currentColor" />
      <circle cx="10.5" cy="15" r=".6" fill="currentColor" />
    </svg>
  )
}

const ITEMS: { to: string; key: Key; icon: (s: number) => ReactNode }[] = [
  { to: '/', key: 'nav.home', icon: (s) => <IconStar size={s} /> },
  { to: '/chacra', key: 'nav.farm', icon: (s) => <IconPin size={s} /> },
  { to: '/calendario', key: 'nav.calendar', icon: (s) => <IconCalendar size={s} /> },
  { to: '/cultivo', key: 'nav.crop', icon: (s) => <IconSprout size={s} /> },
  { to: '/papas', key: 'nav.potatoes', icon: (s) => <IconPotato size={s} /> },
  { to: '/marte', key: 'nav.mars', icon: (s) => <IconPlanet size={s} /> },
]

export function BottomNav() {
  const { t } = useI18n()
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-tierra-100 bg-white/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Menu"
    >
      <ul className="flex">
        {ITEMS.map(({ to, key, icon }) => (
          <li key={to} className="min-w-0 flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex min-h-[64px] flex-col items-center justify-center gap-1 px-0.5 text-[10.5px] font-bold leading-tight transition-colors ${
                  isActive ? 'text-noche-800' : 'text-tierra-400 hover:text-tierra-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-8 w-11 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-inti-200' : ''}`}>
                    {icon(21)}
                  </span>
                  <span className="w-full truncate text-center">{t(key)}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
