/**
 * Tres escenas ilustradas (SVG) de cómo los incas usaban las estrellas para la papa,
 * y una cuarta que une esa sabiduría con los satélites de la NASA.
 */

const INK = '#1a1a2e'

type Pose = 'point' | 'dig' | 'seed' | 'sit'

/** Figura andina (chullo y poncho). (x, y) = pies. Mira a la derecha; `flip` la voltea. */
function Person({ x, y, s = 1, pose = 'point', color = INK, flip = false }: { x: number; y: number; s?: number; pose?: Pose; color?: string; flip?: boolean }) {
  const sit = pose === 'sit'
  const bodyTop = sit ? -30 : -46
  const bodyBottom = sit ? -6 : -22
  const headY = bodyTop - 7
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill={color} stroke={color} strokeLinecap="round">
      {sit ? (
        <rect x={-13} y={-7} width={26} height={7} rx={3.5} stroke="none" />
      ) : (
        <>
          <rect x={-6} y={-23} width={5} height={23} rx={2} stroke="none" />
          <rect x={1} y={-23} width={5} height={23} rx={2} stroke="none" />
        </>
      )}
      {/* Poncho */}
      <path d={`M-13 ${bodyBottom} L13 ${bodyBottom} L8 ${bodyTop} L-8 ${bodyTop} Z`} stroke="none" />
      <path d={`M-12 ${bodyBottom - 5} L12 ${bodyBottom - 5}`} stroke="#d4af37" strokeWidth={1.6} />
      {/* Cabeza y chullo */}
      <circle cx={0} cy={headY} r={7} stroke="none" />
      <path d={`M-7.5 ${headY - 1} Q0 ${headY - 16} 7.5 ${headY - 1} Z`} stroke="none" />
      <path d={`M-7 ${headY} L-8 ${headY + 7} M7 ${headY} L8 ${headY + 7}`} strokeWidth={2} />
      <circle cx={0} cy={headY - 13} r={2.4} stroke="none" />
      {/* Brazos según la acción */}
      {pose === 'point' && <path d={`M4 ${bodyTop + 3} L16 ${bodyTop - 20}`} strokeWidth={4} />}
      {pose === 'dig' && (
        <>
          <path d={`M4 ${bodyTop + 4} L16 ${bodyTop + 2}`} strokeWidth={4} />
          {/* Chakitaqlla */}
          <path d={`M14 ${bodyTop - 6} L24 2`} strokeWidth={3} />
          <path d="M18 -12 L25 -14" strokeWidth={3} />
        </>
      )}
      {pose === 'seed' && <path d={`M4 ${bodyTop + 4} L14 ${bodyTop + 22}`} strokeWidth={4} />}
      {pose === 'sit' && <path d={`M5 ${bodyTop + 6} L15 ${bodyTop + 14}`} strokeWidth={4} />}
    </g>
  )
}

function Pleiades7({ x, y, s = 1, glow = true }: { x: number; y: number; s?: number; glow?: boolean }) {
  const pts: [number, number, number][] = [[0, 6, 3.2], [12, 0, 2.2], [20, 9, 2.6], [8, 14, 2], [26, 18, 2.8], [34, 13, 2], [17, 23, 2]]
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {pts.map(([px, py, r], i) => (
        <g key={i} className="twinkle" style={{ animationDelay: `${i * 0.35}s` }}>
          {glow && <circle cx={px} cy={py} r={r * 3} fill="#faefc5" opacity={0.18} />}
          <circle cx={px} cy={py} r={r} fill="#fffaf0" />
        </g>
      ))}
    </g>
  )
}

const STARS = Array.from({ length: 34 }, (_, i) => [(i * 83.7) % 320, (i * 37.3) % 110, i % 5 === 0 ? 1.3 : 0.7])

