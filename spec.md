# SPEC: Qullqa - Andean AgroSpace Intelligence

## 1. REQUIREMENTS

### Objetivo General
Crear una web app mobile-first que ayuda a agricultores andinos a sembrar y cultivar papa con datos de la NASA, inspirada en cómo los incas observaban las Pléyades (Qullqa) y el sol para decidir cuándo sembrar.

### Requisitos Funcionales

#### RF-1: Pantalla de Inicio
- Mostrar foto APOD del día desde NASA
- Título motivador en español
- Botón "Comenzar" hacia Mi chacra
- Fallback a imagen estática si APOD falla

#### RF-2: Mi Chacra
- Input o selector de ubicación (GPS automático, o campo manual)
- Fallback a Cusco (lat: -13.5319, lon: -71.9754) si no hay GPS
- Selector de variedad de papa: Yungay, Canchán, Huayro
- Guardar datos en localStorage
- Botón "Siguiente" al calendario

#### RF-3: Calendario Inca Circular
- SVG circular con 12 meses agrícolas andinos
- Cada mes coloreado por semáforo (verde=bueno, amarillo=advertencia, rojo=riesgo)
- Marcar mes estimado de siembra y cosecha
- Al tocar mes: mostrar detalles (lluvia, temperatura, riesgo de helada)
- Datos cargados desde climatología anual de NASA POWER

#### RF-4: Mi Cultivo
- Mostrar progreso desde siembra (% grados-día acumulados)
- Pronóstico de cosecha (X días restantes)
- Tabla/gráfico de lluvia y temperatura (últimas 4 semanas + próximas 2)
- Estado de riego y recomendaciones
- Contador visual "Días para cosecha"

#### RF-5: Qullqa en Marte
- Simulador interactivo de invernadero marciano
- Sliders ajustables: Temperatura (°C), Luz (%%), Agua (%)
- Mismo modelo de grados-día calcula días a cosecha
- Mostrar diferencia vs. Tierra

#### RF-6: Navegación
- Bottom navigation con 5 tabs: Inicio, Mi chacra, Calendario, Mi cultivo, Marte
- Persistencia de estado
- Back button en modales/detalles

### Requisitos No-Funcionales

#### RNF-1: Datos
- Solo APIs públicas de NASA (POWER, GIBS, APOD)
- Caché en localStorage con try/catch
- JSON de respaldo para Cusco en `/public/fallback-cusco.json`
- Siempre mostrar atribución: "Datos: NASA"

#### RNF-2: Rendimiento
- App funciona offline con datos cacheados
- Lazy loading de imágenes
- Gráficos optimizados con Recharts

#### RNF-3: Diseño
- Mobile-first (min 320px, optimizado para 375-812px)
- Colores: tierra (marrón #8B6F47), inti (dorado #D4AF37), noche (azul #1a1a2e)
- Tarjetas grandes, tipografía sencilla
- Accesible (contrast, labels, touch targets 44px+)

#### RNF-4: Idioma
- Español sencillo para agricultores
- Toques en quechua (ej: "Pachasami" = clima, "Ayllu" = comunidad)
- Motivador y esperanzador

#### RNF-5: Testing
- Unitarias con Vitest para lógica (potatoModel)
- E2E con Playwright: cargar inicio, elegir chacra, ver calendario
- Coverage > 80% en lógica critical

#### RNF-6: Deploy
- Vercel listo
- Variables env: VITE_NASA_API_KEY
- Build optimizado (~200KB gzipped idealmente)

---

## 2. DESIGN

Ver [design.md](./design.md) para:
- Interfaces TypeScript de servicios (src/services/nasa/)
- Interfaces de lógica agronómica (src/lib/agro/)
- Componentes UI de la app
- Flujo de datos

---

## 3. TASKS

Ver [tasks.md](./tasks.md) para el desglose de tareas por fase:
- **Fase 1**: Configuración inicial (Vite, TypeScript, Tailwind)
- **Fase 2**: Servicios NASA y lógica agronómica (paralelo con otro agente)
- **Fase 3**: Componentes de UI base
- **Fase 4**: Pantalla inicio, Mi chacra, Calendario
- **Fase 5**: Mi cultivo, Marte
- **Fase 6**: Testing y optimización
- **Fase 7**: Entrega

---

## 4. CRITERIOS DE ÉXITO

- ✅ App carga sin errores en dispositivo móvil
- ✅ Geolocalización funciona o fallback a Cusco
- ✅ Calendario muestra colores correctos (semáforo)
- ✅ Cálculo de cosecha coincide con modelo agronómico
- ✅ Tests pasan (unitarias + E2E)
- ✅ Desplegable en Vercel
- ✅ README con fuentes NASA y link del demo
- ✅ Atribución de datos visible en cada pantalla
