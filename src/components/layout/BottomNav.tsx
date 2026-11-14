import { NavLink } from 'react-router-dom'
import { IconCalendar, IconPin, IconPlanet, IconSprout, IconStar } from '@/components/common'

const ITEMS = [
  { to: '/', label: 'Inicio', Icon: IconStar },
  { to: '/chacra', label: 'Mi chacra', Icon: IconPin },
  { to: '/calendario', label: 'Calendario', Icon: IconCalendar },
  { to: '/cultivo', label: 'Mi cultivo', Icon: IconSprout },
  { to: '/marte', label: 'Marte', Icon: IconPlanet },
]

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-tierra-100 bg-white/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegación principal"
    >
      <ul className="flex">
        {ITEMS.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex min-h-[64px] flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors ${
                  isActive ? 'text-noche-800' : 'text-tierra-400 hover:text-tierra-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-inti-200' : ''}`}>
                    <Icon size={22} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
