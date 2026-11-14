/**
 * Productos que agrega el agricultor (además de los de la app).
 * Con sus necesidades de altura y clima, la app dice si se pueden sembrar en su chacra.
 * DEMO: se guardan solo en este teléfono (localStorage).
 */
import { useCallback, useState } from 'react'
import type { Localized } from '@/i18n'
import type { CropNeeds } from './fit'

export interface CustomCrop extends CropNeeds {
  id: string
  name: string
  emoji: string
}

export type CustomCropInput = Omit<CustomCrop, 'id'>

/** Ejemplos rápidos: valores de referencia para cultivos comunes del Perú (aproximados) */
export const CROP_PRESETS: (CropNeeds & { key: string; emoji: string; name: Localized })[] = [
  { key: 'olluco', emoji: '🟡', name: { en: 'Olluco (ulluco)', es: 'Olluco' }, altitude: [2800, 4000], minMeanTemp: 6, frostSensitive: true, cycleMonths: 6, perennial: false, waterMm: 450 },
  { key: 'kiwicha', emoji: '🌺', name: { en: 'Kiwicha (amaranth)', es: 'Kiwicha' }, altitude: [1500, 3500], minMeanTemp: 12, frostSensitive: true, cycleMonths: 5, perennial: false, waterMm: 400 },
  { key: 'arveja', emoji: '🟢', name: { en: 'Peas', es: 'Arveja' }, altitude: [1500, 3600], minMeanTemp: 8, frostSensitive: true, cycleMonths: 4, perennial: false, waterMm: 350 },
  { key: 'trigo', emoji: '🌾', name: { en: 'Wheat', es: 'Trigo' }, altitude: [1500, 3800], minMeanTemp: 6, frostSensitive: false, cycleMonths: 6, perennial: false, waterMm: 450 },
  { key: 'cebolla', emoji: '🧅', name: { en: 'Onion', es: 'Cebolla' }, altitude: [0, 3500], minMeanTemp: 10, frostSensitive: false, cycleMonths: 5, perennial: false, waterMm: 500 },
  { key: 'zanahoria', emoji: '🥕', name: { en: 'Carrot', es: 'Zanahoria' }, altitude: [0, 3500], minMeanTemp: 8, frostSensitive: false, cycleMonths: 4, perennial: false, waterMm: 400 },
  { key: 'fresa', emoji: '🍓', name: { en: 'Strawberry', es: 'Fresa' }, altitude: [0, 3000], minMeanTemp: 12, frostSensitive: true, cycleMonths: 6, perennial: false, waterMm: 600 },
  { key: 'yuca', emoji: '🍠', name: { en: 'Cassava', es: 'Yuca' }, altitude: [0, 1500], minMeanTemp: 20, frostSensitive: true, cycleMonths: 10, perennial: false, waterMm: 1000 },
  { key: 'platano', emoji: '🍌', name: { en: 'Banana', es: 'Plátano' }, altitude: [0, 1200], minMeanTemp: 22, frostSensitive: true, cycleMonths: 12, perennial: true, waterMm: 1500 },
  { key: 'arroz', emoji: '🍚', name: { en: 'Rice', es: 'Arroz' }, altitude: [0, 1000], minMeanTemp: 20, frostSensitive: true, cycleMonths: 5, perennial: false, waterMm: 1200 },
]

const KEY = 'qullqa:v1:customCrops'

export function loadCustomCrops(): CustomCrop[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as CustomCrop[]
  } catch {
    /* ignorar */
  }
  return []
}

export function useCustomCrops() {
  const [crops, setCrops] = useState<CustomCrop[]>(loadCustomCrops)
  const persist = useCallback((fn: (c: CustomCrop[]) => CustomCrop[]) => {
    const next = fn(loadCustomCrops())
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* ignorar */
    }
    setCrops(next)
  }, [])
  const add = (c: CustomCropInput) => persist((prev) => [...prev, { ...c, id: `c-${Date.now().toString(36)}` }])
  const remove = (id: string) => persist((prev) => prev.filter((c) => c.id !== id))
  return { crops, add, remove }
}
