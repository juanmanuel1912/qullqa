# TASKS: Qullqa - Desglose de Implementación

## FASE 1: Configuración Inicial

### T1.1: Crear proyecto Vite + configurar TypeScript
- [ ] `npm create vite@latest . -- --template react-ts`
- [ ] Instalar deps: React, React-DOM, TypeScript
- [ ] Crear tsconfig.json strict
- [ ] Crear vite.config.ts con alias @/
- [ ] Status: `todo`

### T1.2: Instalar y configurar Tailwind CSS
- [ ] Instalar Tailwind, PostCSS, Autoprefixer
- [ ] Crear tailwind.config.js con colores custom (tierra, inti, noche)
- [ ] Crear src/index.css base
- [ ] Importar en App.tsx
- [ ] Status: `todo`

### T1.3: Instalar dependencias de libs
- [ ] `npm install react-leaflet leaflet recharts axios`
- [ ] `npm install -D vitest @testing-library/react @testing-library/jest-dom`
- [ ] `npm install -D @playwright/test`
- [ ] Status: `todo`

### T1.4: Crear estructura de carpetas base
- [ ] Crear src/components/{layout,screens,common,calendar,charts,map,forms}
- [ ] Crear src/services/nasa/
- [ ] Crear src/lib/agro/
- [ ] Crear src/context/
- [ ] Crear src/hooks/
- [ ] Crear src/types/
- [ ] Crear src/utils/
- [ ] Crear public/{fallback-cusco.json,apod-fallback.jpg}
- [ ] Status: `todo`

