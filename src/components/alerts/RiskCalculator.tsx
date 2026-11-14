import { useState } from 'react'
import { useI18n } from '@/i18n'
import { PESTS } from '@/data/pests'
import type { VarietyId } from '@/lib/agro'

interface Props {
  altitude: number
  variety: VarietyId
}

type RiskLevel = 'low' | 'medium' | 'high'

interface RiskScore {
  altitude: number
  rainfall: number
  variety: number
  total: number
  level: RiskLevel
}

export default function RiskCalculator({ altitude: initialAlt, variety: initialVar }: Props) {
  const { t } = useI18n()
  const [step, setStep] = useState<'form' | 'result'>('form')
  const [altitude, setAltitude] = useState(initialAlt)
  const [rainfall, setRainfall] = useState<'low' | 'medium' | 'high'>('medium')
  const [variety, setVariety] = useState(initialVar)
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null)

  const calculateRisk = (): RiskScore => {
    let score = 0

    // Altitude score (pests have different ranges)
    const pestsAtAlt = Object.values(PESTS).filter(
      (p) => altitude >= p.altRange[0] && altitude <= p.altRange[1]
    ).length
    score += pestsAtAlt * 20

    // Rainfall score
    const rainfallScores = { low: 10, medium: 25, high: 40 }
    score += rainfallScores[rainfall]

    // Variety susceptibility
    const susceptibleCount = Object.values(PESTS).filter(
      (p) => p.susceptibleVarieties.includes(initialVar)
    ).length
    score += susceptibleCount * 15

    // Clamp to 100
    score = Math.min(100, score)

    const level: RiskLevel = score < 40 ? 'low' : score < 70 ? 'medium' : 'high'

    return {
      altitude: pestsAtAlt,
      rainfall: rainfallScores[rainfall],
      variety: susceptibleCount * 15,
      total: score,
      level,
    }
  }

  const handleSubmit = () => {
    const result = calculateRisk()
    setRiskScore(result)
    setStep('result')
  }

  const handleReset = () => {
    setStep('form')
    setAltitude(initialAlt)
    setRainfall('medium')
    setVariety(initialVar)
    setRiskScore(null)
  }

  if (step === 'result' && riskScore) {
    const color = {
      low: 'good',
      medium: 'warning',
      high: 'rojo',
    }[riskScore.level]

    const emoji = {
      low: '✓',
      medium: '⚠️',
      high: '🚨',
    }[riskScore.level]

    return (
      <div className="space-y-4">
        <div className={`card border-2 border-${color}`}>
          <div className="text-center">
            <p className="text-5xl">{emoji}</p>
            <h3 className="mt-3 font-display text-2xl font-bold text-noche-800">
              {t(`alerts.risk.${riskScore.level}`) ?? 'Risk Level'}
            </h3>
            <p className={`mt-1 text-3xl font-extrabold text-${color}`}>
              {riskScore.total}%
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-extrabold text-noche-800">{t('alerts.riskFactors') ?? 'Risk Factors'}</h3>
          <div className="space-y-2 text-sm text-tierra-700">
            <div className="flex justify-between rounded-lg bg-tierra-50 p-3">
              <span>🏔️ {t('alerts.riskAltitude') ?? 'Altitude Zones'}</span>
              <span className="font-bold">{riskScore.altitude} pests</span>
            </div>
            <div className="flex justify-between rounded-lg bg-tierra-50 p-3">
              <span>💧 {t('alerts.riskRainfall') ?? 'Rainfall'}</span>
              <span className="font-bold">+{riskScore.rainfall} pts</span>
            </div>
            <div className="flex justify-between rounded-lg bg-tierra-50 p-3">
              <span>🥔 {t('alerts.riskVariety') ?? 'Variety Susceptibility'}</span>
              <span className="font-bold">+{riskScore.variety} pts</span>
            </div>
          </div>
        </div>

        {riskScore.level === 'high' && (
          <div className="rounded-lg bg-rojo/10 p-3">
            <p className="text-sm font-bold text-rojo">
              {t('alerts.riskHighAlert') ??
                'High risk detected! Increase monitoring frequency and preventive measures.'}
            </p>
          </div>
        )}

        {riskScore.level === 'medium' && (
          <div className="rounded-lg bg-yellow-100 p-3">
            <p className="text-sm font-bold text-yellow-900">
              {t('alerts.riskMediumAlert') ??
                'Moderate risk. Apply regular monitoring and organic controls.'}
            </p>
          </div>
        )}

        {riskScore.level === 'low' && (
          <div className="rounded-lg bg-good/10 p-3">
            <p className="text-sm font-bold text-good">
              {t('alerts.riskLowAlert') ??
                'Low risk. Maintain standard prevention practices.'}
            </p>
          </div>
        )}

        <button onClick={handleReset} className="btn-secondary w-full">
          {t('alerts.recalculate') ?? 'Recalculate'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <label>
          <span className="text-sm font-semibold text-tierra-700">
            {t('alerts.quizAltitude') ?? 'Your Altitude (msnm)'}
          </span>
          <input
            type="range"
            min="1000"
            max="4000"
            step="100"
            value={altitude}
            onChange={(e) => setAltitude(Number(e.target.value))}
            className="mt-2 w-full"
          />
          <p className="mt-1 text-center font-bold text-inti-600">{altitude} msnm</p>
        </label>
      </div>

      <div className="card space-y-3">
        <p className="text-sm font-semibold text-tierra-700">
          {t('alerts.quizRainfall') ?? 'Expected Rainfall This Season'}
        </p>
        <div className="space-y-2">
          {['low', 'medium', 'high'].map((level) => (
            <button
              key={level}
              onClick={() => setRainfall(level as typeof rainfall)}
              className={`flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition ${
                rainfall === level
                  ? 'border-inti-600 bg-inti-50'
                  : 'border-tierra-200 bg-white hover:border-tierra-300'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  rainfall === level
                    ? 'border-inti-600 bg-inti-600'
                    : 'border-tierra-300'
                }`}
              >
                {rainfall === level && (
                  <span className="h-2 w-2 rounded-full bg-white" />
                )}
              </span>
              <span className="flex-1">
                <span className="font-bold">
                  {level === 'low' && '☀️ Baja lluvia'}
                  {level === 'medium' && '☁️ Lluvia normal'}
                  {level === 'high' && '🌧️ Lluvia excesiva'}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-3">
        <p className="text-sm font-semibold text-tierra-700">
          {t('alerts.quizVariety') ?? 'Your Potato Variety'}
        </p>
        <div className="rounded-lg bg-tierra-50 p-3">
          <p className="font-bold text-noche-800">{variety}</p>
          <p className="text-xs text-tierra-600">
            {t(`variety.${variety}` as any) ?? variety}
          </p>
        </div>
      </div>

      <button onClick={handleSubmit} className="btn-primary w-full">
        {t('alerts.calculateRisk') ?? 'Calculate Risk'}
      </button>
    </div>
  )
}
