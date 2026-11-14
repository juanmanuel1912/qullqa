---
inclusion: auto
name: Qullqa - NASA Space Apps
description: Directrices para el desarrollo de Qullqa, web app para agricultores andinos
---

# Qullqa: Andean AgroSpace Intelligence
## Web app para el reto Field Shift - NASA Space Apps 2026

### Visión
Qullqa ayuda a agricultores andinos a sembrar y cultivar papa inspirada en cómo los incas observaban las Pléyades (Qullqa) y el sol para decidir cuándo sembrar. Combina sabiduría ancestral con datos actuales de la NASA.

### Stack Tecnológico
- **Frontend**: React + Vite + TypeScript
- **Estilos**: Tailwind CSS
- **Gráficos**: Recharts + SVG circular
- **Mapas**: react-leaflet (NASA GIBS NDVI)
- **Testing**: Vitest (unitarias) + Playwright (E2E)
- **Deploy**: Vercel
- **Sin backend**: solo APIs públicas de NASA

### Fuentes de Datos
- **NASA POWER**: climatología y datos diarios (T2M, PRECTOTCORR, GWETROOT, ALLSKY_SFC_SW_DWN)
- **NASA GIBS**: capa NDVI para mapas
- **NASA APOD**: foto del día en pantalla de inicio
- **Datos de respaldo**: JSON local en `/public` para Cusco

### Diseño Visual
- **Colores**: tierra (marrón andino), dorado inti (sun), azul noche estrellado
- **UX**: Mobile-first, tarjetas grandes, accesible
- **Calendario**: SVG circular con 12 meses incas, coloreado por semáforo
- **Idioma**: Español sencillo + toques en quechua

### Pantallas Clave
1. **Inicio**: Foto APOD motivadora + bienvenida
2. **Mi chacra**: Ubicación (GPS/mapa) + variedad de papa (Yungay, Canchán, Huayro)
3. **Calendario inca**: 12 meses agrícolas andinos, coloreados por riesgo (semáforo)
4. **Mi cultivo**: Progreso, pronóstico, cuenta regresiva a cosecha
5. **Qullqa en Marte**: Simulación interactiva de invernadero marciano

### Lógica del Modelo
- **Siembra buena**: lluvia > 60 mm/mes, T2M_MIN > 2°C, GWETROOT en aumento
- **Riesgo de helada**: T2M_MIN < 0°C
- **Grados-día**: base 2°C (calibrado con datos reales NASA POWER de Cusco; ver nasa-data-api.md)
  - Canchán: 900 GDD (~135 días)
  - Yungay: 1050 GDD (~160 días)
  - Huayro: 1200 GDD (~185 días)
- **Cosecha**: suma grados-día desde siembra, proyecta con climatología

### Atribución de Datos
Siempre mostrar: "Datos: NASA"

### Estándares de Código
- TypeScript strict
- Componentes funcionales con hooks
- Caché en localStorage con try/catch
- Estados de carga y error
- Tests unitarios para lógica critical
- E2E para flujos principales
