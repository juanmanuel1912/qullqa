import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useI18n, type Key } from '@/i18n'
import { IconCalendar, IconSprout, IconStar } from '@/components/common'

function IconMap({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" />
      <path d="M9 4v13.5M15 6.5V20" />
    </svg>
  )
}

function IconWeather({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 2v1.5M2 8h1.5M3.8 3.8l1 1M12.2 3.8l-1 1" />
      <path d="M8.5 19h9a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6 1.5A2.8 2.8 0 0 0 8.5 19z" />
    </svg>
  )
}

function IconAlerts({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

const ITEMS: { to: string; key: Key; icon: (s: number) => ReactNode }[] = [
  { to: '/', key: 'nav.home', icon: (s) => <IconStar size={s} /> },
  { to: '/tierras', key: 'nav.lands', icon: (s) => <IconMap size={s} /> },
  { to: '/clima', key: 'nav.weather', icon: (s) => <IconWeather size={s} /> },
  { to: '/calendario', key: 'nav.calendar', icon: (s) => <IconCalendar size={s} /> },
  { to: '/cultivo', key: 'nav.crop', icon: (s) => <IconSprout size={s} /> },
  { to: '/alertas', key: 'nav.alerts', icon: (s) => <IconAlerts size={s} /> },
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
