-- Majlis AI · panel pro (fase 2, modo real).
-- ADITIVA E IDEMPOTENTE: solo añade columnas, tablas, funciones, una vista y
-- políticas; no borra ni reescribe nada, y se puede ejecutar dos veces.
-- Todo con prefijo majlis_. No toca tablas de WhiteMoon.
--
-- Acceso: solo el dueño (public.majlis_is_owner(), app_metadata.majlis_role
-- = 'owner'). anon no recibe nada nuevo. Sin datos por defecto: ni precios
-- ni planes; los pone el dueño.

-- ---------------------------------------------------------------------------
-- 1. Cita: estado del vehículo, vehículo en texto libre y notas del taller
-- ---------------------------------------------------------------------------
alter table public.majlis_bookings add column if not exists work_status   text;
alter table public.majlis_bookings add column if not exists vehicle_label text;
alter table public.majlis_bookings add column if not exists notes         text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'majlis_bookings_work_status_chk') then
    alter table public.majlis_bookings add constraint majlis_bookings_work_status_chk
      check (work_status is null or work_status in ('received', 'diagnosing', 'parts', 'in_progress', 'ready', 'delivered'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'majlis_bookings_vehicle_label_chk') then
    alter table public.majlis_bookings add constraint majlis_bookings_vehicle_label_chk
      check (vehicle_label is null or char_length(vehicle_label) <= 80);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'majlis_bookings_notes_chk') then
    alter table public.majlis_bookings add constraint majlis_bookings_notes_chk
      check (notes is null or char_length(notes) <= 1000);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Historial de estados del vehículo
-- ---------------------------------------------------------------------------
create table if not exists public.majlis_status_log (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.majlis_bookings(id) on delete cascade,
  at          timestamptz not null default now(),
  from_status text check (from_status is null or from_status in ('received', 'diagnosing', 'parts', 'in_progress', 'ready', 'delivered')),
  to_status   text not null check (to_status in ('received', 'diagnosing', 'parts', 'in_progress', 'ready', 'delivered')),
  changed_by  uuid default auth.uid()
);
create index if not exists majlis_status_log_booking_idx on public.majlis_status_log (booking_id, at);

alter table public.majlis_status_log enable row level security;
revoke all on public.majlis_status_log from anon, authenticated;
grant select, insert on public.majlis_status_log to authenticated;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'majlis_status_log' and policyname = 'majlis_status_log_owner_read') then
    create policy majlis_status_log_owner_read on public.majlis_status_log
      for select to authenticated using ((select public.majlis_is_owner()));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'majlis_status_log' and policyname = 'majlis_status_log_owner_insert') then
    create policy majlis_status_log_owner_insert on public.majlis_status_log
      for insert to authenticated with check ((select public.majlis_is_owner()));
  end if;
end $$;

-- Cambio de estado atómico: actualiza la cita y deja la línea de historial
-- en la misma transacción. SECURITY INVOKER: corre con los permisos y el RLS
-- de quien llama, así que solo funciona para el dueño. "delivered" marca la
-- cita como atendida.
create or replace function public.majlis_set_work_status(p_booking uuid, p_to text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_from text;
begin
  if p_to not in ('received', 'diagnosing', 'parts', 'in_progress', 'ready', 'delivered') then
    raise exception 'invalid work status %', p_to using errcode = '22023';
  end if;
  select work_status into v_from from public.majlis_bookings where id = p_booking for update;
  if not found then
    raise exception 'booking not found' using errcode = 'P0002';
  end if;
  if v_from is not distinct from p_to then
    return;
  end if;
  update public.majlis_bookings
     set work_status = p_to,
         status = case when p_to = 'delivered' and status = 'confirmed' then 'done' else status end
   where id = p_booking;
  insert into public.majlis_status_log (booking_id, from_status, to_status) values (p_booking, v_from, p_to);
end
$$;
revoke execute on function public.majlis_set_work_status(uuid, text) from public, anon;
grant execute on function public.majlis_set_work_status(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Precios de servicio (opcionales, los pone el dueño; sin valores por defecto)
-- ---------------------------------------------------------------------------
alter table public.majlis_services add column if not exists price_qar numeric(10, 2);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'majlis_services_price_chk') then
    alter table public.majlis_services add constraint majlis_services_price_chk
      check (price_qar is null or price_qar >= 0);
  end if;
end $$;

-- El dueño solo puede cambiar el precio (no ids, nombres ni duraciones).
grant update (price_qar) on public.majlis_services to authenticated;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'majlis_services' and policyname = 'majlis_services_owner_update') then
    create policy majlis_services_owner_update on public.majlis_services
      for update to authenticated
      using ((select public.majlis_is_owner())) with check ((select public.majlis_is_owner()));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Planes de mantenimiento (para el MRR). Opcional: vacía hasta que el
--    dueño dé de alta un plan.
-- ---------------------------------------------------------------------------
create table if not exists public.majlis_plans (
  id              uuid primary key default gen_random_uuid(),
  customer_phone  text not null check (customer_phone ~ '^\+974 [3567][0-9]{3} [0-9]{4}$'),
  customer_name   text not null check (char_length(customer_name) between 2 and 80),
  fee_qar         numeric(10, 2) not null check (fee_qar > 0),
  started_on      date not null default current_date,
  ended_on        date,
  created_at      timestamptz not null default now(),
  check (ended_on is null or ended_on >= started_on)
);
create index if not exists majlis_plans_phone_idx on public.majlis_plans (customer_phone);

alter table public.majlis_plans enable row level security;
revoke all on public.majlis_plans from anon, authenticated;
grant select, insert, update on public.majlis_plans to authenticated;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'majlis_plans' and policyname = 'majlis_plans_owner_all') then
    create policy majlis_plans_owner_all on public.majlis_plans
      for all to authenticated
      using ((select public.majlis_is_owner())) with check ((select public.majlis_is_owner()));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Vista de clientes (agregada por móvil). security_invoker = on: hereda el
--    RLS de majlis_bookings, así que solo el dueño ve filas.
-- ---------------------------------------------------------------------------
create or replace view public.majlis_customers_v
with (security_invoker = on) as
select
  b.customer_phone                                                    as phone,
  (array_agg(b.customer_name order by b.start_at desc))[1]           as name,
  (array_agg(b.vehicle_label order by b.start_at desc)
     filter (where b.vehicle_label is not null))[1]                  as vehicle_label,
  count(*) filter (where b.status = 'done')                          as visits,
  max(b.start_at) filter (where b.status = 'done')                   as last_visit,
  min(b.start_at) filter (where b.status = 'confirmed' and b.start_at >= now()) as next_booking
from public.majlis_bookings b
group by b.customer_phone;

revoke all on public.majlis_customers_v from anon, authenticated;
grant select on public.majlis_customers_v to authenticated;
