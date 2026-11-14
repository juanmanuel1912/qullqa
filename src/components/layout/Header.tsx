import { Link } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { IconPin, Pleiades } from '@/components/common'

export function Header() {
  const { profile } = useQullqa()
  return (
    <header className="sticky top-0 z-40 bg-noche-800/95 text-white backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Qullqa, inicio">
          <Pleiades className="h-7 w-11" glow={false} />
          <span className="font-display text-xl tracking-wide">Qullqa</span>
        </Link>
        <Link
          to="/chacra"
          className="flex max-w-[55%] items-center gap-1 rounded-full bg-noche-600 px-3 py-1.5 text-xs font-bold text-inti-200"
        >
          <IconPin size={14} className="shrink-0" />
          <span className="truncate">{profile.placeName}</span>
        </Link>
      </div>
    </header>
  )
}
