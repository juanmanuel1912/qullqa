/**
 * Pantalla Qullqa en Marte
 * - Simulador interactivo
 * - Sliders: temperatura, luz, agua
 * - Comparación con Tierra
 */

import { useEffect, useState } from 'react'
import { useQullqa } from '@/context/QullqaContext'
import { simulateMars, MARS } from '@/lib/mars/model'
import { Card, Badge, Attribution } from '@/components/common'
import type { PotatoVariety } from '@/types'

interface MarsEnvironment {
  tempC: number
  lightPct: number
  waterPct: number
}

const DEFAULT_ENV: MarsEnvironment = {
  tempC: MARS.avgSurfaceTempC,
  lightPct: 43,
  waterPct: 50,
}

export function MarsScreen() {
  const { variety } = useQullqa()
  const [environment, setEnvironment] = useState<MarsEnvironment>(DEFAULT_ENV)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Simular cuando cambian parámetros
  useEffect(() => {
    if (!variety) return
    try {
      const sim = simulateMars({
        tempC: environment.tempC,
        lightPct: environment.lightPct,
        waterPct: environment.waterPct,
        variety: variety as any,
      })
      setResult(sim)
    } catch (err) {
      console.warn('Mars simulation error:', err)
    }
  }, [environment, variety])

  const handleSliderChange = (key: keyof MarsEnvironment, value: number) => {
    setEnvironment(prev => ({ ...prev, [key]: value }))
  }

  const presets = [
    {
      name: 'Al aire libre',
      desc: 'Condiciones reales de Marte',
      env: DEFAULT_ENV,
    },
    {
      name: 'Invernadero',
      desc: 'Invernadero básico con calefacción',
      env: { tempC: -20, lightPct: 60, waterPct: 70 },
    },
    {
      name: 'Invernadero + LED',
      desc: 'Con luces LED y riego automático',
      env: { tempC: 10, lightPct: 95, waterPct: 85 },
    },
  ]

  return (
    <div className="space-y-6 pb-8 max-w-2xl mx-auto px-4">
      {/* Header */}
      <Card variant="default" className="space-y-3">
        <h2 className="text-2xl font-bold text-tierra">🔴 Qullqa en Marte</h2>
        <p className="text-sm text-tierra-600">
          ¿Qué pasaría si sembráramos {variety || 'papa'} en Marte?
        </p>
      </Card>

      {/* Presets */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-tierra">Escenarios:</p>
        <div className="grid grid-cols-1 gap-2">
          {presets.map((preset, i) => (
            <button
              key={i}
              onClick={() => setEnvironment(preset.env)}
              className={`
                text-left p-3 rounded-lg border-2 transition-all
                ${
                  JSON.stringify(environment) === JSON.stringify(preset.env)
                    ? 'border-inti bg-inti-50'
                    : 'border-tierra-200 bg-white hover:border-tierra-300'
                }
              `}
            >
              <p className="font-semibold text-tierra">{preset.name}</p>
              <p className="text-xs text-tierra-600">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <Card variant="elevated" className="space-y-6">
        <h3 className="font-semibold text-tierra">Ajusta el ambiente</h3>

        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-tierra">🌡️ Temperatura</label>
            <span className="text-lg font-bold text-inti">{environment.tempC}°C</span>
          </div>
          <input
            type="range"
            min="-80"
            max="35"
            value={environment.tempC}
            onChange={(e) => handleSliderChange('tempC', parseInt(e.target.value))}
            className="w-full cursor-pointer"
          />
          <p className="text-xs text-tierra-600">
            Marte: -63°C media | Tierra: ~13°C media
          </p>
        </div>

        {/* Light */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-tierra">💡 Luz</label>
            <span className="text-lg font-bold text-inti">{environment.lightPct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={environment.lightPct}
            onChange={(e) => handleSliderChange('lightPct', parseInt(e.target.value))}
            className="w-full cursor-pointer"
          />
          <p className="text-xs text-tierra-600">
            Marte: ~43% luz terrestre | Tierra: 100%
          </p>
        </div>

        {/* Water */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-tierra">💧 Agua</label>
            <span className="text-lg font-bold text-inti">{environment.water}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={environment.water}
            onChange={(e) => handleSliderChange('water', parseInt(e.target.value))}
            className="w-full cursor-pointer"
          />
          <p className="text-xs text-tierra-600">
            Disponibilidad de agua en el invernadero
          </p>
        </div>
      </Card>

      {/* Results */}
      {result && (
        <Card variant="elevated" className="space-y-4 bg-gradient-to-br from-noche-50 to-inti-50">
          <h3 className="font-semibold text-tierra">Resultados de la simulación</h3>

          {/* Viability */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-tierra-700">Viabilidad:</span>
            <Badge
              variant={
                result.viable
                  ? result.earthDays && result.earthDays < 200
                    ? 'success'
                    : 'warning'
                  : 'danger'
              }
            >
              {result.viable
                ? result.earthDays && result.earthDays < 200
                  ? '✓ Buena'
                  : '⚠️ Posible pero lento'
                : '✗ No viable'}
            </Badge>
          </div>

          {/* Days to harvest */}
          <div className="space-y-2">
            <p className="text-sm text-tierra-600">Cosecha en Marte:</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-tierra-600">Soles (días marcianos)</p>
                <p className="text-2xl font-bold text-noche">
                  {result.sols ? Math.round(result.sols) : '—'}
                </p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-tierra-600">Días terrestres</p>
                <p className="text-2xl font-bold text-noche">
                  {result.earthDays ? Math.round(result.earthDays) : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <Card variant="outlined" className="space-y-2">
            <p className="text-sm font-semibold text-tierra">Comparación con Tierra</p>
            <p className="text-xs text-tierra-700">
              En Tierra (condiciones ideales): ~160 días para {variety}
            </p>
            <p className="text-xs text-tierra-700 font-semibold">
              {result.earthDays && result.earthDays > 160 ? '🔴 Más lento en Marte' : result.earthDays ? '🟢 Similar o más rápido' : '—'}
            </p>
          </Card>

          {/* Notes */}
          {result.notes && result.notes.length > 0 && (
            <div className="space-y-2 p-3 bg-white rounded">
              <p className="text-xs font-semibold text-tierra">Notas:</p>
              <ul className="text-xs text-tierra-600 space-y-1">
                {result.notes.map((note: string, i: number) => (
                  <li key={i}>• {note}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Curiosidades */}
      <Card variant="outlined" className="bg-noche-50 border-noche-200 space-y-3">
        <h3 className="font-semibold text-noche">🚀 Datos de Marte</h3>
        <ul className="text-xs text-tierra-700 space-y-2">
          <li>
            <strong>Día marciano (Sol):</strong> 24h 37m — casi igual a Tierra
          </li>
          <li>
            <strong>Luz solar:</strong> ~43% de la Tierra a causa de la distancia
          </li>
          <li>
            <strong>Atmósfera:</strong> 95% CO₂, presión 1% de Tierra
          </li>
          <li>
            <strong>Temperatura media:</strong> -63°C (hasta -140°C en polos)
          </li>
          <li>
            <strong>Agua:</strong> Hielo en casquetes y subsuelo
          </li>
        </ul>
      </Card>

      <Attribution />
    </div>
  )
}
