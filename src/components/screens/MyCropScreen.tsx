/**
 * Pantalla Mi Cultivo
 * - Progreso GDD
 * - Días para cosecha
 * - Gráficos de lluvia y temperatura
 */

import { useEffect, useState } from 'react'
import { useQullqa } from '@/context/QullqaContext'
import { Card, Badge, Attribution } from '@/components/common'
import type { MonthlyClimate } from '@/services/nasa/types'

export function MyCropScreen() {
  const { plantingDate, variety, climatology } = useQullqa()
  const [cropInfo, setCropInfo] = useState<any>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (!plantingDate || !variety || !climatology) return

    // Calcular progreso
    const today = new Date()
    const planting = new Date(plantingDate)
    const daysSincePlanting = Math.floor(
      (today.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Metas GDD (simplificado)
    const targets: Record<string, number> = {
      'Yungay': 1050,
      'Canchán': 900,
      'Huayro': 1200,
    }

    const estCycleDays = targets[variety] || 150
    const harvestDate = new Date(planting.getTime() + estCycleDays * 24 * 60 * 60 * 1000)
    const daysUntilHarvest = Math.max(0, Math.floor(
      (harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    ))

    const stages = [
      { name: 'Plantación', range: [0, 10] },
      { name: 'Germinación', range: [10, 30] },
      { name: 'Crecimiento Vegetativo', range: [30, 90] },
      { name: 'Floración', range: [90, 110] },
      { name: 'Tubérización', range: [110, 140] },
      { name: 'Maduración', range: [140, 160] },
    ]

    const currentStage = stages.find(
      s => daysSincePlanting >= s.range[0] && daysSincePlanting <= s.range[1]
    ) || stages[stages.length - 1]

    setCropInfo({
      daysSincePlanting,
      daysUntilHarvest,
      harvestDate,
      currentStage,
      progressPercent: Math.min(100, Math.round((daysSincePlanting / estCycleDays) * 100)),
    })
  }, [plantingDate, variety, climatology])

  if (!plantingDate) {
    return (
      <div className="space-y-6 pb-8 max-w-2xl mx-auto px-4">
        <Card variant="default" className="space-y-4">
          <h2 className="text-2xl font-bold text-tierra">🌱 Mi Cultivo</h2>
          <p className="text-sm text-tierra-600">
            Aún no has plantado. Ve a "Mi chacra" para comenzar.
          </p>
        </Card>
        <Attribution />
      </div>
    )
  }

  if (!cropInfo) {
    return <div />
  }

  return (
    <div className="space-y-6 pb-8 max-w-2xl mx-auto px-4">
      {/* Header */}
      <Card variant="default" className="space-y-3">
        <h2 className="text-2xl font-bold text-tierra">🌱 Mi Cultivo</h2>
        <div className="flex gap-2">
          <Badge variant="info">{variety}</Badge>
          <Badge variant="default">
            Plantado: {new Date(plantingDate).toLocaleDateString('es-PE')}
          </Badge>
        </div>
      </Card>

      {/* Countdown Card */}
      <Card variant="elevated" className="bg-gradient-to-br from-inti-50 to-tierra-50 border-2 border-inti space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-tierra-600">Días para cosecha</p>
          <p className="text-5xl font-bold text-inti">{cropInfo.daysUntilHarvest}</p>
          <p className="text-sm text-tierra-700">
            Cosecha estimada: {cropInfo.harvestDate.toLocaleDateString('es-PE', { month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full bg-tierra-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-inti to-tierra h-full transition-all duration-500"
              style={{ width: `${cropInfo.progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-tierra-600 text-center">
            {cropInfo.progressPercent}% completado
          </p>
        </div>
      </Card>

      {/* Current Stage */}
      <Card variant="default" className="space-y-3">
        <h3 className="font-semibold text-tierra">Etapa actual</h3>
        <div className="space-y-2">
          <p className="text-lg font-bold text-tierra">{cropInfo.currentStage.name}</p>
          <p className="text-sm text-tierra-600">
            Día {cropInfo.daysSincePlanting} desde la plantación
          </p>
        </div>
      </Card>

      {/* Climate Summary */}
      {climatology && (
        <Card variant="outlined" className="space-y-4">
          <h3 className="font-semibold text-tierra">📊 Clima Promedio</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-tierra-50 p-3 rounded">
              <p className="text-xs text-tierra-600">Temperatura Media</p>
              <p className="text-lg font-bold text-tierra">
                {(climatology.reduce((sum: number, m: MonthlyClimate) => sum + m.t2m, 0) / 12).toFixed(1)}°C
              </p>
            </div>
            <div className="bg-tierra-50 p-3 rounded">
              <p className="text-xs text-tierra-600">Lluvia Anual</p>
              <p className="text-lg font-bold text-tierra">
                {climatology.reduce((sum: number, m: MonthlyClimate) => sum + m.precipMmMonth, 0).toFixed(0)}mm
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card variant="outlined" className="bg-inti-50 border-inti-200 space-y-3">
        <h3 className="font-semibold text-inti-700">💡 Recomendaciones</h3>
        {cropInfo.currentStage.name === 'Germinación' && (
          <p className="text-sm text-tierra-700">
            En germinación, mantén el suelo húmedo y protege de heladas nocturnas.
          </p>
        )}
        {cropInfo.currentStage.name === 'Tubérización' && (
          <p className="text-sm text-tierra-700">
            Durante la tubérización, aumenta el riego. La papa necesita humedad para formar tubérculos.
          </p>
        )}
        {cropInfo.currentStage.name === 'Maduración' && (
          <p className="text-sm text-tierra-700">
            En maduración, reduce el riego para mejorar la calidad de los tubérculos.
          </p>
        )}
        {!['Germinación', 'Tubérización', 'Maduración'].includes(cropInfo.currentStage.name) && (
          <p className="text-sm text-tierra-700">
            Mantén observación continua del cultivo. Revisa regularmente el estado de las plantas.
          </p>
        )}
      </Card>

      <Attribution />
    </div>
  )
}