/** 1. Junio, madrugada: miran las Qullqa desde el cerro. */
export function SceneStars() {
  return (
    <svg viewBox="0 0 320 200" className="block h-auto w-full" role="img" aria-label="Agricultores incas mirando las Pléyades antes del amanecer">
      <defs>
        <linearGradient id="sc1-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f0f1c" />
          <stop offset="70%" stopColor="#2a3060" />
          <stop offset="100%" stopColor="#5d6699" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#sc1-sky)" />
      {STARS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.7} />
      ))}
      <Pleiades7 x={214} y={42} s={1.3} />
      {/* Primer resplandor del amanecer por el noreste */}
      <ellipse cx="250" cy="168" rx="120" ry="34" fill="#ecc955" opacity="0.18" />
      <path d="M0 200 L0 138 L50 112 L92 132 L140 96 L188 126 L236 104 L290 130 L320 118 L320 200 Z" fill="#20244a" />
      <path d="M0 200 L0 160 Q60 140 120 150 Q170 158 200 172 L200 200 Z" fill="#1a1a2e" />
      <Person x={70} y={152} s={0.95} pose="point" color="#0f0f1c" />
      <Person x={104} y={156} s={0.72} pose="point" color="#0f0f1c" />
    </svg>
  )
}

/** 2. Noviembre: siembran la papa con las primeras lluvias. */
export function ScenePlanting() {
  return (
    <svg viewBox="0 0 320 200" className="block h-auto w-full" role="img" aria-label="Agricultores incas sembrando papa en andenes bajo la lluvia">
      <defs>
        <linearGradient id="sc2-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b3b9d9" />
          <stop offset="100%" stopColor="#faefc5" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#sc2-sky)" />
      <circle cx="262" cy="46" r="20" fill="#ecc955" />
      {/* Nubes y lluvia */}
      <g fill="#fff" opacity="0.95">
        <ellipse cx="88" cy="36" rx="38" ry="13" />
        <ellipse cx="114" cy="28" rx="24" ry="13" />
        <ellipse cx="186" cy="50" rx="30" ry="10" />
      </g>
      <g stroke="#5d6699" strokeWidth="1.6" strokeLinecap="round" opacity="0.6">
        {[64, 78, 92, 106, 120, 172, 186, 200].map((x, i) => (
          <line key={x} x1={x} y1={52 + (i % 2) * 4} x2={x - 5} y2={70 + (i % 2) * 4} />
        ))}
      </g>
      <path d="M0 110 L60 86 L110 100 L170 78 L230 96 L320 80 L320 200 L0 200 Z" fill="#8790bd" opacity="0.55" />
      {/* Andenes */}
      <path d="M0 132 Q160 118 320 128 L320 200 L0 200 Z" fill="#54402a" />
      <path d="M0 138 Q160 124 320 134 L320 140 Q160 130 0 144 Z" fill="#2f9e44" />
      <path d="M0 164 Q160 152 320 160 L320 200 L0 200 Z" fill="#6e5537" />
      <path d="M0 170 Q160 158 320 166 L320 172 Q160 164 0 176 Z" fill="#40c057" />
      {/* Brotes */}
      {[40, 66, 230, 262, 290].map((x) => (
        <g key={x} stroke="#2f9e44" strokeWidth="2" strokeLinecap="round" fill="#40c057">
          <line x1={x} y1={186} x2={x} y2={178} />
          <ellipse cx={x - 3} cy={178} rx={3.5} ry={2} stroke="none" />
          <ellipse cx={x + 3} cy={177} rx={3.5} ry={2} stroke="none" />
        </g>
      ))}
      <Person x={120} y={186} pose="dig" />
      <Person x={186} y={186} s={0.9} pose="seed" flip />
      {/* Semillas de papa */}
      {[170, 164, 176].map((x, i) => (
        <ellipse key={x} cx={x} cy={186 - i} rx={3.2} ry={2.4} fill="#b8956a" />
      ))}
    </svg>
  )
}

