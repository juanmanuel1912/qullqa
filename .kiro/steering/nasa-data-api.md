---
inclusion: always
---

# ESTADO ACTUAL (Claude es el desarrollador principal; Kiro solo hace retoques pequeños)

La UI completa ya está hecha (commit e9821ac). Antes de cambiar algo, lee el archivo y haz cambios mínimos.
- Rutas: `/` Inicio, `/tierras` (demo multi-chacra), `/clima` (Open-Meteo + NASA), `/chacra`, `/calendario`, `/cultivo`, `/papas`, `/marte`, `/cielo`
- Textos: todo string visible va en `src/i18n/en.ts` y `es.ts` (mismas claves; hay test). Quechua opcional en `qu.ts`. (`src/App.tsx`, pantallas con lazy loading)
- Estado: `src/context/QullqaContext.tsx` → `useQullqa()` da `profile`, `updateProfile`, `climatology`, `daily`, `apod`, `calendar`, `sowing`, `crop`, `weekly`. Usa directamente `src/lib/agro` y `src/services/nasa` (los adaptadores de design.md no se usan en la UI).
- Fechas: siempre formatear con `src/utils/format.ts` (UTC). Nunca `new Date(x).getMonth()`.
- Estilos: clases `.card`, `.btn-primary`, `.btn-dark`, `.btn-ghost`, `.chip`, `.stat` en `src/index.css`; colores `tierra`, `inti`, `noche`, `good`, `caution`, `risk`, `marte`.
- En `useEffect` usa siempre llaves: `useEffect(() => { ... })`. Nunca devuelvas el resultado de una llamada (scrollTo devuelve una Promise y rompe React).
- Antes de cada commit: `npx tsc -b && npx vitest run && npm run build`.

---

# FASE 2 COMPLETA — archivos del design.md listos para usar

Claude implementó T2.1–T2.6 con **exactamente las firmas del design.md** y los tipos de `src/types/index.ts`:

| Tarea | Archivo | Funciones |
|---|---|---|
| T2.1 | `src/services/nasaPower.ts` | `getClimatology`, `getDaily`, `getCachedData`, `setCachedData`, `CUSCO` |
| T2.2 | `src/services/apod.ts` | `getAPOD`, `getCachedAPOD`, `setCachedAPOD` |
| T2.3 | `src/services/gibs.ts` | `getNDVILayerUrl`, `getAvailableLayers`, `GIBS_MAX_ZOOM` |
| T2.4 | `src/lib/agro/potatoModel.ts` | `assessAllMonths`, `isGoodForSowing`, `hasFrostRisk`, `calculateGDD`, `calculateCropProgress`, `projectHarvestDate`, `assessIrrigationNeeds`, `getMonthNumberFromIncaName`, `INCA_MONTHS`, `GDD_TARGETS` |
| T2.5 | `src/lib/agro/marsSimulator.ts` | `simulateMarsGrowth`, `calculateMarsGDD`, `DEFAULT_MARS_ENVIRONMENT`, `MARS_SLIDER_RANGES`, `MARS_PRESETS`, `MARS_FACTS` |
| T2.6 | `src/types/index.ts` | (de Kiro; se añadieron campos opcionales `source`, `elevation`, `explanation`, `sols`, `notes`) |

**Extras para la UI** en `potatoModel.ts`:
- `getSowingAdvice(climatology, variety)` → tarjeta "¿Cuándo siembro?" (`bestMonthName`, `incaMonthName`, `sowNow`, `daysUntil`, `harvestDate`, `cycleDays`, `label`, `reasons`)
- `getCropInsights(plantingDate, variety, dailyData, climatology)` → `stage.name`, `stage.quechua`, `stage.tip`, `alerts[]` (helada / riego)
- `getWeeklyChartData(dailyData, climatology)` → 6 semanas para Recharts (`kind: 'observed' | 'expected'`)
- `getCalendarDetails(climatology, variety)` → incluye `ancestral` (qué hacían los incas ese mes)
- `VARIETY_INFO`, `POTATO_VARIETIES`, `CUSCO_CLIMATOLOGY`
- Pasar siempre `climatology` (de `getClimatology`) a `calculateCropProgress`; si se omite, se usa Cusco.

**Reglas:**
- NO modificar `public/fallback-cusco.json` ni `src/data/fallback-cusco.json`: son la respuesta **real** de NASA POWER (formato GeoJSON crudo). No acceder a ellos directamente: usar `getClimatology()`, que ya hace el fallback.
- NO borrar los `*.test.ts` (42 tests). `vitest` ya está en devDependencies. Correr `npx vitest run` antes de cada commit.
- Mostrar aviso "Sin conexión: datos de Cusco" cuando `getClimatology(...).source === 'fallback'`.

---

# Módulos internos (implementados por Claude — NO reescribir)

Los siguientes módulos ya están implementados y probados (32 tests de Vitest, TypeScript strict).
La UI debe **importarlos y usarlos**, no duplicar su lógica. Si falta algo, pedirlo en vez de reimplementar.

