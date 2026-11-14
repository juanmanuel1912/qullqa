/**
 * Hook para obtener geolocalización del usuario
 */

import { useState, useEffect } from 'react'

interface GeolocationState {
  lat: number | null;
  lon: number | null;
  loading: boolean;
  error: string | null;
}

const CUSCO_LAT = parseFloat(
  (import.meta.env.VITE_CUSCO_LAT as string) || '-13.5319'
)
const CUSCO_LON = parseFloat(
  (import.meta.env.VITE_CUSCO_LON as string) || '-71.9754'
)

/**
 * Hook que intenta obtener GPS del usuario, fallback a Cusco
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lon: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const getLocation = async () => {
      // Primero intentar con stored location
      try {
        const storedLat = localStorage.getItem('qullqa_location_lat')
        const storedLon = localStorage.getItem('qullqa_location_lon')

        if (storedLat && storedLon) {
          setState({
            lat: parseFloat(storedLat),
            lon: parseFloat(storedLon),
            loading: false,
            error: null,
          })
          return
        }
      } catch {
        // localStorage no disponible, continuar
      }

      // Intentar con geolocalización de navegador
      if (!navigator.geolocation) {
        // No hay GPS disponible, usar Cusco
        setState({
          lat: CUSCO_LAT,
          lon: CUSCO_LON,
          loading: false,
          error: 'Geolocalización no disponible, usando Cusco',
        })
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setState({
            lat: latitude,
            lon: longitude,
            loading: false,
            error: null,
          })

          // Guardar para próxima sesión
          try {
            localStorage.setItem('qullqa_location_lat', latitude.toString())
            localStorage.setItem('qullqa_location_lon', longitude.toString())
          } catch {
            // localStorage lleno o deshabilitado
          }
        },
        (error) => {
          // GPS rechazado o no disponible, fallback a Cusco
          console.warn('Geolocation error:', error.message)
          setState({
            lat: CUSCO_LAT,
            lon: CUSCO_LON,
            loading: false,
            error: `GPS no disponible: ${error.message}. Usando Cusco.`,
          })
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
        }
      )
    }

    getLocation()
  }, [])

  return state
}

/**
 * Hook para obtener ubicación manual
 */
export function useLocationManager() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)

  const saveLocation = (lat: number, lon: number) => {
    setLocation({ lat, lon })
    try {
      localStorage.setItem('qullqa_location_lat', lat.toString())
      localStorage.setItem('qullqa_location_lon', lon.toString())
    } catch {
      console.warn('Error saving location to localStorage')
    }
  }

  const loadLocation = () => {
    try {
      const lat = localStorage.getItem('qullqa_location_lat')
      const lon = localStorage.getItem('qullqa_location_lon')
      if (lat && lon) {
        setLocation({
          lat: parseFloat(lat),
          lon: parseFloat(lon),
        })
        return { lat: parseFloat(lat), lon: parseFloat(lon) }
      }
    } catch {
      console.warn('Error loading location from localStorage')
    }
    return null
  }

  return { location, saveLocation, loadLocation }
}
