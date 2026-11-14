/**
 * Mapa del Perú con relieve (OpenTopoMap) y las principales zonas agrícolas,
 * coloreadas por piso ecológico. Las chacras del agricultor aparecen como estrellas doradas.
 */
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export interface ZonePoint {
  id: string
  lat: number
  lon: number
  label: string
  color: string
}

interface Props {
  zones: ZonePoint[]
  farms: ZonePoint[]
  selected: string | null
  onSelect: (id: string) => void
  ariaLabel: string
}

const PERU_BOUNDS: [[number, number], [number, number]] = [
  [-18.4, -81.4],
  [-0.1, -68.6],
]

export default function PeruZonesMap({ zones, farms, selected, onSelect, ariaLabel }: Props) {
  return (
    <div className="relative isolate z-0 h-[26rem] overflow-hidden rounded-2xl" role="region" aria-label={ariaLabel}>
      <MapContainer bounds={PERU_BOUNDS} boundsOptions={{ padding: [6, 6] }} zoomSnap={0.25} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          maxZoom={15}
          attribution="&copy; OpenStreetMap, SRTM | &copy; OpenTopoMap (CC-BY-SA)"
        />
        {zones.map((z) => (
          <CircleMarker
            key={z.id}
            center={[z.lat, z.lon]}
            radius={selected === z.id ? 13 : 10}
            pathOptions={{ color: selected === z.id ? '#1a1a2e' : '#ffffff', weight: 3, fillColor: z.color, fillOpacity: 0.95 }}
            eventHandlers={{ click: () => onSelect(z.id) }}
          >
            <Tooltip direction="top" offset={[0, -8]} permanent={selected === z.id}>
              {z.label}
            </Tooltip>
          </CircleMarker>
        ))}
        {farms.map((f) => (
          <CircleMarker
            key={f.id}
            center={[f.lat, f.lon]}
            radius={8}
            pathOptions={{ color: '#1a1a2e', weight: 3, fillColor: '#d4af37', fillOpacity: 1 }}
            eventHandlers={{ click: () => onSelect(f.id) }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              ⭐ {f.label}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
