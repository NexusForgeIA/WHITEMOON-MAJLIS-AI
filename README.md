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
| `majlis_rate` + `majlis_rate_hit()` | Contadores de uso de `majlis-cita`, por IP (hash, nunca en claro) y por día. Solo los usa la service role: RLS sin políticas, sin privilegios para anon ni authenticated. Se limpian solos a los 2 días. |
| Edge Function `majlis-cita` | Pública (`--no-verify-jwt`). Acciones `slots`, `book` y `understand` (Claude `claude-haiku-4-5-20251001`). Usa el secreto `ANTHROPIC_API_KEY`, el mismo que `client-chat`. |

Migraciones: `supabase/migrations/20261015120000_majlis_init.sql` (`majlis_init`) y `20261015170000_majlis_rate.sql` (`majlis_rate`).

Límites de `majlis-cita` (constantes al principio del fichero):
- Texto libre (`understand`): 20 mensajes por IP y hora, y 500 llamadas a Claude al día en total. Pasado el límite responde con un mensaje amable en EN/AR y **no** llama al modelo.
- Reservas (`book`): como máximo 3 citas confirmadas futuras por móvil y 30 futuras en total. Pasado eso no reserva: guarda un lead en `majlis_leads` y Leo dice «te llamamos».
- Buscadores: `noindex, nofollow` en la web y en el panel. El `robots.txt` de `web-taller/` se publica en `/WHITEMOON-MAJLIS-AI/robots.txt`, pero los buscadores solo leen el de la raíz del dominio, así que lo que protege de verdad es el `noindex`.

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
