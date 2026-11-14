/** Tres dibujos sencillos que explican la rotación: tierra pelada → elegir con Qullqa → tierra cubierta. */

const SOIL = '#a0703f'
const SOIL_DARK = '#6b4226'

export function BareSoilArt({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 160 110" role="img" aria-label={label} className="h-full w-full">
      <rect width="160" height="110" rx="14" fill="#fdebc8" />
      {/* Sol fuerte */}
      <circle cx="128" cy="24" r="12" fill="#f2b705" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line
          key={a}
          x1={128 + Math.cos((a * Math.PI) / 180) * 16}
          y1={24 + Math.sin((a * Math.PI) / 180) * 16}
          x2={128 + Math.cos((a * Math.PI) / 180) * 21}
          y2={24 + Math.sin((a * Math.PI) / 180) * 21}
          stroke="#f2b705"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ))}
      {/* Viento que levanta polvo */}
      <path d="M8 34 q14 -6 28 0 t28 0" fill="none" stroke="#b9a58a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 46 q12 -5 24 0 t24 0" fill="none" stroke="#b9a58a" strokeWidth="2.5" strokeLinecap="round" />
      {[[70, 40], [78, 50], [86, 44], [74, 56]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="2" fill={SOIL} opacity="0.7" />
      ))}
      {/* Suelo pelado con surcos y grietas */}
      <path d="M0 64 Q40 58 80 63 T160 62 V110 H0 Z" fill={SOIL} />
      {[74, 86, 98].map((y) => (
        <path key={y} d={`M6 ${y} Q80 ${y - 4} 154 ${y}`} fill="none" stroke={SOIL_DARK} strokeWidth="2" opacity="0.5" />
      ))}
      <polyline points="34,70 38,76 34,82 39,88" fill="none" stroke={SOIL_DARK} strokeWidth="1.8" />
      <polyline points="108,72 104,79 109,85" fill="none" stroke={SOIL_DARK} strokeWidth="1.8" />
      {/* Saco con la papa cosechada */}
      <path d="M120 70 q-6 20 2 30 h24 q8 -10 2 -30 z" fill="#d9b77e" stroke="#8a6a3a" strokeWidth="1.5" />
      <circle cx="127" cy="68" r="5" fill="#c79a5b" />
      <circle cx="136" cy="66" r="5.5" fill="#b8854a" />
      <circle cx="144" cy="69" r="4.5" fill="#c79a5b" />
    </svg>
  )
}

export function ChooseCropArt({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 160 110" role="img" aria-label={label} className="h-full w-full">
      <rect width="160" height="110" rx="14" fill="#e6eefc" />
      <path d="M0 80 Q80 74 160 80 V110 H0 Z" fill={SOIL} />
      {/* Celular con la app */}
      <rect x="62" y="14" width="36" height="66" rx="7" fill="#1a1a2e" />
      <rect x="66" y="22" width="28" height="48" rx="3" fill="#ffffff" />
      <circle cx="80" cy="40" r="9" fill="#2f9e44" />
      <path d="M75.5 40 l3 3 l6 -6" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="69" y="54" width="22" height="3" rx="1.5" fill="#d4af37" />
      <rect x="69" y="60" width="16" height="3" rx="1.5" fill="#c9c2b8" />
      {/* Opciones de cultivo: dos buenas, una mala */}
      <Option x={24} y={30} emoji="🫘" good />
      <Option x={24} y={66} emoji="🌾" good />
      <Option x={136} y={46} emoji="🥭" />
      <path d="M38 33 Q50 36 60 40" fill="none" stroke="#2f9e44" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M38 64 Q50 58 60 52" fill="none" stroke="#2f9e44" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M122 46 H100" fill="none" stroke="#d9480f" strokeWidth="2" strokeDasharray="3 3" />
    </svg>
  )
}

function Option({ x, y, emoji, good = false }: { x: number; y: number; emoji: string; good?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r="13" fill="#fff" stroke={good ? '#2f9e44' : '#d9480f'} strokeWidth="2.5" />
      <text x={x} y={y + 5} textAnchor="middle" fontSize="14">
        {emoji}
      </text>
      <circle cx={x + 10} cy={y - 10} r="5.5" fill={good ? '#2f9e44' : '#d9480f'} />
      {good ? (
        <path d={`M${x + 7.5} ${y - 10} l2 2 l3.5 -3.5`} fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <path d={`M${x + 8} ${y - 12} l4 4 M${x + 12} ${y - 12} l-4 4`} stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      )}
    </g>
  )
}

export function GreenSoilArt({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 160 110" role="img" aria-label={label} className="h-full w-full">
      <rect width="160" height="110" rx="14" fill="#dcf1fb" />
      {/* Nube con lluvia */}
      <g fill="#ffffff">
        <circle cx="34" cy="20" r="9" />
        <circle cx="46" cy="16" r="11" />
        <circle cx="58" cy="21" r="8" />
        <rect x="30" y="20" width="32" height="9" rx="4.5" />
      </g>
      {[36, 46, 56].map((x) => (
        <line key={x} x1={x} y1="33" x2={x - 3} y2="41" stroke="#4dabf7" strokeWidth="2" strokeLinecap="round" />
      ))}
      <circle cx="130" cy="20" r="9" fill="#f2b705" />
      {/* Suelo */}
      <path d="M0 64 Q80 60 160 64 V110 H0 Z" fill="#7a4f2e" />
      {/* Plantas de habas cubriendo la tierra */}
      {[16, 44, 72, 100, 128].map((x) => (
        <g key={x}>
          <line x1={x + 8} y1="64" x2={x + 8} y2="42" stroke="#2b8a3e" strokeWidth="2.5" />
          <ellipse cx={x + 3} cy="52" rx="6" ry="3.5" fill="#40c057" transform={`rotate(-30 ${x + 3} 52)`} />
          <ellipse cx={x + 13} cy="47" rx="6" ry="3.5" fill="#2f9e44" transform={`rotate(30 ${x + 13} 47)`} />
          <ellipse cx={x + 4} cy="42" rx="5" ry="3" fill="#51cf66" transform={`rotate(-30 ${x + 4} 42)`} />
          {/* Raíces con nódulos que fijan nitrógeno */}
          <path d={`M${x + 8} 64 v12 M${x + 8} 70 l-6 8 M${x + 8} 72 l6 8`} stroke="#e9d8a6" strokeWidth="1.5" fill="none" />
          <circle cx={x + 3} cy="77" r="1.8" fill="#ff8787" />
          <circle cx={x + 13} cy="79" r="1.8" fill="#ff8787" />
        </g>
      ))}
      {/* N = nitrógeno que vuelve al suelo */}
      <circle cx="80" cy="96" r="8" fill="#d4af37" />
      <text x="80" y="100" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1a1a2e">
        N
      </text>
    </svg>
  )
}
