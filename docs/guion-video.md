# Guion del video y guía de producción — Qullqa

> **Reglas oficiales Space Apps 2026** (Project Submission Guide, revisada el 14-nov-2026):
> - Demo = **video de 30 s o menos** *o* **máximo 7 diapositivas** (en inglés). Si te pasas, **quedas fuera del juzgamiento global**.
> - Puedes hablar en español, pero el video **DEBE tener subtítulos en inglés**.
> - Subirlo a YouTube / Google Drive con **enlace público** (sin login ni permisos). Probarlo en ventana de incógnito.
> - **Sin imágenes, voz ni rostro de menores de 18 años.**
> - **Sin logos de la NASA**, banderas ni insignias de misiones (no dar a entender que la NASA nos respalda).
> - Lo generado con IA (SI): **imágenes/videos con marca de agua visible** ("AI-generated"); **audio/código** declarado en el texto de la descripción.
> - Cierre de envío: **domingo 15 de noviembre, 11:59 p. m.** (hora de tu evento local). Puedes reenviar cuantas veces quieras antes.
> - Estructura sugerida por Space Apps: 0:00 quién eres · 0:02 el reto · 0:05 nombre del proyecto · 0:10 cómo funciona + datos NASA · 0:20–0:30 el futuro.

---

## A. Video oficial — 30 segundos (voz en español, subtítulos en inglés)

Meta: **28 s** (deja 2 s de margen). Unas 65–70 palabras en total: frases cortas.

| Tiempo | Qué se ve | Voz (español) | Subtítulo (inglés) |
|---|---|---|---|
| 0–3 s | Tú hablando a cámara (o tu nombre en texto sobre el cielo nocturno) | "Soy [Nombre], del equipo [Equipo]." | "I'm [Name], team [Team]." |
| 3–6 s | Texto grande: **Field Shift: Adapting Farms with NASA Data** sobre foto de chacra andina | "Nuestro reto: adaptar las chacras con datos de la NASA." | "Our challenge: adapting farms with NASA data." |
| 6–10 s | Foto NASA de las Pléyades → zoom → aparece **QULLQA** + lámina inca de la app (pantalla *Cielo*) | "Los incas miraban las Pléyades, *Qullqa*, para saber cuándo sembrar papa." | "The Incas read the Pleiades — *Qullqa* — to know when to plant potatoes." |
| 10–15 s | App: **Calendario** → rueda inca, tocar noviembre (verde) → 1 s de la alerta **El Niño** | "Con datos NASA te dice cuándo sembrar, evitar heladas y te alerta de El Niño." | "With NASA data it tells you when to plant, avoid frost, and warns you about El Niño." |
| 15–20 s | App: **Rotación → ¿Qué siembro después?** Papa → tocar **Mango** (👎 rojo) → tocar **Habas** (👍 ⭐) | "¿Mango después de papa? Mala idea aquí. Mejor habas: alimentan el suelo." | "Mango after potato? Bad idea here. Broad beans instead: they feed the soil." |
| 20–25 s | App: **Mi cultivo** (anillo de progreso + días para cosecha) → **Asistente** respondiendo | "Sigue tu cultivo día a día y te dice cuándo cosechar." | "It tracks your crop day by day and tells you when to harvest." |
| 25–30 s | App: **Marte** (mover el slider, aparece el domo) → cierre: **QULLQA** + link `qullqa-five.vercel.app` + "Data: NASA POWER · GIBS · APOD" | "Mañana, papa en Marte. Qullqa: sabiduría inca, datos de la NASA." | "Tomorrow, potatoes on Mars. Qullqa: Inca wisdom, NASA data." |

**Consejos de ritmo**
- Graba la voz primero y mide con cronómetro. Si pasa de 28 s, recorta palabras, no aceleres la voz.
- Cada toma de la app dura 2–3 s: muévete rápido, sin buscar botones (ensaya la ruta antes).
- Subtítulos: máximo 2 líneas, letra grande, fondo semitransparente, abajo al centro.

