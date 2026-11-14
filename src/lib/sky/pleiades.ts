/**
 * ¿Cuándo se ven las Qullqa (Pléyades) desde mi chacra?
 * Astronomía de baja precisión (±1°), suficiente para observar a simple vista.
 */

/** Alcíone, la estrella más brillante de las Pléyades (J2000). */
export const PLEIADES = { raDeg: 56.871, decDeg: 24.105 } as const;

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const norm360 = (x: number) => ((x % 360) + 360) % 360;

export function julianDay(date: Date): number {
  return date.getTime() / 86_400_000 + 2440587.5;
}

/** Tiempo sidéreo local (grados). */
export function localSiderealDeg(date: Date, lonDeg: number): number {
  const d = julianDay(date) - 2451545.0;
  return norm360(280.46061837 + 360.98564736629 * d + lonDeg);
}

/** Posición aproximada del Sol (RA/Dec en grados). */
export function sunRaDec(date: Date): { raDeg: number; decDeg: number } {
  const n = julianDay(date) - 2451545.0;
  const L = norm360(280.46 + 0.9856474 * n);
  const g = rad(norm360(357.528 + 0.9856003 * n));
  const lambda = rad(L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));
  const eps = rad(23.439 - 0.0000004 * n);
  return {
    raDeg: norm360(deg(Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)))),
    decDeg: deg(Math.asin(Math.sin(eps) * Math.sin(lambda))),
  };
}

export interface Horizontal {
  /** Altura sobre el horizonte (grados) */
  alt: number;
  /** Azimut desde el norte hacia el este (grados) */
  az: number;
}

export function altAz(raDeg: number, decDeg: number, date: Date, latDeg: number, lonDeg: number): Horizontal {
  const ha = rad(localSiderealDeg(date, lonDeg) - raDeg);
  const lat = rad(latDeg);
  const dec = rad(decDeg);
  const sinAlt = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(ha);
  const alt = Math.asin(sinAlt);
  const az = Math.atan2(-Math.sin(ha) * Math.cos(dec), Math.cos(lat) * Math.sin(dec) - Math.sin(lat) * Math.cos(dec) * Math.cos(ha));
  return { alt: deg(alt), az: norm360(deg(az)) };
}

export const pleiadesAt = (date: Date, lat: number, lon: number) => altAz(PLEIADES.raDeg, PLEIADES.decDeg, date, lat, lon);

export function sunAt(date: Date, lat: number, lon: number): Horizontal {
  const s = sunRaDec(date);
  return altAz(s.raDeg, s.decDeg, date, lat, lon);
}

const DIRECTIONS = ['norte', 'noreste', 'este', 'sureste', 'sur', 'suroeste', 'oeste', 'noroeste'];
export function compass(azDeg: number): string {
  return DIRECTIONS[Math.round(norm360(azDeg) / 45) % 8];
}

export interface NightWindow {
  /** Primer momento visible (cielo oscuro y Qullqa sobre 10°) */
  start: Date;
  end: Date;
  /** Momento de mayor altura dentro de la ventana */
  best: Date;
  bestAlt: number;
  bestDirection: string;
  /** Dirección por donde aparecen al inicio */
  startDirection: string;
}

export const MIN_ALT = 10;
/** Crepúsculo náutico: el cielo ya está oscuro */
export const DARK_SUN_ALT = -12;

/**
 * Ventana de observación de la noche que empieza en `from` (se revisan 24 h en pasos de 10 min).
 * Devuelve null si esa noche no se ven (están detrás del Sol, abril-mayo).
 */
export function nightWindow(from: Date, lat: number, lon: number, stepMin = 10): NightWindow | null {
  let start: Date | null = null;
  let end: Date | null = null;
  let best: Date | null = null;
  let bestAlt = -90;
  let startAz = 0;
  let bestAz = 0;
  const steps = Math.round((24 * 60) / stepMin);
  for (let i = 0; i <= steps; i++) {
    const t = new Date(from.getTime() + i * stepMin * 60_000);
    const p = pleiadesAt(t, lat, lon);
    const visible = p.alt >= MIN_ALT && sunAt(t, lat, lon).alt <= DARK_SUN_ALT;
    if (visible) {
      if (!start) {
        start = t;
        startAz = p.az;
      }
      end = t;
      if (p.alt > bestAlt) {
        bestAlt = p.alt;
        best = t;
        bestAz = p.az;
      }
    } else if (start) {
      break; // primera ventana continua
    }
  }
  if (!start || !end || !best) return null;
  return { start, end, best, bestAlt, bestDirection: compass(bestAz), startDirection: compass(startAz) };
}

/**
 * Momento "inca": amanecer del 20 de junio (Inti Raymi), ~5:15 hora solar local,
 * cuando las Qullqa reaparecen por el noreste antes de que salga el Sol.
 */
export function incaDawn(year: number, lonDeg: number): Date {
  const utcHours = 5.25 - lonDeg / 15;
  return new Date(Date.UTC(year, 5, 20) + utcHours * 3_600_000);
}

/** Planetario Stellarium Web apuntando a las Pléyades desde la chacra. */
export function stellariumUrl(lat: number, lon: number, elevation: number | null, date?: Date): string {
  const q = new URLSearchParams({
    fov: '40',
    lat: lat.toFixed(4),
    lng: lon.toFixed(4),
    elev: String(Math.round(elevation ?? 3400)),
  });
  if (date) q.set('date', date.toISOString().slice(0, 19) + 'Z');
  return `https://stellarium-web.org/skysource/Alcyone?${q}`;
}
