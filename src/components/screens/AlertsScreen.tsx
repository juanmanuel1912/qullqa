import { useState } from 'react'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n } from '@/i18n'
import { PESTS, PEST_ORDER } from '@/data/pests'
import { IconArrow, Notice, Attribution } from '@/components/common'
import PestGuideModal from '@/components/alerts/PestGuideModal'
import RiskCalculator from '@/components/alerts/RiskCalculator'
import DisasterResponse from '@/components/alerts/DisasterResponse'

export default function AlertsScreen() {
  const { profile, climatology } = useQullqa()
  const { t } = useI18n()
  const [selectedPest, setSelectedPest] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pests' | 'niño' | 'disasters' | 'quiz'>('pests')

  const altitude = climatology?.elevation ?? 0

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <p className="eyebrow text-inti-700">{t('alerts.step')}</p>
        <h1 className="mt-1 font-display text-3xl text-noche-800">{t('alerts.title')}</h1>
        <p className="mt-1 text-[15px] text-tierra-700">{t('alerts.subtitle')}</p>
      </header>

      {/* Tabs */}
      <div className="sticky top-0 z-10 flex gap-1 overflow-x-auto bg-white pb-4 scrollbar-none">
        {[
          { id: 'pests' as const, label: t('alerts.tab.pests'), emoji: '🪲' },
          { id: 'niño' as const, label: t('alerts.tab.nino'), emoji: '🌊' },
          { id: 'disasters' as const, label: t('alerts.tab.disasters'), emoji: '❄️' },
          { id: 'quiz' as const, label: t('alerts.tab.quiz'), emoji: '📋' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`chip shrink-0 transition ${
              activeTab === tab.id
                ? 'border-noche-800 bg-noche-800 text-white'
                : 'border-tierra-200 bg-white text-tierra-800 hover:border-tierra-300'
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Pests */}
      {activeTab === 'pests' && (
        <div className="space-y-4">
          <Notice tone="info" title={t('alerts.pestAlert')}>
            {t('alerts.pestAlertText', { alt: Math.round(altitude) })}
          </Notice>

          <div className="space-y-2">
            {PEST_ORDER.map((pestId) => {
              const pest = PESTS[pestId]
              const inRange =
                altitude >= pest.altRange[0] && altitude <= pest.altRange[1]

              return (
                <button
                  key={pest.id}
                  onClick={() => setSelectedPest(pest.id)}
                  className={`card space-y-2 text-left transition hover:bg-inti-50 ${
                    inRange ? 'border-2 border-rojo' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-2xl font-bold">{pest.emoji}</p>
                      <h3 className="mt-1 font-extrabold text-noche-800">
                        {pest.nameEs}
                      </h3>
                      <p className="mt-0.5 text-xs text-tierra-600">
                        {pest.nameQu} • {pest.altRange[0]}-{pest.altRange[1]} msnm
                      </p>
                    </div>
                    {inRange && (
                      <span className="rounded-full bg-rojo px-2 py-1 text-xs font-bold text-white">
                        {t('alerts.atRisk')}
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-sm text-tierra-700">
                    {pest.description}
                  </p>
                  <div className="flex items-center justify-end text-xs font-bold text-inti-600">
                    {t('alerts.learnMore')} <IconArrow size={16} className="ml-1" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab: Niño Impact */}
      {activeTab === 'niño' && (
        <div className="space-y-4">
          <Notice tone="warning" title={t('alerts.ninoTitle')}>
            {t('alerts.ninoDesc')}
          </Notice>

          <div className="card space-y-3">
            <h3 className="font-extrabold text-noche-800">{t('alerts.ninoImpacts')}</h3>
            <ul className="space-y-2 text-sm text-tierra-700">
              <li className="flex gap-2">
                <span className="shrink-0">🌡️</span>
                <span>{t('alerts.ninoTemp')}</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">💧</span>
                <span>{t('alerts.ninoRain')}</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">🌪️</span>
                <span>{t('alerts.ninoWind')}</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">🪲</span>
                <span>{t('alerts.ninoPests')}</span>
              </li>
            </ul>
          </div>

          <div className="card space-y-3">
            <h3 className="font-extrabold text-noche-800">
              {t('alerts.ninoPrep')}
            </h3>
            <ul className="space-y-2 text-sm text-tierra-700">
              <li className="flex gap-2">
                <span className="shrink-0">✓</span>
                <span>{t('alerts.ninoPrep1')}</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">✓</span>
                <span>{t('alerts.ninoPrep2')}</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">✓</span>
                <span>{t('alerts.ninoPrep3')}</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">✓</span>
                <span>{t('alerts.ninoPrep4')}</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab: Disaster Response */}
      {activeTab === 'disasters' && <DisasterResponse />}

      {/* Tab: Risk Quiz */}
      {activeTab === 'quiz' && <RiskCalculator altitude={altitude} variety={profile.variety} />}

      <Attribution />

      {/* Pest Modal */}
      {selectedPest && (
        <PestGuideModal
          pest={PESTS[selectedPest as keyof typeof PESTS]}
          onClose={() => setSelectedPest(null)}
        />
      )}
    </div>
  )
}
