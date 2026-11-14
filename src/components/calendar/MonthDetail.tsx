/**
 * Modal con detalles de un mes del calendario
 */

import { Card, Badge, Button } from '@/components/common'
import type { CalendarMonth } from '@/lib/agro/calendar'

interface MonthDetailProps {
  month: CalendarMonth
  monthIndex: number
  onClose: () => void
}

const MONTH_NAMES_SPANISH = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function MonthDetail({ month, monthIndex, onClose }: MonthDetailProps) {
  const statusLabel = {
    good: 'Excelente para sembrar',
    caution: 'Cuidado',
    risk: 'Riesgo',
  }[month.condition.status]

  const statusVariant = {
    good: 'success',
    caution: 'warning',
    risk: 'danger',
  }[month.condition.status] as 'success' | 'warning' | 'danger'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-tierra-200 p-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-tierra">{MONTH_NAMES_SPANISH[monthIndex]}</h2>
            <p className="text-sm text-tierra-600">{month.quechua}</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-tierra-600 hover:text-tierra"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Status */}
          <div>
            <Badge variant={statusVariant} size="md">
              {statusLabel}
            </Badge>
          </div>

          {/* Climate Data */}
          <Card variant="outlined" className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-tierra-600">Temperatura Media</p>
              <p className="text-lg font-bold text-tierra">{month.climate.t2m.toFixed(1)}°C</p>
            </div>
            <div>
              <p className="text-xs text-tierra-600">Temperatura Mínima</p>
              <p className="text-lg font-bold text-tierra">{month.climate.t2mMin.toFixed(1)}°C</p>
            </div>
            <div>
              <p className="text-xs text-tierra-600">Precipitación</p>
              <p className="text-lg font-bold text-tierra">{month.climate.precipMmMonth.toFixed(0)}mm</p>
            </div>
            <div>
              <p className="text-xs text-tierra-600">Humedad Raíz</p>
              <p className="text-lg font-bold text-tierra">{(month.climate.gwetRoot * 100).toFixed(0)}%</p>
            </div>
          </Card>

          {/* Sowing Info */}
          {month.sowing && (
            <Card variant="default" className="space-y-3">
              <h3 className="font-semibold text-tierra">🌱 Siembra en este mes</h3>
              <p className="text-sm text-tierra-700">{month.sowing.label}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-tierra-50 p-2 rounded">
                  <p className="text-tierra-600">Puntuación</p>
                  <p className="text-lg font-bold text-tierra">{month.sowing.score}/100</p>
                </div>
                <div className="bg-tierra-50 p-2 rounded">
                  <p className="text-tierra-600">Ciclo estimado</p>
                  <p className="text-lg font-bold text-tierra">~160d</p>
                </div>
              </div>
            </Card>
          )}

          {/* Frost Warning */}
          {month.condition.frostRisk && (
            <Card variant="outlined" className="border-red-200 bg-red-50 space-y-2">
              <p className="text-sm font-semibold text-red-700">⚠️ Riesgo de helada</p>
              <p className="text-xs text-red-600">
                Temperatura mínima bajo 0°C. Cuidado en germinación.
              </p>
            </Card>
          )}

          {/* Ancestral wisdom */}
          <Card variant="outlined" className="bg-inti-50 border-inti-200 space-y-2">
            <p className="text-xs font-semibold text-inti-700">📚 Lo que hacían los incas</p>
            <p className="text-sm text-tierra-700">{month.ancestral}</p>
          </Card>

          {/* Close Button */}
          <Button onClick={onClose} variant="secondary" size="md" className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