### T1.5: Variables de entorno
- [ ] Crear .env.example
- [ ] Crear .env.local (git ignore)
- [ ] Generar API key NASA (https://api.nasa.gov)
- [ ] Documentar en README
- [ ] Status: `todo`

---

## FASE 2: Servicios NASA y Lógica Agronómica (PARALELO)

### T2.1: Implementar src/services/nasaPower.ts
**Responsable**: Otro agente  
- [ ] Implementar `getClimatology(lat, lon)` con climatología de 12 meses
- [ ] Implementar `getDaily(lat, lon, startDate?, endDate?)`
- [ ] Implementar caché en localStorage con try/catch
- [ ] Crear JSON fallback para Cusco en /public/fallback-cusco.json
- [ ] Agregar manejo de errores y retry con backoff
- [ ] Tests unitarios (Vitest)
- [ ] Status: `todo`

### T2.2: Implementar src/services/apod.ts
**Responsable**: Otro agente  
- [ ] Implementar `getAPOD()` con foto del día
- [ ] Caché localStorage
- [ ] Fallback a imagen local
- [ ] Manejo de errores
- [ ] Tests unitarios
- [ ] Status: `todo`

### T2.3: Implementar src/services/gibs.ts
**Responsable**: Otro agente  
- [ ] Implementar `getNDVILayerUrl(date?)`
- [ ] Implementar `getAvailableLayers()`
- [ ] Atribución NASA
- [ ] Tests unitarios
- [ ] Status: `todo`

### T2.4: Implementar src/lib/agro/potatoModel.ts
**Responsable**: Otro agente  
- [ ] Implementar `assessAllMonths(climatology)`
- [ ] Implementar `isGoodForSowing(month, prevMonth?)`
- [ ] Implementar `hasFrostRisk(T2M_MIN)`
- [ ] Implementar `calculateGDD(T2M_MAX, T2M_MIN, baseTemp?)`
- [ ] Implementar `calculateCropProgress(plantingDate, variety, dailyData)`
- [ ] Implementar `projectHarvestDate(...)`
- [ ] Implementar `assessIrrigationNeeds(...)`
- [ ] Exportar INCA_MONTHS
- [ ] Tests unitarios (coverage > 80%)
- [ ] Status: `todo`

### T2.5: Implementar src/lib/agro/marsSimulator.ts
**Responsable**: Otro agente  
- [ ] Implementar `simulateMarsGrowth(environment, variety)`
- [ ] Implementar `calculateMarsGDD(gddBase, lightPercent, temperature)`
- [ ] Exportar DEFAULT_MARS_ENVIRONMENT
- [ ] Tests unitarios
- [ ] Status: `todo`

### T2.6: Crear tipos en src/types/index.ts
**Responsable**: Otro agente  
- [ ] Exportar ClimatologyMonth, DailyDataPoint, ClimatologyResponse, etc.
- [ ] Exportar MonthAssessment, CropProgress, MarsEnvironment, etc.
- [ ] Exportar TrafficLight, PotatoVariety
- [ ] Status: `todo`

---

## FASE 3: Contexto Global y Hooks

### T3.1: Crear src/context/QullqaContext.tsx
**Responsable**: Yo (UI agent)  
- [ ] Crear QullqaContext + QullqaProvider
- [ ] Implementar useQullqa hook
- [ ] Gestionar: location, variety, climatology, dailyData, apod, loading, error
- [ ] Funciones: fetchClimateData(), refetch()
- [ ] Persistencia en localStorage
- [ ] Status: `todo`

### T3.2: Crear src/hooks/useGeolocation.ts
**Responsable**: Yo  
- [ ] Hook para obtener GPS o fallback a Cusco
- [ ] Retornar {lat, lon, loading, error}
- [ ] Status: `todo`

### T3.3: Crear src/utils/cacheUtils.ts
**Responsable**: Yo  
- [ ] Funciones helper para localStorage con try/catch
- [ ] getCached(key), setCached(key, data), clearOldCache()
- [ ] Status: `todo`

---

## FASE 4: Componentes Base y Layout

### T4.1: Crear src/components/layout/BottomNav.tsx
**Responsable**: Yo  
- [ ] 5 tabs: Inicio, Mi chacra, Calendario, Mi cultivo, Marte
- [ ] Icono Qullqa en cada tab
- [ ] Navegación a screens
- [ ] Highlight de tab activo
- [ ] Mobile-first (44px+ touch targets)
- [ ] Status: `todo`

### T4.2: Crear src/components/layout/Header.tsx
**Responsable**: Yo  
- [ ] Logo/nombre "Qullqa"
- [ ] Opcional: menú hamburguesa
- [ ] Status: `todo`

### T4.3: Crear src/components/layout/SafeArea.tsx
**Responsable**: Yo  
- [ ] Wrapper para notch/home bar
- [ ] CSS safe-area-inset
- [ ] Status: `todo`

### T4.4: Crear src/components/common/Card.tsx
**Responsable**: Yo  
- [ ] Tarjeta genérica con shadow, padding, rounded
- [ ] Variantes (default, elevated, outlined)
- [ ] Status: `todo`

### T4.5: Crear src/components/common/Button.tsx
**Responsable**: Yo  
- [ ] Botón con variantes (primary, secondary, danger)
- [ ] Loading state
- [ ] Disabled state
- [ ] 44px+ altura
- [ ] Status: `todo`

### T4.6: Crear src/components/common/Loading.tsx
**Responsable**: Yo  
- [ ] Spinner/skeleton
- [ ] Mensaje "Cargando..."
- [ ] Status: `todo`

### T4.7: Crear src/components/common/ErrorBoundary.tsx
**Responsable**: Yo  
- [ ] Manejo de errores React
- [ ] Fallback UI
- [ ] Botón retry
- [ ] Status: `todo`

### T4.8: Crear src/components/common/Attribution.tsx
**Responsable**: Yo  
- [ ] Componente "Datos: NASA"
- [ ] Reutilizable en todas las pantallas
- [ ] Status: `todo`

### T4.9: Crear src/components/common/Badge.tsx
**Responsable**: Yo  
- [ ] Badge genérico para etiquetas
- [ ] Status: `todo`

---

## FASE 5: Pantalla Inicio (HomeScreen)

### T5.1: Crear src/components/screens/HomeScreen.tsx
**Responsable**: Yo  
- [ ] Mostrar APOD del día (imagen grande)
- [ ] Título motivador en español
- [ ] Descripción breve del proyecto
- [ ] Botón "Comenzar" → navigate /my-farm
- [ ] Loading state mientras carga APOD
- [ ] Fallback a imagen local si falla
- [ ] Attribution "Datos: NASA"
- [ ] Status: `todo`

### T5.2: Integrar apod.ts en HomeScreen
**Responsable**: Yo (después que otro agente impl. apod.ts)  
- [ ] Llamar getAPOD() desde QullqaContext
- [ ] Caché automático
- [ ] Mostrar copyright del fotógrafo
- [ ] Status: `todo`

---

## FASE 6: Pantalla Mi Chacra (MyFarmScreen)

### T6.1: Crear src/components/forms/LocationPicker.tsx
**Responsable**: Yo  
- [ ] GPS automático (useGeolocation hook)
- [ ] Campo manual para lat/lon
- [ ] Botón "Usar mi ubicación"
- [ ] Mostrar ubicación actual ({lat}, {lon})
- [ ] Fallback a Cusco si no hay GPS
- [ ] Status: `todo`

### T6.2: Crear src/components/forms/PotatoVarietySelect.tsx
**Responsable**: Yo  
- [ ] Radio buttons o cards: Yungay, Canchán, Huayro
- [ ] Descripción breve de cada variedad
- [ ] Icono/imagen de papa
- [ ] Status: `todo`

### T6.3: Crear src/components/screens/MyFarmScreen.tsx
**Responsable**: Yo  
- [ ] Título "Mi chacra"
- [ ] LocationPicker
- [ ] PotatoVarietySelect
- [ ] Botón "Siguiente" (valida ubicación + variedad)
- [ ] Guardar en QullqaContext + localStorage
- [ ] Loading mientras fetch climatology
- [ ] Navegar a Calendar cuando esté listo
- [ ] Status: `todo`

### T6.4: Integrar fetchClimateData() en MyFarmScreen
**Responsable**: Yo (después que otro agente impl. nasaPower.ts)  
- [ ] Trigger fetchClimateData() cuando se valida ubicación + variedad
- [ ] Mostrar loading spinner
- [ ] Si falla: mostrar error + retry
- [ ] Si éxito: navigate a Calendar
- [ ] Status: `todo`

---

## FASE 7: Calendario Inca Circular (CalendarScreen)

### T7.1: Crear src/components/calendar/CircularCalendar.tsx
**Responsable**: Yo  
- [ ] SVG circular con 12 meses incas
- [ ] Cada mes:
  - Nombre inca (INCA_MONTHS)
  - Color semáforo (verde/amarillo/rojo)
  - Número romano del mes
  - Marcas siembra/cosecha si aplica
- [ ] Responsive: escala según viewport
- [ ] Click en mes → abre MonthDetail modal
- [ ] Status: `todo`

### T7.2: Crear src/components/calendar/MonthDetail.tsx
**Responsable**: Yo  
- [ ] Modal con detalles de mes seleccionado
- [ ] Mostrar: T2M, T2M_MIN, PRECTOTCORR, GWETROOT, ALLSKY_SFC_SW_DWN
- [ ] Gráficos pequeños (Recharts)
- [ ] Recomendación de siembra (verde/amarillo/rojo)
- [ ] Riesgo de helada si aplica
- [ ] Botón "Cerrar"
- [ ] Status: `todo`

### T7.3: Crear src/components/calendar/TrafficLightBadge.tsx
**Responsable**: Yo  
- [ ] Badge con color semáforo + ícono
- [ ] Reutilizable
- [ ] Status: `todo`

### T7.4: Crear src/components/screens/CalendarScreen.tsx
**Responsable**: Yo  
- [ ] Título "Calendario Agrícola"
- [ ] Texto intro: "Inspírate en las Pléyades y siembra en el mes correcto"
- [ ] CircularCalendar
- [ ] Leyenda: verde = bueno, amarillo = cuidado, rojo = riesgo
- [ ] Attribution "Datos: NASA"
- [ ] Status: `todo`

### T7.5: Integrar potatoModel.assessAllMonths() en CalendarScreen
**Responsable**: Yo (después que otro agente impl. potatoModel.ts)  
- [ ] Leer climatology del QullqaContext
- [ ] Llamar assessAllMonths() → genera MonthAssessment[]
- [ ] Pasar a CircularCalendar para coloreo
- [ ] Status: `todo`

---

## FASE 8: Pantalla Mi Cultivo (MyCropScreen)

### T8.1: Crear src/components/charts/GDDProgress.tsx
**Responsable**: Yo  
- [ ] Barra de progreso con % GDD acumulado
- [ ] Mostrar X/Y grados-día
- [ ] Color gradual (rojo → amarillo → verde)
- [ ] Status: `todo`

### T8.2: Crear src/components/charts/RainfallChart.tsx
**Responsable**: Yo  
- [ ] Gráfico de barras con Recharts
- [ ] Últimas 4 semanas + próximas 2 (si disponible)
- [ ] Eje Y: mm/semana
- [ ] Eje X: semanas
- [ ] Línea referencia (60 mm = bueno)
- [ ] Status: `todo`

### T8.3: Crear src/components/charts/TemperatureChart.tsx
**Responsable**: Yo  
- [ ] Gráfico de línea con Recharts
- [ ] Últimas 4 semanas + próximas 2
- [ ] Dos series: T2M, T2M_MIN
- [ ] Zona roja si T2M_MIN < 0 (helada)
- [ ] Status: `todo`

### T8.4: Crear src/components/screens/MyCropScreen.tsx
**Responsable**: Yo  
- [ ] Título "Mi Cultivo"
- [ ] Card grande: contador "X días para cosecha"
- [ ] GDDProgress barra
- [ ] Mostrar variedad + fecha siembra
- [ ] RainfallChart
- [ ] TemperatureChart
- [ ] Estado de riego (IrrigationStatus)
- [ ] Recomendaciones
- [ ] Attribution "Datos: NASA"
- [ ] Status: `todo`

### T8.5: Integrar calculateCropProgress() en MyCropScreen
**Responsable**: Yo (después que otro agente impl. potatoModel.ts + nasaPower.ts)  
- [ ] Leer plantingDate, variety del localStorage
- [ ] Fetch getDaily() últimos 30 días
- [ ] Llamar calculateCropProgress()
- [ ] Pasar datos a componentes de charts
- [ ] Status: `todo`

---

## FASE 9: Pantalla Qullqa en Marte (MarsScreen)

### T9.1: Crear src/components/screens/MarsScreen.tsx
**Responsable**: Yo  
- [ ] Título "Qullqa en Marte"
- [ ] Intro: "¿Qué pasaría si sembráramos papa en Marte?"
- [ ] Tres sliders interactivos:
  - Temperatura: -80 a +20 °C (default -63)
  - Luz: 0-100% (default 43)
  - Agua: 0-100% (default 50)
- [ ] Card grande: contador "X días para cosecha en Marte"
- [ ] GDD/día comparación Tierra vs Marte
- [ ] Indicador "Viabilidad" (not viable, low, moderate, high)
- [ ] Mensaje motivador
- [ ] Attribution "Datos: NASA"
- [ ] Status: `todo`

### T9.2: Integrar simulateMarsGrowth() en MarsScreen
**Responsable**: Yo (después que otro agente impl. marsSimulator.ts)  
- [ ] Leer variety del QullqaContext
- [ ] Pasar environment (T, luz, agua) a simulateMarsGrowth()
- [ ] Update en tiempo real cuando sliders cambian
- [ ] Status: `todo`

---

## FASE 10: Integración y App.tsx

### T10.1: Crear App.tsx con enrutamiento
**Responsable**: Yo  
- [ ] Instalar react-router-dom
- [ ] Routes:
  - / → HomeScreen
  - /my-farm → MyFarmScreen
  - /calendar → CalendarScreen
  - /my-crop → MyCropScreen
  - /mars → MarsScreen
  - /* → HomeScreen (redirect)
- [ ] QullqaProvider envuelve todo
- [ ] BottomNav siempre visible
- [ ] Status: `todo`

### T10.2: Crear src/index.css global
**Responsable**: Yo  
- [ ] Reset de estilos CSS
- [ ] Colores custom Tailwind (tierra, inti, noche)
- [ ] Tipografía base (sans-serif legible)
- [ ] Safe area insets
- [ ] Status: `todo`

---

## FASE 11: Testing

### T11.1: Tests unitarios - potatoModel.ts
**Responsable**: Otro agente (después implementación)  
- [ ] Test calculateGDD() con casos varios
- [ ] Test isGoodForSowing() con datos reales
- [ ] Test hasFrostRisk()
- [ ] Test calculateCropProgress()
- [ ] Coverage > 80%
- [ ] Status: `todo`

### T11.2: Tests unitarios - nasaPower.ts
**Responsable**: Otro agente  
- [ ] Test getClimatology() mock API
- [ ] Test getDaily() mock API
- [ ] Test caché localStorage
- [ ] Test fallback Cusco
- [ ] Status: `todo`

### T11.3: Tests unitarios - servicios apod.ts, gibs.ts
**Responsable**: Otro agente  
- [ ] Tests básicos con mocks
- [ ] Status: `todo`

### T11.4: Tests E2E - Playwright
**Responsable**: Yo  
- [ ] Test 1: Cargar Home, ver APOD
- [ ] Test 2: Navegar a My Farm, elegir ubicación + variedad, ver loading
- [ ] Test 3: Ver Calendar con colores semáforo, click en mes, ver modal
- [ ] Tests en Chrome/Firefox
- [ ] Status: `todo`

---

## FASE 12: Optimización y Entrega

### T12.1: Optimizar bundle
**Responsable**: Yo  
- [ ] Analizar bundle con `vite-plugin-visualizer`
- [ ] Lazy load screens con React.lazy + Suspense
- [ ] Tree-shake CSS unused
- [ ] Reducir tamaño SVG circular
- [ ] Goal: < 250KB gzipped
- [ ] Status: `todo`

### T12.2: Responsive design
**Responsable**: Yo  
- [ ] Testear en 320px, 375px, 812px
- [ ] Media queries Tailwind
- [ ] Touch targets 44px+
- [ ] Landscape orientation
- [ ] Status: `todo`

### T12.3: Crear README.md
**Responsable**: Yo  
- [ ] Descripción del proyecto
- [ ] Fuentes NASA (POWER, APOD, GIBS)
- [ ] Links a documentación NASA
- [ ] Setup local (npm install, npm run dev)
- [ ] Deploy a Vercel (link al demo)
- [ ] Créditos (quechua, calendario inca)
- [ ] Status: `todo`

### T12.4: Configurar Vercel deployment
**Responsable**: Yo  
- [ ] Crear vercel.json
- [ ] Environment vars en Vercel dashboard
- [ ] Deploy y testear en producción
- [ ] Status: `todo`

### T12.5: Auditoría de accesibilidad
**Responsable**: Yo  
- [ ] WAVE o Lighthouse Accessibility
- [ ] Contrast ratios OK
- [ ] Labels en form inputs
- [ ] Alt text en imágenes
- [ ] Keyboard navigation (tabs)
- [ ] Status: `todo`

---

## RESUMEN DE RESPONSABILIDADES

### Otro Agente (Servicios + Lógica)
- Implementar T2.1 - T2.6: nasaPower, apod, gibs, potatoModel, marsSimulator, tipos
- Tests unitarios para estos servicios
- Asegurar que interfaces coincidan con design.md

### Yo (UI Agent)
- Implementar T1.1 - T1.5: configuración inicial
- Implementar T3.1 - T3.3: contexto y hooks
- Implementar T4.1 - T4.9: componentes base
- Implementar T5 - T10: todas las pantallas
- Integración de servicios en pantallas (después que otro agente termina)
- T11.4: Tests E2E
- T12.1 - T12.5: optimización y entrega

---

## ORDEN DE EJECUCIÓN RECOMENDADO

1. T1: Setup (yo)
2. T2 (paralelo): otro agente en servicios/lógica, yo en T3
3. T4: componentes base (yo)
4. T5-T9: pantallas (yo integra con servicios cuando listos)
5. T10: App.tsx + routing (yo)
6. T11: testing (ambos)
7. T12: entrega (yo)
