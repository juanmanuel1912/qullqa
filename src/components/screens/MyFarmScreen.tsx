/**
 * Pantalla Mi Chacra
 * - Ubicación (GPS + manual)
 * - Variedad de papa
 * - Botón para continuar (dispara fetchClimateData)
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { useGeolocation } from '@/hooks/useGeolocation'
import { Button, Card, Loading, Badge, Attribution } from '@/components/common'
import type { PotatoVariety } from '@/types'

const VARIETIES: { id: PotatoVariety; name: string; daysToHarvest: number; temp: string }[] = [
  {
    id: 'Yungay',
    name: 'Yungay',
    daysToHarvest: 160,
    temp: 'Climas fríos, 2000-3800 msnm',
  },
  {
    id: 'Canchán',
    name: 'Canchán',
    daysToHarvest: 135,
    temp: 'Climas templados, 2200-3600 msnm',
  },
  {
    id: 'Huayro',
    name: 'Huayro',
    daysToHarvest: 185,
    temp: 'Climas altos, 2500-3900 msnm',
  },
]

export function MyFarmScreen() {
  const navigate = useNavigate()
  const { location, setLocation, variety, setVariety, fetchClimateData, loading, error } = useQullqa()
  const geoLocation = useGeolocation()

  const [selectedVariety, setSelectedVariety] = useState<PotatoVariety | null>(variety)
  const [manualLat, setManualLat] = useState(location?.lat.toString() || '')
  const [manualLon, setManualLon] = useState(location?.lon.toString() || '')
  const [useManual, setUseManual] = useState(!!location)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Si GPS está listo y no hay ubicación manual
  useEffect(() => {
    if (!useManual && geoLocation.lat && geoLocation.lon && !location) {
      setLocation(geoLocation.lat, geoLocation.lon)
    }
  }, [geoLocation.lat, geoLocation.lon, useManual, location, setLocation])

  const currentLocation = useManual
    ? { lat: parseFloat(manualLat) || 0, lon: parseFloat(manualLon) || 0 }
    : location

  const canContinue =
    currentLocation &&
    selectedVariety &&
    !Number.isNaN(currentLocation.lat) &&
    !Number.isNaN(currentLocation.lon)

  const handleContinue = async () => {
    if (!currentLocation || !selectedVariety) return

    // Guardar ubicación y variedad
    setLocation(currentLocation.lat, currentLocation.lon)
    setVariety(selectedVariety)

    // Fetch datos de clima y navegar
    await fetchClimateData()
    navigate('/calendar')
  }

  return (
    <div className="space-y-6 pb-8 max-w-2xl mx-auto px-4">
      <Card variant="default" className="space-y-4">
        <h2 className="text-2xl font-bold text-tierra">Mi chacra</h2>
        <p className="text-sm text-tierra-600">
          Cuéntame dónde está tu chacra y qué variedad de papa siembras.
        </p>
      </Card>

      {/* Ubicación */}
      <Card variant="elevated" className="space-y-4">
        <h3 className="text-lg font-semibold text-tierra">📍 Ubicación</h3>

        {/* Selector GPS vs Manual */}
        <div className="flex gap-2">
          <Button
            variant={!useManual ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setUseManual(false)}
            className="flex-1"
          >
            {geoLocation.loading ? '⏳ GPS...' : '📡 GPS'}
          </Button>
          <Button
            variant={useManual ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setUseManual(true)}
            className="flex-1"
          >
            ✏️ Manual
          </Button>
        </div>

        {/* GPS Status */}
        {!useManual && (
          <div className="space-y-2">
            {geoLocation.loading && <Loading message="Obteniendo ubicación..." />}
            {geoLocation.error && (
              <p className="text-sm text-red-600">{geoLocation.error}</p>
            )}
            {geoLocation.lat && geoLocation.lon && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium text-green-700">✓ Ubicación obtenida</p>
                <p className="text-xs text-green-600">
                  {geoLocation.lat.toFixed(4)}°, {geoLocation.lon.toFixed(4)}°
                </p>
              </div>
            )}
          </div>
        )}

        {/* Manual Input */}
        {useManual && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-tierra-700 mb-1">
                Latitud
              </label>
              <input
                type="number"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                placeholder="-13.5319"
                step="0.0001"
                className="w-full px-3 py-2 border border-tierra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-inti"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-tierra-700 mb-1">
                Longitud
              </label>
              <input
                type="number"
                value={manualLon}
                onChange={(e) => setManualLon(e.target.value)}
                placeholder="-71.9754"
                step="0.0001"
                className="w-full px-3 py-2 border border-tierra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-inti"
              />
            </div>
          </div>
        )}

        {currentLocation && (
          <Badge variant="info">
            📍 {currentLocation.lat.toFixed(4)}°, {currentLocation.lon.toFixed(4)}°
          </Badge>
        )}
      </Card>

      {/* Variedad de Papa */}
      <Card variant="elevated" className="space-y-4">
        <h3 className="text-lg font-semibold text-tierra">🥔 Variedad de papa</h3>
        <p className="text-xs text-tierra-600">
          Elige la variedad que siembras en tu chacra.
        </p>

        <div className="space-y-2">
          {VARIETIES.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVariety(v.id)}
              className={`
                w-full p-3 rounded-lg border-2 transition-all text-left
                ${
                  selectedVariety === v.id
                    ? 'border-inti bg-inti-50'
                    : 'border-tierra-200 bg-white hover:border-tierra-300'
                }
              `}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-tierra">{v.name}</p>
                  <p className="text-xs text-tierra-600 mt-1">{v.temp}</p>
                </div>
                <Badge
                  variant={selectedVariety === v.id ? 'info' : 'default'}
                  size="sm"
                >
                  ~{v.daysToHarvest}d
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Error Display */}
      {error && !error.includes('Sin conexión') && (
        <Card variant="outlined" className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      {/* CTA */}
      <Button
        onClick={handleContinue}
        variant="primary"
        size="lg"
        disabled={!canContinue || loading}
        loading={loading}
        className="w-full"
      >
        {loading ? 'Cargando datos de clima...' : 'Ver calendario 📅'}
      </Button>

      {/* Ayuda */}
      <Card variant="outlined" className="space-y-2">
        <p className="text-xs font-semibold text-tierra-700">💡 Consejo</p>
        <p className="text-xs text-tierra-600">
          Si no tienes GPS, puedes entrar las coordenadas manualmente. 
          Ejemplo: Cusco es -13.5319, -71.9754.
        </p>
      </Card>

      <Attribution />
    </div>
  )
}