---

## B. Alternativa: 7 diapositivas (todo en inglés)

Úsala solo si no llegas con el video (también se puede enviar ambas: el video como demo y las diapositivas como material extra en el link del proyecto).

1. **Title** — QULLQA · Inca wisdom, NASA data. Team name, member names, challenge "Field Shift: Adapting Farms with NASA Data". Foto de las Pléyades.
2. **The problem** — Andean potato farmers face late rains, out-of-season frost and El Niño; one wrong sowing date can cost a year's harvest.
3. **The inspiration** — Incas watched the Pleiades (Qullqa) in June to forecast rain; science confirmed the link to El Niño (Orlove, Chiang & Cane, *Nature*, 2000). Captura de *Cielo*.
4. **How it works** — NASA POWER (25 y climate + daily), GIBS MODIS NDVI, APOD, Image Library + Open-Meteo forecast + NOAA ENSO → crop model (growing degree days) → simple traffic-light advice. Diagrama de flujo simple.
5. **User experience** — 3–4 capturas del celular: Calendar · El Niño alert · Rotation planner · My crop. Una línea de texto por captura.
6. **Impact** — Free, mobile-first, English/Spanish/Quechua, works offline with cached NASA data; demo farms in Peru, Chile and USA; rotation planner for soil and water.
7. **The future** — Farmer marketplace, expert-validated variety map, optional AI assistant, and the same model for Mars greenhouses. Link: qullqa-five.vercel.app · GitHub.

---

## C. Paso a paso para producirlo (gratis, 2–3 horas)

### Paso 1 — Preparar la app para grabar (15 min)
1. Abre **https://qullqa-five.vercel.app** en Chrome, en ventana normal (no incógnito, para que cargue la caché).
2. Pulsa **F12** → icono de celular (**Toggle device toolbar**, Ctrl+Shift+M) → elige **iPhone 12 Pro** o **Pixel 7**. Zoom 100 %.
3. Idioma **English** en la app (el jurado lee inglés; la voz va en español).
4. En *Mi chacra* deja **Cusco** y variedad **Yungay**, con fecha de siembra en noviembre para que *Mi cultivo* muestre progreso.
5. Recorre una vez todas las pantallas del guion para que se carguen los datos (NASA POWER, El Niño, imágenes) y la grabación no muestre "cargando".
6. Cierra otras pestañas y activa *No molestar* en Windows (Win+N → No molestar).

### Paso 2 — Grabar la pantalla (20 min)
- **Opción rápida:** **Win + Alt + R** (Xbox Game Bar) graba la ventana de Chrome. Los videos quedan en *Videos → Capturas*.
- **Opción con más control:** **OBS Studio** (gratis, obsproject.com) → fuente *Captura de ventana* → recorta solo el área del celular → grabar en 1080p, 30 fps.
- Graba **cada pantalla como clip separado** (calendario, El Niño, rotación, mi cultivo, asistente, Marte). Es más fácil editar.
- Mueve el mouse despacio; los toques deben verse claros.

### Paso 3 — Imágenes (20 min)
| Necesidad | De dónde sacarla | Nota legal |
|---|---|---|
| Pléyades, cielo, Marte | **images.nasa.gov** (busca "Pleiades", "Mars surface") — ya tienes 5 en `public/sky/` | Dominio público, pero **sin logo de la NASA** y sin dar a entender respaldo |
| Chacra andina, papas | **Unsplash** o **Pexels** (gratis) o fotos propias de tu celular | Que no aparezcan menores de 18 |
| Láminas incas | Las 3 ilustraciones que ya tiene la app (pantallas *Cielo* y *El Niño*): captura de pantalla | Son ilustraciones hechas con código asistido por IA → decláralo en la descripción |
| Imagen generada con IA (opcional) | Copilot Designer / Bing Image Creator / Canva Magic Media | **Obligatorio:** marca de agua visible "AI-generated" en la imagen |
| Miniatura de YouTube y textos | **Canva** (gratis), plantilla 1280×720 | Sin logo NASA |

