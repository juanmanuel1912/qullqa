/**
 * NASA APOD (Astronomy Picture of the Day) para la pantalla de inicio.
 * La API a veces falla (500) o se queda sin cuota con DEMO_KEY: siempre hay respaldo.
 */
import { cacheGet, cacheSet, HOUR } from './cache';
import type { ApodData } from './types';

/** Respaldo: las Pléyades (Qullqa), imagen de dominio público de NASA. */
export const APOD_FALLBACK: ApodData = {
  title: 'Las Pléyades — Qullqa',
  date: '',
  explanation:
    'Los incas observaban las Pléyades (Qullqa, "el depósito") al amanecer de junio. ' +
    'Si brillaban claras, esperaban buenas lluvias y sembraban a tiempo. ' +
    'Hoy los satélites de la NASA nos ayudan a leer el cielo y la tierra.',
  imageUrl: '/apod-fallback.jpg',
  mediaType: 'image',
  copyright: 'NASA/JPL-Caltech (Spitzer, PIA09262)',
  source: 'fallback',
};

interface ApodResponse {
  title?: string;
  date?: string;
  explanation?: string;
  url?: string;
  hdurl?: string;
  thumbnail_url?: string;
  media_type?: string;
  copyright?: string;
}

export function parseApod(json: unknown): ApodData {
  const r = json as ApodResponse;
  const mediaType = r.media_type === 'image' ? 'image' : r.media_type === 'video' ? 'video' : 'other';
  const imageUrl = mediaType === 'image' ? r.url : r.thumbnail_url;
  if (!r.title || !imageUrl) throw new Error('APOD sin imagen utilizable');
  return {
    title: r.title,
    date: r.date ?? '',
    explanation: r.explanation ?? '',
    imageUrl,
    mediaType,
    copyright: r.copyright?.trim(),
    source: 'nasa',
  };
}

function apiKey(): string {
  try {
    return import.meta.env?.VITE_NASA_API_KEY || 'DEMO_KEY';
  } catch {
    return 'DEMO_KEY';
  }
}

/** Nunca lanza error: si APOD falla devuelve `APOD_FALLBACK`. */
export async function fetchApod(signal?: AbortSignal): Promise<ApodData> {
  const cached = cacheGet<ApodData>('apod', 12 * HOUR);
  if (cached) return { ...cached, source: 'cache' };
  try {
    const res = await fetch(`https://api.nasa.gov/planetary/apod?thumbs=true&api_key=${apiKey()}`, { signal });
    if (!res.ok) throw new Error(`APOD respondió ${res.status}`);
    const data = parseApod(await res.json());
    cacheSet('apod', data);
    return data;
  } catch {
    return APOD_FALLBACK;
  }
}
