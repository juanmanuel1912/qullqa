/**
 * Variedades de papa y parámetros del modelo de grados-día (GDD).
 *
 * Calibración: se usa temperatura base 2 °C (no 7 °C). Con los datos reales de NASA POWER
 * para Cusco (T2M media ≈ 8.5 °C), una base de 7 °C daría ~1.5 GDD/día y ciclos de
 * ~1000 días, imposible. Con base 2 °C, las metas de abajo reproducen los ciclos reales
 * de la sierra peruana (Canchán ~140 d, Yungay ~160 d, Huayro ~185 d).
 */

export type VarietyId = 'yungay' | 'canchan' | 'huayro';

export interface PotatoVariety {
  id: VarietyId;
  name: string;
  /** Grados-día (base GDD_BASE) desde la siembra hasta la cosecha */
  gddToHarvest: number;
  /** Rango típico en la sierra (días) — solo informativo */
  typicalDays: [number, number];
  description: string;
}

/** Temperatura base del crecimiento de la papa (°C) */
export const GDD_BASE = 2;
/** Sobre esta temperatura la papa no crece más rápido (°C) */
export const GDD_CAP = 29;

export const VARIETIES: Record<VarietyId, PotatoVariety> = {
  canchan: {
    id: 'canchan',
    name: 'Canchán',
    gddToHarvest: 900,
    typicalDays: [120, 150],
    description: 'Precoz y de piel rosada. Ideal para vender en el mercado.',
  },
  yungay: {
    id: 'yungay',
    name: 'Yungay',
    gddToHarvest: 1050,
    typicalDays: [150, 170],
    description: 'La más sembrada en la sierra. Rinde bien y aguanta el frío.',
  },
  huayro: {
    id: 'huayro',
    name: 'Huayro',
    gddToHarvest: 1200,
    typicalDays: [170, 190],
    description: 'Papa nativa harinosa, de gran sabor. Ciclo largo.',
  },
};

export const VARIETY_LIST: PotatoVariety[] = [VARIETIES.canchan, VARIETIES.yungay, VARIETIES.huayro];

export function getVariety(id: VarietyId): PotatoVariety {
  return VARIETIES[id];
}
