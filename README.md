# Majlis AI

Asistente de IA en árabe e inglés para reservas, pensado para Qatar. Prototipo en desarrollo.

- `landing/` — landing bilingüe con demo del agente y panel.
- `web-taller/` — web demo de un taller ficticio en Doha (EN/AR, RTL), con Leo (asistente de IA) y panel del dueño en `web-taller/panel/`.
- `supabase/` — migración y Edge Function de Majlis.
- `CLAUDE.md` — contexto, reglas y lista de tareas para Claude Code.

## Publicado (GitHub Pages)
Lo publica `.github/workflows/pages.yml` con cada push a `main` que toque `web-taller/`.

- Web: https://nexusforgeia.github.io/WHITEMOON-MAJLIS-AI/
- Panel del dueño (login real): https://nexusforgeia.github.io/WHITEMOON-MAJLIS-AI/panel/
- Panel en modo demo (sin Supabase): https://nexusforgeia.github.io/WHITEMOON-MAJLIS-AI/panel/?demo=1

## Desplegado en Supabase (`mlaqtniujnvfxcvcourm`, proyecto compartido con WhiteMoon)
Todo con prefijo `majlis`. No toca tablas ni funciones de otros productos.

| Pieza | Qué es |
|---|---|
| `majlis_services` | 7 servicios de la demo (id = `data-svc` de la web, nombre EN/AR, duración). |
| `majlis_bookings` | Citas. Estados `confirmed` / `done` / `cancelled`. Una restricción de exclusión impide dos citas solapadas. |
| `majlis_leads` | Clientes que no llegaron a reservar (prefieren que les llamen, o piden una persona). Estados `new` / `contacted` / `closed`. |
| `majlis_is_owner()` | `true` si el JWT lleva `app_metadata.majlis_role = 'owner'`. Lo usan las políticas RLS. |
| `majlis_touch_updated_at()` + trigger | Mantiene `majlis_bookings.updated_at`. |
| Edge Function `majlis-cita` | Pública (`--no-verify-jwt`). Acciones `slots`, `book` y `understand` (Claude `claude-haiku-4-5-20251001`). Usa el secreto `ANTHROPIC_API_KEY`, el mismo que `client-chat`. |

Migración: `supabase/migrations/20261015120000_majlis_init.sql` (aplicada como `majlis_init`).

Acceso:
- **Anónimo:** solo `INSERT` en `majlis_leads`, y solo en las columnas de un lead nuevo. Reservas a través de `majlis-cita`.
- **Autenticado:** lee y modifica citas y leads, y lee servicios, **solo** con `app_metadata.majlis_role = 'owner'`. Sin esa marca no ve nada, aunque tenga sesión en otro producto de WhiteMoon.
- Sin avisos externos (ni Telegram ni email): el panel es el único canal.

## Dar de alta a un dueño real
1. Supabase → Authentication → **Add user**: email del dueño y contraseña elegida por él (o «Send invite»). Marca *Auto confirm* si creas la contraseña tú.
2. SQL Editor:
   ```sql
   update auth.users
      set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"majlis_role":"owner"}'
    where email = 'EMAIL_DEL_DUEÑO';
   ```
3. El dueño entra en `/panel/` con su email y contraseña. Si ya tenía la sesión abierta, debe salir y volver a entrar para que el token lleve la marca.

Para retirar el acceso: el mismo `update` con `raw_app_meta_data - 'majlis_role'`. Las contraseñas nunca van al repo ni al chat.
