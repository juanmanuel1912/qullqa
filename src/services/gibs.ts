/**
 * T2.3 — NASA GIBS con la API del design.md.
 * Nota: el endpoint antiguo map1.vis.earthdata.nasa.gov está retirado; se usa gibs.earthdata.nasa.gov
 * (verificado: responde 200 con teselas PNG).
 */
import type { GIBSLayer } from '../types';
import { GIBS_ATTRIBUTION, GIBS_MAX_ZOOM, ndviTileUrl, trueColorTileUrl } from './nasa/gibs';

export { GIBS_ATTRIBUTION, GIBS_MAX_ZOOM };

/**
 * Plantilla de teselas NDVI para <TileLayer>. Sin fecha usa la imagen más reciente.
 * Usar `maxNativeZoom={GIBS_MAX_ZOOM}` (la capa solo llega a zoom 9).
 */
export function getNDVILayerUrl(date?: string): string {
  return ndviTileUrl(date ?? 'default');
}

export function getAvailableLayers(): GIBSLayer[] {
  return [
    { name: 'Verdor de cultivos (NDVI)', tileUrl: ndviTileUrl(), attribution: GIBS_ATTRIBUTION },
    { name: 'Color real (MODIS)', tileUrl: trueColorTileUrl(), attribution: 'Imágenes: NASA GIBS / MODIS' },
  ];
}
