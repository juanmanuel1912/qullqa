import { useState } from 'react'
import { useI18n, type Key } from '@/i18n'
import type { Climatology } from '@/services/nasa/types'
import { PESTS } from '@/data/pests'
import { pestRisks, type RiskLevel } from '@/lib/alerts/pestRisk'

const STYLE: Record<RiskLevel, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-inti-100 text-inti-900',
  high: 'bg-red-100 text-red-800',
}

interface Props {
  climatology: Climatology | null
  elevation: number
  initialMonth: number
  onOpenPest: (id: string) => void
}

/** Riesgo de plagas en el mes elegido, con la altitud y el clima NASA de la chacra. */
export default function RiskCalculator({ climatology, elevation, initialMonth, onOpenPest }: Props) {
  const { t, L, month } = useI18n()
  const [m, setM] = useState(initialMonth)
  if (!climatology) return null
  const risks = pestRisks(climatology, elevation, m)

  return (
    <section className="card space-y-3">
      <div className="flex items-end justify-between gap-2">
        <h2 className="text-lg font-extrabold">{t('alerts.riskTitle')}</h2>
        <select
          value={m}
          onChange={(e) => setM(Number(e.target.value))}
          aria-label={t('check.month')}
          className="min-h-[40px] rounded-xl border-2 border-tierra-200 bg-white px-2 text-sm"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {month(i)}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-tierra-600">
        {t('alerts.riskSub', { alt: elevation.toLocaleString(), rain: climatology.months[m].precipMmMonth, temp: climatology.months[m].t2m.toFixed(1) })}
      </p>
      <ul className="divide-y divide-tierra-100">
        {risks.map((r) => {
          const p = PESTS[r.pest]
          return (
            <li key={r.pest}>
              <button onClick={() => onOpenPest(r.pest)} className="flex w-full items-center gap-3 py-2.5 text-left">
                <span className="text-2xl" aria-hidden="true">
                  {p.emoji}
                </span>
                <span className="flex-1">
                  <span className="block font-extrabold">{L(p.name)}</span>
                  <span className="text-xs text-tierra-600">{L(p.weatherNote)}</span>
                </span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${STYLE[r.level]}`}>{t(`alerts.risk.${r.level}` as Key)}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="text-[11px] text-tierra-500">{t('alerts.riskDisclaimer')}</p>
    </section>
  )
}
