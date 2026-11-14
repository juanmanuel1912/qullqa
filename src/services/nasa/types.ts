/** Origen de los datos mostrados al usuario. */
export type DataSource = 'nasa' | 'cache' | 'fallback';

/** Clima promedio de un mes (climatología NASA POWER 2001-2025). */
export interface MonthlyClimate {
  /** 0 = enero ... 11 = diciembre */
  month: number;
  /** Temperatura media a 2 m (°C) */
  t2m: number;
  /** Temperatura mínima (°C). En climatología POWER es la mínima más fría del mes. */
  t2mMin: number;
  /** Temperatura máxima (°C) */
  t2mMax: number;
  /** Lluvia promedio (mm/día) */
  precipMmDay: number;
  /** Lluvia total del mes (mm) */
  precipMmMonth: number;
  /** Humedad del suelo en la zona de raíces (0-1) */
  gwetRoot: number;
  /** Radiación solar (MJ/m²/día) */
  solar: number;
}

export interface Climatology {
  lat: number;
  lon: number;
  /** Altitud del punto de la grilla NASA (m) */
  elevation: number | null;
  months: MonthlyClimate[];
  source: DataSource;
  fetchedAt: string;
}

/** Un día de datos NASA POWER. `null` = dato aún no disponible (POWER tiene ~2-3 días de retraso). */
export interface DailyRecord {
  /** YYYY-MM-DD */
  date: string;
  t2m: number | null;
  t2mMin: number | null;
  t2mMax: number | null;
  precip: number | null;
  gwetRoot: number | null;
  /** Radiación solar (MJ/m²/día) */
  solar: number | null;
}

export interface DailySeries {
  lat: number;
  lon: number;
  days: DailyRecord[];
  source: DataSource;
  fetchedAt: string;
}

export interface ApodData {
  title: string;
  date: string;
  explanation: string;
  /** URL a mostrar como imagen (para videos, la miniatura si existe) */
  imageUrl: string;
  mediaType: 'image' | 'video' | 'other';
  copyright?: string;
  source: DataSource;
}

export interface GeoPoint {
  lat: number;
  lon: number;
}
