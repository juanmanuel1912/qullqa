/**
 * Cultivos del Perú. Hoy Qullqa funciona completo para la papa; el resto son
 * EJEMPLOS ESTÁTICOS e informativos de cómo se verá cada cultivo en el futuro.
 * Épocas aproximadas y generales; variarán por zona y se calcularán con NASA.
 */
import type { Localized } from '@/i18n'

export type CropId = 'papa' | 'maiz' | 'palta' | 'aji' | 'quinua' | 'mango' | 'cafe' | 'cacao'

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
  /** Requisitos aproximados para el motor de recomendación */
  req: {
    /** Rango de altitud habitual (m) */
    altitude: [number, number]
    /** Temperatura media mínima para crecer bien (°C) */
    minMeanTemp: number
    /** Se daña con heladas */
    frostSensitive: boolean
    /** Meses de siembra a cosecha (anuales) o años a la primera cosecha (perennes) */
    cycleMonths: number
    perennial: boolean
  }
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
    req: { altitude: [2000, 4200], minMeanTemp: 6, frostSensitive: false, cycleMonths: 5, perennial: false },
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
    req: { altitude: [0, 3500], minMeanTemp: 10, frostSensitive: true, cycleMonths: 6, perennial: false },
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
    req: { altitude: [0, 2500], minMeanTemp: 14, frostSensitive: true, cycleMonths: 36, perennial: true },
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
    req: { altitude: [0, 2900], minMeanTemp: 14, frostSensitive: true, cycleMonths: 6, perennial: false },
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
    req: { altitude: [2500, 4000], minMeanTemp: 5, frostSensitive: false, cycleMonths: 6, perennial: false },
  },
  {
    id: 'mango',
    emoji: '🥭',
    name: { en: 'Mango', es: 'Mango' },
    scientific: 'Mangifera indica',
    status: 'soon',
    color: '#f2b705',
    varieties: 'Kent, Edward, Haden',
    regions: { en: 'Warm northern coast and valleys (Piura, Lambayeque, Áncash)', es: 'Costa y valles cálidos del norte (Piura, Lambayeque, Áncash)' },
    altitude: '0 – 1 000 m',
    sowMonths: [],
    harvestMonths: [10, 11, 0, 1, 2],
    cycle: { en: 'Perennial tree: first fruit 3–4 years after planting grafted trees', es: 'Árbol perenne: primeros frutos 3–4 años después de plantar injertos' },
    uses: { en: 'Fresh fruit, juices, desserts, ceviche de mango', es: 'Fruta fresca, jugos, postres, ceviche de mango' },
    note: { en: 'Piura is the main mango region of Peru, and Kent mango is a major export.', es: 'Piura es la principal región mangera del Perú, y el mango Kent es un gran producto de exportación.' },
    req: { altitude: [0, 1000], minMeanTemp: 20, frostSensitive: true, cycleMonths: 42, perennial: true },
  },
  {
    id: 'cafe',
    emoji: '☕',
    name: { en: 'Coffee', es: 'Café' },
    scientific: 'Coffea arabica',
    status: 'soon',
    color: '#6f4e37',
    varieties: 'Typica, Bourbon, Caturra, Catimor, Geisha',
    regions: {
      en: 'High jungle: Jaén and San Ignacio (Cajamarca), Chanchamayo (Junín), Villa Rica (Pasco), La Convención (Cusco), Moyobamba (San Martín)',
      es: 'Selva alta: Jaén y San Ignacio (Cajamarca), Chanchamayo (Junín), Villa Rica (Pasco), La Convención (Cusco), Moyobamba (San Martín)',
    },
    altitude: '800 – 2 000 m',
    sowMonths: [],
    harvestMonths: [3, 4, 5, 6, 7, 8],
    cycle: { en: 'Perennial shrub: first harvest 3 years after planting; produces for 15–20 years', es: 'Arbusto perenne: primera cosecha a los 3 años; produce 15–20 años' },
    uses: { en: 'Specialty and organic coffee for export, local coffee shops', es: 'Café especial y orgánico de exportación, cafeterías locales' },
    note: {
      en: 'Peru is one of the largest exporters of organic coffee. It grows best under shade trees, which also protect the soil and store carbon.',
      es: 'El Perú es uno de los mayores exportadores de café orgánico. Crece mejor bajo árboles de sombra, que además protegen el suelo y guardan carbono.',
    },
    req: { altitude: [800, 2000], minMeanTemp: 17, frostSensitive: true, cycleMonths: 36, perennial: true },
  },
  {
    id: 'cacao',
    emoji: '🍫',
    name: { en: 'Cacao', es: 'Cacao' },
    scientific: 'Theobroma cacao',
    status: 'soon',
    color: '#7b3f00',
    varieties: 'Chuncho (Cusco), Blanco de Piura, CCN-51, native fine-aroma cacao',
    regions: {
      en: 'High and low jungle: San Martín, VRAEM (Cusco, Ayacucho, Junín), Tingo María (Huánuco), Ucayali, Amazonas; Piura (white cacao)',
      es: 'Selva alta y baja: San Martín, VRAEM (Cusco, Ayacucho, Junín), Tingo María (Huánuco), Ucayali, Amazonas; Piura (cacao blanco)',
    },
    altitude: '0 – 1 200 m',
    sowMonths: [],
    harvestMonths: [2, 3, 4, 5, 6, 7],
    cycle: { en: 'Perennial tree: first pods 3–4 years after planting', es: 'Árbol perenne: primeras mazorcas 3–4 años después de plantar' },
    uses: { en: 'Fine chocolate, cocoa butter and powder, nibs', es: 'Chocolate fino, manteca y polvo de cacao, nibs' },
    note: {
      en: 'Peru has native fine-aroma cacao. It replaced illegal coca crops in San Martín and the VRAEM, a social and environmental success.',
      es: 'El Perú tiene cacao nativo fino de aroma. Reemplazó cultivos ilegales de coca en San Martín y el VRAEM, un éxito social y ambiental.',
    },
    req: { altitude: [0, 1200], minMeanTemp: 22, frostSensitive: true, cycleMonths: 42, perennial: true },
  },
]

export const cropById = (id: CropId) => CROPS.find((c) => c.id === id)!
