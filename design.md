# DESIGN: Qullqa - Arquitectura y Interfaces

## 1. SERVICIOS NASA (src/services/nasa/)

### 1.1 NASA POWER Service
**Archivo**: `src/services/nasaPower.ts`

#### Tipos

```typescript
// Climatología de 12 meses
interface ClimatologyMonth {
  month: number; // 1-12
  T2M: number; // Temperatura media (°C)
  T2M_MIN: number; // Temperatura mínima (°C)
  T2M_MAX: number; // Temperatura máxima (°C)
  PRECTOTCORR: number; // Precipitación (mm/mes)
  ALLSKY_SFC_SW_DWN: number; // Radiación solar (kWh/m²/día)
  GWETROOT: number; // Humedad raíz (0-1)
}

interface ClimatologyResponse {
  lat: number;
  lon: number;
  climatic_data: ClimatologyMonth[]; // Array de 12 meses
  cacheTimestamp?: number; // Timestamp de cuándo se cacheó
}

// Datos diarios
interface DailyDataPoint {
  date: string; // YYYY-MM-DD
  T2M: number;
  T2M_MIN: number;
  T2M_MAX: number;
  PRECTOTCORR: number;
  ALLSKY_SFC_SW_DWN: number;
  GWETROOT: number;
}

interface DailyDataResponse {
  lat: number;
  lon: number;
  data: DailyDataPoint[]; // Array de últimos 30 días
  cacheTimestamp?: number;
}

// Error de caché
interface CacheError {
  message: string;
  recovered: boolean; // true si se devolvió dato respaldo
}
```

#### Funciones

```typescript
/**
 * Obtiene climatología de 12 meses para una ubicación
 * @param lat - Latitud
 * @param lon - Longitud
 * @returns Promesa con datos de 12 meses, con caché y fallback
 */
async function getClimatology(
  lat: number,
  lon: number
): Promise<ClimatologyResponse>

/**
 * Obtiene datos diarios de los últimos 30 días para una ubicación
 * @param lat - Latitud
 * @param lon - Longitud
 * @param startDate - Fecha inicio (YYYY-MM-DD), default: hace 30 días
 * @param endDate - Fecha fin (YYYY-MM-DD), default: hoy
 * @returns Promesa con datos diarios, con caché y fallback
 */
async function getDaily(
  lat: number,
  lon: number,
  startDate?: string,
  endDate?: string
): Promise<DailyDataResponse>

/**
 * Obtiene URL de caché en localStorage o null
 * @param cacheKey - Clave única (ej: "climatology_-13.5_-71.9")
 * @returns Datos cacheados o null
 */
function getCachedData(cacheKey: string): ClimatologyResponse | DailyDataResponse | null

/**
 * Guarda datos en localStorage con try/catch
 * @param cacheKey - Clave única
 * @param data - Datos a guardar
 */
function setCachedData(
  cacheKey: string,
  data: ClimatologyResponse | DailyDataResponse
): void
```

#### Notas
- Endpoint: `https://power.larc.nasa.gov/api/temporal/climatology/point`
- Parámetros: `community=AG`, `T2M,T2M_MIN,T2M_MAX,PRECTOTCORR,ALLSKY_SFC_SW_DWN,GWETROOT`
- Formato: `JSON`
- Caché: localStorage con clave `qullqa_climatology_{lat}_{lon}` y `qullqa_daily_{lat}_{lon}`
- Fallback: `/public/fallback-cusco.json` con climatología y datos de Cusco
- Manejo de errores: try/catch, devolver fallback si falla

---

### 1.2 NASA APOD Service
**Archivo**: `src/services/apod.ts`

#### Tipos

```typescript
interface APODResponse {
  date: string; // YYYY-MM-DD
  url: string; // URL de la imagen
  title: string; // Título
  explanation: string; // Descripción
  media_type: 'image' | 'video';
  copyright?: string; // Autor
}

interface APODData {
  date: string;
  url: string;
  title: string;
  copyright?: string;
  cacheTimestamp?: number;
}
```

