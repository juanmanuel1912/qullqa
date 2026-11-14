/**
 * Aportes de la comunidad: nuevas variedades de papa con revisión de un experto.
 * DEMO: se guardan solo en este teléfono (localStorage). En el futuro irán a una base de datos
 * compartida, con inicio de sesión y perfiles de revisores.
 */
import { useCallback, useEffect, useState } from 'react'

export type ContribStatus = 'pending' | 'approved' | 'rejected'

export interface Contribution {
  id: string
  name: string
  localNames: string
  where: string
  altitude: string
  dishes: string
  diseases: string
  description: string
  /** Foto reducida (data URL JPEG) */
  photo: string | null
  author: string
  status: ContribStatus
  createdAt: string
  /** Aporte de ejemplo para mostrar el flujo */
  example?: boolean
}

export type ContributionInput = Omit<Contribution, 'id' | 'status' | 'createdAt' | 'example'>

const KEY = 'qullqa:v1:contributions'

/** Un aporte de ejemplo (marcado como tal) para que se vea el flujo de revisión. */
export const EXAMPLE_CONTRIBUTION: Contribution = {
  id: 'example-1',
  name: 'Ejemplo · papa nativa de la comunidad',
  localNames: '—',
  where: 'Comunidad de ejemplo, Cusco',
  altitude: '3800',
  dishes: 'Sancochada, huatia',
  diseases: '—',
  description: 'Este es un aporte de ejemplo para mostrar cómo funciona la revisión. Apruébalo o recházalo en el modo revisor.',
  photo: null,
  author: 'Qullqa',
  status: 'pending',
  createdAt: '2026-11-14T00:00:00Z',
  example: true,
}

function load(): Contribution[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Contribution[]
  } catch {
    /* ignorar */
  }
  return [EXAMPLE_CONTRIBUTION]
}

function save(list: Contribution[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
    return true
  } catch {
    return false // almacenamiento lleno (fotos grandes) o bloqueado
  }
}

export function useContributions() {
  const [items, setItems] = useState<Contribution[]>(load)

  // Sincroniza entre pestañas/pantallas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setItems(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const update = useCallback((fn: (prev: Contribution[]) => Contribution[]) => {
    setItems((prev) => {
      const next = fn(prev)
      save(next)
      return next
    })
  }, [])

  const add = useCallback(
    (input: ContributionInput) =>
      update((prev) => [
        { ...input, id: `c-${Date.now().toString(36)}`, status: 'pending', createdAt: new Date().toISOString() },
        ...prev,
      ]),
    [update],
  )

  const setStatus = useCallback(
    (id: string, status: ContribStatus) => update((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c))),
    [update],
  )

  return { items, add, setStatus, approved: items.filter((c) => c.status === 'approved') }
}

/** Reduce una foto a máx. 640 px y JPEG 70 % para que quepa en el teléfono. */
export function resizePhoto(file: File, max = 640): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen'))
    }
    img.src = url
  })
}
