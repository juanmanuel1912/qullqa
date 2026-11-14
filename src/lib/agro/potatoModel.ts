/**
 * T2.4 — Modelo de papa con la API del design.md.
 * Delega en los módulos probados de src/lib/agro (calendar, sowing, crop, gdd).
 *
 * Calibración con datos reales NASA POWER (Cusco): base 2 °C, no 7 °C.
 * Con base 7 °C la papa tardaría ~1000 días en Cusco. Ver .kiro/steering/nasa-data-api.md
 */
import fallback from '../../data/fallback-cusco.json';
import { fromClimatologyMonths, fromDailyDataPoints } from '../../services/nasaPower';
import { parseClimatology } from '../../services/nasa/power';
import type { Climatology } from '../../services/nasa/types';
import type {
  ClimatologyMonth,
  CropProgress,
  DailyDataPoint,
  GrowingDegreeDaysTarget,
  IrrigationStatus,
  MonthAssessment,
  PotatoVariety,
  TrafficLight,
} from '../../types';
import { buildCalendar, INCA_MONTHS as INCA_MONTH_DETAILS, type TrafficLight as Light } from './calendar';
import { getCropStatus, weeklySeries, type CropStatus, type WeekPoint } from './crop';
import { isoDate, projectDateForGdd, startOfDayUtc } from './gdd';
import { recommendSowing } from './sowing';
import { GDD_BASE, GDD_CAP, VARIETIES, type VarietyId } from './varieties';

export const BASE_TEMP = GDD_BASE;

export const VARIETY_ID: Record<PotatoVariety, VarietyId> = {
  Yungay: 'yungay',
  'Canchán': 'canchan',
  Huayro: 'huayro',
};

export const POTATO_VARIETIES: PotatoVariety[] = ['Canchán', 'Yungay', 'Huayro'];

export const GDD_TARGETS: GrowingDegreeDaysTarget[] = POTATO_VARIETIES.map((v) => ({
  variety: v,
  targetGDD: VARIETIES[VARIETY_ID[v]].gddToHarvest,
  baseTemp: GDD_BASE,
}));

/** Descripción corta de cada variedad para el selector. */
export const VARIETY_INFO: Record<PotatoVariety, { description: string; typicalDays: [number, number] }> = {
  Yungay: { description: VARIETIES.yungay.description, typicalDays: VARIETIES.yungay.typicalDays },
  'Canchán': { description: VARIETIES.canchan.description, typicalDays: VARIETIES.canchan.typicalDays },
  Huayro: { description: VARIETIES.huayro.description, typicalDays: VARIETIES.huayro.typicalDays },
};

/** Meses agrícolas incas (Guamán Poma), enero a diciembre. */
export const INCA_MONTHS: string[] = INCA_MONTH_DETAILS.map((m) => m.quechua);
export { INCA_MONTH_DETAILS };

/** Climatología de Cusco incluida en la app (si no se pasa otra). */
export const CUSCO_CLIMATOLOGY: Climatology = parseClimatology(fallback, 'fallback');

const LIGHT: Record<Light, TrafficLight> = { good: 'green', caution: 'yellow', risk: 'red' };

function toClim(climatology?: ClimatologyMonth[] | null): Climatology {
  return climatology && climatology.length === 12 ? fromClimatologyMonths(climatology) : CUSCO_CLIMATOLOGY;
}

const parseDate = (s: string) => new Date(`${s.slice(0, 10)}T00:00:00Z`);

// ---------- Calendario ----------

/**
 * Semáforo de los 12 meses (índice 0 = enero, `month` 1-12).
 * `trafficLight`: clima del mes para la papa en el campo.
 * `isGoodForSowing`: sembrar ese mes da buena cosecha (simula todo el ciclo).
 */
