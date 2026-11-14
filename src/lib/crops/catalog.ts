/**
 * Cultivos del Perú. Hoy Qullqa funciona completo para la papa; el resto son
 * EJEMPLOS ESTÁTICOS e informativos de cómo se verá cada cultivo en el futuro.
 * Épocas aproximadas y generales; variarán por zona y se calcularán con NASA.
 */
import type { Localized } from '@/i18n'

export type CropId = 'papa' | 'maiz' | 'palta' | 'aji' | 'quinua'

export interface CropInfo {
  id: CropId
  emoji: string
  name: Localized
  scientific: string
  status: 'available' | 'soon'
  color: string
  varieties: string
  regions: Localized
  altitude: string
  /** Meses de siembra y de cosecha (0 = enero) */
  sowMonths: number[]
  harvestMonths: number[]
  cycle: Localized
  uses: Localized
  note: Localized
}

export const CROPS: CropInfo[] = [
  {
    id: 'papa',
    emoji: '🥔',
    name: { en: 'Potato', es: 'Papa', qu: 'Papa' },
    scientific: 'Solanum tuberosum',
    status: 'available',
    color: '#b8956a',
    varieties: 'Yungay, Canchán, Huayro, Amarilla, Peruanita…',
    regions: { en: 'Andean highlands (Puno, Huánuco, Cusco, Junín…)', es: 'Sierra andina (Puno, Huánuco, Cusco, Junín…)' },
    altitude: '2 300 – 4 200 m',
    sowMonths: [9, 10, 11],
    harvestMonths: [3, 4, 5],
    cycle: { en: '4.5 – 6 months', es: '4,5 – 6 meses' },
    uses: { en: 'Causa, papa rellena, pastel de papa, chuño', es: 'Causa, papa rellena, pastel de papa, chuño' },
    note: { en: 'Fully working today with NASA data.', es: 'Funciona completo hoy con datos de la NASA.' },
  },
  {
    id: 'maiz',
    emoji: '🌽',
    name: { en: 'Maize / choclo', es: 'Maíz / choclo', qu: 'Sara' },
    scientific: 'Zea mays',
    status: 'soon',
    color: '#ecc955',
    varieties: 'Blanco Gigante Cusco, Maíz morado, Amarillo duro',
    regions: { en: 'Sacred Valley (Cusco), Andean valleys and the coast', es: 'Valle Sagrado (Cusco), valles andinos y costa' },
    altitude: '0 – 3 500 m',
    sowMonths: [8, 9, 10],
    harvestMonths: [1, 2, 3, 4, 5],
    cycle: { en: '5 – 8 months in the highlands (choclo earlier)', es: '5 – 8 meses en la sierra (choclo antes)' },
    uses: { en: 'Choclo con queso, humitas, chicha morada, mazamorra morada', es: 'Choclo con queso, humitas, chicha morada, mazamorra morada' },
    note: {
      en: 'The giant white corn of Cusco has a Peruvian protected designation of origin.',
      es: 'El maíz blanco gigante del Cusco tiene denominación de origen peruana.',
    },
  },
  {
    id: 'palta',
    emoji: '🥑',
    name: { en: 'Avocado', es: 'Palta' },
    scientific: 'Persea americana',
    status: 'soon',
    color: '#2f9e44',
    varieties: 'Hass, Fuerte, palta criolla',
    regions: { en: 'Coastal valleys (La Libertad, Lima, Ica) and inter-Andean valleys', es: 'Valles de la costa (La Libertad, Lima, Ica) y valles interandinos' },
    altitude: '0 – 2 500 m',
    sowMonths: [],
    harvestMonths: [3, 4, 5, 6, 7, 8],
    cycle: { en: 'Perennial tree: first harvest 3–4 years after planting', es: 'Árbol perenne: primera cosecha 3–4 años después de plantar' },
    uses: { en: 'Palta rellena, causa, salads', es: 'Palta rellena, causa, ensaladas' },
    note: { en: 'Peru is one of the world’s leading exporters of Hass avocado.', es: 'El Perú es uno de los principales exportadores de palta Hass del mundo.' },
  },
  {
    id: 'aji',
    emoji: '🌶️',
    name: { en: 'Peruvian chili peppers', es: 'Ajíes', qu: 'Uchu' },
    scientific: 'Capsicum baccatum, C. pubescens, C. chinense',
    status: 'soon',
    color: '#d9480f',
    varieties: 'Ají amarillo, ají panca, ají limo, rocoto',
    regions: { en: 'Coast and warm valleys; rocoto in highland valleys', es: 'Costa y valles cálidos; el rocoto en valles de altura' },
    altitude: '0 – 2 900 m',
    sowMonths: [7, 8, 9],
    harvestMonths: [0, 1, 2, 3, 4],
    cycle: { en: 'Seedbed ~2 months, then first harvest 4–5 months after transplanting', es: 'Almácigo ~2 meses; primera cosecha 4–5 meses después del trasplante' },
    uses: { en: 'Papa a la huancaína, ají de gallina, rocoto relleno, ceviche', es: 'Papa a la huancaína, ají de gallina, rocoto relleno, ceviche' },
    note: { en: 'The base of Peruvian cooking: almost every dish starts with an ají.', es: 'La base de la cocina peruana: casi todo plato empieza con un ají.' },
  },
  {
    id: 'quinua',
    emoji: '🌾',
    name: { en: 'Quinoa', es: 'Quinua', qu: 'Kinwa' },
    scientific: 'Chenopodium quinoa',
    status: 'soon',
    color: '#e2725b',
    varieties: 'Blanca de Juli, Salcedo INIA, Pasankalla, quinua negra',
    regions: { en: 'Altiplano of Puno (main producer), Ayacucho, Junín', es: 'Altiplano de Puno (principal productor), Ayacucho, Junín' },
    altitude: '2 500 – 4 000 m',
    sowMonths: [8, 9, 10],
    harvestMonths: [3, 4],
    cycle: { en: '5 – 7 months', es: '5 – 7 meses' },
    uses: { en: 'Soups, quinotto, breakfast drinks, flour', es: 'Sopas, quinotto, desayunos, harina' },
    note: { en: 'An Andean grain that tolerates frost and drought, like the bitter potatoes.', es: 'Grano andino que resiste heladas y sequías, como las papas amargas.' },
  },
]

export const cropById = (id: CropId) => CROPS.find((c) => c.id === id)!
