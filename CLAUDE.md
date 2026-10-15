# Majlis AI — contexto para Claude Code

Startup (nombre de trabajo **Majlis AI**) para Qatar: asistente de IA en **árabe e inglés** que atiende y reserva citas 24/7 para negocios con cita previa (clínicas, talleres, salones, spas…).
Objetivo inmediato: tener un MVP funcional para enseñar. Lo burocrático (QDB / Startup Qatar, sociedad, etc.) viene después.

## Qué hay en el repo
- `landing/` — landing bilingüe EN/AR (RTL) con demo funcional: chat de reservas por reglas + panel del dueño. HTML/CSS/JS sin frameworks. Textos en `app.js` (objeto `T`, claves en `data-i18n`).
- `web-taller/` — web de taller de coches recoloreada (blanco, azul `#0b3d91`, dorado `#c9a227`), con tarjetas de coches y capa holográfica (`holo.js`, CSS `.hl`). En inglés con selector a árabe (RTL); negocio ficticio en Doha. El asistente `assets/js/leo.js` usa la Edge Function `majlis-cita`. Panel del dueño en `web-taller/panel/` (Supabase Auth; acceso con `app_metadata.majlis_role = 'owner'`).

## Reglas (no negociables)
1. **Mismo stack y reglas que WhiteMoon** (decidido por Cris, 2026-10-15). Este proyecto cuelga de WhiteMoon: HTML/CSS/JS vanilla, GitHub Pages, Supabase `mlaqtniujnvfxcvcourm`, Edge Functions, Claude `claude-haiku-4-5-20251001` y skills de `WHITEMOON-SKILLS-CLAUDE`. Aplican las reglas de WhiteMoon:
   - Todo lo de Majlis va **aislado con prefijo**: tablas `majlis_*`, funciones `majlis-*`. No tocar tablas, funciones ni datos de otros productos ni de clientes.
   - Leads en tabla propia `majlis_leads` (no en `leads_web`). **Sin avisos externos** (ni Telegram ni email, decidido por Cris 2026-10-15): el dueño ve citas y leads en su panel. Secretos en Supabase Secrets, **nunca** claves secretas en el cliente (la publicable sí, protegida por RLS).
   - Edge Functions públicas: `supabase functions deploy <nombre> --no-verify-jwt --project-ref mlaqtniujnvfxcvcourm`.
   - RLS en todas las tablas nuevas: INSERT anónimo solo donde haga falta; SELECT/UPDATE/DELETE solo `authenticated`. Toda VIEW con `security_invoker = on`. Ningún panel protegido con un gate en JS: login real con Supabase Auth.
   - Diseño y SEO/GEO según las skills (en `web-taller/` rige la paleta blanco, azul y dorado de este repo).
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
3. **Backend en el Supabase de WhiteMoon, con prefijo:** tablas `majlis_services`, `majlis_bookings`, `majlis_leads` con RLS; Edge Function `majlis-cita` (`--no-verify-jwt`, CORS, `ANTHROPIC_API_KEY` en Supabase Secrets, el mismo de `client-chat`); conectar `leo.js` y la landing. Antes de crear nada, consultar el esquema real con Supabase y no tocar lo existente.
4. **IA real:** Edge Function con Claude (`claude-haiku-4-5-20251001`) para entender texto libre en árabe e inglés; respuestas de máximo 3 frases, una pregunta cada vez; el LLM **no** inventa horarios ni precios (los huecos salen de la base de datos); derivación a persona.
5. **Panel del dueño** con login (Supabase Auth, nunca un gate en JS): agenda, cancelar/mover, exportar.
6. ~~Aviso al dueño~~ — descartado: el panel es el único canal.
7. Calidad: Lighthouse móvil ≥ 85, accesibilidad, sin errores de consola, `prefers-reduced-motion`, sin desbordamiento horizontal en 390 px.

## Cómo probar en local
Sitio estático: `python3 -m http.server` dentro de `landing/` o `web-taller/`. No hay npm ni build.
