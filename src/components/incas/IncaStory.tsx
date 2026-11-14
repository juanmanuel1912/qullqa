import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { INCA_STEPS } from './IncaScenes'

/** Carrusel "Así lo hacían los incas": 3 pasos ilustrados + el paso de hoy con la NASA. */
export function IncaStory() {
  const [active, setActive] = useState(0)
  const track = useRef<HTMLDivElement>(null)

  const goTo = (i: number) => {
    const el = track.current?.children[i] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  }

  return (
    <section className="space-y-3" aria-roledescription="carrusel" aria-label="Así lo hacían los incas">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow text-inti-700">En 3 pasos</p>
          <h2 className="font-display text-xl text-noche-800">Así lo hacían los incas</h2>
        </div>
        <Link to="/cielo" className="text-sm font-bold text-noche-600 underline">
          🔭 Ver el cielo
        </Link>
      </div>

      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget
          setActive(Math.round(el.scrollLeft / (el.scrollWidth / INCA_STEPS.length)))
        }}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none]"
      >
        {INCA_STEPS.map(({ Scene, when, title, text }, i) => (
          <article
            key={title}
            className={`w-[84%] shrink-0 snap-start overflow-hidden rounded-3xl shadow-card ${i === 3 ? 'bg-noche-800 text-white' : 'bg-white'}`}
            aria-label={`Paso ${i + 1} de ${INCA_STEPS.length}`}
          >
            <Scene />
            <div className="p-4">
              <p className={`text-xs font-extrabold uppercase tracking-wider ${i === 3 ? 'text-inti-300' : 'text-inti-700'}`}>
                {i < 3 ? `${i + 1}. ` : ''}
                {when}
              </p>
              <p className="mt-1 font-display text-lg leading-snug">{title}</p>
              <p className={`mt-1 text-sm leading-relaxed ${i === 3 ? 'text-noche-100' : 'text-tierra-800'}`}>{text}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        {INCA_STEPS.map((s, i) => (
          <button
            key={s.title}
            onClick={() => goTo(i)}
            aria-label={`Ir al paso ${i + 1}`}
            className="flex h-6 w-6 items-center justify-center"
          >
            <span className={`block h-2 rounded-full transition-all ${active === i ? 'w-6 bg-noche-800' : 'w-2 bg-tierra-300'}`} />
          </button>
        ))}
      </div>
    </section>
  )
}