export function assessAllMonths(climatology: ClimatologyMonth[], variety: PotatoVariety = 'Yungay'): MonthAssessment[] {
  const clim = toClim(climatology);
  return buildCalendar(clim, VARIETY_ID[variety]).map((c) => {
    const tags = [c.isBestSowing ? '🌱 Mejor mes para sembrar' : '', c.isHarvest ? '🥔 Mes de cosecha' : '']
      .filter(Boolean)
      .join(' · ');
    return {
      month: c.month + 1,
      monthName: c.spanish,
      incaMonthName: c.quechua,
      T2M: c.climate.t2m,
      T2M_MIN: c.climate.t2mMin,
      PRECTOTCORR: c.climate.precipMmMonth,
      GWETROOT: c.climate.gwetRoot,
      ALLSKY_SFC_SW_DWN: Math.round((c.climate.solar / 3.6) * 100) / 100,
      isGoodForSowing: c.sowing.score >= 60,
      frostRisk: c.condition.frostRisk,
      trafficLight: LIGHT[c.condition.status],
      recommendation: `${tags ? tags + '. ' : ''}Siembra: ${c.sowing.label} (${c.sowing.score}/100). ${c.condition.reasons.join('. ')}.`,
    };
  });
}

/** Detalle completo del calendario (incluye texto ancestral de cada mes). */
export function getCalendarDetails(climatology: ClimatologyMonth[], variety: PotatoVariety = 'Yungay') {
  return buildCalendar(toClim(climatology), VARIETY_ID[variety]);
}

/**
 * Criterio rápido: lluvia ≥ 60 mm/mes, sin helada (T2M_MIN ≥ 0 °C) y suelo húmedo o humedeciéndose.
 * (T2M_MIN de la climatología POWER es la mínima más fría del mes, por eso el umbral es 0 °C y no 2 °C.)
 */
export function isGoodForSowing(month: MonthAssessment, prevMonth?: MonthAssessment): boolean {
  const soilOk = month.GWETROOT >= 0.5 || !prevMonth || month.GWETROOT > prevMonth.GWETROOT;
  return month.PRECTOTCORR >= 60 && month.T2M_MIN >= 0 && soilOk;
}

export function hasFrostRisk(T2M_MIN: number): boolean {
  return T2M_MIN < 0;
}

// ---------- Grados-día y cosecha ----------

export function calculateGDD(T2M_MAX: number, T2M_MIN: number, baseTemp: number = GDD_BASE): number {
  return Math.max(0, Math.min((T2M_MAX + T2M_MIN) / 2, GDD_CAP) - baseTemp);
}

/**
 * Progreso del cultivo con datos diarios reales (los días sin dato se completan con climatología).
 * Pasar la climatología de la ubicación para proyectar la cosecha; si no, usa la de Cusco.
 */
export function calculateCropProgress(
  plantingDate: string,
  variety: PotatoVariety,
  dailyData: DailyDataPoint[],
  climatology?: ClimatologyMonth[] | null,
  today: Date = new Date(),
): CropProgress {
  const s = getCropInsights(plantingDate, variety, dailyData, climatology, today);
  return {
    plantingDate: plantingDate.slice(0, 10),
    variety,
    targetGDD: s.gddTarget,
    accumulatedGDD: s.gddAccumulated,
    remainingGDD: Math.max(0, s.gddTarget - s.gddAccumulated),
    progressPercent: Math.round(s.progress * 100),
    estimatedHarvestDate: s.harvestDate ? isoDate(s.harvestDate) : '',
    daysUntilHarvest: s.daysToHarvest ?? -1,
    status: s.progress >= 1 ? 'ready' : s.daysSinceSowing === 0 || s.stage.id === 'sprouting' ? 'sowing' : 'growing',
  };
}

/**
 * Todo lo que la pantalla "Mi cultivo" necesita: etapa (nombre, quechua, consejo),
 * alertas de helada y riego, días a cosecha, progreso.
 */
export function getCropInsights(
  plantingDate: string,
  variety: PotatoVariety,
  dailyData: DailyDataPoint[] = [],
  climatology?: ClimatologyMonth[] | null,
  today: Date = new Date(),
): CropStatus {
  return getCropStatus({
    sowingDate: parseDate(plantingDate),
    variety: VARIETY_ID[variety],
    climatology: toClim(climatology),
    daily: fromDailyDataPoints(dailyData),
    today,
  });
}

