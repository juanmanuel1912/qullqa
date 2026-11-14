/**
 * Mapa con varios puntos (mis chacras, zonas de cada variedad de papa).
 * Se ajusta solo para mostrar todos los puntos.
 */
import { useEffect } from 'react'
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export interface MapPoint {
  id: string
  lat: number
  lon: number
  label: string
  color: string
}

interface Props {
  points: MapPoint[]
  selected?: string | null
  onSelect?: (id: string) => void
  height?: string
  ariaLabel: string
}

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lon], 7)
      return
    }
    map.fitBounds(
      points.map((p) => [p.lat, p.lon] as [number, number]),
      { padding: [28, 28], maxZoom: 7 },
    )
  }, [points, map])
  return null
}

export default function PointsMap({ points, selected, onSelect, height = 'h-64', ariaLabel }: Props) {
  return (
    <div className={`relative isolate z-0 overflow-hidden rounded-2xl ${height}`} role="region" aria-label={ariaLabel}>
      <MapContainer center={[-13.5, -72]} zoom={4} scrollWheelZoom={false} className="h-full w-full" worldCopyJump>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        {points.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lon]}
            radius={selected === p.id ? 12 : 9}
            pathOptions={{ color: selected === p.id ? '#1a1a2e' : '#ffffff', weight: 3, fillColor: p.color, fillOpacity: 0.95 }}
            eventHandlers={{ click: () => onSelect?.(p.id) }}
          >
            <Tooltip direction="top" offset={[0, -8]} permanent={selected === p.id}>
              {p.label}
            </Tooltip>
          </CircleMarker>
        ))}
        <FitBounds points={points} />
      </MapContainer>
    </div>
  )
}
