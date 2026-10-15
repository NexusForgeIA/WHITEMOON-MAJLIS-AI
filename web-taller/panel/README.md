# Panel del dueño (demo Example Garage)

- Login real con Supabase Auth (email y contraseña). Los datos los protege RLS, no este JS.
- Acceso: usuario autenticado **con** `app_metadata.majlis_role = 'owner'`. El proyecto de Supabase es compartido con WhiteMoon; sin esa marca ningún otro usuario ve las citas.
- Citas (`majlis_bookings`): filtro por día y estado, marcar atendida, mover (huecos de `majlis-cita`), cancelar, exportar CSV.
- Leads sin cita (`majlis_leads`): nuevo → contactado → cerrado.
- Refresco cada 30 s con la pestaña visible, y botón «Refresh».
- EN/AR con RTL; horas en Doha (UTC+3).

## Dar de alta a un dueño
1. Supabase → Authentication → Add user (email + contraseña, «Auto confirm»).
2. SQL:
   ```sql
   update auth.users
      set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"majlis_role":"owner"}'
    where email = 'EMAIL_DEL_DUEÑO';
   ```
La contraseña nunca va al repo ni al chat.

## Modo demo (`?demo=1`)
- Botón «Try the demo» en el login, o `panel/?demo=1`.
- Datos ficticios **en memoria** (10 citas en días dom–jue alrededor de hoy, 3 leads; móviles `+974 5000 00xx`). Al recargar vuelven al estado inicial.
- **No toca Supabase**: ni siquiera se descarga supabase-js; no hay login, lecturas, escrituras ni llamadas a `majlis-cita`. Solo se cambia la capa de datos (`storeDemo` en lugar de `storeReal`), así que no da acceso a nada real.
- Todo funciona igual que en real: filtros, atendida, mover (los huecos ocupados salen tachados y avisan), cancelar, CSV (`demo-bookings-*.csv`), leads, EN/AR.
- Banner fijo «DEMO · sample data, nothing is saved or sent» (árabe marcado `AR-REVIEW`).

## Panel pro (fase 1, solo demo)
Pestañas: **Overview** (KPI y ocupación), **Calendar** (semana/día), **Workshop** (estado del vehículo), **Bookings**, **Customers** y **Leads**. En modo real, hasta la fase 2, solo se ven Bookings y Leads (`store.caps` en `data.js`): nada de inventar datos.

- **Calendario:** semana de domingo a jueves (viernes y sábado salen como cerrados) y vista de día. Las citas son bloques por franja, con color por estado; clic → ficha. Con ratón se arrastran a otra franja: el indicador sale verde si está libre y rojo si está ocupada, y una franja ocupada se rechaza. En táctil se mueve con «Move» desde la ficha o la lista.
- **Taller:** Received → Diagnosing → Waiting for parts → In progress → Ready → Delivered. Cada cambio añade una línea al historial (hora de Doha) y enseña el mensaje de ejemplo para el cliente, en el idioma en que reservó. **Solo se muestra; no se envía nada.**
- **Ficha / orden de trabajo:** cliente, móvil, servicio, vehículo en texto libre (sin matrícula), notas del taller, estado e historial. «Print / PDF» imprime solo la orden (`@media print`). Enlace directo: `#card=<id>`.
- **Resumen:** citas de hoy y de la semana, vehículos en taller, ocupación %, leads nuevos y tasa de cancelación (30 días). Gráfica de ocupación por día. Ingresos del mes y MRR solo en demo, con la etiqueta fija «Sample figures».
- **Clientes:** visitas, última visita, próximo servicio recomendado (regla de ejemplo: 10.000 km o 6 meses) y recordatorio simulado.
- **Enlaces directos:** `?demo=1&lang=ar#tab=calendar`.

Ficheros: `i18n.js` (textos), `data.js` (capas real/demo), `panel.js` (esqueleto, citas, leads), `view-*.js` (una vista por fichero). Sin librerías: gráficas, arrastre e impresión son código propio.
