/**
 * ¿Cuándo sembrar? Evalúa cada mes simulando todo el ciclo de la papa con la climatología NASA.
 */
import type { Climatology } from '../../services/nasa/types';
import { addDays, daysBetween, projectDateForGdd } from './gdd';
import { getVariety, type VarietyId } from './varieties';
import type { Reason } from './calendar';

export type SowingLabelCode = 'excellent' | 'good' | 'fair' | 'notRecommended';

export interface SowingEvaluation {
  /** Mes de siembra (0-11) */
  month: number;
  /** 0-100: qué tan recomendable es sembrar este mes */
  score: number;
  sowDate: Date;
  harvestDate: Date | null;
  cycleDays: number | null;
  /** Meses del ciclo con riesgo de helada */
  frostMonths: number[];
  rainAtSowingMm: number;
  label: 'Excelente' | 'Buena' | 'Regular' | 'No recomendada';
  reasons: string[];
  /** Traducible: clave i18n sowLabel.* */
  labelCode: SowingLabelCode;
  /** Traducible: claves i18n sreason.* */
  codes: Reason[];
}

/** Meses (0-11) que toca el ciclo entre dos fechas. */
function monthsInCycle(from: Date, to: Date): number[] {
  const out: number[] = [];
  for (let d = new Date(from); d <= to; d = addDays(d, 1)) {
    const m = d.getUTCMonth();
    if (out[out.length - 1] !== m) out.push(m);
  }
  return out;
}

/**
 * Puntaje de sembrar el día 1 de `month`:
 *   +30 lluvia al sembrar, +15 suelo húmedo, +15 sin helada al brotar,
 *   +40 ciclo sin heladas (−15 por cada mes con helada, −25 si es fuerte),
 *   −20 si la papa pasa sus primeros 3 meses con poca lluvia.
 */
export function evaluateSowingMonth(
  clim: Climatology,
  variety: VarietyId,
  month: number,
  year: number,
  /** Día de siembra (1 por defecto; para el mes en curso se usa hoy) */
  day = 1,
): SowingEvaluation {
  const v = getVariety(variety);
  const sowDate = new Date(Date.UTC(year, month, day));
  const harvestDate = projectDateForGdd(sowDate, 0, v.gddToHarvest, clim);
  const m = clim.months[month];
  const prev = clim.months[(month + 11) % 12];
  const reasons: string[] = [];
  const codes: Reason[] = [];
  let score = 0;

  if (m.precipMmMonth >= 60) {
    score += 30;
    reasons.push('Las lluvias ya llegaron');
    codes.push({ code: 'rainsArrived' });
  } else if (m.precipMmMonth >= 30) {
    score += 15;
    reasons.push('Lluvias recién empiezan: ten riego a mano');
    codes.push({ code: 'rainsStarting' });
  } else {
    reasons.push('Muy seco para sembrar sin riego');
    codes.push({ code: 'tooDry' });
  }

  if (m.gwetRoot >= 0.5 || m.gwetRoot > prev.gwetRoot) {
    score += 15;
    reasons.push('Suelo con humedad');
    codes.push({ code: 'soilMoist' });
  }

  if (m.t2mMin >= 0) {
    score += 15;
  } else {
    reasons.push('Helada al brotar');
    codes.push({ code: 'frostAtSprout' });
  }

  if (!harvestDate) {
    return {
      month,
      score: 0,
      sowDate,
      harvestDate: null,
      cycleDays: null,
      frostMonths: [],
      rainAtSowingMm: m.precipMmMonth,
      label: 'No recomendada',
      labelCode: 'notRecommended',
      reasons: ['Hace demasiado frío: la papa no llegaría a madurar'],
      codes: [{ code: 'tooCold' }],
    };
  }

  const cycle = monthsInCycle(sowDate, harvestDate);
  const frostMonths = cycle.filter((i) => clim.months[i].t2mMin < 0);
  let cycleScore = 40;
  for (const i of frostMonths) cycleScore -= clim.months[i].t2mMin < -2 ? 25 : 15;
  // Puede ser negativo: muchas heladas en el ciclo hunden el puntaje.
  score += cycleScore;
  if (frostMonths.length === 0) {
    reasons.push('Todo el ciclo libre de heladas');
    codes.push({ code: 'cycleFrostFree' });
  } else {
    reasons.push(`Heladas durante el cultivo (${frostMonths.length} mes${frostMonths.length > 1 ? 'es' : ''})`);
    codes.push({ code: 'cycleFrost', value: frostMonths.length });
  }

  const early = cycle.slice(0, 3);
  const earlyRain = early.reduce((s, i) => s + clim.months[i].precipMmDay, 0) / early.length;
  if (earlyRain < 2) {
    score -= 20;
    reasons.push('Poca lluvia en el crecimiento: necesitará riego');
    codes.push({ code: 'lowEarlyRain' });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const label = score >= 80 ? 'Excelente' : score >= 60 ? 'Buena' : score >= 40 ? 'Regular' : 'No recomendada';
  const labelCode: SowingLabelCode = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'notRecommended';

  return {
    month,
    score,
    sowDate,
    harvestDate,
    cycleDays: daysBetween(sowDate, harvestDate),
    frostMonths,
    rainAtSowingMm: m.precipMmMonth,
    label,
    labelCode,
    reasons,
    codes,
  };
}

export interface SowingRecommendation {
  best: SowingEvaluation;
  /** Meses consecutivos alrededor del mejor con puntaje ≥ 60 */
  window: SowingEvaluation[];
  /** Días hasta el inicio del mejor mes (0 si es este mes) */
  daysUntil: number;
  all: SowingEvaluation[];
}

/**
 * Mejor momento para sembrar en los próximos 12 meses, contando desde `today`.
 * Si el mes actual es bueno, la recomendación es "¡siembra ya!".
 */
export function recommendSowing(clim: Climatology, variety: VarietyId, today = new Date()): SowingRecommendation {
  const y = today.getUTCFullYear();
  const m0 = today.getUTCMonth();
  const all = Array.from({ length: 12 }, (_, k) => {
    const month = (m0 + k) % 12;
    const year = y + Math.floor((m0 + k) / 12);
    // Mes en curso: sembrar hoy (no el día 1, que ya pasó).
    return evaluateSowingMonth(clim, variety, month, year, k === 0 ? today.getUTCDate() : 1);
  });
  // Mejor puntaje; en empate gana el más cercano.
  const bestIdx = all.reduce((bi, e, i) => (e.score > all[bi].score ? i : bi), 0);
  const best = all[bestIdx];

  const window: SowingEvaluation[] = [best];
  for (let i = bestIdx - 1; i >= 0 && all[i].score >= 60; i--) window.unshift(all[i]);
  for (let i = bestIdx + 1; i < all.length && all[i].score >= 60; i++) window.push(all[i]);

  return { best, window, daysUntil: Math.max(0, daysBetween(today, best.sowDate)), all };
}
