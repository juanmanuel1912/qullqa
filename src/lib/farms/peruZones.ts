/**
 * Principales zonas agrícolas del Perú y lo que se cultiva en cada una según su
 * clima y altura. Información general (MIDAGRI, INEI, Pulgar Vidal) con fines
 * educativos: dentro de cada zona hay muchos microclimas.
 */
import type { Localized } from '@/i18n'
import type { AltZone } from './indicators'

export interface ZoneCrop {
  emoji: string
  name: Localized
}

export interface PeruZone {
  id: string
  name: string
  region: Localized
  zone: AltZone
  lat: number
  lon: number
  /** Altitud aproximada (m) */
  altitude: string
  climate: Localized
  crops: ZoneCrop[]
}

const c = (emoji: string, en: string, es: string): ZoneCrop => ({ emoji, name: { en, es } })

export const PERU_ZONES: PeruZone[] = [
  {
    id: 'piura',
    name: 'Piura (San Lorenzo)',
    region: { en: 'North coast', es: 'Costa norte' },
    zone: 'chala',
    lat: -5.0,
    lon: -80.4,
    altitude: '0 – 300',
    climate: { en: 'Hot and dry, 24–30 °C; rain only in El Niño years.', es: 'Cálido y seco, 24–30 °C; llueve solo en años de El Niño.' },
    crops: [c('🥭', 'Mango', 'Mango'), c('🍋', 'Lime', 'Limón'), c('🌾', 'Rice', 'Arroz'), c('🍌', 'Organic banana', 'Banano orgánico')],
  },
  {
    id: 'lambayeque',
    name: 'Lambayeque',
    region: { en: 'North coast', es: 'Costa norte' },
    zone: 'chala',
    lat: -6.7,
    lon: -79.85,
    altitude: '0 – 200',
    climate: { en: 'Warm desert with river irrigation.', es: 'Desierto cálido con riego de ríos.' },
    crops: [c('🎋', 'Sugar cane', 'Caña de azúcar'), c('🌾', 'Rice', 'Arroz'), c('🥭', 'Mango (Motupe)', 'Mango (Motupe)'), c('🟡', 'Passion fruit', 'Maracuyá')],
  },
  {
    id: 'libertad',
    name: 'La Libertad (Virú, Chao)',
    region: { en: 'North-central coast', es: 'Costa norcentral' },
    zone: 'chala',
    lat: -8.45,
    lon: -78.75,
    altitude: '0 – 400',
    climate: { en: 'Mild desert, 17–25 °C, almost no rain: everything is irrigated.', es: 'Desierto templado, 17–25 °C, casi sin lluvia: todo es con riego.' },
    crops: [c('🌿', 'Asparagus', 'Espárrago'), c('🥑', 'Avocado (Hass)', 'Palta (Hass)'), c('🫐', 'Blueberry', 'Arándano'), c('🎋', 'Sugar cane', 'Caña de azúcar')],
  },
  {
    id: 'ica',
    name: 'Ica',
    region: { en: 'South coast', es: 'Costa sur' },
    zone: 'chala',
    lat: -14.07,
    lon: -75.73,
    altitude: '300 – 500',
    climate: { en: 'Very dry and sunny desert; water from wells and the river.', es: 'Desierto muy seco y soleado; agua de pozos y del río.' },
    crops: [c('🍇', 'Grapes (pisco)', 'Uva (pisco)'), c('🌿', 'Asparagus', 'Espárrago'), c('🥑', 'Avocado', 'Palta'), c('☁️', 'Cotton', 'Algodón')],
  },
  {
    id: 'arequipa',
    name: 'Arequipa (Majes, valle)',
    region: { en: 'South coast and valleys', es: 'Costa y valles del sur' },
    zone: 'yunga',
    lat: -16.35,
    lon: -72.2,
    altitude: '1 000 – 2 300',
    climate: { en: 'Sunny, dry and mild; irrigation from the Colca river.', es: 'Soleado, seco y templado; riego del río Colca.' },
    crops: [c('🧄', 'Garlic', 'Ajo'), c('🧅', 'Onion', 'Cebolla'), c('🌱', 'Alfalfa (dairy)', 'Alfalfa (leche)'), c('🌶️', 'Paprika', 'Páprika')],
  },
  {
    id: 'cajamarca',
    name: 'Cajamarca',
    region: { en: 'Northern highlands', es: 'Sierra norte' },
    zone: 'quechua',
    lat: -7.16,
    lon: -78.5,
    altitude: '2 700 – 3 200',
    climate: { en: 'Temperate, 13–15 °C; rains from October to April.', es: 'Templado, 13–15 °C; lluvias de octubre a abril.' },
    crops: [c('🥔', 'Potato', 'Papa'), c('🌽', 'Maize', 'Maíz'), c('🫘', 'Beans and peas', 'Frijol y arveja'), c('🐄', 'Pasture (dairy)', 'Pastos (leche)')],
  },
  {
    id: 'huanuco',
    name: 'Huánuco (alturas)',
    region: { en: 'Central highlands', es: 'Sierra central' },
    zone: 'quechua',
    lat: -9.75,
    lon: -76.1,
    altitude: '2 800 – 3 800',
    climate: { en: 'Cool, with rain from November to March. One of the largest potato producers.', es: 'Fresco, con lluvias de noviembre a marzo. Uno de los mayores productores de papa.' },
    crops: [c('🥔', 'Potato', 'Papa'), c('🟣', 'Olluco and oca', 'Olluco y oca'), c('🌽', 'Maize', 'Maíz'), c('🫘', 'Broad beans', 'Habas')],
  },
  {
    id: 'mantaro',
    name: 'Valle del Mantaro (Junín)',
    region: { en: 'Central highlands', es: 'Sierra central' },
    zone: 'quechua',
    lat: -12.07,
    lon: -75.2,
    altitude: '3 200 – 3 400',
    climate: { en: 'Temperate by day, cold nights; frost from May to August.', es: 'Templado de día, noches frías; heladas de mayo a agosto.' },
    crops: [c('🥔', 'Potato', 'Papa'), c('🌽', 'Maize', 'Maíz'), c('🌸', 'Artichoke', 'Alcachofa'), c('🫘', 'Broad beans', 'Habas')],
  },
  {
    id: 'junin-puna',
    name: 'Meseta de Junín',
    region: { en: 'Central high plateau', es: 'Meseta central' },
    zone: 'puna',
    lat: -11.0,
    lon: -76.1,
    altitude: '4 000 – 4 400',
    climate: { en: 'Cold, frost almost every night of the year.', es: 'Frío, helada casi todas las noches del año.' },
    crops: [c('🟤', 'Maca', 'Maca'), c('🥔', 'Bitter potato (chuño)', 'Papa amarga (chuño)'), c('🌾', 'Pasture', 'Pastos'), c('🦙', 'Alpacas and sheep', 'Alpacas y ovinos')],
  },
  {
    id: 'huancavelica',
    name: 'Huancavelica',
    region: { en: 'Central-south highlands', es: 'Sierra centro sur' },
    zone: 'suni',
    lat: -12.79,
    lon: -74.97,
    altitude: '3 600 – 4 000',
    climate: { en: 'Cold, strong frosts; rain from December to March.', es: 'Frío, heladas fuertes; lluvias de diciembre a marzo.' },
    crops: [c('🥔', 'Native potatoes', 'Papas nativas'), c('🌾', 'Barley', 'Cebada'), c('🫘', 'Broad beans', 'Habas'), c('🦙', 'Alpacas', 'Alpacas')],
  },
  {
    id: 'sagrado',
    name: 'Valle Sagrado (Cusco)',
    region: { en: 'Southern highlands', es: 'Sierra sur' },
    zone: 'quechua',
    lat: -13.3,
    lon: -72.12,
    altitude: '2 800 – 3 000',
    climate: { en: 'Mild valley, 12–16 °C; rain from November to March.', es: 'Valle templado, 12–16 °C; lluvias de noviembre a marzo.' },
    crops: [c('🌽', 'Giant white maize', 'Maíz blanco gigante'), c('🥔', 'Potato', 'Papa'), c('🫘', 'Broad beans', 'Habas'), c('🌾', 'Quinoa', 'Quinua')],
  },
  {
    id: 'andahuaylas',
    name: 'Andahuaylas (Apurímac)',
    region: { en: 'Southern highlands', es: 'Sierra sur' },
    zone: 'quechua',
    lat: -13.66,
    lon: -73.39,
    altitude: '2 900 – 3 500',
    climate: { en: 'Temperate, rain from November to March.', es: 'Templado, lluvias de noviembre a marzo.' },
    crops: [c('🥔', 'Potato', 'Papa'), c('🌽', 'Maize', 'Maíz'), c('🌾', 'Quinoa', 'Quinua'), c('🌼', 'Tarwi', 'Tarwi')],
  },
  {
    id: 'puno',
    name: 'Altiplano de Puno',
    region: { en: 'High plateau (Lake Titicaca)', es: 'Altiplano (lago Titicaca)' },
    zone: 'suni',
    lat: -15.5,
    lon: -70.1,
    altitude: '3 800 – 4 000',
    climate: { en: 'Cold and dry, 8–10 °C; frost from April to October. The lake softens the cold.', es: 'Frío y seco, 8–10 °C; heladas de abril a octubre. El lago suaviza el frío.' },
    crops: [c('🌾', 'Quinoa', 'Quinua'), c('🥔', 'Potato and chuño', 'Papa y chuño'), c('🌾', 'Barley and oats', 'Cebada y avena'), c('🦙', 'Alpacas', 'Alpacas')],
  },
  {
    id: 'chanchamayo',
    name: 'Chanchamayo (Selva central)',
    region: { en: 'High jungle', es: 'Selva alta' },
    zone: 'rupaRupa',
    lat: -11.05,
    lon: -75.33,
    altitude: '700 – 1 500',
    climate: { en: 'Warm and rainy, 20–26 °C; more than 1 500 mm of rain a year.', es: 'Cálido y lluvioso, 20–26 °C; más de 1 500 mm de lluvia al año.' },
    crops: [c('☕', 'Coffee', 'Café'), c('🍍', 'Pineapple', 'Piña'), c('🍊', 'Citrus', 'Cítricos'), c('🍌', 'Plantain', 'Plátano')],
  },
  {
    id: 'sanmartin',
    name: 'San Martín',
    region: { en: 'High jungle', es: 'Selva alta' },
    zone: 'rupaRupa',
    lat: -6.5,
    lon: -76.37,
    altitude: '300 – 1 200',
    climate: { en: 'Warm and humid, 23–28 °C.', es: 'Cálido y húmedo, 23–28 °C.' },
    crops: [c('🍫', 'Cacao', 'Cacao'), c('☕', 'Coffee (Alto Mayo)', 'Café (Alto Mayo)'), c('🌾', 'Rice', 'Arroz'), c('🍌', 'Plantain', 'Plátano')],
  },
  {
    id: 'ucayali',
    name: 'Ucayali (Pucallpa)',
    region: { en: 'Low jungle', es: 'Selva baja' },
    zone: 'omagua',
    lat: -8.38,
    lon: -74.55,
    altitude: '150 – 300',
    climate: { en: 'Hot and very rainy, 26 °C; river floods.', es: 'Caluroso y muy lluvioso, 26 °C; crecidas de los ríos.' },
    crops: [c('🍌', 'Plantain', 'Plátano'), c('🥔', 'Cassava (yuca)', 'Yuca'), c('🍫', 'Cacao', 'Cacao'), c('🌴', 'Oil palm', 'Palma aceitera')],
  },
  {
    id: 'loreto',
    name: 'Loreto (Iquitos)',
    region: { en: 'Low jungle (Amazon)', es: 'Selva baja (Amazonía)' },
    zone: 'omagua',
    lat: -3.75,
    lon: -73.25,
    altitude: '80 – 200',
    climate: { en: 'Hot and rainy all year, about 27 °C.', es: 'Caluroso y lluvioso todo el año, unos 27 °C.' },
    crops: [c('🍒', 'Camu camu', 'Camu camu'), c('🥔', 'Cassava (yuca)', 'Yuca'), c('🍌', 'Plantain', 'Plátano'), c('🌴', 'Aguaje palm', 'Aguaje')],
  },
  {
    id: 'madrededios',
    name: 'Madre de Dios',
    region: { en: 'Low jungle', es: 'Selva baja' },
    zone: 'omagua',
    lat: -12.6,
    lon: -69.19,
    altitude: '180 – 300',
    climate: { en: 'Hot and humid, 26 °C; cold winds (friaje) in winter.', es: 'Cálido y húmedo, 26 °C; vientos fríos (friaje) en invierno.' },
    crops: [c('🌰', 'Brazil nut', 'Castaña'), c('🍫', 'Cacao', 'Cacao'), c('🍌', 'Plantain', 'Plátano'), c('🥔', 'Cassava (yuca)', 'Yuca')],
  },
]
