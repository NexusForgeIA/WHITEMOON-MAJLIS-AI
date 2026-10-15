-- Majlis AI · esquema inicial (aislado con prefijo majlis_).
-- No toca ninguna tabla existente. leads_web se usa tal cual, desde las
-- Edge Functions con la service role.
--
-- Acceso:
--   · anon: NADA. El público solo habla con las Edge Functions majlis-cita y
--     majlis-notify, que escriben con la service role.
--   · authenticated: lectura y gestión solo con app_metadata.role = 'staff',
--     el mismo criterio que leads_web. El panel del dueño (tarea 5) definirá
--     su propio rol si hace falta.

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
  status          text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  lang            text not null default 'en' check (lang in ('en', 'ar')),
  created_at      timestamptz not null default now(),
  check (end_at > start_at),
  -- Un solo puesto de trabajo en la demo: dos citas confirmadas no pueden
  -- solaparse. La base de datos es la que impide la doble reserva, no el JS.
  constraint majlis_bookings_no_overlap
    exclude using gist (tstzrange(start_at, end_at, '[)') with &&) where (status = 'confirmed')
);

create index if not exists majlis_bookings_start_idx on public.majlis_bookings (start_at) where status = 'confirmed';

alter table public.majlis_services enable row level security;
alter table public.majlis_bookings enable row level security;

create policy majlis_services_staff on public.majlis_services
  for all to authenticated
  using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'staff')
  with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'staff');

create policy majlis_bookings_staff on public.majlis_bookings
  for all to authenticated
  using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'staff')
  with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'staff');

insert into public.majlis_services (id, name_en, name_ar, duration_min, sort) values
  ('oil',     'Oil change',              'تغيير الزيت',        45,  1),
  ('service', 'General service',         'الصيانة الدورية',    60,  2),
  ('inspect', 'Pre-purchase inspection', 'فحص ما قبل الشراء',  60,  3),
  ('tyres',   'Tyres',                   'الإطارات',           45,  4),
  ('brakes',  'Brakes',                  'الفرامل',            120, 5),
  ('diag',    'Computer diagnostics',    'الفحص بالكمبيوتر',   60,  6),
  ('ac',      'Air conditioning',        'التكييف',            60,  7)
on conflict (id) do nothing;
