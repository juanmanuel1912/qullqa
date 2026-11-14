import { afterEach, describe, expect, it, vi } from 'vitest';
import fallback from '../../data/fallback-cusco.json';
import { APOD_FALLBACK, fetchApod, parseApod } from './apod';
import { locationKey } from './cache';
import { ndviTileUrl } from './gibs';
import { climatologyUrl, fetchClimatology, parseClimatology, parseDaily } from './power';

afterEach(() => vi.unstubAllGlobals());

describe('NASA POWER', () => {
  it('parsea la climatología de Cusco en 12 meses', () => {
    const c = parseClimatology(fallback, 'fallback');
    expect(c.months).toHaveLength(12);
    expect(c.elevation).toBeGreaterThan(3000);
    // Enero lluvioso, julio seco
    expect(c.months[0].precipMmMonth).toBeGreaterThan(100);
    expect(c.months[6].precipMmMonth).toBeLessThan(20);
  });

  it('convierte el valor de relleno -999 en null', () => {
    const d = parseDaily(
      {
        geometry: { coordinates: [-72, -13.5, 3700] },
        properties: {
          parameter: {
            T2M: { '20261111': 10.5, '20261112': -999 },
            T2M_MIN: { '20261111': 7, '20261112': -999 },
            T2M_MAX: { '20261111': 14, '20261112': -999 },
            PRECTOTCORR: { '20261111': 2.1, '20261112': -999 },
            GWETROOT: { '20261111': 0.6, '20261112': -999 },
          },
        },
      },
      'nasa',
    );
    expect(d.days).toHaveLength(2);
    expect(d.days[0]).toMatchObject({ date: '2026-11-11', t2m: 10.5 });
    expect(d.days[1].t2m).toBeNull();
  });

  it('arma la URL con los parámetros agrícolas', () => {
    const url = climatologyUrl(-13.5319, -71.9754);
    expect(url).toContain('community=AG');
    expect(url).toContain('PRECTOTCORR');
    expect(url).toContain('latitude=-13.5319');
  });

  it('si NASA falla, usa el JSON de respaldo', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.startsWith('https://power')) return new Response('error', { status: 503 });
      return new Response(JSON.stringify(fallback), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);
    const c = await fetchClimatology(10, 10);
    expect(c.source).toBe('fallback');
    expect(c.months).toHaveLength(12);
  });

  it('clave de caché redondeada', () => {
    expect(locationKey(-13.53191, -71.97541)).toBe('-13.53,-71.98');
  });
});

describe('APOD y GIBS', () => {
  it('usa la miniatura cuando APOD es un video', () => {
    const a = parseApod({ title: 'X', media_type: 'video', url: 'https://yt', thumbnail_url: 'https://thumb.jpg' });
    expect(a.imageUrl).toBe('https://thumb.jpg');
  });

  it('devuelve el respaldo de las Pléyades si APOD falla', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"code":500}', { status: 500 })));
    expect(await fetchApod()).toEqual(APOD_FALLBACK);
  });

  it('URL de teselas NDVI con plantilla de Leaflet', () => {
    expect(ndviTileUrl()).toContain('MODIS_Terra_NDVI_8Day/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png');
  });
});
