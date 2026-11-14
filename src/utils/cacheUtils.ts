/**
 * Utilidades para manejo de caché en localStorage
 */

const CACHE_PREFIX = 'qullqa_'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 horas

interface CachedItem<T> {
  data: T
  timestamp: number
}

/**
 * Obtiene datos del caché
 */
export function getCached<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(CACHE_PREFIX + key)
    if (!stored) return null

    const parsed: CachedItem<T> = JSON.parse(stored)
    const age = Date.now() - parsed.timestamp

    if (age > CACHE_TTL) {
      // Expirado, eliminar
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }

    return parsed.data
  } catch (error) {
    console.warn(`Error reading cache key "${key}":`, error)
    return null
  }
}

/**
 * Guarda datos en caché
 */
export function setCached<T>(key: string, data: T): void {
  try {
    const item: CachedItem<T> = {
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item))
  } catch (error) {
    // localStorage lleno o deshabilitado
    console.warn(`Error writing cache key "${key}":`, error)
    // Intentar limpiar caché viejo
    try {
      clearOldCache()
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
        data,
        timestamp: Date.now(),
      }))
    } catch (retryError) {
      console.error(`Failed to save cache after cleanup:`, retryError)
    }
  }
}

/**
 * Elimina un item del caché
 */
export function clearCachedItem(key: string): void {
  try {
    localStorage.removeItem(CACHE_PREFIX + key)
  } catch (error) {
    console.warn(`Error removing cache key "${key}":`, error)
  }
}

/**
 * Limpia todo el caché de Qullqa
 */
export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Error clearing all cache:', error)
  }
}

/**
 * Limpia items viejos del caché
 */
export function clearOldCache(): void {
  try {
    const keys = Object.keys(localStorage)
    const now = Date.now()

    keys.forEach(key => {
      if (!key.startsWith(CACHE_PREFIX)) return

      try {
        const stored = localStorage.getItem(key)
        if (!stored) return

        const parsed: CachedItem<unknown> = JSON.parse(stored)
        const age = now - parsed.timestamp

        if (age > CACHE_TTL) {
          localStorage.removeItem(key)
        }
      } catch {
        // Si no se puede parsear, eliminar
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Error clearing old cache:', error)
  }
}

/**
 * Retorna información de tamaño del caché
 */
export function getCacheStats(): {
  itemCount: number
  estimatedSizeKB: number
} {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX))
    let totalSize = 0

    keys.forEach(key => {
      const item = localStorage.getItem(key)
      if (item) {
        totalSize += item.length
      }
    })

    return {
      itemCount: keys.length,
      estimatedSizeKB: Math.round(totalSize / 1024),
    }
  } catch {
    return { itemCount: 0, estimatedSizeKB: 0 }
  }
}
