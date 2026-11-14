/**
 * Bottom Navigation - 5 tabs
 */

import { useLocation, useNavigate } from 'react-router-dom'

interface NavItem {
  label: string
  path: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', path: '/', icon: '🌟' },
  { label: 'Mi chacra', path: '/my-farm', icon: '🌾' },
  { label: 'Calendario', path: '/calendar', icon: '📅' },
  { label: 'Mi cultivo', path: '/my-crop', icon: '🌱' },
  { label: 'Marte', path: '/mars', icon: '🔴' },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-tierra-200 shadow-2xl md:hidden">
      <div className="flex justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex-1 flex flex-col items-center justify-center
                min-h-[64px] py-2 px-1 gap-1
                transition-colors duration-200
                ${
                  isActive
                    ? 'text-inti border-t-2 border-inti bg-inti-50'
                    : 'text-tierra-600 hover:bg-tierra-50'
                }
              `}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
