# Majlis AI — contexto para Claude Code

Startup (nombre de trabajo **Majlis AI**) para Qatar: asistente de IA en **árabe e inglés** que atiende y reserva citas 24/7 para negocios con cita previa (clínicas, talleres, salones, spas…).
Objetivo inmediato: tener un MVP funcional para enseñar. Lo burocrático (QDB / Startup Qatar, sociedad, etc.) viene después.

## Qué hay en el repo
- `landing/` — landing bilingüe EN/AR (RTL) con demo funcional: chat de reservas por reglas + panel del dueño. HTML/CSS/JS sin frameworks. Textos en `app.js` (objeto `T`, claves en `data-i18n`).
- `web-taller/` — web de taller de coches recoloreada (blanco, azul `#0b3d91`, dorado `#c9a227`), con tarjetas de coches y capa holográfica (`holo.js`, CSS `.hl`). **Aún en español y con datos de Madrid.** El asistente `assets/js/leo.js` está **sin backend** (`SUPABASE_URL` vacío).

## Reglas (no negociables)
1. **Nunca conectar nada a los sistemas de WhiteMoon** (Supabase `mlaqtniujnvfxcvcourm`, Telegram, CDN, claves). Este proyecto tiene sus propios backend y secretos. Ninguna clave en el cliente.
2. **Sin datos inventados:** nada de testimonios, cifras de rendimiento, "30 años", precios reales ni logos ajenos. Los negocios de las demos son ficticios y se etiquetan así.
3. **Sin marcas de coches** en imágenes, textos o logos; sin matrículas visibles.
4. **Clean-room:** si se analiza una web de terceros, se replica comportamiento/idea con código propio; nunca copiar su código, diseño ni textos.
5. El chat se identifica siempre como **asistente de IA** (cabecera y primer mensaje).
6. Árabe: layout RTL real (`dir`, propiedades lógicas), fuente IBM Plex Sans Arabic. Los textos árabes los revisará un hablante nativo: marca los dudosos con `<!-- AR-REVIEW -->`.
7. Git: ramas y PR; commits `feat:` `fix:` `docs:` `refactor:`. No push a `main` para cambios grandes.
8. Calendario Qatar: laborable domingo–jueves; viernes y sábado cerrado por defecto. Móvil: +974, 8 dígitos. Moneda: QAR (no fijar precios).

## Tareas para Code (por orden)
1. **`web-taller/` a inglés + árabe:** i18n con selector EN/AR, RTL completo, datos de ejemplo de Doha (negocio ficticio, dirección genérica, horario dom–jue), QAR sin precios cerrados. Actualizar `leo.js` (textos, validación de teléfono +974, fechas por locale). Quitar restos de España/Madrid/ITV.
2. **Fotos de coches (Unsplash):** sustituir `assets/img/car-*.svg` por 7 fotos de coches de lujo, modelo reconocible y **sin marcas ni matrículas visibles**. Embeberlas en el repo (jpg/webp optimizadas, `width`/`height`), con créditos en `CREDITS.md`. Mantener la capa holográfica encima.
3. **Backend propio (Supabase nuevo):** tablas `services`, `bookings`, `leads` con RLS (INSERT anónimo, lectura solo `authenticated`); Edge Functions para huecos y reservas (`verify_jwt:false` solo en las públicas, CORS, secretos en Supabase Secrets); conectar `leo.js` y la landing.
4. **IA real:** Edge Function con Claude (`claude-haiku-4-5-20251001`) para entender texto libre en árabe e inglés; respuestas de máximo 3 frases, una pregunta cada vez; el LLM **no** inventa horarios ni precios (los huecos salen de la base de datos); derivación a persona.
5. **Panel del dueño** con login (Supabase Auth, nunca un gate en JS): agenda, cancelar/mover, exportar.
6. **Aviso al dueño** por el canal que se decida (Telegram/email) vía Edge Function, sin claves en cliente.
7. Calidad: Lighthouse móvil ≥ 85, accesibilidad, sin errores de consola, `prefers-reduced-motion`, sin desbordamiento horizontal en 390 px.

## Cómo probar en local
Sitio estático: `python3 -m http.server` dentro de `landing/` o `web-taller/`. No hay npm ni build.