- `src/services/nasa/` — NASA POWER, APOD, GIBS, caché
- `src/lib/agro/` — variedades, grados-día, calendario inca, cuándo sembrar, estado del cultivo, mensajes
- `src/lib/mars/` — simulación del invernadero marciano
- `public/fallback-cusco.json` — climatología real NASA POWER de Cusco (2001-2025)
- `public/apod-fallback.jpg` — Pléyades (NASA Spitzer, PIA09262), respaldo de APOD

## Modelo calibrado (reemplaza los valores anteriores)
- Grados-día con **base 2 °C**, tope 29 °C (base 7 °C daba ciclos de ~1000 días con datos reales de Cusco)
- Metas: Canchán 900 GDD (~135 d), Yungay 1050 GDD (~160 d), Huayro 1200 GDD (~185 d)
- Resultado con datos reales de Cusco: sembrar en noviembre, cosechar en abril

## Requisitos de configuración del proyecto
- `tsconfig`: `"resolveJsonModule": true` (los tests importan el JSON de respaldo)
- `vitest` en devDependencies; tests en `src/**/*.test.ts`
- Variable opcional `VITE_NASA_API_KEY` (si no existe se usa `DEMO_KEY`)

## API para la UI

```ts
import { fetchClimatology, fetchDaily, fetchApod, CUSCO, NASA_ATTRIBUTION,
         ndviTileUrl, GIBS_ATTRIBUTION, GIBS_MAX_ZOOM } from '@/services/nasa'; // o ruta relativa
import { VARIETY_LIST, buildCalendar, recommendSowing, getCropStatus, weeklySeries,
         motivationFor, TRAFFIC_LIGHT_LABEL, QULLQA_STORY, QUECHUA } from '@/lib/agro';
import { simulateMars, MARS_PRESETS, MARS_FACTS, MARS } from '@/lib/mars';
```

### Datos (nunca lanzan error salvo `fetchDaily`)
- `fetchClimatology(lat, lon, signal?) → Promise<Climatology>` — 12 meses; caché 30 d → NASA → caché vieja → JSON Cusco. Mostrar aviso si `source === 'fallback'`.
- `fetchDaily(lat, lon, start: Date, end: Date, signal?) → Promise<DailySeries>` — puede lanzar error: capturarlo y seguir sin datos diarios (la lógica completa con climatología). Los últimos 2-3 días vienen `null` (retraso de POWER).
- `fetchApod(signal?) → Promise<ApodData>` — usar `imageUrl`; si falla devuelve las Pléyades.
- GIBS en Leaflet: `<TileLayer url={ndviTileUrl()} attribution={GIBS_ATTRIBUTION} maxNativeZoom={GIBS_MAX_ZOOM} opacity={0.7} />`

### Pantalla Calendario
`buildCalendar(clim, varietyId) → CalendarMonth[12]` (índice 0 = enero). Cada mes:
`quechua`, `spanish`, `ancestral`, `climate` (t2m, t2mMin, precipMmMonth, gwetRoot, solar),
`condition.status: 'good'|'caution'|'risk'` (semáforo), `condition.reasons: string[]`,
`sowing.score` (0-100), `sowing.label`, `isBestSowing`, `isHarvest`.

### Pantalla Mi chacra / recomendación
`recommendSowing(clim, varietyId, today?) → { best, window, daysUntil, all }`
- `best.sowDate`, `best.harvestDate`, `best.cycleDays`, `best.label`, `best.reasons`
- `daysUntil === 0` → mostrar "¡Este mes es bueno para sembrar!"

### Pantalla Mi cultivo
`getCropStatus({ sowingDate, variety, climatology, daily?, today? }) → CropStatus`
- `progress` (0-1), `stage.name`, `stage.quechua`, `stage.tip`, `daysSinceSowing`,
  `daysToHarvest`, `harvestDate`, `gddAccumulated`/`gddTarget`, `alerts[]` (`level`, `title`, `message`)
- Pedir `fetchDaily(lat, lon, sowingDate, hoy)` para usar datos reales.

`weeklySeries(clim, daily, today?) → WeekPoint[6]` para Recharts: 4 semanas reales + 2 esperadas.
Campos: `label`, `rainMm`, `tMean`, `tMin`, `kind: 'observed'|'expected'` (pintar `expected` con barras punteadas o más claras).

`motivationFor(stage.id) → string` — mensaje motivador del día.

### Pantalla Marte
`simulateMars({ tempC, lightPct, waterPct, variety }) → { viable, sols, earthDays, notes[], gddPerSol, lightFactor, waterFactor, tempFactor }`
- Sliders: tempC −70 a 35, lightPct 0 a 100 (Marte natural = 43), waterPct 0 a 100.
- `MARS_PRESETS` = 3 botones (Al aire libre / Invernadero / Invernadero + LED).
- Comparar `earthDays` con `recommendSowing(...).best.cycleDays` de la Tierra.
- `MARS_FACTS` para tarjetas de datos curiosos.