/**
 * Fecha estimada de cosecha (YYYY-MM-DD) proyectando con la climatología desde hoy
 * (o desde la siembra si aún no se sembró). Devuelve '' si el clima es demasiado frío.
 */
export function projectHarvestDate(
  plantingDate: string,
  variety: PotatoVariety,
  accumulatedGDD: number,
  climatology: ClimatologyMonth[],
  today: Date = new Date(),
): string {
  const sow = parseDate(plantingDate);
  const now = startOfDayUtc(today);
  const from = now > sow ? now : sow;
  const d = projectDateForGdd(from, accumulatedGDD, VARIETIES[VARIETY_ID[variety]].gddToHarvest, toClim(climatology));
  return d ? isoDate(d) : '';
}

/**
 * ¿Hay que regar? GWETROOT 0-1, PRECTOTCORR en mm/mes, T2M en °C.
 */
export function assessIrrigationNeeds(GWETROOT: number, PRECTOTCORR: number, T2M: number): IrrigationStatus {
  const soilMoisture = Math.round(GWETROOT * 100);
  // Con más calor la planta transpira más y necesita el suelo más húmedo.
  const dryLimit = T2M > 15 ? 0.55 : 0.5;
  if (GWETROOT < dryLimit && PRECTOTCORR < 60) {
    return {
      needsWater: true,
      soilMoisture,
      recommendation: `Suelo seco (${soilMoisture}%) y poca lluvia (${Math.round(PRECTOTCORR)} mm). Riega temprano en la mañana o al atardecer.`,
    };
  }
  if (GWETROOT > 0.8 || PRECTOTCORR > 150) {
    return {
      needsWater: false,
      soilMoisture,
      recommendation: 'Mucha humedad. No riegues; abre surcos de drenaje y vigila la rancha.',
    };
  }
  return {
    needsWater: false,
    soilMoisture,
    recommendation: `Humedad adecuada (${soilMoisture}%). Las lluvias alcanzan; no hace falta regar.`,
  };
}

/** Número de mes (1-12) a partir del nombre inca (o en español). 0 si no se reconoce. */
export function getMonthNumberFromIncaName(incaMonthName: string): number {
  const n = incaMonthName.trim().toLowerCase();
  const i = INCA_MONTH_DETAILS.findIndex((m) => m.quechua.toLowerCase() === n || m.spanish.toLowerCase() === n);
  return i + 1;
}

// ---------- Extras para la UI ----------

export interface SowingAdvice {
  /** 1-12 */
  bestMonth: number;
  bestMonthName: string;
  incaMonthName: string;
  sowDate: string;
  harvestDate: string;
  cycleDays: number | null;
  score: number;
  label: string;
  reasons: string[];
  /** Días hasta el mejor mes (0 = ¡siembra ya!) */
  daysUntil: number;
  sowNow: boolean;
  /** Meses buenos consecutivos (1-12) */
  windowMonths: number[];
}

/** "¿Cuándo siembro?" para la tarjeta principal. */
export function getSowingAdvice(climatology: ClimatologyMonth[] | null, variety: PotatoVariety, today: Date = new Date()): SowingAdvice {
  const r = recommendSowing(toClim(climatology), VARIETY_ID[variety], today);
  const inca = INCA_MONTH_DETAILS[r.best.month];
  return {
    bestMonth: r.best.month + 1,
    bestMonthName: inca.spanish,
    incaMonthName: inca.quechua,
    sowDate: isoDate(r.best.sowDate),
    harvestDate: r.best.harvestDate ? isoDate(r.best.harvestDate) : '',
    cycleDays: r.best.cycleDays,
    score: r.best.score,
    label: r.best.label,
    reasons: r.best.reasons,
    daysUntil: r.daysUntil,
    sowNow: r.daysUntil === 0,
    windowMonths: r.window.map((w) => w.month + 1),
  };
}

/** Datos semanales para Recharts: 4 semanas reales + 2 esperadas (`kind`). */
export function getWeeklyChartData(
  dailyData: DailyDataPoint[],
  climatology?: ClimatologyMonth[] | null,
  today: Date = new Date(),
): WeekPoint[] {
  return weeklySeries(toClim(climatology), fromDailyDataPoints(dailyData), today);
}
