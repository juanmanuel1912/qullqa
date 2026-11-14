import { useEffect, useState } from 'react'
import { fetchEnso, type EnsoData } from '@/services/enso/noaa'
import { ensoStatus, type EnsoStatus } from '@/lib/agro'

/** Datos de El Niño (NOAA) y su estado calculado. */
export function useEnso(): { data: EnsoData | null; status: EnsoStatus | null } {
  const [data, setData] = useState<EnsoData | null>(null)
  useEffect(() => {
    const ctrl = new AbortController()
    fetchEnso(ctrl.signal)
      .then(setData)
      .catch(() => undefined)
    return () => ctrl.abort()
  }, [])
  return { data, status: data ? ensoStatus(data.oni, data.nino12) : null }
}