/** 3. Mayo: cosechan y comparten la papa cocida en la huatia. */
export function SceneHarvest() {
  return (
    <svg viewBox="0 0 320 200" className="block h-auto w-full" role="img" aria-label="Familia andina compartiendo papas cocidas en la huatia al atardecer">
      <defs>
        <linearGradient id="sc3-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d4577" />
          <stop offset="45%" stopColor="#e2725b" />
          <stop offset="100%" stopColor="#ecc955" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#sc3-sky)" />
      <Pleiades7 x={40} y={18} s={0.7} glow={false} />
      <circle cx="176" cy="112" r="24" fill="#fdf8e8" opacity="0.9" />
      <path d="M0 140 L60 108 L120 130 L180 100 L240 126 L320 104 L320 200 L0 200 Z" fill="#7a2a0a" opacity="0.75" />
      <rect y="150" width="320" height="50" fill="#9c7a4f" />
      {/* Huatia (horno de tierra) con vapor */}
      <path d="M232 168 Q252 136 272 168 Z" fill="#54402a" />
      <g stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.75">
        <path d="M246 138 q-6 -10 0 -18 q6 -8 0 -16" />
        <path d="M258 140 q6 -10 0 -18 q-6 -8 0 -16" />
      </g>
      {/* Manta con papas */}
      <ellipse cx="146" cy="176" rx="62" ry="12" fill="#d9480f" />
      <ellipse cx="146" cy="176" rx="54" ry="8" fill="none" stroke="#ecc955" strokeWidth="2" strokeDasharray="5 4" />
      {[[124, 173], [136, 177], [148, 172], [160, 176], [172, 172], [142, 168], [156, 168]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={6} ry={4.4} fill={i % 2 ? '#d2b88f' : '#b8956a'} stroke="#6e5537" strokeWidth="0.8" />
      ))}
      {/* Familia */}
      <Person x={76} y={180} pose="sit" />
      <Person x={104} y={186} s={0.7} pose="sit" />
      <Person x={214} y={180} pose="sit" flip />
    </svg>
  )
}

/** 4. Hoy: los satélites de la NASA leen el cielo, el agua y el suelo. */
export function SceneNasa() {
  return (
    <svg viewBox="0 0 320 200" className="block h-auto w-full" role="img" aria-label="Satélite de la NASA sobre los Andes enviando datos a un teléfono">
      <rect width="320" height="200" fill="#1a1a2e" />
      {STARS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.55} />
      ))}
      <Pleiades7 x={30} y={30} s={0.8} />
      {/* Haz de datos */}
      <path d="M212 70 L150 168 L214 168 Z" fill="#d4af37" opacity="0.16" />
      <g stroke="#ecc955" strokeWidth="2" strokeDasharray="3 6" strokeLinecap="round">
        <line x1="210" y1="78" x2="182" y2="150" />
      </g>
      {/* Satélite */}
      <g transform="translate(212 58) rotate(-18)">
        <rect x="-10" y="-8" width="20" height="16" rx="3" fill="#d9ddee" />
        <rect x="-44" y="-6" width="30" height="12" fill="#3d4577" stroke="#8790bd" />
        <rect x="14" y="-6" width="30" height="12" fill="#3d4577" stroke="#8790bd" />
        <line x1="-14" y1="0" x2="-10" y2="0" stroke="#d9ddee" strokeWidth="2" />
        <line x1="10" y1="0" x2="14" y2="0" stroke="#d9ddee" strokeWidth="2" />
        <circle cx="0" cy="12" r="4" fill="#d4af37" />
      </g>
      <path d="M0 200 L0 150 L56 118 L104 142 L160 112 L214 140 L268 116 L320 136 L320 200 Z" fill="#2a3060" />
      <path d="M0 200 L0 176 Q120 160 320 178 L320 200 Z" fill="#2f9e44" opacity="0.8" />
      {/* Agricultor con teléfono */}
      <Person x={150} y={190} pose="seed" color="#0f0f1c" />
      <rect x="160" y="150" width="12" height="20" rx="2.5" fill="#d4af37" stroke="#0f0f1c" strokeWidth="1.5" />
    </svg>
  )
}

/** Escenas en orden; los textos están en i18n (incas.1.* … incas.4.*). */
export const INCA_STEPS = [SceneStars, ScenePlanting, SceneHarvest, SceneNasa]
