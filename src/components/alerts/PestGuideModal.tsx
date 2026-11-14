import type { ReactNode } from 'react'
import { useI18n } from '@/i18n'
import type { Pest } from '@/data/pests'

interface Props {
  pest: Pest
  onClose: () => void
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="font-extrabold text-noche-800">{title}</h3>
      <div className="text-sm text-tierra-800">{children}</div>
    </div>
  )
}

/** Ficha de una plaga (información general, sin productos químicos). */
export default function PestGuideModal({ pest, onClose }: Props) {
  const { t, L } = useI18n()

  const download = () => {
    const lines = [
      `${L(pest.name)} (${pest.localName}) — ${pest.scientific}`,
      '',
      L(pest.description),
      '',
      `${t('alerts.identification')}:`,
      ...pest.identification.map((x) => `- ${L(x)}`),
      '',
      `${t('alerts.prevention')}:`,
      ...pest.prevention.map((x) => `- ${L(x)}`),
      '',
      `${t('alerts.biological')}:`,
      ...pest.biological.map((x) => `- ${L(x)}`),
      '',
      t('alerts.chemicalNote'),
      '',
      t('alerts.sources'),
    ]
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `qullqa-${pest.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={L(pest.name)}>
      <div className="max-h-[88vh] w-full max-w-md space-y-5 overflow-y-auto rounded-t-3xl bg-white p-5">
        <div className="flex items-start gap-3">
          <span className="text-4xl" aria-hidden="true">
            {pest.emoji}
          </span>
          <div className="flex-1">
            <h2 className="font-display text-2xl text-noche-800">{L(pest.name)}</h2>
            <p className="text-sm text-tierra-600">
              “{pest.localName}” · <em>{pest.scientific}</em>
            </p>
          </div>
          <button onClick={onClose} className="text-2xl text-tierra-500" aria-label={t('alerts.close')}>
            ✕
          </button>
        </div>

        <p className="text-[15px] leading-relaxed text-tierra-900">{L(pest.description)}</p>
        <p className="rounded-2xl bg-inti-50 p-3 text-xs font-bold text-inti-900">
          {t('alerts.altitude')}: {pest.altRange[0].toLocaleString()}–{pest.altRange[1].toLocaleString()} m · {L(pest.weatherNote)}
        </p>

        <Section title={`🔍 ${t('alerts.identification')}`}>
          <ul className="space-y-1">
            {pest.identification.map((x, i) => (
              <li key={i}>• {L(x)}</li>
            ))}
          </ul>
        </Section>

        <Section title={`✓ ${t('alerts.prevention')}`}>
          <ul className="space-y-1">
            {pest.prevention.map((x, i) => (
              <li key={i}>• {L(x)}</li>
            ))}
          </ul>
        </Section>

        <Section title={`🌿 ${t('alerts.biological')}`}>
          <ul className="space-y-1">
            {pest.biological.map((x, i) => (
              <li key={i}>• {L(x)}</li>
            ))}
          </ul>
        </Section>

        <p className="rounded-2xl border-2 border-risk/40 bg-red-50 p-3 text-sm text-red-900">⚠️ {t('alerts.chemicalNote')}</p>
        <p className="text-xs text-tierra-500">{t('alerts.sources')}</p>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={download} className="btn-ghost">
            📥 {t('alerts.download')}
          </button>
          <button onClick={onClose} className="btn-primary">
            {t('alerts.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