#### Funciones

```typescript
/**
 * Obtiene foto APOD del día
 * @returns Promesa con URL, título y atribución
 */
async function getAPOD(): Promise<APODData>

/**
 * Obtiene APOD cacheado o fallback
 * @returns APODData o null
 */
function getCachedAPOD(): APODData | null

/**
 * Guarda APOD en caché
 * @param data - Datos APOD
 */
function setCachedAPOD(data: APODData): void
```

#### Notas
- Endpoint: `https://api.nasa.gov/planetary/apod`
- Clave: `VITE_NASA_API_KEY` (variable de entorno)
- Caché: localStorage con clave `qullqa_apod_${date}`
- Fallback: imagen local `/public/apod-fallback.jpg` + fallback en componente

---

### 1.3 NASA GIBS Service
**Archivo**: `src/services/gibs.ts`

#### Tipos

```typescript
interface GIBSLayer {
  name: string;
  tileUrl: string; // URL template para Leaflet
  attribution: string;
}
```

#### Funciones

```typescript
/**
 * Obtiene URL de capa NDVI (Normalized Difference Vegetation Index)
 * @param date - Fecha (YYYY-MM-DD), default: hoy
 * @returns URL template para Leaflet TileLayer
 */
function getNDVILayerUrl(date?: string): string

/**
 * Obtiene capas disponibles de GIBS
 * @returns Array de capas con atribución NASA
 */
function getAvailableLayers(): GIBSLayer[]
```

#### Notas
- Endpoint: `https://map1.vis.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_NDVI/default/{date}/GoogleMapsCompatible_Level{z}/{z}/{y}/{x}.jpg`
- Attribution: "Datos: NASA GIBS"
- Sin autenticación requerida

---

## 2. LÓGICA AGRONÓMICA (src/lib/agro/)

### 2.1 Modelo de Papa
**Archivo**: `src/lib/agro/potatoModel.ts`

#### Tipos

```typescript
// Variedad de papa
type PotatoVariety = 'Yungay' | 'Canchán' | 'Huayro';

// Semáforo de riesgo
type TrafficLight = 'green' | 'yellow' | 'red';

// Detalles de un mes
interface MonthAssessment {
  month: number; // 1-12
  monthName: string; // "Enero", "Febrero", etc.
  incaMonthName: string; // "Pawkar Apuy", etc.
  T2M: number;
  T2M_MIN: number;
  PRECTOTCORR: number;
  GWETROOT: number;
  ALLSKY_SFC_SW_DWN: number;
  
  // Evaluaciones
  isGoodForSowing: boolean; // lluvia > 60, T2M_MIN > 2, GWETROOT creciente
  frostRisk: boolean; // T2M_MIN < 0
  trafficLight: TrafficLight; // verde/amarillo/rojo
  recommendation: string; // Mensaje al usuario
}

// Metas de grados-día por variedad
interface GrowingDegreeDaysTarget {
  variety: PotatoVariety;
  targetGDD: number; // Yungay: 1500, Canchán: 1300, Huayro: 1700
  baseTemp: number; // 7°C
}

// Progreso de cultivo
interface CropProgress {
  plantingDate: string; // YYYY-MM-DD
  variety: PotatoVariety;
  targetGDD: number;
  accumulatedGDD: number; // Grados-día reales desde siembra
  remainingGDD: number;
  progressPercent: number; // 0-100
  estimatedHarvestDate: string; // YYYY-MM-DD proyectado
  daysUntilHarvest: number;
  status: 'sowing' | 'growing' | 'ready'; // Estado del cultivo
}

// Estado de riego
interface IrrigationStatus {
  needsWater: boolean;
  soilMoisture: number; // 0-100
  recommendation: string;
}

// Proyección de cosecha (próximas semanas)
interface HarvestProjection {
  date: string; // YYYY-MM-DD
  projectedGDD: number;
  likelihood: number; // 0-1
}
```

#### Funciones

