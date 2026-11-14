/**
 * Grados-día de crecimiento (GDD) y proyección de la fecha de cosecha.
 */
import type { Climatology, DailyRecord } from '../../services/nasa/types';
import { GDD_BASE, GDD_CAP } from './varieties';

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** GDD de un día a partir de la temperatura media (°C). */
export function gddFromTemp(tMean: number): number {
  return Math.max(0, Math.min(tMean, GDD_CAP) - GDD_BASE);
}

/** Temperatura media de un registro diario, o null si no hay dato. */
export function dailyMean(d: DailyRecord): number | null {
  if (d.t2m !== null) return d.t2m;
  if (d.t2mMin !== null && d.t2mMax !== null) return (d.t2mMin + d.t2mMax) / 2;
  return null;
}

/** GDD esperado por día en un mes, según la climatología NASA. */
export function climatologyGddPerDay(clim: Climatology, month: number): number {
  return gddFromTemp(clim.months[month].t2m);
}

/** 'YYYY-MM-DD' (UTC) */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Medianoche UTC del día dado (evita problemas de zona horaria al contar días). */
export function startOfDayUtc(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_PER_DAY);
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDayUtc(b).getTime() - startOfDayUtc(a).getTime()) / MS_PER_DAY);
}

export interface GddAccumulation {
  gdd: number;
  /** Días con dato real de NASA */
  observedDays: number;
  /** Días sin dato real, completados con la climatología */
  filledDays: number;
}

/**
 * Suma GDD desde `from` (incluido) hasta `to` (excluido).
 * Usa el dato diario real si existe; si falta (retraso de POWER), usa la climatología del mes.
 */
export function accumulateGdd(from: Date, to: Date, clim: Climatology, daily: DailyRecord[] = []): GddAccumulation {
  const byDate = new Map(daily.map((d) => [d.date, d]));
  let gdd = 0;
  let observedDays = 0;
  let filledDays = 0;
  for (let day = startOfDayUtc(from); day < startOfDayUtc(to); day = addDays(day, 1)) {
    const rec = byDate.get(isoDate(day));
    const mean = rec ? dailyMean(rec) : null;
    if (mean !== null) {
      gdd += gddFromTemp(mean);
      observedDays++;
    } else {
      gdd += climatologyGddPerDay(clim, day.getUTCMonth());
      filledDays++;
    }
  }
  return { gdd, observedDays, filledDays };
}

/** Límite de seguridad: si el clima es demasiado frío, la papa no llega a cosecha. */
export const MAX_CYCLE_DAYS = 400;

/**
 * Proyecta el día en que se alcanzará `targetGdd`, partiendo de `from` con `startGdd` ya acumulados,
 * usando la climatología NASA día a día. Devuelve null si no se alcanza en MAX_CYCLE_DAYS.
 */
export function projectDateForGdd(from: Date, startGdd: number, targetGdd: number, clim: Climatology): Date | null {
  let gdd = startGdd;
  let day = startOfDayUtc(from);
  for (let i = 0; i <= MAX_CYCLE_DAYS; i++) {
    if (gdd >= targetGdd) return day;
    gdd += climatologyGddPerDay(clim, day.getUTCMonth());
    day = addDays(day, 1);
  }
  return null;
}
