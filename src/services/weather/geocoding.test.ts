import { describe, expect, it } from 'vitest'
import { parsePlaces } from './geocoding'

describe('buscador de lugares (Open-Meteo Geocoding)', () => {
  it('convierte la respuesta en lugares', () => {
    const places = parsePlaces({
      results: [
        { id: 1, name: 'Ollantaytambo', admin1: 'Cusco', country: 'Perú', country_code: 'PE', latitude: -13.258, longitude: -72.263, elevation: 2792 },
        { id: 2, name: 'Malo', latitude: Number.NaN, longitude: 0 },
      ],
    })
    expect(places).toHaveLength(1)
    expect(places[0]).toMatchObject({ name: 'Ollantaytambo', admin1: 'Cusco', countryCode: 'PE', lat: -13.258, lon: -72.263, elevation: 2792 })
  })

  it('sin resultados devuelve una lista vacía', () => {
    expect(parsePlaces({})).toEqual([])
    expect(parsePlaces(null)).toEqual([])
  })
})
