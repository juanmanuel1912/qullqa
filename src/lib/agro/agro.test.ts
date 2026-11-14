import { describe, expect, it } from 'vitest';
import fallback from '../../data/fallback-cusco.json';
import { parseClimatology } from '../../services/nasa/power';
import type { DailyRecord } from '../../services/nasa/types';
import {
  accumulateGdd,
  buildCalendar,
  classifyMonth,
  gddFromTemp,
  getCropStatus,
  motivationFor,
  projectDateForGdd,
  recommendSowing,
  stageFor,
  weeklySeries,
} from './index';

const clim = parseClimatology(fallback, 'fallback');
const day = (date: string, t2m: number | null, extra: Partial<DailyRecord> = {}): DailyRecord => ({
  date,
  t2m,
  t2mMin: null,
  t2mMax: null,
  precip: null,
  gwetRoot: null,
  solar: null,
  ...extra,
});

describe('grados-día', () => {
  it('usa base 2 °C y tope 29 °C', () => {
    expect(gddFromTemp(1)).toBe(0);
    expect(gddFromTemp(10)).toBe(8);
    expect(gddFromTemp(35)).toBe(27);
  });

  it('prefiere el dato diario real y completa con climatología', () => {
    const from = new Date('2026-11-01');
    const to = new Date('2026-11-04');
    const acc = accumulateGdd(from, to, clim, [day('2026-11-01', 12), day('2026-11-02', null)]);
    expect(acc.observedDays).toBe(1);
    expect(acc.filledDays).toBe(2);
    const novClim = gddFromTemp(clim.months[10].t2m);
    expect(acc.gdd).toBeCloseTo(10 + 2 * novClim, 5);
  });

  it('devuelve null si nunca se alcanza la meta (clima demasiado frío)', () => {
    const frozen = { ...clim, months: clim.months.map((m) => ({ ...m, t2m: 1 })) };
    expect(projectDateForGdd(new Date('2026-01-01'), 0, 1000, frozen)).toBeNull();
  });
});

describe('cuándo sembrar en Cusco (datos reales NASA POWER)', () => {
  const today = new Date('2026-08-01');

  it('recomienda sembrar entre octubre y noviembre, como la tradición andina', () => {
    const r = recommendSowing(clim, 'yungay', today);
    expect([9, 10]).toContain(r.best.month);
    expect(r.best.score).toBeGreaterThanOrEqual(80);
    expect(r.best.frostMonths).toHaveLength(0);
  });

  it('cosecha Yungay en marzo-mayo con un ciclo realista', () => {
    const r = recommendSowing(clim, 'yungay', today);
    expect(r.best.cycleDays).toBeGreaterThanOrEqual(140);
    expect(r.best.cycleDays).toBeLessThanOrEqual(185);
    expect([2, 3, 4]).toContain(r.best.harvestDate!.getUTCMonth());
  });

  it('Canchán es más precoz que Yungay, y Yungay que Huayro', () => {
    const days = (['canchan', 'yungay', 'huayro'] as const).map(
      (v) => recommendSowing(clim, v, today).all.find((e) => e.month === 10)!.cycleDays!,
    );
    expect(days[0]).toBeLessThan(days[1]);
    expect(days[1]).toBeLessThan(days[2]);
  });

  it('no recomienda sembrar en pleno invierno seco (junio)', () => {
    const r = recommendSowing(clim, 'yungay', today);
    const june = r.all.find((e) => e.month === 5)!;
    expect(june.label).toBe('No recomendada');
  });

  it('penaliza sembrar en enero porque la cosecha cae en temporada de heladas', () => {
    const r = recommendSowing(clim, 'yungay', today);
    const jan = r.all.find((e) => e.month === 0)!;
    expect(jan.frostMonths.length).toBeGreaterThan(0);
    expect(jan.score).toBeLessThan(r.best.score);
  });
});

describe('calendario inca', () => {
  const cal = buildCalendar(clim, 'yungay', 2026);

  it('tiene 12 meses con nombre quechua', () => {
    expect(cal).toHaveLength(12);
    expect(cal[5].quechua).toBe('Inti Raymi');
    expect(cal.every((m) => m.quechua && m.ancestral)).toBe(true);
  });

  it('semáforo: verano lluvioso verde, invierno con heladas rojo', () => {
    expect(cal[0].condition.status).toBe('good');
    expect(cal[6].condition.status).toBe('risk');
    expect(cal[6].condition.frostRisk).toBe(true);
  });

  it('marca exactamente un mes de siembra y uno de cosecha', () => {
    expect(cal.filter((m) => m.isBestSowing)).toHaveLength(1);
    expect(cal.filter((m) => m.isHarvest)).toHaveLength(1);
  });

  it('classifyMonth: helada fuerte siempre es riesgo', () => {
    const c = classifyMonth({ ...clim.months[0], t2mMin: -5 }, clim.months[11]);
    expect(c.status).toBe('risk');
  });
});

