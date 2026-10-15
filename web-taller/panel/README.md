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
