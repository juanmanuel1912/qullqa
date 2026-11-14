---
inclusion: always
---

# Módulos de datos y lógica (implementados por Claude — NO reescribir)

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
