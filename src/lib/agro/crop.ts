/**
 * Estado del cultivo: progreso, etapa, días a cosecha, alertas y recomendaciones.
 */
import type { Climatology, DailyRecord } from '../../services/nasa/types';
import { accumulateGdd, addDays, daysBetween, isoDate, projectDateForGdd, startOfDayUtc } from './gdd';
import { getVariety, type VarietyId } from './varieties';

export type StageId = 'sprouting' | 'growth' | 'tuberization' | 'bulking' | 'maturation' | 'harvest';

export interface Stage {
  id: StageId;
  name: string;
  quechua: string;
  /** Fracción de GDD en que empieza la etapa */
  from: number;
  tip: string;
}

export const STAGES: Stage[] = [
  { id: 'sprouting', name: 'Brotación', quechua: 'Ch’iqchiy', from: 0, tip: 'La semilla despierta. Mantén el suelo húmedo, no encharcado.' },
  { id: 'growth', name: 'Crecimiento', quechua: 'Wiñay', from: 0.15, tip: 'Hora del primer aporque: junta tierra al pie de la planta.' },
  { id: 'tuberization', name: 'Floración y tuberización', quechua: 'T’ikay', from: 0.4, tip: 'Nacen las papitas. Es cuando más agua necesita.' },
  { id: 'bulking', name: 'Llenado de tubérculos', quechua: 'Puquy', from: 0.55, tip: 'Las papas engordan. Segundo aporque y vigila la rancha.' },
  { id: 'maturation', name: 'Maduración', quechua: 'Puquy tukuy', from: 0.9, tip: 'Las hojas amarillean. Reduce el riego para que la piel endurezca.' },
  { id: 'harvest', name: '¡Cosecha!', quechua: 'Allay', from: 1, tip: '¡Tu papa está lista! Cosecha en días secos y guarda en lugar fresco y oscuro.' },
];

export function stageFor(progress: number): Stage {
  let current = STAGES[0];
  for (const s of STAGES) if (progress >= s.from) current = s;
  return current;
}

export interface Alert {
  level: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
  /** Traducible: claves i18n alert.<code>.title / alert.<code>.msg */
  code: 'frostObserved' | 'frostMonth' | 'needWater' | 'tooMuchRain' | 'waterOk';
  value?: number;
}

export interface CropStatus {
  variety: VarietyId;
  sowingDate: Date;
  daysSinceSowing: number;
  gddAccumulated: number;
  gddTarget: number;
  /** 0-1 */
  progress: number;
  stage: Stage;
  harvestDate: Date | null;
  daysToHarvest: number | null;
  /** Días con dato diario real de NASA (el resto se completa con climatología) */
  observedDays: number;
  alerts: Alert[];
}

export interface CropInput {
  sowingDate: Date;
  variety: VarietyId;
  climatology: Climatology;
  /** Datos diarios NASA POWER desde la siembra (opcional, mejora la precisión) */
  daily?: DailyRecord[];
  today?: Date;
}

export function getCropStatus({ sowingDate, variety, climatology, daily = [], today = new Date() }: CropInput): CropStatus {
  const v = getVariety(variety);
  const sow = startOfDayUtc(sowingDate);
  const now = startOfDayUtc(today);
  const started = now > sow;
  const acc = started ? accumulateGdd(sow, now, climatology, daily) : { gdd: 0, observedDays: 0, filledDays: 0 };
  const progress = Math.min(1, acc.gdd / v.gddToHarvest);
  const harvestDate = projectDateForGdd(started ? now : sow, acc.gdd, v.gddToHarvest, climatology);

  return {
    variety,
    sowingDate: sow,
    daysSinceSowing: Math.max(0, daysBetween(sow, now)),
    gddAccumulated: Math.round(acc.gdd),
    gddTarget: v.gddToHarvest,
    progress,
    stage: stageFor(progress),
    harvestDate,
    daysToHarvest: harvestDate ? Math.max(0, daysBetween(now, harvestDate)) : null,
    observedDays: acc.observedDays,
    alerts: buildAlerts(progress, climatology, daily, now),
  };
}

