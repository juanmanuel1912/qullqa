# Qullqa — Andean AgroSpace Intelligence

**NASA Space Apps Challenge 2026 · Challenge: _Field Shift: Adapting Farms with NASA Data_**

> Inca wisdom, NASA data. A mobile web app that tells Andean potato farmers **when to plant**, **how their crop is doing**, and **when they will harvest**, using NASA Earth observation data. It also simulates growing potatoes **on Mars**.

🔗 **Live demo:** _TODO: Vercel link_ · 🎬 **Video (30 s):** _TODO: YouTube link_ · 👥 **Team:** _TODO_

---

## The problem

More than 700,000 families in Peru depend on potatoes. Climate change is shifting the rainy season and bringing frost at unexpected times, and a single bad planting decision can cost a family a whole year's harvest.

## The inspiration

For centuries, Andean farmers have watched the **Pleiades** (in Quechua, **_Qullqa_**, "the storehouse") before dawn in June. When the stars look bright, they expect good rains and plant on time. When they look dim, they delay planting. In 2000, a study in _Nature_ (Orlove, Chiang & Cane) showed why the method works: the stars' visibility depends on high cirrus clouds linked to El Niño.

**Qullqa does the same thing with NASA satellites instead of the naked eye.**

## What it does

| Screen | What the farmer gets |
|---|---|
| **Home** | NASA Astronomy Picture of the Day and a motivating welcome message |
| **My field** | GPS location (Cusco by default) and potato variety: Yungay, Canchán or Huayro |
| **Inca calendar** | A circular calendar of the 12 Inca agricultural months, each colored green, yellow or red for rain and frost risk. It marks the best month to plant and the expected harvest month |
| **My crop** | Growth progress from real NASA daily temperatures, current crop stage, a countdown to harvest, and frost and irrigation alerts |
| **Qullqa on Mars** | A Martian greenhouse simulator with temperature, light and water sliders. It runs the same crop model and compares the result with Earth |

## NASA data used

| Source | Data | Use |
|---|---|---|
| [NASA POWER](https://power.larc.nasa.gov) – Climatology API | `T2M`, `T2M_MIN`, `T2M_MAX`, `PRECTOTCORR`, `GWETROOT`, `ALLSKY_SFC_SW_DWN` (2001–2025 monthly normals) | Inca calendar, frost and rain risk, best planting month, harvest projection |
| NASA POWER – Daily API | Daily `T2M`, `T2M_MIN`, `PRECTOTCORR`, `GWETROOT` | Real growing degree-days since planting, frost and irrigation alerts |
| [NASA GIBS](https://earthdata.nasa.gov/gibs) | `MODIS_Terra_NDVI_8Day` | Vegetation greenness map of the field |
| [NASA APOD](https://api.nasa.gov) | Astronomy Picture of the Day | Home screen |
| NASA Mars Fact Sheet | Sol length, sunlight (43% of Earth's), surface temperature | Mars greenhouse simulation |

All data is fetched directly from NASA's public APIs in the browser, so there is no backend. The app caches responses and falls back to bundled NASA POWER data for Cusco, so it keeps working offline in remote areas.

## The crop model

- **Growing degree-days (GDD):** `GDD = max(0, min(T_mean, 29 °C) − 2 °C)`
- **Varieties:** Canchán 900 GDD (~135 days), Yungay 1050 GDD (~160 days), Huayro 1200 GDD (~185 days)
- **Best planting month:** the model simulates the whole crop cycle for each of the 12 months. Each month is scored on rain at planting, root-zone soil moisture, frost at emergence, frost months during the cycle, and rain during early growth
- **Harvest date:** GDD from real NASA daily data up to today, plus projected GDD from NASA climatology after today
- **Validation:** with NASA POWER data for Cusco, the model recommends planting in **November** and harvesting in **April**, which matches traditional Andean practice

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npx vitest run     # unit tests
```

Optional: create `.env.local` with `VITE_NASA_API_KEY=<your key from api.nasa.gov>`. Without it, the app uses `DEMO_KEY`.

## Tech

React, Vite, TypeScript (strict), Tailwind CSS, Recharts, React-Leaflet, Vitest and Playwright. Deployed on Vercel. Built with Kiro and Claude Code.

## Future work

- **Pleiades visibility index:** use satellite cloud data (e.g. MODIS cirrus) from June dawns as a modern version of the Inca forecast
- **Quechua voice mode** for farmers who don't read
- **Community reports:** farmers in the same _ayllu_ share frost and pest sightings
- **Mars and the Moon:** connect the simulator to CIP's _Potatoes on Mars_ research and NASA plant-growth data

---

_Data: NASA POWER, NASA GIBS, NASA APOD. This app is not endorsed by NASA._
