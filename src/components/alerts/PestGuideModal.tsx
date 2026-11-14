import { ReactNode } from 'react'
import { useI18n } from '@/i18n'
import type { Pest } from '@/data/pests'
import { IconArrow } from '@/components/common'

interface Props {
  pest: Pest
  onClose: () => void
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="font-extrabold text-noche-800">{title}</h3>
      <div className="text-sm text-tierra-700">{children}</div>
    </div>
  )
}

export default function PestGuideModal({ pest, onClose }: Props) {
  const { t } = useI18n()

  const handleDownloadPDF = () => {
    // Simple PDF generation (in production, use jsPDF)
    const text = `
${pest.nameEs} (${pest.nameQu})
${pest.emoji}

DESCRIPCIÓN:
${pest.description}

RANGO DE ALTITUD: ${pest.altRange[0]}-${pest.altRange[1]} msnm

IDENTIFICACIÓN:
${pest.identification.map((item) => `• ${item}`).join('\n')}

CICLO DE VIDA:
${Object.entries(pest.lifecycle)
  .map(([key, value]) => `• ${key}: ${value}`)
  .join('\n')}

VARIEDADES SUSCEPTIBLES:
${pest.susceptibleVarieties.join(', ')}

VARIEDADES RESISTENTES:
${pest.resistantVarieties.join(', ')}

PREVENCIÓN:
${pest.prevention.map((item) => `• ${item}`).join('\n')}

DETECCIÓN TEMPRANA:
${pest.earlyDetection.map((item) => `• ${item}`).join('\n')}

CONTROL ORGÁNICO:
${pest.control.organic.map((item) => `• ${item}`).join('\n')}

CONTROL QUÍMICO:
${pest.control.chemical.map((item) => `• ${item}`).join('\n')}

IMPACTO DEL FENÓMENO DEL NIÑO:
${pest.ninoImpact}
    `.trim()

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${pest.nameEs.replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30 backdrop-blur-sm sm:items-center">
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 sm:max-h-[85vh] sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{pest.emoji}</span>
            <div>
              <h2 className="font-display text-2xl font-bold text-noche-800">
                {pest.nameEs}
              </h2>
              <p className="text-xs text-tierra-600">{pest.nameQu}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-tierra-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Description */}
          <Section title={t('alerts.description') ?? 'Description'}>
            <p>{pest.description}</p>
          </Section>

          {/* Altitude */}
          <div className="rounded-lg bg-inti-50 p-3">
            <p className="text-xs font-semibold text-inti-700">
              {t('alerts.altitude') ?? 'Altitude'}: {pest.altRange[0]}–{pest.altRange[1]} msnm
            </p>
          </div>

          {/* Identification */}
          <Section title={t('alerts.identification') ?? 'How to Identify'}>
            <ul className="space-y-1">
              {pest.identification.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0">🔍</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Lifecycle */}
          <Section title={t('alerts.lifecycle') ?? 'Life Cycle'}>
            <div className="space-y-1 text-xs">
              <p>
                <span className="font-bold">{t('alerts.generations') ?? 'Generations'}:</span>{' '}
                {pest.generationsPerYear}
              </p>
              <div className="space-y-0.5">
                <p>
                  <span className="font-bold">{t('alerts.stages') ?? 'Stages'}</span>
                </p>
                <ul className="ml-4 space-y-0.5">
                  {Object.entries(pest.lifecycle).map(([key, value]) => (
                      <li key={key} className="flex gap-2">
                        <span className="shrink-0">▪</span>
                        <span>
                          <span className="font-semibold capitalize">
                            {key.replace(/stage\d/, 'Stage')}:
                          </span>{' '}
                          {String(value)}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* Susceptible & Resistant */}
          <div className="grid grid-cols-2 gap-3">
            <Section title={t('alerts.susceptible') ?? 'Susceptible'}>
              <p className="text-xs">
                {pest.susceptibleVarieties.join(', ')}
              </p>
            </Section>
            <Section title={t('alerts.resistant') ?? 'Resistant'}>
              <p className="text-xs">
                {pest.resistantVarieties.join(', ')}
              </p>
            </Section>
          </div>

          {/* Prevention */}
          <Section title={t('alerts.prevention') ?? 'Prevention'}>
            <ul className="space-y-1">
              {pest.prevention.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Early Detection */}
          <Section title={t('alerts.earlyDetection') ?? 'Early Detection'}>
            <ul className="space-y-1">
              {pest.earlyDetection.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0">👁️</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Control Methods */}
          <div className="space-y-3">
            <Section
              title={`${t('alerts.control') ?? 'Control'} 🌿 ${t('alerts.organic') ?? 'Organic'}`}
            >
              <ul className="space-y-1">
                {pest.control.organic.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
            <Section
              title={`${t('alerts.control') ?? 'Control'} ⚗️ ${t('alerts.chemical') ?? 'Chemical'}`}
            >
              <ul className="space-y-1">
                {pest.control.chemical.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          {/* Niño Impact */}
          <div className="rounded-lg bg-yellow-50 p-3">
            <p className="text-sm font-semibold text-yellow-900">
              {t('alerts.ninoImpact') ?? 'El Niño Impact'}:
            </p>
            <p className="mt-1 text-xs text-yellow-800">{pest.ninoImpact}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={handleDownloadPDF}
            className="btn-secondary flex-1"
          >
            📥 {t('alerts.download') ?? 'Download'}
          </button>
          <button onClick={onClose} className="btn-primary flex-1">
            {t('alerts.close') ?? 'Close'} <IconArrow size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
