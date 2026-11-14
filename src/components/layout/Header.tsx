/**
 * Header con logo Qullqa
 */

import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
}

export function Header({ title, showBack = false, onBack }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-tierra-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex items-center gap-3 flex-1">
          {showBack && (
            <button
              onClick={onBack || (() => navigate(-1))}
              className="text-xl hover:text-inti transition-colors"
              aria-label="Volver"
            >
              ←
            </button>
          )}
          <h1 className="text-lg md:text-xl font-bold text-tierra">
            {title || (
              <>
                <span className="text-inti">🌟</span> Qullqa
              </>
            )}
          </h1>
        </div>
      </div>
    </header>
  )
}