### Paso 4 — Grabar la voz (15 min)
- Usa tu propia voz (recomendado): grabadora del celular o *Grabadora de sonido* de Windows, en un cuarto silencioso, a 15 cm del micrófono.
- Lee el guion de la tabla A tres veces y quédate con la mejor toma de **≤ 28 s**.
- Si usas voz de IA (texto a voz de Clipchamp, por ejemplo), debes **declararlo** en la descripción del video y del proyecto.

### Paso 5 — Editar (60 min) — **Clipchamp** (viene en Windows 11) o **CapCut** (gratis)
1. Nuevo proyecto **16:9, 1080p** (YouTube y jurado lo ven mejor en horizontal; el celular va al centro y los textos a los lados).
2. Arrastra la voz a la pista de audio; coloca los clips encima siguiendo los tiempos de la tabla A.
3. Fondo: color azul noche `#1a1a2e` (el de la app) o la foto de las Pléyades difuminada.
4. Textos: título *QULLQA* en la fuente **Fraunces** (la de la app) o similar con serifa; textos de apoyo en **Nunito**.
5. **Subtítulos:** Clipchamp → *Subtítulos* → *Transcripción automática* en español → reemplaza cada línea por el texto en inglés de la tabla A (revisa ortografía). En CapCut: *Texto → Subtítulos automáticos* y luego editas.
6. **Música:** Biblioteca de audio de YouTube (studio.youtube.com → *Biblioteca de audio*, filtra "Sin atribución") o la música de stock de Clipchamp. Algo andino suave; volumen al 15–20 % bajo la voz.
7. Transiciones simples (corte o fundido corto). Nada de efectos llamativos.
8. Revisa la duración final: **≤ 30 s exactos** (la línea de tiempo lo indica).
9. Exporta **1080p MP4**.

### Paso 6 — Subir y compartir (15 min)
1. YouTube → *Crear → Subir video*. Título: **Qullqa — Inca wisdom, NASA data | NASA Space Apps 2026**.
2. Visibilidad: **Público** o **No listado** (ambos funcionan sin login). No uses *Privado*.
3. Sube también los subtítulos en inglés como pista (*Subtítulos → Inglés*), además de los quemados en el video.
4. Descripción (en inglés): qué es la app, link `https://qullqa-five.vercel.app`, repo GitHub, datos usados (NASA POWER, GIBS, APOD, NASA Image Library; Open-Meteo; NOAA CPC) y la **declaración de IA** (ver abajo).
5. Abre el link en **ventana de incógnito** para confirmar que se ve sin iniciar sesión.

### Paso 7 — Formulario de Space Apps (30 min)
En spaceappschallenge.org → tu perfil → **My Team → Project → Edit**:
- **Project Name:** Qullqa
- **High-Level Summary:** 3–4 frases en inglés (tómalas del README).
- **Link to Project Demo:** link de YouTube.
- **Link to Final Project:** `https://qullqa-five.vercel.app` (y el repo GitHub en la descripción).
- **Detailed Description / NASA Data / Other References:** copia y adapta las secciones del README.
- **Use of SI:** declara cómo usaste IA (texto sugerido abajo).
- Guarda con **Save Progress** a menudo → marca *Terms and Conditions* y *Confirm All Work is Original* → **Submit for Judging** antes del domingo 15, 11:59 p. m.
- Opcional (recomendado): pedir la clasificación del sitio en **FortiGuard Web Filter** (categoría *Web-based application*, Company Name "N/A") para que el jurado no tenga bloqueos.

**Texto sugerido para declarar IA (inglés):**
> AI tools were used as development assistants: Claude (Anthropic) and Kiro helped write and review code, tests, illustrations drawn as SVG code, translations and documentation. The idea, the Inca-astronomy concept, design decisions and testing were done by the team. The app's in-app assistant is a local rule-based helper (no AI API calls in production). [If used: The voice-over / image X was AI-generated and is watermarked.]