```typescript
/**
 * Evalúa cada mes para determinar semáforo de siembra
 * @param climatology - Array de 12 meses de ClimatologyMonth
 * @returns Array de 12 MonthAssessment
 */
function assessAllMonths(climatology: ClimatologyMonth[]): MonthAssessment[]

/**
 * Calcula si un mes es bueno para sembrar
 * Criterios: lluvia > 60 mm, T2M_MIN > 2°C, GWETROOT en aumento
 * @param month - MonthAssessment actual
 * @param prevMonth - MonthAssessment del mes anterior (opcional)
 * @returns boolean
 */
function isGoodForSowing(
  month: MonthAssessment,
  prevMonth?: MonthAssessment
): boolean

/**
 * Detecta riesgo de helada
 * @param T2M_MIN - Temperatura mínima (°C)
 * @returns boolean (true si hay riesgo)
 */
function hasFrostRisk(T2M_MIN: number): boolean

/**
 * Calcula grados-día para un día
 * Formula: max(0, (T2M_MAX + T2M_MIN) / 2 - BASE_TEMP)
 * @param T2M_MAX - Temperatura máxima
 * @param T2M_MIN - Temperatura mínima
 * @param baseTemp - Temperatura base (default: 7°C)
 * @returns GDD del día
 */
function calculateGDD(T2M_MAX: number, T2M_MIN: number, baseTemp?: number): number

/**
 * Calcula progreso desde fecha de siembra
 * @param plantingDate - Fecha siembra (YYYY-MM-DD)
 * @param variety - Variedad papa
 * @param dailyData - Array de DailyDataPoint desde siembra a hoy
 * @returns CropProgress
 */
function calculateCropProgress(
  plantingDate: string,
  variety: PotatoVariety,
  dailyData: DailyDataPoint[]
): CropProgress

/**
 * Proyecta fecha de cosecha usando climatología
 * @param plantingDate - Fecha siembra
 * @param variety - Variedad
 * @param accumulatedGDD - GDD acumulado a hoy
 * @param climatology - Climatología de próximos meses
 * @returns Fecha estimada cosecha (YYYY-MM-DD)
 */
function projectHarvestDate(
  plantingDate: string,
  variety: PotatoVariety,
  accumulatedGDD: number,
  climatology: ClimatologyMonth[]
): string

/**
 * Evalúa estado de riego
 * @param GWETROOT - Humedad raíz (0-1)
 * @param PRECTOTCORR - Precipitación (mm/mes)
 * @param T2M - Temperatura media (°C)
 * @returns IrrigationStatus
 */
function assessIrrigationNeeds(
  GWETROOT: number,
  PRECTOTCORR: number,
  T2M: number
): IrrigationStatus

/**
 * Devuelve número de mes del nombre inca
 * @param incaMonthName - Nombre inca (ej: "Pawkar Apuy")
 * @returns Número de mes (1-12)
 */
function getMonthNumberFromIncaName(incaMonthName: string): number

/**
 * Meses agrícolas incas en orden (enero a diciembre)
 */
const INCA_MONTHS: string[] = [
  'Qhapaq Raymi',    // 1 - Enero
  'Apurimac',        // 2 - Febrero
  'Pawkar Apuy',     // 3 - Marzo
  'Ayrihuay',        // 4 - Abril
  'Aymoray',         // 5 - Mayo
  'Inti Raymi',      // 6 - Junio
  'Anta Situwa',     // 7 - Julio
  'Qapaq Situa',     // 8 - Agosto
  'Llama Unu',       // 9 - Septiembre
  'Chakra Conop',    // 10 - Octubre
  'Chacracamac',     // 11 - Noviembre
  'Capac Raymi',     // 12 - Diciembre
]
```

#### Notas
- Base temperatura: 7°C
- Metas GDD: Yungay 1500, Canchán 1300, Huayro 1700
- Criterios siembra: lluvia > 60 mm/mes, T2M_MIN > 2°C, GWETROOT en aumento
- Riesgo helada: T2M_MIN < 0°C

---

