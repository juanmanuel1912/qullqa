/**
 * NASA GIBS: capa NDVI (verdor de la vegetación) para react-leaflet.
 * Uso:
 *   <TileLayer url={ndviTileUrl()} attribution={GIBS_ATTRIBUTION} maxNativeZoom={GIBS_MAX_ZOOM} opacity={0.7} />
 */

export const GIBS_ATTRIBUTION = 'Imágenes: NASA GIBS / MODIS NDVI';
/** La capa MODIS_Terra_NDVI_8Day solo llega a nivel 9. */
export const GIBS_MAX_ZOOM = 9;

/**
 * @param date 'YYYY-MM-DD' o 'default' (la imagen más reciente disponible).
 */
export function ndviTileUrl(date: string = 'default'): string {
  return (
    'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/' +
    `${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`
  );
}

/** Imagen de color real (para dar contexto bajo el NDVI). */
export function trueColorTileUrl(date: string = 'default'): string {
  return (
    'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/' +
    `${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`
  );
}
