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
| **Weather** | Current conditions and a 7-day forecast for the farm, with a plan for the week: which day to irrigate (FAO-56 water balance), frost and heavy-rain warnings, and this week's rain compared with the NASA POWER normal for the month |
| **My land** *(demo)* | A sample signed-in farmer with fields in Peru, Chile and the USA on one map. Each field shows its crop, progress and harvest date, or when to plant, computed from NASA data for that location |
| **Potatoes** | A guide to Peru's potatoes: a curated catalog of improved, native and bitter varieties with their altitude, regions and best uses; the Andean altitude zones; how to plant in 7 steps; which potato for which dish (causa, papa rellena, pastel de papa…); and how chuño, tunta, papa seca and potato starch are made. It also includes a map of where each variety grows and a **community contribution form** (photo, region, dishes, disease resistance) with an expert review queue. That form is the path toward documenting all 3,000+ varieties. *(Demo: contributions are stored on the device.)* |
| **Crops of Peru** *(preview)* | Maize/choclo, avocado, Peruvian chili peppers and quinoa as static previews (varieties, regions, altitude, seasons, cooking). The goal is to bring the same NASA calendar, variety catalog with expert approval, field maps and producer profiles to every crop |
| **Farmer profile** *(demo)* | Public profile of a sample farmer with location, contact and what they grow and when, plus a **My products** form where farmers list what they sell (stored on the device). It's the base for a future direct-sale marketplace |
| **Qullqa telescope** | A live planetarium aimed at the Pleiades from the farmer's location, both now and at dawn on the Inti Raymi (June 20) as the Incas saw them. It computes tonight's viewing window, shows real NASA images of the Pleiades (Spitzer, WISE, Cassini, and from the surface of Mars), and tells the Inca story in three illustrated steps |
| **Qullqa on Mars** | A Martian greenhouse simulator with temperature, light and water sliders. It runs the same crop model and compares the result with Earth |

**Languages:** English (default), Spanish and Quechua (beta). Pick one in the top bar. The Quechua version covers navigation, headings and key phrases and falls back to Spanish for longer texts; it still needs review by a native speaker.

## NASA data used

| Source | Data | Use |
|---|---|---|
| [NASA POWER](https://power.larc.nasa.gov) – Climatology API | `T2M`, `T2M_MIN`, `T2M_MAX`, `PRECTOTCORR`, `GWETROOT`, `ALLSKY_SFC_SW_DWN` (2001–2025 monthly normals) | Inca calendar, frost and rain risk, best planting month, harvest projection |
| NASA POWER – Daily API | Daily `T2M`, `T2M_MIN`, `PRECTOTCORR`, `GWETROOT` | Real growing degree-days since planting, frost and irrigation alerts |
| [NASA GIBS](https://earthdata.nasa.gov/gibs) | `MODIS_Terra_NDVI_8Day` | Vegetation greenness map of the field |
| [NASA APOD](https://api.nasa.gov) | Astronomy Picture of the Day | Home screen |
| [NASA Image and Video Library](https://images.nasa.gov) | Pleiades images from Spitzer, WISE, Cassini and the Martian surface (PIA09262, PIA09263, PIA13121, PIA11482, PIA06339) | Telescope screen |
| NASA Mars Fact Sheet | Sol length, sunlight (43% of Earth's), surface temperature | Mars greenhouse simulation |

NASA POWER has no forecast (its daily data arrives about 3 days late), so the current weather and 7-day forecast come from [Open-Meteo](https://open-meteo.com). The app labels which source each figure comes from.

All data is fetched directly from public APIs in the browser, so there is no backend. The app caches responses and falls back to bundled NASA POWER data for Cusco, so it keeps working offline in remote areas.

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

- **Accounts:** sign-in, editable fields per farmer, and expert reviewer profiles backed by a shared database (e.g. Supabase) for community potato entries and photos
- **Regional calibration:** frost thresholds tuned per region (today's model is calibrated for the Andes; irrigated temperate farms use their local season)

- **Pleiades visibility index:** use satellite cloud data (e.g. MODIS cirrus) from June dawns as a modern version of the Inca forecast
- **Quechua voice mode** for farmers who don't read
- **Community reports:** farmers in the same _ayllu_ share frost and pest sightings
- **Mars and the Moon:** connect the simulator to CIP's _Potatoes on Mars_ research and NASA plant-growth data

---

_Data: NASA POWER, NASA GIBS, NASA APOD. This app is not endorsed by NASA._
