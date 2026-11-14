/**
 * Galería informativa de cada producto y zona.
 * - Fotos y videos de Wikimedia Commons con licencia libre (autor y licencia visibles).
 * - Imágenes satelitales de la NASA (GIBS) de cada zona.
 */
import type { Localized } from '@/i18n'
import type { NextCropId } from '../rotation/nextCrop'

export interface MediaItem {
  kind: 'image' | 'video'
  /** Nombre del archivo en Wikimedia Commons */
  file: string
  author: string
  license: string
  caption: Localized
}

const img = (file: string, author: string, license: string, en: string, es: string): MediaItem => ({ kind: 'image', file, author, license, caption: { en, es } })
const vid = (file: string, author: string, license: string, en: string, es: string): MediaItem => ({ kind: 'video', file, author, license, caption: { en, es } })

const commonsPath = (file: string) => encodeURIComponent(file.replace(/ /g, '_'))
/** Imagen (o portada del video) en el ancho pedido */
export const commonsThumb = (file: string, width = 640) => `https://commons.wikimedia.org/wiki/Special:FilePath/${commonsPath(file)}?width=${width}`
/** Archivo original (para el video) */
export const commonsFile = (file: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${commonsPath(file)}`
/** Página con el autor y la licencia completa */
export const commonsPage = (file: string) => `https://commons.wikimedia.org/wiki/File:${commonsPath(file)}`

export const CROP_MEDIA: Partial<Record<NextCropId, MediaItem[]>> = {
  cafe: [
    img('Coffee plantations in Peru.jpg', 'Kızıldeniz', 'CC BY-SA 4.0', 'Coffee plantation in Peru', 'Cafetal en el Perú'),
    img('Coffee arabica cherry.jpg', 'Roger Burger', 'CC0', 'Ripe coffee cherries: they are picked by hand', 'Cerezos de café maduros: se cosechan a mano'),
    vid(
      'The bean that could save coffee from climate change.webm',
      'Context_news',
      'CC BY-SA 4.0',
      'Video: coffee and climate change (English)',
      'Video: el café y el cambio climático (en inglés)',
    ),
    vid('Ripen coffee fruits, Kodagu, Karnataka.webm', 'Subhashish Panigrahi', 'CC BY-SA 3.0', 'Video: ripe coffee on the plant', 'Video: café maduro en la planta'),
  ],
  cacao: [
    img('Ruta turística del cacao de Alto el Sol.JPG', 'Municipalidad distrital de Pachiza', 'CC BY 3.0', 'Cacao route in Pachiza, San Martín (Peru)', 'Ruta del cacao en Pachiza, San Martín (Perú)'),
    img('Cacao Tree (Theobroma cacao) green pods (17348751253).jpg', 'Bernard Dupont', 'CC BY-SA 2.0', 'Cacao pods grow on the trunk', 'Las mazorcas de cacao crecen en el tronco'),
    vid('Cocoa Fermentation.webm', "Bhat'n' Bhat", 'CC BY 3.0', 'Video: fermenting cacao beans', 'Video: fermentación de los granos de cacao'),
  ],
  papa: [
    img('Labeled native potato varieties in Santa Teresa, Cusco, Peru.jpg', 'H.dav.are', 'CC BY-SA 4.0', 'Native potato varieties, Cusco', 'Variedades de papa nativa, Cusco'),
    img('Peru - Lares Trek 043 - potatoes laid out for freeze-drying (7586212426).jpg', 'McKay Savage', 'CC BY 2.0', 'Potatoes laid out to make chuño', 'Papas tendidas para hacer chuño'),
  ],
  quinua: [
    img('Drying quinoa near Puno.JPG', 'Michael Hermann', 'CC BY-SA 3.0', 'Drying quinoa near Puno', 'Secado de quinua cerca de Puno'),
    img('Camino a Puno Golpeando quinoa.JPG', 'Michael Hermann', 'CC BY-SA 3.0', 'Threshing quinoa by hand', 'Trillando quinua a mano'),
  ],
  maiz: [img('Cusco Peru- Mercado San Pedro- cooked Choclo ears for sale.jpg', 'Thayne Tuason', 'CC BY 4.0', 'Choclo at San Pedro market, Cusco', 'Choclo en el mercado San Pedro, Cusco')],
  palta: [img('Persea americana fruit 2.JPG', 'B.navez', 'CC BY-SA 3.0', 'Avocados on the tree', 'Paltas en el árbol')],
  mango: [img('Mango fruits on a tree 01.jpg', 'daSupremo', 'CC BY-SA 4.0', 'Mangoes on the tree', 'Mangos en el árbol')],
}

/** Imágenes satelitales de la NASA (GIBS WMS) de un cuadrado de ~1° alrededor del punto */
export function nasaZoneImages(lat: number, lon: number, size = 480) {
  const d = 0.5
  const bbox = `${(lat - d).toFixed(2)},${(lon - d).toFixed(2)},${(lat + d).toFixed(2)},${(lon + d).toFixed(2)}`
  const base = `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&CRS=EPSG:4326&BBOX=${bbox}&WIDTH=${size}&HEIGHT=${size}&STYLES=`
  return {
    /** Mosaico sin nubes con relieve (NASA Blue Marble) */
    relief: `${base}&LAYERS=BlueMarble_ShadedRelief_Bathymetry&FORMAT=image/jpeg`,
    /** Verdor de la vegetación (NDVI MODIS, 8 días) */
    ndvi: `${base}&LAYERS=BlueMarble_ShadedRelief_Bathymetry,MODIS_Terra_NDVI_8Day&FORMAT=image/jpeg`,
  }
}
