/**
 * Pantalla Calendario Inca Circular
 * - SVG con 12 meses coloreados por semáforo
 * - Modal de detalles al clickear
 * - Info de siembra y cosecha
 */

import { useEffect, useState } from 'react'
import { useQullqa } from '@/context/QullqaContext'
import { buildCalendar } from '@/lib/agro/calendar'
import { recommendSowing } from '@/lib/agro/sowing'
import { Card, Loading, Attribution } from '@/components/common'
import { CircularCalendar } from '@/components/calendar/CircularCalendar'
import { MonthDetail } from '@/components/calendar/MonthDetail'
import type { Climatology } from '@/services/nasa/types'
import type { VarietyId } from '@/lib/agro/varieties'

export function CalendarScreen() {
  const { climatology, variety, location } = useQullqa()
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [calendarMonths, setCalendarMonths] = useState<any[]>([])
  const [sowingRec, setSowingRec] = useState<any>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Calcular calendario cuando hay datos
  useEffect(() => {
    if (!climatology || !variety) return

    try {
      // Convertir climatología a formato que necesita Claude
      const climData: Climatology = {
        lat: location?.lat ?? -13.5319,
        lon: location?.lon ?? -71.9754,
        elevation: null,
        months: climatology,
        source: 'nasa',
        fetchedAt: new Date().toISOString(),
      }

      // Construir calendario
      const months = buildCalendar(climData, variety as VarietyId)
      setCalendarMonths(months)

      // Obtener recomendación de siembra
      const rec = recommendSowing(climData, variety as VarietyId)
      setSowingRec(rec)
    } catch (err) {
      console.error('Error building calendar:', err)
    }
  }, [climatology, variety, location])

  if (!climatology) {
    return (
      <div className="space-y-6 pb-8 max-w-2xl mx-auto px-4">
        <Card variant="default" className="space-y-4">
          <h2 className="text-2xl font-bold text-tierra">📅 Calendario Inca</h2>
          <Loading message="Cargando datos de clima..." />
        </Card>
        <Attribution />
      </div>
    )
  }

  const selectedMonthData = selectedMonth !== null ? calendarMonths[selectedMonth] : null

  return (
    <div className="space-y-6 pb-8 max-w-2xl mx-auto px-4">
      {/* Header */}
      <Card variant="default" className="space-y-3">
        <h2 className="text-2xl font-bold text-tierra">📅 Calendario Agrícola Inca</h2>
        <p className="text-sm text-tierra-600">
          Los 12 meses andinos coloreados según el clima para {variety}.
        </p>
      </Card>

      {/* Sowing Recommendation Card */}
      {sowingRec && (
        <Card variant="elevated" className="space-y-4 border-l-4 border-l-inti">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-inti">🌱 ¿Cuándo siembro?</h3>
            <p className="text-sm text-tierra-700 font-medium">{sowingRec.best.label}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-inti-50 rounded p-3">
              <p className="text-xs text-inti-700">Mejor mes</p>
              <p className="text-sm font-bold text-inti">
                {sowingRec.best.sowDate && new Date(sowingRec.best.sowDate).toLocaleDateString('es-PE', { month: 'long' })}
              </p>
            </div>
            <div className="bg-tierra-50 rounded p-3">
              <p className="text-xs text-tierra-600">Cosecha en</p>
              <p className="text-sm font-bold text-tierra">
                {sowingRec.best.harvestDate && new Date(sowingRec.best.harvestDate).toLocaleDateString('es-PE', { month: 'long' })}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-inti-100">
            <p className="text-xs text-tierra-700">
              <strong>Razones:</strong> {sowingRec.best.reasons?.join(', ') || 'Condiciones favorables'}
            </p>
          </div>
        </Card>
      )}

      {/* Circular Calendar */}
      <Card variant="elevated" className="space-y-4">
        <h3 className="text-lg font-semibold text-tierra text-center">
          Toca un mes para ver detalles
        </h3>

        {calendarMonths.length > 0 && (
          <CircularCalendar
            months={calendarMonths}
            onMonthClick={setSelectedMonth}
            sowingMonth={sowingRec?.best?.sowDate ? new Date(sowingRec.best.sowDate).getMonth() : undefined}
            harvestMonth={sowingRec?.best?.harvestDate ? new Date(sowingRec.best.harvestDate).getMonth() : undefined}
          />
        )}

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 text-xs pt-4 border-t border-tierra-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-tierra-700">Bueno</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span className="text-tierra-700">Cuidado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-tierra-700">Riesgo</span>
          </div>
        </div>
      </Card>

      {/* Ancestral Message */}
      <Card variant="outlined" className="bg-noche-50 border-noche-200 space-y-2">
        <p className="text-sm font-semibold text-noche">🌟 Sabiduría de las Pléyades</p>
        <p className="text-xs text-tierra-700">
          "En junio, al amanecer, los incas miraban las Pléyades (Qullqa, 'el depósito'). 
          Si brillaban claras, sabían que vendría buen año de lluvias. 
          Hoy, los satélites de la NASA nos leen el cielo de la misma forma."
        </p>
      </Card>

      <Attribution />

      {/* Month Detail Modal */}
      {selectedMonth !== null && selectedMonthData && (
        <MonthDetail
          month={selectedMonthData}
          monthIndex={selectedMonth}
          onClose={() => setSelectedMonth(null)}
        />
      )}
    </div>
  )
}
