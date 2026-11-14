/**
 * Qullqa en Marte: simulación de papa en un invernadero marciano.
 * Usa el mismo modelo de grados-día que en la Tierra, ajustado por luz y agua.
 *
 * Datos de Marte: NASA Mars Fact Sheet (nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html).
 */
import { GDD_BASE, GDD_CAP, getVariety, type VarietyId } from '../agro/varieties';

export const MARS = {
  /** Duración de un sol (día marciano) en días terrestres: 24 h 39 min 35 s */
  solInEarthDays: 1.0275,
  /** Luz solar en Marte comparada con la Tierra (590 vs 1361 W/m²) */
  sunlightVsEarth: 0.43,
  /** Temperatura media de la superficie (°C) */
  avgSurfaceTempC: -63,
  /** Presión atmosférica comparada con la Tierra */
  pressureVsEarth: 0.006,
  /** Gravedad comparada con la Tierra */
  gravityVsEarth: 0.38,
  /** Duración del año marciano en días terrestres */
  yearInEarthDays: 687,
} as const;

export interface MarsInput {
  /** Temperatura dentro del invernadero (°C) */
  tempC: number;
  /** Luz que reciben las plantas, en % de la luz del Sol en la Tierra (Marte natural = 43) */
  lightPct: number;
  /** Agua disponible en el suelo (% del óptimo; 100 = suelo empapado) */
  waterPct: number;
  variety: VarietyId;
}

export interface MarsResult {
  viable: boolean;
  /** Soles hasta la cosecha (null si no es viable) */
  sols: number | null;
  /** Lo mismo en días terrestres */
  earthDays: number | null;
  gddPerSol: number;
  lightFactor: number;
  waterFactor: number;
  tempFactor: number;
  /** Mensajes para explicar el resultado */
  notes: string[];
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Con poca luz la planta hace menos fotosíntesis; se satura cerca de la luz terrestre. */
export function lightFactor(lightPct: number): number {
  if (lightPct < 15) return 0;
  return clamp(Math.pow(lightPct / 100, 0.6), 0, 1);
}

/** Óptimo entre 60 % y 90 %; muy seco detiene el crecimiento; encharcado pudre el tubérculo. */
export function waterFactor(waterPct: number): number {
  if (waterPct < 20) return 0;
  if (waterPct < 60) return 0.4 + (0.6 * (waterPct - 20)) / 40;
  if (waterPct <= 90) return 1;
  return clamp(1 - (waterPct - 90) / 40, 0.6, 1);
}

/** Sobre ~25 °C la papa deja de formar tubérculos aunque crezca. */
export function tempFactor(tempC: number): number {
  if (tempC <= GDD_BASE || tempC >= 32) return 0;
  if (tempC <= 25) return 1;
  return clamp(1 - (tempC - 25) / 7, 0, 1);
}

export function simulateMars(input: MarsInput): MarsResult {
  const v = getVariety(input.variety);
  const lf = lightFactor(input.lightPct);
  const wf = waterFactor(input.waterPct);
  const tf = tempFactor(input.tempC);
  const baseGdd = Math.max(0, Math.min(input.tempC, GDD_CAP) - GDD_BASE);
  // Un sol es un poco más largo que un día: más horas de crecimiento.
  const gddPerSol = baseGdd * MARS.solInEarthDays * lf * wf * tf;
  const notes: string[] = [];

  if (input.tempC <= GDD_BASE) notes.push('Demasiado frío: la papa no crece bajo 2 °C. Calienta el invernadero.');
  else if (input.tempC >= 25) notes.push('Mucho calor: la papa deja de formar tubérculos sobre 25 °C.');
  else if (input.tempC >= 14 && input.tempC <= 20) notes.push('Temperatura ideal, como un buen día en los Andes.');

  if (input.lightPct < 15) notes.push('Muy poca luz: las plantas no pueden hacer fotosíntesis.');
  else if (input.lightPct <= 50) notes.push('Luz natural de Marte (43 %): agrega luces LED para crecer más rápido.');

  if (input.waterPct < 20) notes.push('Sin agua no hay papa. En Marte el agua se obtiene derritiendo hielo del subsuelo.');
  else if (input.waterPct > 90) notes.push('Demasiada agua: el tubérculo se puede pudrir.');

  const viable = gddPerSol > 0.5;
  const sols = viable ? Math.ceil(v.gddToHarvest / gddPerSol) : null;
  if (viable && sols !== null && sols > 400) notes.push('Crecería, pero muy lento. Mejora la luz o la temperatura.');

  return {
    viable,
    sols,
    earthDays: sols !== null ? Math.round(sols * MARS.solInEarthDays) : null,
    gddPerSol: Math.round(gddPerSol * 100) / 100,
    lightFactor: Math.round(lf * 100) / 100,
    waterFactor: Math.round(wf * 100) / 100,
    tempFactor: Math.round(tf * 100) / 100,
    notes,
  };
}

export interface MarsPreset {
  id: string;
  name: string;
  description: string;
  input: Omit<MarsInput, 'variety'>;
}

export const MARS_PRESETS: MarsPreset[] = [
  {
    id: 'outside',
    name: 'Al aire libre',
    description: 'Superficie de Marte: −63 °C y sin agua líquida. Imposible.',
    input: { tempC: MARS.avgSurfaceTempC, lightPct: 43, waterPct: 0 },
  },
  {
    id: 'greenhouse',
    name: 'Invernadero',
    description: 'Domo presurizado y calentado, con la luz natural de Marte.',
    input: { tempC: 16, lightPct: 43, waterPct: 75 },
  },
  {
    id: 'greenhouse-led',
    name: 'Invernadero + LED',
    description: 'Domo con luces LED que completan la luz que falta.',
    input: { tempC: 16, lightPct: 100, waterPct: 75 },
  },
];

export const MARS_FACTS: string[] = [
  'En 2016 el Centro Internacional de la Papa (Lima) y la NASA cultivaron papa en condiciones simuladas de Marte. ¡Brotó!',
  'Un día en Marte (sol) dura 24 horas y 39 minutos.',
  'Marte recibe solo el 43 % de la luz solar que llega a la Tierra.',
  'El suelo marciano tiene percloratos tóxicos: hay que lavarlo antes de sembrar.',
  'Los Andes son uno de los mejores laboratorios de la Tierra para preparar la agricultura en Marte: frío, mucha radiación y aire delgado.',
];
