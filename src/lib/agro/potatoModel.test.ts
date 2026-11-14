import { describe, expect, it } from 'vitest';
import { toClimatologyMonth } from '../../services/nasaPower';
import { getNDVILayerUrl, getAvailableLayers } from '../../services/gibs';
import type { DailyDataPoint } from '../../types';
import { DEFAULT_MARS_ENVIRONMENT, simulateMarsGrowth } from './marsSimulator';
import {
  assessAllMonths,
  assessIrrigationNeeds,
  calculateCropProgress,
  calculateGDD,
  CUSCO_CLIMATOLOGY,
  GDD_TARGETS,
  getMonthNumberFromIncaName,
  getSowingAdvice,
  getWeeklyChartData,
  hasFrostRisk,
  INCA_MONTHS,
  isGoodForSowing,
  projectHarvestDate,
} from './potatoModel';

const clim = CUSCO_CLIMATOLOGY.months.map(toClimatologyMonth);

describe('potatoModel (API del design.md)', () => {
  it('climatología en formato UI: meses 1-12 y lluvia en mm/mes', () => {
    expect(clim[0].month).toBe(1);
    expect(clim[0].PRECTOTCORR).toBeGreaterThan(100);
    expect(clim[0].ALLSKY_SFC_SW_DWN).toBeCloseTo(17.39 / 3.6, 1);
  });

  it('assessAllMonths: 12 meses con semáforo y nombre inca', () => {
    const a = assessAllMonths(clim, 'Yungay');
    expect(a).toHaveLength(12);
    expect(a[0]).toMatchObject({ month: 1, monthName: 'Enero', trafficLight: 'green' });
    expect(a[6].trafficLight).toBe('red');
    expect(a[10].isGoodForSowing).toBe(true);
    expect(a[10].recommendation).toContain('Mejor mes para sembrar');
    expect(isGoodForSowing(a[11], a[10])).toBe(true);
    expect(isGoodForSowing(a[6], a[5])).toBe(false);
  });

  it('metas GDD calibradas con base 2 °C', () => {
    expect(GDD_TARGETS.find((t) => t.variety === 'Yungay')).toEqual({ variety: 'Yungay', targetGDD: 1050, baseTemp: 2 });
    expect(calculateGDD(20, 4)).toBe(10);
    expect(hasFrostRisk(-0.5)).toBe(true);
  });

  it('progreso y cosecha a mitad del ciclo', () => {
    const p = calculateCropProgress('2026-11-01', 'Yungay', [], clim, new Date('2027-01-31T12:00:00Z'));
    expect(p.status).toBe('growing');
    expect(p.progressPercent).toBeGreaterThan(40);
    expect(p.estimatedHarvestDate).toMatch(/^2027-0[3-5]-\d\d$/);
    expect(p.daysUntilHarvest).toBeGreaterThan(0);
    expect(projectHarvestDate('2026-11-01', 'Yungay', p.accumulatedGDD, clim, new Date('2027-01-31T12:00:00Z'))).toBe(
      p.estimatedHarvestDate,
    );
  });

  it('usa los datos diarios reales cuando existen', () => {
    const hot: DailyDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.UTC(2026, 10, 1 + i)).toISOString().slice(0, 10),
      T2M: 20,
      T2M_MIN: 10,
      T2M_MAX: 30,
      PRECTOTCORR: 3,
      ALLSKY_SFC_SW_DWN: 5,
      GWETROOT: 0.6,
    }));
    const withData = calculateCropProgress('2026-11-01', 'Yungay', hot, clim, new Date('2026-12-01'));
    const without = calculateCropProgress('2026-11-01', 'Yungay', [], clim, new Date('2026-12-01'));
    expect(withData.accumulatedGDD).toBeGreaterThan(without.accumulatedGDD);
  });

  it('consejo de siembra y gráfico semanal', () => {
    const s = getSowingAdvice(clim, 'Yungay', new Date('2026-08-01'));
    expect([10, 11]).toContain(s.bestMonth);
    expect(s.incaMonthName).toBeTruthy();
    expect(getWeeklyChartData([], clim, new Date('2026-11-14'))).toHaveLength(6);
  });

  it('riego y meses incas', () => {
    expect(assessIrrigationNeeds(0.4, 20, 10).needsWater).toBe(true);
    expect(assessIrrigationNeeds(0.7, 120, 10).needsWater).toBe(false);
    expect(INCA_MONTHS).toHaveLength(12);
    expect(getMonthNumberFromIncaName('Inti Raymi')).toBe(6);
    expect(getMonthNumberFromIncaName('noviembre')).toBe(11);
    expect(getMonthNumberFromIncaName('xyz')).toBe(0);
  });
});

describe('marsSimulator (API del design.md)', () => {
  it('superficie de Marte: no viable', () => {
    expect(simulateMarsGrowth(DEFAULT_MARS_ENVIRONMENT, 'Yungay').viability).toBe('not_viable');
  });

  it('invernadero con LED: viable y más rápido que Cusco', () => {
    const r = simulateMarsGrowth({ temperature: 16, light: 100, water: 75 }, 'Yungay');
    expect(r.viability).toBe('high');
    expect(r.comparisonWithEarth.accelerationFactor).toBeGreaterThan(1);
    expect(r.comparisonWithEarth.message).toContain('Cusco');
  });
});

describe('gibs (API del design.md)', () => {
  it('usa el endpoint vigente de GIBS', () => {
    expect(getNDVILayerUrl()).toContain('gibs.earthdata.nasa.gov');
    expect(getAvailableLayers()).toHaveLength(2);
  });
});