### 2.2 Simulador de Marte
**Archivo**: `src/lib/agro/marsSimulator.ts`

#### Tipos

```typescript
interface MarsEnvironment {
  temperature: number; // °C (-60 a +20 típicamente)
  light: number; // % (0-100, 1x = luz terrestre)
  water: number; // % (0-100)
}

interface MarsSimulationResult {
  environment: MarsEnvironment;
  gddPerDay: number; // GDD por día bajo condiciones marcianas
  daysToHarvest: number;
  viability: 'not_viable' | 'low' | 'moderate' | 'high'; // Viabilidad
  comparisonWithEarth: {
    accelerationFactor: number; // >1 = más rápido, <1 = más lento
    message: string;
  };
}
```

#### Funciones

```typescript
/**
 * Simula crecimiento de papa en Marte
 * Ajusta temperatura, luz y agua para calcular GDD modificado
 * @param environment - Condiciones de invernadero marciano
 * @param variety - Variedad de papa
 * @return Resultado de simulación
 */
function simulateMarsGrowth(
  environment: MarsEnvironment,
  variety: PotatoVariety
): MarsSimulationResult

/**
 * Calcula GDD modificado bajo luz artificial
 * Formula: GDD base * (light% / 100) * temperatureFactor
 * @param GDDBase - GDD normal con base 7°C
 * @param lightPercent - % de luz
 * @param temperature - Temperatura (°C)
 * @returns GDD modificado
 */
function calculateMarsGDD(
  GDDBase: number,
  lightPercent: number,
  temperature: number
): number

/**
 * Valores por defecto para Marte (realistas NASA)
 */
const DEFAULT_MARS_ENVIRONMENT: MarsEnvironment = {
  temperature: -63, // Temperatura media Marte
  light: 43, // ~43% de luz terrestre
  water: 50, // Agua disponible en invernadero
}
```

#### Notas
- Temperatura Marte: -63°C (media), puede ajustar -80 a +20 en simulador
- Luz Marte: ~43% de luz terrestre (ajustable 0-100%)
- Agua: simulada como disponibilidad en invernadero (0-100%)
- GDD se ajusta por temperatura (más frío = menos crecimiento)
- Viabilidad: evalúa si los parámetros permiten crecimiento

---

## 3. COMPONENTES UI (src/components/)

### 3.1 Estructura de Carpetas

```
src/components/
├── layout/
│   ├── BottomNav.tsx          # Navegación inferior (5 tabs)
│   ├── SafeArea.tsx           # Safe area para notch/home bar
│   └── Header.tsx             # Encabezado con logo Qullqa
├── screens/
│   ├── HomeScreen.tsx         # Inicio (APOD + bienvenida)
│   ├── MyFarmScreen.tsx       # Mi chacra (ubicación + variedad)
│   ├── CalendarScreen.tsx     # Calendario inca circular
│   ├── MyCropScreen.tsx       # Mi cultivo (progreso + pronóstico)
│   └── MarsScreen.tsx         # Qullqa en Marte (simulador)
├── common/
│   ├── Card.tsx               # Tarjeta genérica
│   ├── Button.tsx             # Botón
│   ├── Badge.tsx              # Badge (etiquetas)
│   ├── Loading.tsx            # Spinner
│   ├── ErrorBoundary.tsx      # Manejo de errores
│   └── Attribution.tsx        # "Datos: NASA"
├── calendar/
│   ├── CircularCalendar.tsx   # SVG calendario circular (12 meses)
│   ├── MonthDetail.tsx        # Modal con detalles de mes
│   └── TrafficLightBadge.tsx  # Badge verde/amarillo/rojo
├── charts/
│   ├── RainfallChart.tsx      # Gráfico precipitación (Recharts)
│   ├── TemperatureChart.tsx   # Gráfico temperatura (Recharts)
│   └── GDDProgress.tsx        # Barra progreso GDD
├── map/
│   ├── NDVIMap.tsx            # Mapa Leaflet con NDVI
│   └── LocationPicker.tsx     # Selector ubicación (GPS/manual)
└── forms/
    ├── PotatoVarietySelect.tsx # Selector variedad papa
    └── DatePicker.tsx         # Selector fecha (simple)
```