---

## D. Cifras verificadas para usar en el video (datos reales)

- Cusco (NASA POWER 2001–2025): mejor siembra **noviembre**; cosecha Yungay **~abril** (~159 días). Canchán ~135 días · Huayro ~183 días.
- Lluvia: enero ~129 mm/mes vs. julio ~11 mm/mes. Heladas de mayo a octubre, hasta **−4.5 °C** en julio.
- El Niño (NOAA CPC, en vivo en la app): ONI **+2.46** (ago–oct 2026), Niño 1+2 **+5.25 °C** (oct 2026) → **El Niño muy fuerte**. Verifica el valor el día que grabes: la app lo actualiza sola.
- Marte (Yungay, 16 °C, 75 % agua): ~125 días con luz natural, ~75 días con LED.

---

## E. IA para imágenes y video (opcional, solo para las tomas de ambiente)

**Regla de oro:** el 80 % del video debe ser la **app real grabada** (eso es lo que evalúa el jurado). La IA sirve solo para 1–2 tomas de ambiente (0–10 s). Todo lo generado con IA lleva **marca de agua visible "AI-generated"** y se declara en la descripción. Sin logos NASA, sin niños, sin personas reales reconocibles.

| Para qué | Herramienta (revisa el plan gratuito vigente) | Nota |
|---|---|---|
| Imágenes | **Gemini** (Google), **ChatGPT** (imágenes), **Microsoft Designer / Bing Image Creator**, **Canva Magic Media** | Bing y Canva tienen opción gratis |
| Video corto (5–8 s) desde texto o desde una imagen | **Google Veo** (en Gemini / Flow), **Runway**, **Kling**, **Luma Dream Machine** | Créditos gratis limitados: genera pocas tomas y bien pensadas |
| Voz (si no usas la tuya) | Texto a voz de **Clipchamp** o **ElevenLabs** | Se debe declarar; mejor tu propia voz |
| Edición | **Clipchamp** (Windows 11) o **CapCut** | Ambos gratis; tienen subtítulos automáticos |

Las fotos reales de las Pléyades de la NASA (`public/sky/`) son mejores que una imagen de IA para la toma del cielo: son reales y de dominio público.

**Prompts listos (en inglés funcionan mejor):**

1. *Imagen — chacra andina al amanecer (toma 3–6 s):*
   > Photorealistic wide shot of terraced potato fields in the Peruvian Andes at dawn, around 3,800 m altitude, snowy peaks in the background, an adult farmer in a traditional woven poncho walking between furrows, golden light, no text, no logos.

2. *Imagen — el cielo inca (toma 6–10 s):*
   > Night sky over Andean mountains, the Pleiades star cluster bright above the horizon, an adult Quechua farmer seen from behind looking up at the stars, stone Inca terraces in the foreground, cinematic, no text, no logos.

3. *Video — animar la imagen 2 (image-to-video, 5 s):*
   > Slow camera push-in toward the Pleiades, stars twinkling gently, light wind moving the poncho, calm and cinematic.

4. *Imagen — Marte (toma final 25–28 s, opcional):*
   > A transparent dome greenhouse on the red surface of Mars with green potato plants growing inside under LED lights, Earth-like Andean terraces design, photorealistic, no text, no logos, no flags.

Después de generarlas: en Clipchamp o Canva agrega un texto pequeño **"AI-generated"** en una esquina, visible durante toda la toma.

---

## F. Checklist final

- [ ] Video ≤ 30 s, subtítulos en inglés legibles
- [ ] Sin logos NASA, sin menores de 18, IA marcada/declarada
- [ ] Link público probado en incógnito
- [ ] README con link del video y nombres del equipo
- [ ] Formulario completo y **Submit for Judging** enviado antes del domingo 15, 11:59 p. m.
