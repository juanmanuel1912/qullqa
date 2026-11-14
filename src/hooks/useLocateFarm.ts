import { useState } from 'react'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n } from '@/i18n'

export type LocateStatus = 'idle' | 'locating' | 'error'

const round = (n: number) => Math.round(n * 1e4) / 1e4

/** Cambiar la chacra activa: por GPS o eligiendo un lugar. Todo el resto de la app se recalcula. */
export function useLocateFarm() {
  const { updateProfile } = useQullqa()
  const { t } = useI18n()
  const [status, setStatus] = useState<LocateStatus>('idle')

  const pick = (lat: number, lon: number, placeName: string, extra: { onboarded?: boolean } = {}) =>
    updateProfile({ lat: round(lat), lon: round(lon), placeName, ...extra })

  const locate = (extra: { onboarded?: boolean } = {}) => {
    if (!navigator.geolocation) return setStatus('error')
    setStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (p) => {
        pick(p.coords.latitude, p.coords.longitude, t('farm.gpsName'), extra)
        setStatus('idle')
      },
      () => setStatus('error'),
      { timeout: 10_000, maximumAge: 600_000 },
    )
  }

  return { status, locate, pick }
}
