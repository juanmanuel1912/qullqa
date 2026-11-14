/**
 * Calendario agrícola inca (según Guamán Poma de Ayala) + semáforo climático NASA.
 */
import type { Climatology, MonthlyClimate } from '../../services/nasa/types';
import { evaluateSowingMonth, type SowingEvaluation } from './sowing';
import type { VarietyId } from './varieties';

export type TrafficLight = 'good' | 'caution' | 'risk';

/** Razón traducible: `code` es la clave i18n, `value` el número a mostrar. */
export interface Reason {
  code: string;
  value?: number;
}

export interface IncaMonth {
  month: number;
  /** Nombre quechua del mes */
  quechua: string;
  spanish: string;
  /** Qué se hacía en la chacra en tiempos incas */
  ancestral: string;
}

export const INCA_MONTHS: IncaMonth[] = [
  { month: 0, quechua: 'Qhapaq Raymi Killa', spanish: 'Enero', ancestral: 'Se cuidaba la chacra y se hacía el aporque.' },
  { month: 1, quechua: 'Hatun Puquy', spanish: 'Febrero', ancestral: 'Gran maduración: la papa forma sus tubérculos.' },
  { month: 2, quechua: 'Pacha Puquy', spanish: 'Marzo', ancestral: 'La tierra madura; se vigilaba la helada.' },
  { month: 3, quechua: 'Ayriwa', spanish: 'Abril', ancestral: 'Primeras cosechas de papa y maíz.' },
  { month: 4, quechua: 'Aymuray', spanish: 'Mayo', ancestral: 'Gran cosecha y almacenamiento en las qullqas (depósitos).' },
  { month: 5, quechua: 'Inti Raymi', spanish: 'Junio', ancestral: 'Fiesta del Sol. Al amanecer se miraban las Pléyades (Qullqa) para predecir las lluvias.' },
  { month: 6, quechua: 'Anta Sitwa', spanish: 'Julio', ancestral: 'Se repartían las tierras y se preparaba el chuño con las heladas.' },
  { month: 7, quechua: 'Chakra Yapuy', spanish: 'Agosto', ancestral: 'Se rompía la tierra con la chakitaqlla y se pagaba a la Pachamama.' },
  { month: 8, quechua: 'Quya Raymi', spanish: 'Septiembre', ancestral: 'Siembra temprana (maway) donde había agua.' },
  { month: 9, quechua: 'Uma Raymi', spanish: 'Octubre', ancestral: 'Se pedía la lluvia. Comenzaba la siembra grande.' },
  { month: 10, quechua: 'Aya Marq’ay', spanish: 'Noviembre', ancestral: 'Siembra principal con las primeras lluvias.' },
  { month: 11, quechua: 'Qhapaq Inti Raymi', spanish: 'Diciembre', ancestral: 'La papa brota y crece con las lluvias.' },
];

export interface MonthCondition {
  status: TrafficLight;
  rainMm: number;
  tMin: number;
  tMean: number;
  frostRisk: boolean;
  /** La humedad del suelo sube respecto al mes anterior */
  soilWettening: boolean;
  /** Razones en español sencillo */
  reasons: string[];
  /** Las mismas razones como códigos traducibles (reason.*) */
  codes: Reason[];
}

/** Umbrales del semáforo */
export const RAIN_GOOD_MM = 60;
export const RAIN_LOW_MM = 30;
export const FROST_C = 0;
export const HARD_FROST_C = -2;

/** Semáforo climático de un mes (¿es buen mes para tener papa en el campo?). */
export function classifyMonth(m: MonthlyClimate, prev: MonthlyClimate): MonthCondition {
  const reasons: string[] = [];
  const codes: Reason[] = [];
  const frostRisk = m.t2mMin < FROST_C;
  const hardFrost = m.t2mMin < HARD_FROST_C;
  const soilWettening = m.gwetRoot > prev.gwetRoot;
  let score = 0;

  if (m.precipMmMonth >= RAIN_GOOD_MM) {
    score += 2;
    reasons.push(`Buena lluvia: ${m.precipMmMonth} mm en el mes`);
    codes.push({ code: 'rainGood', value: m.precipMmMonth });
  } else if (m.precipMmMonth >= RAIN_LOW_MM) {
    score += 1;
    reasons.push(`Lluvia escasa: ${m.precipMmMonth} mm, puede necesitar riego`);
    codes.push({ code: 'rainLow', value: m.precipMmMonth });
  } else {
    reasons.push(`Mes seco: solo ${m.precipMmMonth} mm de lluvia`);
    codes.push({ code: 'rainDry', value: m.precipMmMonth });
  }

  if (hardFrost) {
    score -= 3;
    reasons.push(`Heladas fuertes: hasta ${m.t2mMin.toFixed(1)} °C`);
    codes.push({ code: 'frostHard', value: m.t2mMin });
  } else if (frostRisk) {
    score -= 1;
    reasons.push(`Riesgo de helada: hasta ${m.t2mMin.toFixed(1)} °C`);
    codes.push({ code: 'frostRisk', value: m.t2mMin });
  } else {
    score += 1;
    reasons.push('Sin heladas esperadas');
    codes.push({ code: 'noFrost' });
  }

  if (soilWettening) {
    reasons.push('El suelo se está humedeciendo');
    codes.push({ code: 'soilWet' });
  }

  const status: TrafficLight = score >= 3 ? 'good' : score >= 1 ? 'caution' : 'risk';
  return {
    status,
    rainMm: m.precipMmMonth,
    tMin: m.t2mMin,
    tMean: m.t2m,
    frostRisk,
    soilWettening,
    reasons,
    codes,
  };
}

export interface CalendarMonth extends IncaMonth {
  climate: MonthlyClimate;
  condition: MonthCondition;
  /** Qué tan bueno es sembrar en este mes (incluye todo el ciclo hasta la cosecha) */
  sowing: SowingEvaluation;
  /** Mes recomendado para sembrar */
  isBestSowing: boolean;
  /** Mes de cosecha si se siembra en el mes recomendado */
  isHarvest: boolean;
}

/** Arma los 12 meses del calendario circular. */
export function buildCalendar(clim: Climatology, variety: VarietyId, year = new Date().getUTCFullYear()): CalendarMonth[] {
  const sowings = clim.months.map((_, i) => evaluateSowingMonth(clim, variety, i, year));
  const best = sowings.reduce((a, b) => (b.score > a.score ? b : a));
  const harvestMonth = best.harvestDate ? best.harvestDate.getUTCMonth() : -1;

  return INCA_MONTHS.map((inca) => {
    const m = clim.months[inca.month];
    const prev = clim.months[(inca.month + 11) % 12];
    return {
      ...inca,
      climate: m,
      condition: classifyMonth(m, prev),
      sowing: sowings[inca.month],
      isBestSowing: inca.month === best.month,
      isHarvest: inca.month === harvestMonth,
    };
  });
}

export const TRAFFIC_LIGHT_LABEL: Record<TrafficLight, string> = {
  good: 'Bueno',
  caution: 'Cuidado',
  risk: 'Riesgo',
};
