/**
 * Calendario Inca Circular - SVG
 * 12 meses en círculo, coloreados por semáforo
 */

import { useMemo } from 'react'
import type { CalendarMonth } from '@/lib/agro/calendar'

interface CircularCalendarProps {
  months: CalendarMonth[]
  onMonthClick?: (monthIndex: number) => void
  currentMonth?: number
  sowingMonth?: number
  harvestMonth?: number
}

type TrafficLight = 'good' | 'caution' | 'risk'

const COLORS: Record<TrafficLight, string> = {
  good: '#22c55e', // green
  caution: '#eab308', // yellow
  risk: '#ef4444', // red
}

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function CircularCalendar({
  months,
  onMonthClick,
  currentMonth,
  sowingMonth,
  harvestMonth,
}: CircularCalendarProps) {
  const size = 280
  const radius = size / 2 - 20
  const centerX = size / 2
  const centerY = size / 2

  const monthElements = useMemo(() => {
    return months.map((month, i) => {
      const angle = (i / 12) * 360 - 90 // start from top
      const rad = (angle * Math.PI) / 180
      const x = centerX + radius * Math.cos(rad)
      const y = centerY + radius * Math.sin(rad)

      const color = COLORS[month.condition.status]
      const isSowing = sowingMonth === i
      const isHarvest = harvestMonth === i
      const isCurrent = currentMonth === i

      return {
        month,
        i,
        x,
        y,
        angle,
        color,
        isSowing,
        isHarvest,
        isCurrent,
      }
    })
  }, [months, sowingMonth, harvestMonth, currentMonth])

  return (
    <svg
      width="100%"
      height="auto"
      viewBox={`0 0 ${size} ${size}`}
      className="max-w-md mx-auto"
    >
      {/* Background circle */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius + 10}
        fill="none"
        stroke="#d4af37"
        strokeWidth="1"
        strokeDasharray="2,2"
      />

      {/* Month circles */}
      {monthElements.map((el) => (
        <g key={el.i}>
          {/* Main month circle */}
          <circle
            cx={el.x}
            cy={el.y}
            r="22"
            fill={el.color}
            opacity="0.8"
            stroke="#fff"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-100 transition-opacity"
            onClick={() => onMonthClick?.(el.i)}
          />

          {/* Sowing marker */}
          {el.isSowing && (
            <circle
              cx={el.x}
              cy={el.y}
              r="28"
              fill="none"
              stroke="#8B6F47"
              strokeWidth="3"
            />
          )}

          {/* Harvest marker */}
          {el.isHarvest && (
            <circle
              cx={el.x}
              cy={el.y}
              r="28"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="3"
              strokeDasharray="4,4"
            />
          )}

          {/* Month number */}
          <text
            x={el.x}
            y={el.y}
            textAnchor="middle"
            dy="0.35em"
            fontSize="14"
            fontWeight="bold"
            fill="#fff"
            pointerEvents="none"
          >
            {el.i + 1}
          </text>

          {/* Month label below */}
          <text
            x={el.x}
            y={el.y + 35}
            textAnchor="middle"
            fontSize="11"
            fill="#1a1a2e"
            fontWeight="500"
            pointerEvents="none"
          >
            {MONTHS_SHORT[el.i]}
          </text>
        </g>
      ))}

      {/* Center label */}
      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        dy="0.35em"
        fontSize="16"
        fontWeight="bold"
        fill="#8B6F47"
      >
        12 meses
      </text>
      <text
        x={centerX}
        y={centerY + 18}
        textAnchor="middle"
        fontSize="12"
        fill="#D4AF37"
        fontWeight="600"
      >
        Andinos
      </text>
    </svg>
  )
}
