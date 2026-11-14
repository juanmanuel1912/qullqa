/**
 * Las chacras del agricultor y lo que producen.
 * DEMO: se guardan solo en este teléfono (localStorage). Luego irán a su cuenta.
 */
import { useCallback, useState } from 'react'
import type { NextCropId, PrevCropId, SoilType } from '../rotation/nextCrop'

export type WaterSource = 'rain' | 'irrigation'

export interface MyFarm {
  id: string
  name: string
  placeName: string
  lat: number
  lon: number
  /** Altitud exacta del punto (m), si se conoce */
  elevation: number | null
  areaHa: number | null
  soil: SoilType
  water: WaterSource
  /** Lo que produce esta chacra */
  products: NextCropId[]
  /** Lo último que se sembró (para la rotación) */
  lastCrop: PrevCropId
  createdAt: string
}

export type MyFarmInput = Omit<MyFarm, 'id' | 'createdAt'>

const KEY = 'qullqa:v1:myfarms'

export function loadMyFarms(): MyFarm[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as MyFarm[]
  } catch {
    /* ignorar */
  }
  return []
}

export function useMyFarms() {
  const [farms, setFarms] = useState<MyFarm[]>(loadMyFarms)
  // Se guarda al instante (no dentro de setState): la pantalla siguiente lee el teléfono enseguida
  const persist = useCallback((fn: (f: MyFarm[]) => MyFarm[]) => {
    const next = fn(loadMyFarms())
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* ignorar */
    }
    setFarms(next)
  }, [])

  const add = (f: MyFarmInput): string => {
    const id = `f-${Date.now().toString(36)}`
    persist((prev) => [...prev, { ...f, id, createdAt: new Date().toISOString() }])
    return id
  }
  const update = (id: string, patch: Partial<MyFarmInput>) => persist((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  const remove = (id: string) => persist((prev) => prev.filter((f) => f.id !== id))

  return { farms, add, update, remove }
}
