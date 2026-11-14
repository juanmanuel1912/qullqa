import { describe, expect, it } from 'vitest';
import { lightFactor, MARS_PRESETS, simulateMars, waterFactor } from './model';

const preset = (id: string) => MARS_PRESETS.find((p) => p.id === id)!.input;

describe('Qullqa en Marte', () => {
  it('al aire libre es imposible cultivar', () => {
    const r = simulateMars({ ...preset('outside'), variety: 'yungay' });
    expect(r.viable).toBe(false);
    expect(r.sols).toBeNull();
  });

  it('en invernadero sí crece, y con LED más rápido', () => {
    const natural = simulateMars({ ...preset('greenhouse'), variety: 'yungay' });
    const led = simulateMars({ ...preset('greenhouse-led'), variety: 'yungay' });
    expect(natural.viable).toBe(true);
    expect(led.sols!).toBeLessThan(natural.sols!);
  });

  it('el calor excesivo frena la tuberización', () => {
    const ideal = simulateMars({ tempC: 18, lightPct: 100, waterPct: 75, variety: 'yungay' });
    const hot = simulateMars({ tempC: 30, lightPct: 100, waterPct: 75, variety: 'yungay' });
    expect(hot.gddPerSol).toBeLessThan(ideal.gddPerSol);
  });

  it('factores de luz y agua en rango 0-1', () => {
    expect(lightFactor(0)).toBe(0);
    expect(lightFactor(100)).toBe(1);
    expect(waterFactor(10)).toBe(0);
    expect(waterFactor(75)).toBe(1);
    expect(waterFactor(100)).toBeLessThan(1);
  });
});
