/**
 * Mapa de la chacra con la capa NDVI de NASA GIBS (verdor de la vegetación).
 * Tocar el mapa elige la ubicación.
 */
import { useEffect } from 'react'
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { GIBS_ATTRIBUTION, GIBS_MAX_ZOOM, ndviTileUrl } from '@/services/nasa'

interface Props {
  lat: number
  lon: number
  onPick: (lat: number, lon: number) => void
}

function ClickToPick({ onPick }: { onPick: Props['onPick'] }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

function FollowPoint({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lon], map.getZoom(), { animate: true })
  }, [lat, lon, map])
  return null
}

export default function FarmMap({ lat, lon, onPick }: Props) {
  return (
    <div className="relative isolate z-0 overflow-hidden rounded-2xl">
      <MapContainer center={[lat, lon]} zoom={8} scrollWheelZoom={false} className="h-56 w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <TileLayer url={ndviTileUrl()} attribution={GIBS_ATTRIBUTION} maxNativeZoom={GIBS_MAX_ZOOM} maxZoom={14} opacity={0.6} />
        <CircleMarker
          center={[lat, lon]}
          radius={10}
          pathOptions={{ color: '#d4af37', weight: 4, fillColor: '#1a1a2e', fillOpacity: 0.9 }}
        />
        <ClickToPick onPick={onPick} />
        <FollowPoint lat={lat} lon={lon} />
      </MapContainer>
    </div>
  )
}
