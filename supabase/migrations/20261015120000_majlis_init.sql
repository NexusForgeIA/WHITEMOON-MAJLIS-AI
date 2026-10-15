-- Majlis AI · esquema inicial (aislado con prefijo majlis_).
-- No toca ninguna tabla, función ni dato existente.
--
-- Acceso:
--   · anon: solo INSERT en majlis_leads, y solo en las columnas de un lead
--     nuevo (nombre, móvil, servicio, franja preferida, idioma). Reservas y
--     servicios pasan por la Edge Function majlis-cita (service role).
--   · authenticated: lee y modifica majlis_bookings / majlis_leads, y lee
--     majlis_services, SOLO si su app_metadata lleva majlis_role = 'owner'.
--     El proyecto de Supabase es compartido con el resto de WhiteMoon: sin
--     esta marca, cualquier usuario autenticado de otro producto vería las
--     citas de Majlis. app_metadata solo se escribe desde el servidor.

create or replace function public.majlis_is_owner()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select auth.jwt()) -> 'app_metadata' ->> 'majlis_role', '') = 'owner'
$$;

create table if not exists public.majlis_services (
  id            text primary key,              -- 'oil', 'brakes'… = data-svc de la web
  name_en       text not null,
  name_ar       text not null,
  duration_min  integer not null check (duration_min between 15 and 480),
  active        boolean not null default true,
  sort          integer not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.majlis_bookings (
  id              uuid primary key default gen_random_uuid(),
  service_id      text not null references public.majlis_services(id),
  customer_name   text not null check (char_length(customer_name) between 2 and 80),
  customer_phone  text not null check (customer_phone ~ '^\+974 [3567][0-9]{3} [0-9]{4}$'),
  start_at        timestamptz not null,
  end_at          timestamptz not null,
  -- confirmed: en agenda · done: atendida · cancelled: hueco liberado
  status          text not null default 'confirmed' check (status in ('confirmed', 'done', 'cancelled')),
  lang            text not null default 'en' check (lang in ('en', 'ar')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (end_at > start_at),
  -- Un solo puesto de trabajo en la demo: dos citas que ocupan agenda no
  -- pueden solaparse. La base de datos impide la doble reserva, también al
  -- mover una cita desde el panel.
  constraint majlis_bookings_no_overlap
    exclude using gist (tstzrange(start_at, end_at, '[)') with &&) where (status <> 'cancelled')
);
create index if not exists majlis_bookings_start_idx on public.majlis_bookings (start_at);

create table if not exists public.majlis_leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 2 and 80),
  phone       text not null check (phone ~ '^\+974 [3567][0-9]{3} [0-9]{4}$'),
  service_id  text references public.majlis_services(id),
  pref_date   date,
  pref_time   text check (pref_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  handoff     boolean not null default false,   -- pidió hablar con una persona
  lang        text not null default 'en' check (lang in ('en', 'ar')),
  -- new: sin atender · contacted: ya se le llamó · closed: cerrado
  status      text not null default 'new' check (status in ('new', 'contacted', 'closed'))
);
create index if not exists majlis_leads_created_idx on public.majlis_leads (created_at desc);

create or replace function public.majlis_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end
$$;
create trigger majlis_bookings_touch before update on public.majlis_bookings
  for each row execute function public.majlis_touch_updated_at();

alter table public.majlis_services enable row level security;
alter table public.majlis_bookings enable row level security;
alter table public.majlis_leads    enable row level security;

-- Privilegios de tabla: Supabase concede ALL a anon/authenticated por
-- defecto en public. Se recortan a lo que se usa; RLS filtra las filas.
revoke all on public.majlis_services, public.majlis_bookings, public.majlis_leads from anon, authenticated;
grant select on public.majlis_services to authenticated;
grant select, update on public.majlis_bookings to authenticated;
grant select, update on public.majlis_leads to authenticated;
grant insert (name, phone, service_id, pref_date, pref_time, handoff, lang) on public.majlis_leads to anon;

create policy majlis_services_owner_read on public.majlis_services
  for select to authenticated using ((select public.majlis_is_owner()));

create policy majlis_bookings_owner_read on public.majlis_bookings
  for select to authenticated using ((select public.majlis_is_owner()));
create policy majlis_bookings_owner_update on public.majlis_bookings
  for update to authenticated
  using ((select public.majlis_is_owner())) with check ((select public.majlis_is_owner()));

create policy majlis_leads_anon_insert on public.majlis_leads
  for insert to anon with check (status = 'new');
create policy majlis_leads_owner_read on public.majlis_leads
  for select to authenticated using ((select public.majlis_is_owner()));
create policy majlis_leads_owner_update on public.majlis_leads
  for update to authenticated
  using ((select public.majlis_is_owner())) with check ((select public.majlis_is_owner()));

insert into public.majlis_services (id, name_en, name_ar, duration_min, sort) values
  ('oil',     'Oil change',              'تغيير الزيت',        45,  1),
  ('service', 'General service',         'الصيانة الدورية',    60,  2),
  ('inspect', 'Pre-purchase inspection', 'فحص ما قبل الشراء',  60,  3),
  ('tyres',   'Tyres',                   'الإطارات',           45,  4),
  ('brakes',  'Brakes',                  'الفرامل',            120, 5),
  ('diag',    'Computer diagnostics',    'الفحص بالكمبيوتر',   60,  6),
  ('ac',      'Air conditioning',        'التكييف',            60,  7)
on conflict (id) do nothing;
