/**
 * Formato de fechas. Las fechas del modelo son medianoche UTC:
 * se formatean en UTC para que "1 de noviembre" no se muestre como 31 de octubre en Perú (UTC−5).
 */

export const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
export const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const asDate = (d: Date | string) => (typeof d === 'string' ? new Date(`${d.slice(0, 10)}T00:00:00Z`) : d);

/** '1 de noviembre de 2026' */
export function fmtLong(d: Date | string): string {
  return asDate(d).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** '1 nov' */
export function fmtShort(d: Date | string): string {
  const x = asDate(d);
  return `${x.getUTCDate()} ${MONTHS_SHORT[x.getUTCMonth()].toLowerCase()}`;
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Hoy como 'YYYY-MM-DD' en hora local del usuario. */
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Hoy a medianoche UTC (misma fecha calendario que ve el usuario). */
export function todayUtc(): Date {
  return new Date(`${todayIso()}T00:00:00Z`);
}

export function addDaysIso(iso: string, n: number): string {
  const d = asDate(iso);
  return new Date(d.getTime() + n * 86_400_000).toISOString().slice(0, 10);
}
