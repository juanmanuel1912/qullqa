/**
 * T2.2 — NASA APOD con la API del design.md. Delega en src/services/nasa/apod.ts.
 */
import type { APODData } from '../types';
import { fetchApod } from './nasa/apod';
import { cacheGetStale, cacheSet } from './nasa/cache';
import type { ApodData } from './nasa/types';

const toAPODData = (a: ApodData): APODData => ({
  date: a.date,
  url: a.imageUrl,
  title: a.title,
  copyright: a.copyright,
  explanation: a.explanation,
  source: a.source,
});

/** Foto del día. Nunca falla: si APOD está caído devuelve las Pléyades (/apod-fallback.jpg). */
export async function getAPOD(): Promise<APODData> {
  return toAPODData(await fetchApod());
}

export function getCachedAPOD(): APODData | null {
  const a = cacheGetStale<ApodData>('apod');
  return a ? toAPODData({ ...a, source: 'cache' }) : null;
}

export function setCachedAPOD(data: APODData): void {
  const a: ApodData = {
    title: data.title,
    date: data.date,
    explanation: data.explanation ?? '',
    imageUrl: data.url,
    mediaType: 'image',
    copyright: data.copyright,
    source: 'cache',
  };
  cacheSet('apod', a);
}
