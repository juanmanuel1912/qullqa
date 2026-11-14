/** Cielo nocturno andino y el cúmulo de las Pléyades (Qullqa). */

/** Las 7 estrellas principales de las Pléyades, en posición aproximada. */
const PLEIADES: [number, number, number][] = [
  [30, 22, 5.5], // Alcíone
  [52, 14, 3.5], // Electra
  [64, 28, 4], // Maia
  [44, 36, 3], // Mérope
  [72, 46, 4.5], // Atlas
  [86, 40, 3], // Pléyone
  [58, 52, 3], // Taygeta
]

export function Pleiades({ className = '', glow = true, color = '#fffaf0' }: { className?: string; glow?: boolean; color?: string }) {
  return (
    <svg viewBox="0 0 110 70" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="pl-glow">
          <stop offset="0%" stopColor="#faefc5" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </radialGradient>
      </defs>
      {PLEIADES.map(([x, y, r], i) => (
        <g key={i} className="twinkle" style={{ animationDelay: `${i * 0.4}s` }}>
          {glow && <circle cx={x} cy={y} r={r * 2.6} fill="url(#pl-glow)" />}
          <circle cx={x} cy={y} r={r * 0.75} fill={color} />
        </g>
      ))}
    </svg>
  )
}

/** Estrellas de fondo (posiciones fijas para que no cambien en cada render). */
const STARS = Array.from({ length: 46 }, (_, i) => {
  const x = (i * 73.13) % 100
  const y = (i * 41.7 + (i % 7) * 9) % 100
  const r = i % 9 === 0 ? 1.4 : i % 3 === 0 ? 0.9 : 0.6
  return { x, y, r, d: (i % 6) * 0.5 }
})

export function Starfield({ className = '' }: { className?: string }) {
  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          fill="#fff"
          className={i % 4 === 0 ? 'twinkle' : undefined}
          style={{ animationDelay: `${s.d}s`, opacity: 0.7 }}
        />
      ))}
    </svg>
  )
}

/** Silueta de montañas andinas para el pie de las tarjetas oscuras. */
export function Mountains({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 60" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d="M0 60 L0 38 L40 22 L70 34 L120 8 L160 30 L200 16 L250 36 L290 12 L340 32 L370 24 L400 34 L400 60 Z" fill="#20244a" />
      <path d="M0 60 L0 48 L60 34 L110 46 L170 30 L230 48 L300 32 L350 46 L400 40 L400 60 Z" fill="#2a3060" />
    </svg>
  )
}
