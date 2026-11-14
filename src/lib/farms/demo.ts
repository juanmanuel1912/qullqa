/**
 * Perfil de agricultor de ejemplo ("ya logueado") con chacras en tres países.
 * En el futuro vendrá de una cuenta con inicio de sesión y será editable.
 */
import type { Localized } from '@/i18n'
import type { VarietyId } from '@/lib/agro'

export interface Farm {
  id: string
  name: string
  place: string
  country: Localized
  /** Código ISO del país (las banderas emoji no se ven en Windows) */
  code: string
  lat: number
  lon: number
  areaHa: number
  variety: VarietyId
  /** 'YYYY-MM-DD' o null si aún no se sembró */
  plantingDate: string | null
  note: Localized
  /**
   * 'nasa': siembra recomendada por el modelo andino (secano).
   * 'local': chacra con riego fuera de los Andes; se muestra su temporada local
   *          (el modelo de heladas está calibrado para los Andes).
   */
  calendar: 'nasa' | 'local'
  season?: { sow: Localized; harvest: Localized }
}

export const DEMO_FARMER = { name: 'Demo farmer', initials: 'DF' }

export const DEMO_FARMS: Farm[] = [
  {
    id: 'cusco',
    name: 'Chakra Sallaq',
    place: 'Cusco',
    country: { en: 'Peru', es: 'Perú' },
    code: 'PE',
    lat: -13.5319,
    lon: -71.9754,
    areaHa: 2.5,
    variety: 'yungay',
    plantingDate: '2026-10-25',
    note: { en: 'Andean highlands, 3,400 m. Rain-fed.', es: 'Sierra andina, 3 400 m. Secano (con lluvia).' },
    calendar: 'nasa',
  },
  {
    id: 'chiloe',
    name: 'Fundo Chiloé',
    place: 'Castro, Chiloé',
    country: { en: 'Chile', es: 'Chile' },
    code: 'CL',
    lat: -42.48,
    lon: -73.76,
    areaHa: 4,
    variety: 'canchan',
    plantingDate: null,
    note: {
      en: 'Chiloé is the second great center of potato diversity, and the origin of most potatoes grown worldwide today.',
      es: 'Chiloé es el segundo gran centro de diversidad de la papa y el origen de la mayoría de las papas que hoy se cultivan en el mundo.',
    },
    calendar: 'nasa',
  },
  {
    id: 'idaho',
    name: 'Snake River Farm',
    place: 'Idaho Falls, Idaho',
    country: { en: 'United States', es: 'Estados Unidos' },
    code: 'US',
    lat: 43.49,
    lon: -112.03,
    areaHa: 12,
    variety: 'russet',
    plantingDate: '2026-05-01',
    note: { en: 'Irrigated valley, northern hemisphere: planted in spring, harvested in autumn.', es: 'Valle con riego, hemisferio norte: se siembra en primavera y se cosecha en otoño.' },
    calendar: 'local',
    season: { sow: { en: 'April–May', es: 'abril–mayo' }, harvest: { en: 'September–October', es: 'septiembre–octubre' } },
  },
]