/** Alertas de helada y agua basadas en los últimos días reales y el clima esperado. */
export function buildAlerts(progress: number, clim: Climatology, daily: DailyRecord[], today: Date): Alert[] {
  const alerts: Alert[] = [];
  const recent = lastDays(daily, today, 7);
  const recentFrost = recent.filter((d) => d.t2mMin !== null && d.t2mMin < 0);
  const monthClim = clim.months[today.getUTCMonth()];

  if (recentFrost.length > 0) {
    const coldest = Math.min(...recentFrost.map((d) => d.t2mMin as number));
    alerts.push({
      level: 'danger',
      code: 'frostObserved',
      value: coldest,
      title: 'Hubo helada esta semana',
      message: `NASA registró ${coldest.toFixed(1)} °C. Riega al atardecer (el suelo húmedo guarda calor) y revisa las hojas.`,
    });
  } else if (monthClim.t2mMin < 0 && progress < 1) {
    alerts.push({
      level: 'warning',
      code: 'frostMonth',
      value: monthClim.t2mMin,
      title: 'Mes con riesgo de helada',
      message: `En este mes la temperatura puede bajar hasta ${monthClim.t2mMin.toFixed(1)} °C. Vigila las noches despejadas.`,
    });
  }

  const withRain = recent.filter((d) => d.precip !== null);
  if (progress < 0.9 && withRain.length >= 4) {
    const rain7 = withRain.reduce((s, d) => s + (d.precip as number), 0) * (7 / withRain.length);
    const gwet = [...recent].reverse().find((d) => d.gwetRoot !== null)?.gwetRoot ?? monthClim.gwetRoot;
    // La papa necesita ~25-35 mm por semana en pleno crecimiento.
    const need = progress >= 0.4 ? 30 : 20;
    if (rain7 < need * 0.5 && gwet < 0.55) {
      alerts.push({
        level: 'warning',
        code: 'needWater',
        value: Math.round(rain7),
        title: 'Tu chacra necesita agua',
        message: `Llovieron ${Math.round(rain7)} mm esta semana y el suelo está seco. Riega si puedes.`,
      });
    } else if (rain7 > need * 2.5) {
      alerts.push({
        level: 'info',
        code: 'tooMuchRain',
        value: Math.round(rain7),
        title: 'Mucha lluvia',
        message: `Llovieron ${Math.round(rain7)} mm esta semana. Abre surcos de drenaje y vigila la rancha (hongo).`,
      });
    } else {
      alerts.push({ level: 'info', code: 'waterOk', title: 'Agua en buen nivel', message: 'Las lluvias van bien. No hace falta regar.' });
    }
  }
  return alerts;
}

function lastDays(daily: DailyRecord[], today: Date, n: number): DailyRecord[] {
  const from = isoDate(addDays(today, -n));
  const to = isoDate(today);
  return daily.filter((d) => d.date >= from && d.date < to);
}

export interface WeekPoint {
  /** Inicio de la semana, 'YYYY-MM-DD' */
  weekStart: string;
  /** Etiqueta corta para el gráfico, ej. '3 nov' */
  label: string;
  rainMm: number;
  tMean: number;
  tMin: number;
  /** observed = dato real NASA; expected = climatología NASA */
  kind: 'observed' | 'expected';
}

const MONTH_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * Serie semanal para el gráfico: las últimas `pastWeeks` semanas con datos reales
 * y las próximas `futureWeeks` con lo esperado según la climatología.
 */
export function weeklySeries(clim: Climatology, daily: DailyRecord[], today = new Date(), pastWeeks = 4, futureWeeks = 2): WeekPoint[] {
  const byDate = new Map(daily.map((d) => [d.date, d]));
  const start = addDays(startOfDayUtc(today), -7 * pastWeeks);
  const out: WeekPoint[] = [];

  for (let w = 0; w < pastWeeks + futureWeeks; w++) {
    const ws = addDays(start, 7 * w);
    let rain = 0;
    let tSum = 0;
    let tMin = Number.POSITIVE_INFINITY;
    let observed = 0;
    for (let i = 0; i < 7; i++) {
      const day = addDays(ws, i);
      const c = clim.months[day.getUTCMonth()];
      const rec = w < pastWeeks ? byDate.get(isoDate(day)) : undefined;
      const t = rec?.t2m ?? null;
      if (rec && t !== null) observed++;
      rain += rec?.precip ?? c.precipMmDay;
      tSum += t ?? c.t2m;
      tMin = Math.min(tMin, rec?.t2mMin ?? c.t2mMin);
    }
    out.push({
      weekStart: isoDate(ws),
      label: `${ws.getUTCDate()} ${MONTH_SHORT[ws.getUTCMonth()]}`,
      rainMm: Math.round(rain),
      tMean: Math.round((tSum / 7) * 10) / 10,
      tMin: Math.round(tMin * 10) / 10,
      kind: observed >= 4 ? 'observed' : 'expected',
    });
  }
  return out;
}