### 3.2 Contexto Global
**Archivo**: `src/context/QullqaContext.tsx`

```typescript
interface QullqaContextType {
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
```

---

## 4. FLUJO DE DATOS

```
App
├── BottomNav (selecciona screen)
│
├── HomeScreen
│   └── APODService.getAPOD()
│       └── render <APOD image + bienvenida>
│
├── MyFarmScreen
│   ├── LocationPicker (GPS o manual)
│   │   └── setLocation() en Context
│   ├── PotatoVarietySelect
│   │   └── setVariety() en Context
│   └── fetchClimateData() → nasaPower.getClimatology()
│       └── guardar climatology en Context
│
├── CalendarScreen
│   ├── Lee climatology del Context
│   ├── potatoModel.assessAllMonths()
│   │   └── genera MonthAssessment[] con semáforo
│   ├── CircularCalendar renderiza SVG
│   │   ├── 12 meses coloreados (verde/amarillo/rojo)
│   │   ├── marca mes de siembra y cosecha
│   │   └── click en mes → MonthDetail modal
│   └── MonthDetail
│       └── muestra detalles + gráficos
│
├── MyCropScreen
│   ├── Lee plantingDate, variety del localStorage
│   ├── nasaPower.getDaily() últimos 30 días
│   ├── potatoModel.calculateCropProgress()
│   │   └── genera CropProgress
│   ├── Renderiza:
│   │   ├── GDDProgress barra
│   │   ├── daysUntilHarvest contador
│   │   ├── RainfallChart (Recharts)
│   │   ├── TemperatureChart (Recharts)
│   │   └── IrrigationStatus
│   └── nasaPower.getDaily() (próximas 2 semanas si disponible)
│
└── MarsScreen
    ├── MarsSimulator (sliders para T, luz, agua)
    ├── potatoModel.simulateMarsGrowth()
    │   └── calcula GDD modificado
    ├── Renderiza:
    │   ├── Sliders interactivos
    │   ├── GDD/día comparativo
    │   ├── daysToHarvest en Marte
    │   └── "Viabilidad" y mensaje
    └── Attribution "Datos: NASA"
```

---

## 5. PERSISTENCIA DE ESTADO

### localStorage keys
- `qullqa_location_lat` - Latitud usuario
- `qullqa_location_lon` - Longitud usuario
- `qullqa_variety` - Variedad (Yungay/Canchán/Huayro)
- `qullqa_planting_date` - Fecha siembra (YYYY-MM-DD)
- `qullqa_climatology_{lat}_{lon}` - Climatología cacheada
- `qullqa_daily_{lat}_{lon}` - Datos diarios cacheados
- `qullqa_apod_{date}` - APOD cacheado

---

## 6. VARIABLES DE ENTORNO

```
VITE_NASA_API_KEY=<clave NASA>
VITE_CUSCO_LAT=-13.5319
VITE_CUSCO_LON=-71.9754
VITE_APP_VERSION=1.0.0
```

---

## 7. FALLBACKS Y RECUPERACIÓN DE ERRORES

- APOD falla → imagen local `/public/apod-fallback.jpg`
- Climatología falla → `fallback-cusco.json`
- GPS no disponible → Cusco automático
- localStorage lleno → limpiar antiguas, reintentar
- API rate limit → retry con backoff exponencial

---

## 8. MILESTONES DE VERIFICACIÓN

- [ ] Servicios NASA implementados y testeados
- [ ] Modelo agronómico validado contra datos reales
- [ ] Calendario circular SVG renderiza correctamente
- [ ] Geolocalización funciona o fallback a Cusco
- [ ] Gráficos Recharts cargan datos dinámicamente
- [ ] Caché localStorage persiste entre sesiones
- [ ] App responsive mobile (375-812px)
- [ ] Atribución "Datos: NASA" visible en todas las pantallas
