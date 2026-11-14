/**
 * Calendario inca circular: 12 segmentos coloreados por semáforo (datos NASA POWER).
 * Enero arriba, avanzando en sentido horario. Tocar un mes lo selecciona.
 */
import type { CalendarMonth, TrafficLight } from '@/lib/agro'
import { useI18n, type Key } from '@/i18n'

export const LIGHT_COLOR: Record<TrafficLight, string> = {
  good: '#2f9e44',
  caution: '#f2b705',
  risk: '#d9480f',
}
const LIGHT_TEXT: Record<TrafficLight, string> = { good: '#fff', caution: '#1a1a2e', risk: '#fff' }

const SIZE = 340
const C = SIZE / 2
const R_OUT = 150
const R_IN = 96

const polar = (r: number, deg: number): [number, number] => {
  const a = ((deg - 90) * Math.PI) / 180
  return [C + r * Math.cos(a), C + r * Math.sin(a)]
}

function segmentPath(i: number, rOut: number, rIn: number) {
  const gap = 1.2
  const a0 = i * 30 - 15 + gap
  const a1 = i * 30 + 15 - gap
  const [x0, y0] = polar(rOut, a0)
  const [x1, y1] = polar(rOut, a1)
  const [x2, y2] = polar(rIn, a1)
  const [x3, y3] = polar(rIn, a0)
  return `M${x0},${y0} A${rOut},${rOut} 0 0 1 ${x1},${y1} L${x2},${y2} A${rIn},${rIn} 0 0 0 ${x3},${y3} Z`
}

interface Props {
  months: CalendarMonth[]
  selected: number
  currentMonth: number
  onSelect: (month: number) => void
}

export function IncaWheel({ months, selected, currentMonth, onSelect }: Props) {
  const { t, lang } = useI18n()
  const sel = months[selected]
  const light = (s: TrafficLight) => t(`light.${s}` as Key)
  // En quechua los meses ya son los nombres incas: arriba va el mes en español como referencia.
  const centerTitle = lang === 'qu' ? sel.quechua : t(`month.${selected}` as Key)
  const centerSub = lang === 'qu' ? sel.spanish : sel.quechua
  const shortLabel = (i: number) => t(`monthShort.${i}` as Key)

  return (
    <svg viewBox={`-16 -16 ${SIZE + 32} ${SIZE + 32}`} className="mx-auto block w-full max-w-[360px]" role="group" aria-label={t('cal.wheel')}>
      <circle cx={C} cy={C} r={R_OUT + 12} fill="none" stroke="#e6d5b8" strokeWidth="1.5" strokeDasharray="2 5" />

      {months.map((m) => {
        const i = m.month
        const active = i === selected
        const rOut = active ? R_OUT + 8 : R_OUT
        const [lx, ly] = polar((rOut + R_IN) / 2, i * 30)
        const status = m.condition.status
        const [mx, my] = polar(R_OUT + 24, i * 30)
        const [dx, dy] = polar(R_IN - 9, i * 30)
        return (
          <g
            key={i}
            role="button"
            tabIndex={0}
            aria-pressed={active}
            aria-label={`${t(`month.${i}` as Key)}, ${m.quechua}: ${light(status)}`}
            onClick={() => onSelect(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(i)
              }
            }}
            className="cursor-pointer outline-none"
          >
            <path
              d={segmentPath(i, rOut, R_IN)}
              fill={LIGHT_COLOR[status]}
              opacity={active ? 1 : 0.88}
              stroke={active ? '#1a1a2e' : '#faf6ef'}
              strokeWidth={active ? 3 : 1}
              style={{ transition: 'all 0.2s ease' }}
            />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="800" fill={LIGHT_TEXT[status]} pointerEvents="none">
              {shortLabel(i)}
            </text>
            {(m.isBestSowing || m.isHarvest) && (
              <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fontSize="20" pointerEvents="none">
                {m.isBestSowing ? '🌱' : '🥔'}
              </text>
            )}
            {i === currentMonth && <circle cx={dx} cy={dy} r="4.5" fill="#d4af37" pointerEvents="none" />}
          </g>
        )
      })}

      <circle cx={C} cy={C} r={R_IN - 18} fill="#1a1a2e" />
      {[
        [C - 22, C - 44, 2.2],
        [C - 8, C - 50, 1.6],
        [C + 4, C - 42, 2],
        [C - 14, C - 36, 1.4],
        [C + 14, C - 48, 1.4],
        [C + 10, C - 34, 1.6],
        [C - 2, C - 32, 1.2],
      ].map(([x, y, r], k) => (
        <circle key={k} cx={x} cy={y} r={r} fill="#faefc5" className="twinkle" style={{ animationDelay: `${k * 0.3}s` }} />
      ))}
      <text x={C} y={C - 6} textAnchor="middle" fontSize={centerTitle.length > 11 ? 16 : 22} fontWeight="700" fill="#fff" fontFamily="Fraunces, Georgia, serif">
        {centerTitle.charAt(0).toUpperCase() + centerTitle.slice(1)}
      </text>
      <text x={C} y={C + 16} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#ecc955">
        {centerSub}
      </text>
      <text x={C} y={C + 38} textAnchor="middle" fontSize="11" fontWeight="800" fill={LIGHT_COLOR[sel.condition.status]} letterSpacing="1">
        {light(sel.condition.status).toUpperCase()}
      </text>
    </svg>
  )
}