describe('mi cultivo', () => {
  it('antes de sembrar: progreso 0 y cosecha proyectada', () => {
    const s = getCropStatus({
      sowingDate: new Date('2026-12-01'),
      variety: 'yungay',
      climatology: clim,
      today: new Date('2026-11-14'),
    });
    expect(s.progress).toBe(0);
    expect(s.stage.id).toBe('sprouting');
    expect(s.harvestDate).not.toBeNull();
  });

  it('a mitad del ciclo avanza de etapa y cuenta los días a cosecha', () => {
    const s = getCropStatus({
      sowingDate: new Date('2026-11-01'),
      variety: 'yungay',
      climatology: clim,
      today: new Date('2027-01-31'),
    });
    expect(s.progress).toBeGreaterThan(0.4);
    expect(s.progress).toBeLessThan(0.75);
    expect(s.daysSinceSowing).toBe(91);
    expect(s.daysToHarvest).toBeGreaterThan(30);
    expect(s.daysToHarvest).toBeLessThan(110);
  });

  it('después del ciclo: listo para cosechar', () => {
    const s = getCropStatus({
      sowingDate: new Date('2026-11-01'),
      variety: 'canchan',
      climatology: clim,
      today: new Date('2027-06-01'),
    });
    expect(s.progress).toBe(1);
    expect(s.stage.id).toBe('harvest');
    expect(s.daysToHarvest).toBe(0);
  });

  it('alerta de helada cuando NASA registró temperatura bajo cero', () => {
    const daily = [day('2026-11-10', 5, { t2mMin: -1.5, precip: 3 })];
    const s = getCropStatus({
      sowingDate: new Date('2026-11-01'),
      variety: 'yungay',
      climatology: clim,
      daily,
      today: new Date('2026-11-14'),
    });
    expect(s.alerts.some((a) => a.level === 'danger')).toBe(true);
  });

  it('alerta de riego cuando la semana fue seca', () => {
    const daily = ['08', '09', '10', '11', '12', '13'].map((d) =>
      day(`2026-11-${d}`, 10, { t2mMin: 4, precip: 0, gwetRoot: 0.4 }),
    );
    const s = getCropStatus({
      sowingDate: new Date('2026-11-01'),
      variety: 'yungay',
      climatology: clim,
      daily,
      today: new Date('2026-11-14'),
    });
    expect(s.alerts.some((a) => a.title.includes('agua'))).toBe(true);
  });

  it('stageFor recorre las etapas en orden', () => {
    expect(stageFor(0).id).toBe('sprouting');
    expect(stageFor(0.5).id).toBe('tuberization');
    expect(stageFor(0.95).id).toBe('maturation');
    expect(stageFor(1).id).toBe('harvest');
  });

  it('serie semanal: 4 semanas reales + 2 esperadas', () => {
    const daily = Array.from({ length: 28 }, (_, i) => {
      const d = new Date(Date.UTC(2026, 9, 17 + i));
      return day(d.toISOString().slice(0, 10), 10, { t2mMin: 5, precip: 2 });
    });
    const w = weeklySeries(clim, daily, new Date('2026-11-14'));
    expect(w).toHaveLength(6);
    expect(w.slice(0, 4).every((p) => p.kind === 'observed')).toBe(true);
    expect(w.slice(4).every((p) => p.kind === 'expected')).toBe(true);
    expect(w[0].rainMm).toBe(14);
  });

  it('mensaje motivador estable para el mismo día', () => {
    const d = new Date('2026-11-14');
    expect(motivationFor('growth', d)).toBe(motivationFor('growth', d));
  });
});

import { buildTimeline } from './timeline'
describe('línea de tiempo del cultivo', () => {
  it('Yungay sembrada en noviembre en Cusco: ~5 meses, tareas en orden', () => {
    const tl = buildTimeline(clim, 'yungay', new Date('2026-11-14'))!
    expect(tl.totalDays).toBeGreaterThan(140)
    expect(tl.totalDays).toBeLessThan(185)
    expect(tl.months).toBeGreaterThan(4.5)
    const days = tl.tasks.map((t) => t.day)
    expect([...days].sort((a, b) => a - b)).toEqual(days)
    expect(tl.tasks[1].day).toBeGreaterThan(20) // primer aporque
    expect(tl.tasks[1].day).toBeLessThan(70)
  })
})
