import { describe, expect, it } from 'vitest';
import { compass, incaDawn, nightWindow, pleiadesAt, stellariumUrl, sunAt } from './pleiades';

const CUSCO = { lat: -13.5319, lon: -71.9754 };

describe('Qullqa en el cielo', () => {
  it('coincide con Stellarium: amanecer del 20 de junio en Cusco, Pléyades a ~14.8° hacia el noreste', () => {
    const p = pleiadesAt(new Date('2026-06-20T10:15:00Z'), CUSCO.lat, CUSCO.lon);
    expect(p.alt).toBeGreaterThan(13.5);
    expect(p.alt).toBeLessThan(16);
    expect(p.az).toBeGreaterThan(55);
    expect(p.az).toBeLessThan(65);
    expect(compass(p.az)).toBe('noreste');
  });

  it('el Sol aún no salió a esa hora (cielo del amanecer)', () => {
    const s = sunAt(new Date('2026-06-20T10:15:00Z'), CUSCO.lat, CUSCO.lon);
    expect(s.alt).toBeLessThan(0);
    expect(s.alt).toBeGreaterThan(-18);
  });

  it('en noviembre se ven casi toda la noche, altas hacia el norte', () => {
    const w = nightWindow(new Date('2026-11-14T17:00:00Z'), CUSCO.lat, CUSCO.lon);
    expect(w).not.toBeNull();
    const hours = (w!.end.getTime() - w!.start.getTime()) / 3_600_000;
    expect(hours).toBeGreaterThan(6);
    expect(w!.bestDirection).toBe('norte');
    expect(w!.bestAlt).toBeGreaterThan(45);
  });

  it('a fines de abril no se ven: están detrás del Sol', () => {
    expect(nightWindow(new Date('2026-05-10T17:00:00Z'), CUSCO.lat, CUSCO.lon)).toBeNull();
  });

  it('amanecer inca y enlace al planetario', () => {
    const d = incaDawn(2027, CUSCO.lon);
    expect(d.toISOString()).toMatch(/^2027-06-20T10:0/);
    expect(decodeURIComponent(stellariumUrl(CUSCO.lat, CUSCO.lon, 3740, d))).toContain('date=2027-06-20T10:0');
  });
});
