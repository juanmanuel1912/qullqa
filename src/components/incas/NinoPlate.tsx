/**
 * Lámina: cómo los incas leían El Niño en las Pléyades.
 * Izquierda: Qullqa brillantes → año normal (lluvia y chacra verde).
 * Derecha: Qullqa opacas tras nubes altas → año de El Niño (tierra seca, siembra tardía).
 */
const STARS7: [number, number, number][] = [[0, 6, 3.2], [12, 0, 2.2], [20, 9, 2.6], [8, 14, 2], [26, 18, 2.8], [34, 13, 2], [17, 23, 2]]

function Cluster({ x, y, dim }: { x: number; y: number; dim?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {STARS7.map(([px, py, r], i) => (
        <g key={i} className={dim ? undefined : 'twinkle'} style={{ animationDelay: `${i * 0.3}s` }}>
          {!dim && <circle cx={px} cy={py} r={r * 3} fill="#faefc5" opacity={0.2} />}
          {/* En año de El Niño solo se ven las estrellas más brillantes, y débiles */}
          {(!dim || r >= 2.6) && <circle cx={px} cy={py} r={dim ? r * 0.55 : r} fill="#fffaf0" opacity={dim ? 0.5 : 1} />}
        </g>
      ))}
    </g>
  )
}

function Watcher({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="#0f0f1c" stroke="#0f0f1c" strokeLinecap="round">
      <rect x={-5} y={-18} width={4} height={18} rx={1.5} stroke="none" />
      <rect x={1} y={-18} width={4} height={18} rx={1.5} stroke="none" />
      <path d="M-11 -18 L11 -18 L7 -38 L-7 -38 Z" stroke="none" />
      <circle cx={0} cy={-44} r={6} stroke="none" />
      <path d="M-6.5 -45 Q0 -58 6.5 -45 Z" stroke="none" />
      <path d="M4 -35 L14 -52" strokeWidth={3.5} />
    </g>
  )
}

export function NinoPlate({ normalLabel, ninoLabel }: { normalLabel: string; ninoLabel: string }) {
  return (
    <svg viewBox="0 0 320 210" className="block h-auto w-full" role="img" aria-label={`${normalLabel} / ${ninoLabel}`}>
      <defs>
        <linearGradient id="np-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f0f1c" />
          <stop offset="100%" stopColor="#3d4577" />
        </linearGradient>
        <linearGradient id="np-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9ddee" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#d9ddee" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* --- Año normal --- */}
      <rect x="0" y="0" width="158" height="210" fill="url(#np-sky)" />
      <Cluster x={92} y={22} />
      <g fill="#fff" opacity="0.6">
        {[[20, 30], [60, 18], [130, 60], [40, 70], [110, 90]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={0.9} />
        ))}
      </g>
      <path d="M0 150 L30 128 L60 140 L95 118 L130 136 L158 126 L158 210 L0 210 Z" fill="#20244a" />
      <rect x="0" y="168" width="158" height="42" fill="#2f9e44" />
      {[18, 40, 62, 84, 106, 128, 148].map((x) => (
        <g key={x} stroke="#1b7a32" strokeWidth="2" strokeLinecap="round">
          <line x1={x} y1={182} x2={x} y2={172} />
          <line x1={x} y1={176} x2={x - 4} y2={172} />
          <line x1={x} y1={176} x2={x + 4} y2={172} />
        </g>
      ))}
      <Watcher x={40} y={166} />
      <rect x="6" y="186" width="146" height="18" rx="9" fill="#1a1a2e" opacity="0.8" />

      {/* --- Año de El Niño --- */}
      <rect x="162" y="0" width="158" height="210" fill="url(#np-sky)" />
      <Cluster x={254} y={22} dim />
      <rect x="162" y="0" width="158" height="120" fill="url(#np-haze)" />
      <g stroke="#eef0f8" strokeWidth="2" strokeLinecap="round" opacity="0.35">
        <line x1="175" y1="30" x2="230" y2="26" />
        <line x1="210" y1="48" x2="300" y2="42" />
        <line x1="190" y1="62" x2="260" y2="58" />
      </g>
      <path d="M162 150 L192 128 L222 140 L257 118 L292 136 L320 126 L320 210 L162 210 Z" fill="#20244a" />
      <rect x="162" y="168" width="158" height="42" fill="#b8956a" />
      <g stroke="#7a5a35" strokeWidth="1.2" fill="none" opacity="0.8">
        <path d="M175 176 l8 6 l-4 8 M215 172 l-6 9 l7 6 M262 175 l9 4 l-3 10 M298 172 l-5 8 l6 9" />
      </g>
      <Watcher x={202} y={166} />
      <rect x="168" y="186" width="146" height="18" rx="9" fill="#1a1a2e" opacity="0.8" />

      <text x="79" y="199" textAnchor="middle" fontSize="11" fontWeight="800" fill="#ecc955">
        ★ {normalLabel}
      </text>
      <text x="241" y="199" textAnchor="middle" fontSize="11" fontWeight="800" fill="#e2725b">
        ☁ {ninoLabel}
      </text>
    </svg>
  )
}
