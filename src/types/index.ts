/**
 * Tipos globales de Qullqa
 * Interfaces completas definidas en design.md
 */

// ============ SERVICIOS NASA ============

// Climatología de 12 meses (NASA POWER)
export interface ClimatologyMonth {
  month: number; // 1-12
  T2M: number; // Temperatura media (°C)
  T2M_MIN: number; // Temperatura mínima (°C)
  T2M_MAX: number; // Temperatura máxima (°C)
  PRECTOTCORR: number; // Precipitación (mm/mes)
  ALLSKY_SFC_SW_DWN: number; // Radiación solar (kWh/m²/día)
  GWETROOT: number; // Humedad raíz (0-1)
}

export interface ClimatologyResponse {
  lat: number;
  lon: number;
  climatic_data: ClimatologyMonth[];
  cacheTimestamp?: number;
}

// Datos diarios (NASA POWER)
export interface DailyDataPoint {
  date: string; // YYYY-MM-DD
  T2M: number;
  T2M_MIN: number;
  T2M_MAX: number;
  PRECTOTCORR: number;
  ALLSKY_SFC_SW_DWN: number;
  GWETROOT: number;
}

export interface DailyDataResponse {
  lat: number;
  lon: number;
  data: DailyDataPoint[];
  cacheTimestamp?: number;
}

// APOD (NASA APOD)
export interface APODData {
  date: string;
  url: string;
  title: string;
  copyright?: string;
  cacheTimestamp?: number;
}

// GIBS Layer
export interface GIBSLayer {
  name: string;
  tileUrl: string;
  attribution: string;
}

// ============ LÓGICA AGRONÓMICA ============

// Variedad de papa
export type PotatoVariety = 'Yungay' | 'Canchán' | 'Huayro'

// Semáforo de riesgo
export type TrafficLight = 'green' | 'yellow' | 'red'

// Detalles de un mes
export interface MonthAssessment {
  month: number;
  monthName: string;
  incaMonthName: string;
  T2M: number;
  T2M_MIN: number;
  PRECTOTCORR: number;
  GWETROOT: number;
  ALLSKY_SFC_SW_DWN: number;
  isGoodForSowing: boolean;
  frostRisk: boolean;
  trafficLight: TrafficLight;
  recommendation: string;
}

// Metas de grados-día
export interface GrowingDegreeDaysTarget {
  variety: PotatoVariety;
  targetGDD: number;
  baseTemp: number;
}

// Progreso de cultivo
export interface CropProgress {
  plantingDate: string;
  variety: PotatoVariety;
  targetGDD: number;
  accumulatedGDD: number;
  remainingGDD: number;
  progressPercent: number;
  estimatedHarvestDate: string;
  daysUntilHarvest: number;
  status: 'sowing' | 'growing' | 'ready';
}

// Estado de riego
export interface IrrigationStatus {
  needsWater: boolean;
  soilMoisture: number; // 0-100
  recommendation: string;
}

// Proyección de cosecha
export interface HarvestProjection {
  date: string;
  projectedGDD: number;
  likelihood: number;
}

// ============ SIMULADOR MARTE ============

export interface MarsEnvironment {
  temperature: number; // °C
  light: number; // % (0-100)
  water: number; // % (0-100)
}

export interface MarsSimulationResult {
  environment: MarsEnvironment;
  gddPerDay: number;
  daysToHarvest: number;
  viability: 'not_viable' | 'low' | 'moderate' | 'high';
  comparisonWithEarth: {
    accelerationFactor: number;
    message: string;
  };
}

// ============ CONTEXTO GLOBAL ============

export interface QullqaContextType {
  // Ubicación
  location: { lat: number; lon: number } | null;
  setLocation: (lat: number, lon: number) => void;

  // Variedad
  variety: PotatoVariety | null;
  setVariety: (v: PotatoVariety) => void;

  // Datos NASA
  climatology: ClimatologyMonth[] | null;
  dailyData: DailyDataPoint[] | null;
  apod: APODData | null;

  // Estado
  loading: boolean;
  error: string | null;

  // Funciones
  fetchClimateData: () => Promise<void>;
  refetch: () => Promise<void>;
}

// ============ ERRORES ============

export interface CacheError {
  message: string;
  recovered: boolean;
}
