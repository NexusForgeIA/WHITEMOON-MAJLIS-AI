-- Majlis AI · contadores de uso para majlis-cita (límites por IP y tope diario de Claude).
-- Solo la service role (Edge Function) los toca: RLS activo sin políticas y
-- sin privilegios para anon/authenticated. Las IPs no se guardan en claro:
-- el bucket lleva un hash SHA-256 truncado.

create table if not exists public.majlis_rate (
  bucket        text not null,          -- 'ip:<hash>' · 'claude:global'
  window_start  timestamptz not null,   -- inicio de la ventana (hora o día)
  hits          integer not null default 0,
  primary key (bucket, window_start)
);

alter table public.majlis_rate enable row level security;
revoke all on public.majlis_rate from anon, authenticated;

-- Suma uno al contador de la ventana y dice si sigue dentro del límite.
-- Atómico (INSERT … ON CONFLICT … RETURNING): dos llamadas simultáneas no
-- pueden leer el mismo valor. De paso borra ventanas de hace más de 2 días.
create or replace function public.majlis_rate_hit(p_bucket text, p_window timestamptz, p_limit integer)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  n integer;
begin
  insert into public.majlis_rate as r (bucket, window_start, hits)
  values (p_bucket, p_window, 1)
  on conflict (bucket, window_start) do update set hits = r.hits + 1
  returning r.hits into n;

  delete from public.majlis_rate where window_start < now() - interval '2 days';

  return n <= p_limit;
end
$$;

revoke execute on function public.majlis_rate_hit(text, timestamptz, integer) from public, anon, authenticated;
grant execute on function public.majlis_rate_hit(text, timestamptz, integer) to service_role;
