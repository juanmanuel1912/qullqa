/**
 * Productos que el agricultor ofrece (base del futuro marketplace).
 * DEMO: se guardan solo en este teléfono. Luego irán a la base de datos con su cuenta.
 */
import { useCallback, useState } from 'react'
import type { CropId } from '@/lib/crops/catalog'

export interface Product {
  id: string
  name: string
  crop: CropId
  variety: string
  amount: string
  /** Meses disponibles (0 = enero) */
  fromMonth: number
  toMonth: number
  notes: string
  createdAt: string
}

export type ProductInput = Omit<Product, 'id' | 'createdAt'>

const KEY = 'qullqa:v1:products'

function load(): Product[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Product[]
  } catch {
    /* ignorar */
  }
  return []
}

export function useProducts() {
  const [items, setItems] = useState<Product[]>(load)
  const persist = useCallback((fn: (p: Product[]) => Product[]) => {
    setItems((prev) => {
      const next = fn(prev)
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        /* ignorar */
      }
      return next
    })
  }, [])
  return {
    items,
    add: (p: ProductInput) => persist((prev) => [{ ...p, id: `p-${Date.now().toString(36)}`, createdAt: new Date().toISOString() }, ...prev]),
    remove: (id: string) => persist((prev) => prev.filter((p) => p.id !== id)),
  }
}
