/**
 * QullqaContext - Estado global de la app
 * Gestiona: ubicación, variedad, datos NASA, estado de carga
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { PotatoVariety } from '@/types'
import { fetchClimatology, fetchDaily, fetchApod } from '@/services/nasa'
import type { MonthlyClimate, DailyRecord, ApodData } from '@/services/nasa/types'

// Crear contexto
const QullqaContext = createContext<any>(undefined)

// Keys para localStorage
const LOCATION_LAT_KEY = 'qullqa_location_lat'
const LOCATION_LON_KEY = 'qullqa_location_lon'
const VARIETY_KEY = 'qullqa_variety'
const PLANTING_DATE_KEY = 'qullqa_planting_date'

// Provider
export function QullqaProvider({ children }: { children: React.ReactNode }) {
  // Estado
  const [location, setLocationState] = useState<{ lat: number; lon: number } | null>(null)
  const [variety, setVarietyState] = useState<PotatoVariety | null>(null)
  const [plantingDate, setPlantingDateState] = useState<string | null>(null)
  const [climatology, setClimatology] = useState<MonthlyClimate[] | null>(null)
  const [dailyData, setDailyData] = useState<DailyRecord[] | null>(null)
  const [apod, setApod] = useState<ApodData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos guardados al iniciar
  useEffect(() => {
    try {
      const savedLat = localStorage.getItem(LOCATION_LAT_KEY)
      const savedLon = localStorage.getItem(LOCATION_LON_KEY)
      const savedVariety = localStorage.getItem(VARIETY_KEY) as PotatoVariety | null
      const savedPlantingDate = localStorage.getItem(PLANTING_DATE_KEY)

      if (savedLat && savedLon) {
        setLocationState({
          lat: parseFloat(savedLat),
          lon: parseFloat(savedLon),
        })
      }

      if (savedVariety) {
        setVarietyState(savedVariety)
      }

      if (savedPlantingDate) {
        setPlantingDateState(savedPlantingDate)
      }
    } catch (err) {
      console.warn('Error loading from localStorage:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar APOD al iniciar
  useEffect(() => {
    fetchApod()
      .then(setApod)
      .catch(err => console.warn('Error fetching APOD:', err))
  }, [])

  // Obtener datos de clima
  const fetchClimateData = useCallback(async () => {
    if (!location) {
      setError('Ubicación no disponible')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch climatología - devuelve objeto Climatology
      const climResult = await fetchClimatology(location.lat, location.lon)
      setClimatology(climResult.months)

      // Mostrar aviso si es fallback
      if (climResult.source === 'fallback') {
        setError('Sin conexión: datos de Cusco')
      }

      // Fetch datos diarios (últimos 30 días)
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      try {
        // fetchDaily devuelve objeto DailySeries
        const dailyResult = await fetchDaily(
          location.lat,
          location.lon,
          thirtyDaysAgo,
          now
        )
        setDailyData(dailyResult.days)
      } catch (dailyErr) {
        // Es OK si falla fetchDaily - seguimos con climatología
        console.warn('Daily data not available:', dailyErr)
        setDailyData(null)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching climate data'
      setError(message)
      console.error('Error fetching climate data:', err)
    } finally {
      setLoading(false)
    }
  }, [location])

  // Refetch
  const refetch = useCallback(async () => {
    await fetchClimateData()
  }, [fetchClimateData])

  // Setters que persisten en localStorage
  const setLocation = useCallback((lat: number, lon: number) => {
    setLocationState({ lat, lon })
    try {
      localStorage.setItem(LOCATION_LAT_KEY, lat.toString())
      localStorage.setItem(LOCATION_LON_KEY, lon.toString())
    } catch (err) {
      console.warn('Error saving location:', err)
    }
  }, [])

  const setVariety = useCallback((v: PotatoVariety) => {
    setVarietyState(v)
    try {
      localStorage.setItem(VARIETY_KEY, v)
    } catch (err) {
      console.warn('Error saving variety:', err)
    }
  }, [])

  const setPlantingDate = useCallback((date: string) => {
    setPlantingDateState(date)
    try {
      localStorage.setItem(PLANTING_DATE_KEY, date)
    } catch (err) {
      console.warn('Error saving planting date:', err)
    }
  }, [])

  const value = {
    location,
    setLocation,
    variety,
    setVariety,
    plantingDate,
    setPlantingDate,
    climatology,
    dailyData,
    apod,
    loading,
    error,
    fetchClimateData,
    refetch,
  }

  return (
    <QullqaContext.Provider value={value}>
      {children}
    </QullqaContext.Provider>
  )
}

// Hook para usar contexto
export function useQullqa() {
  const context = useContext(QullqaContext)
  if (!context) {
    throw new Error('useQullqa debe usarse dentro de QullqaProvider')
  }
  return context
}
