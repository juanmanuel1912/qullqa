import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import { PESTS, PEST_ORDER, type PestId } from '@/data/pests'
import { pestRisks } from '@/lib/alerts/pestRisk'
import { Attribution, IconArrow, Notice } from '@/components/common'
import PestGuideModal from '@/components/alerts/PestGuideModal'
import RiskCalculator from '@/components/alerts/RiskCalculator'
import DisasterResponse from '@/components/alerts/DisasterResponse'

type Tab = 'pests' | 'disasters'

export default function AlertsScreen() {
  const { profile, climatology, forecast, today } = useQullqa()
  const { t, L } = useI18n()
  const [selectedPest, setSelectedPest] = useState<PestId | null>(null)
  const [tab, setTab] = useState<Tab>('pests')

  // Altitud exacta del punto (Open-Meteo); si no, la de la celda NASA
  const elevation = Math.round(forecast?.elevation ?? climatology?.elevation ?? 0)
  const risksNow = climatology ? pestRisks(climatology, elevation, today.getUTCMonth()) : []

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <p className="eyebrow text-inti-700">{profile.placeName}</p>
        <h1 className="mt-1 font-display text-3xl text-noche-800">{t('alerts.title')}</h1>
        <p className="mt-1 text-[15px] text-tierra-700">{t('alerts.subtitle')}</p>
      </header>

      {/* El Niño: la pantalla dedicada tiene los datos de NOAA y la guía completa */}
      <Link to="/nino" className="card flex items-center gap-3 p-4 ring-2 ring-marte-400">
        <span className="text-2xl" aria-hidden="true">
          🌊
        </span>
        <span className="flex-1">
          <span className="block font-extrabold">{t('wx.ninoLink')}</span>
          <span className="text-sm text-tierra-700">{t('wx.ninoLinkSub')}</span>
        </span>
        <IconArrow size={18} className="shrink-0 text-tierra-400" />
      </Link>

      <div className="flex gap-2" role="tablist">
        {(['pests', 'disasters'] as const).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`chip ${tab === k ? 'border-noche-800 bg-noche-800 text-white' : 'border-tierra-200 bg-white text-tierra-800'}`}
          >
            {k === 'pests' ? '🪲' : '❄️'} {t(`alerts.tab.${k}` as Key)}
          </button>
        ))}
      </div>

      {tab === 'pests' && (
        <div className="space-y-3">
          <Notice tone="info" title={t('alerts.pestAlert')}>
            {t('alerts.pestAlertText', { alt: elevation.toLocaleString() })}
          </Notice>

          <RiskCalculator
            climatology={climatology}
            elevation={elevation}
            initialMonth={today.getUTCMonth()}
            onOpenPest={(id) => setSelectedPest(id as PestId)}
          />

          <div className="space-y-2">
            {PEST_ORDER.map((id) => {
              const pest = PESTS[id]
              const inZone = risksNow.find((r) => r.pest === id)?.inZone ?? false
              return (
                <button
                  key={id}
                  onClick={() => setSelectedPest(id)}
                  className={`card w-full space-y-1 text-left ${inZone ? 'ring-2 ring-risk/50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-3xl" aria-hidden="true">
                      {pest.emoji}
                    </span>
                    {inZone && <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800">{t('alerts.atRisk')}</span>}
                  </div>
                  <p className="font-extrabold text-noche-800">{L(pest.name)}</p>
                  <p className="text-xs text-tierra-600">
                    “{pest.localName}” · {pest.altRange[0].toLocaleString()}–{pest.altRange[1].toLocaleString()} m
                  </p>
                  <p className="line-clamp-2 text-sm text-tierra-800">{L(pest.description)}</p>
                  <p className="flex items-center justify-end gap-1 text-xs font-bold text-noche-600">
                    {t('alerts.learnMore')} <IconArrow size={14} />
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'disasters' && <DisasterResponse />}

      <p className="text-center text-xs text-tierra-500">{t('alerts.sources')}</p>
      <Attribution />

      {selectedPest && <PestGuideModal pest={PESTS[selectedPest]} onClose={() => setSelectedPest(null)} />}
    </div>
  )
}
