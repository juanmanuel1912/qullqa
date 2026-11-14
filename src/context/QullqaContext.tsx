/**
 * Estado global de Qullqa: perfil de la chacra (guardado en el teléfono),
 * datos de la NASA y todo lo que se calcula con ellos.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CUSCO, fetchApod, fetchClimatology, fetchDaily } from '@/services/nasa'
import type { ApodData, Climatology, DailyRecord } from '@/services/nasa/types'
import {
  buildCalendar,
  getCropStatus,
  recommendSowing,
  weeklySeries,
  type CalendarMonth,
  type CropStatus,
  type SowingRecommendation,
  type VarietyId,
  type WeekPoint,
} from '@/lib/agro'
import { addDaysIso, todayIso, todayUtc } from '@/utils/format'

export interface FarmProfile {
  lat: number
  lon: number
  placeName: string
  variety: VarietyId
  /** 'YYYY-MM-DD' o null si aún no sembró */
  plantingDate: string | null
  /** Ya completó "Mi chacra" al menos una vez */
  onboarded: boolean
}

export const DEFAULT_PROFILE: FarmProfile = {
  lat: CUSCO.lat,
  lon: CUSCO.lon,
  placeName: 'Cusco',
  variety: 'yungay',
  plantingDate: null,
  onboarded: false,
}

const PROFILE_KEY = 'qullqa:v1:profile'

function loadProfile(): FarmProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw) return { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<FarmProfile>) }
  } catch {
    /* sin almacenamiento: perfil por defecto */
  }
  return DEFAULT_PROFILE
}

function saveProfile(p: FarmProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
  } catch {
    /* ignorar */
  }
}

interface QullqaState {
  profile: FarmProfile
  updateProfile: (patch: Partial<FarmProfile>) => void
  today: Date
  climatology: Climatology | null
  climateLoading: boolean
  daily: DailyRecord[]
  dailyLoading: boolean
  apod: ApodData | null
  calendar: CalendarMonth[] | null
  sowing: SowingRecommendation | null
  crop: CropStatus | null
  weekly: WeekPoint[] | null
}

const QullqaContext = createContext<QullqaState | null>(null)

export function QullqaProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<FarmProfile>(loadProfile)
  const [today] = useState(todayUtc)
  const [climatology, setClimatology] = useState<Climatology | null>(null)
  const [climateLoading, setClimateLoading] = useState(true)
  const [daily, setDaily] = useState<DailyRecord[]>([])
  const [dailyLoading, setDailyLoading] = useState(false)
  const [apod, setApod] = useState<ApodData | null>(null)

  const updateProfile = useCallback((patch: Partial<FarmProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch }
      saveProfile(next)
      return next
    })
  }, [])

  // Foto del día
  useEffect(() => {
    const ctrl = new AbortController()
    fetchApod(ctrl.signal).then(setApod)
    return () => ctrl.abort()
  }, [])

  // Climatología: cada vez que cambia la ubicación
  useEffect(() => {
    const ctrl = new AbortController()
    setClimateLoading(true)
    fetchClimatology(profile.lat, profile.lon, ctrl.signal)
      .then((c) => {
        setClimatology(c)
        setClimateLoading(false)
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setClimateLoading(false)
      })
    return () => ctrl.abort()
  }, [profile.lat, profile.lon])

  // Datos diarios: desde la siembra (o las últimas 5 semanas) hasta hoy
  useEffect(() => {
    const ctrl = new AbortController()
    const now = todayIso()
    const recent = addDaysIso(now, -35)
    const oldest = addDaysIso(now, -400)
    let start = profile.plantingDate && profile.plantingDate < recent ? profile.plantingDate : recent
    if (start < oldest) start = oldest
    setDailyLoading(true)
    fetchDaily(profile.lat, profile.lon, new Date(`${start}T00:00:00Z`), new Date(`${now}T00:00:00Z`), ctrl.signal)
      .then((s) => setDaily(s.days))
      .catch(() => {
        if (!ctrl.signal.aborted) setDaily([])
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setDailyLoading(false)
      })
    return () => ctrl.abort()
  }, [profile.lat, profile.lon, profile.plantingDate])

  const derived = useMemo(() => {
    if (!climatology) return { calendar: null, sowing: null, crop: null, weekly: null }
    return {
      calendar: buildCalendar(climatology, profile.variety, today.getUTCFullYear()),
      sowing: recommendSowing(climatology, profile.variety, today),
      crop: profile.plantingDate
        ? getCropStatus({
            sowingDate: new Date(`${profile.plantingDate}T00:00:00Z`),
            variety: profile.variety,
            climatology,
            daily,
            today,
          })
        : null,
      weekly: weeklySeries(climatology, daily, today),
    }
  }, [climatology, daily, profile.variety, profile.plantingDate, today])

  const value: QullqaState = {
    profile,
    updateProfile,
    today,
    climatology,
    climateLoading,
    daily,
    dailyLoading,
    apod,
    ...derived,
  }

  return <QullqaContext.Provider value={value}>{children}</QullqaContext.Provider>
}

export function useQullqa(): QullqaState {
  const ctx = useContext(QullqaContext)
  if (!ctx) throw new Error('useQullqa debe usarse dentro de QullqaProvider')
  return ctx
}
