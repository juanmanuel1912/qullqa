/**
 * Caché en localStorage. Todo va dentro de try/catch: en modo privado,
 * con almacenamiento lleno o bloqueado, la app sigue funcionando sin caché.
 */

const PREFIX = 'qullqa:v1:';

interface Entry<T> {
  savedAt: number;
  value: T;
}

export function cacheGet<T>(key: string, maxAgeMs: number): T | null {
  try {
    const raw = globalThis.localStorage?.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    if (Date.now() - entry.savedAt > maxAgeMs) return null;
    return entry.value;
  } catch {
    return null;
  }
}

/** Devuelve el valor aunque esté vencido (útil sin conexión). */
export function cacheGetStale<T>(key: string): T | null {
  return cacheGet<T>(key, Number.POSITIVE_INFINITY);
}

export function cacheSet<T>(key: string, value: T): void {
  try {
    const entry: Entry<T> = { savedAt: Date.now(), value };
    globalThis.localStorage?.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
}

/** Clave estable por ubicación (redondeada a ~1 km). */
export function locationKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

export const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;
