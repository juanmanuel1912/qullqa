import type { ReactNode } from 'react'
import type { DataSource } from '@/services/nasa/types'
import { useI18n } from '@/i18n'
import { IconAlert, IconInfo, IconSatellite } from './Icons'

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-tierra-600" role="status">
      <span className="h-9 w-9 animate-spin rounded-full border-4 border-inti border-t-transparent" />
      {label && <p className="text-sm font-semibold">{label}</p>}
    </div>
  )
}

/** Bloque gris animado mientras llegan los datos. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-3xl bg-tierra-100 ${className}`} />
}

export function Attribution({ dark = false }: { dark?: boolean }) {
  const { t } = useI18n()
  return (
    <p className={`flex items-center justify-center gap-1.5 py-4 text-xs font-semibold ${dark ? 'text-noche-200' : 'text-tierra-500'}`}>
      <IconSatellite size={14} />
      {t('data')}: NASA POWER · GIBS · APOD
    </p>
  )
}

/** Aviso cuando los datos no son en vivo. */
export function SourceNotice({ source }: { source: DataSource | undefined }) {
  const { lang } = useI18n()
  if (source !== 'fallback') return null
  return (
    <Notice tone="warning">
      {lang === 'en' ? 'No connection to NASA. Showing saved data for Cusco.' : 'Sin conexión con la NASA. Mostramos los datos guardados de Cusco.'}
    </Notice>
  )
}

const TONES = {
  info: 'bg-noche-50 text-noche-700 border-noche-100',
  warning: 'bg-inti-50 text-inti-900 border-inti-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
  success: 'bg-green-50 text-green-800 border-green-200',
}

export function Notice({ tone = 'info', title, children }: { tone?: keyof typeof TONES; title?: string; children: ReactNode }) {
  const Icon = tone === 'info' || tone === 'success' ? IconInfo : IconAlert
  return (
    <div className={`flex gap-3 rounded-2xl border p-4 ${TONES[tone]}`}>
      <Icon size={20} className="mt-0.5 shrink-0" />
      <div className="text-sm">
        {title && <p className="font-extrabold">{title}</p>}
        <div className={title ? 'mt-0.5' : ''}>{children}</div>
      </div>
    </div>
  )
}
