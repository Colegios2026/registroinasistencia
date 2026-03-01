-- 001_init.sql
-- Backend base en Supabase para:
-- - Nivel 1 docente publico (sin login) via vista/RPC de solo lectura
-- - Nivel 2 staff (auth) con CRU en datos operativos
-- - Nivel 3 superuser (auth) con privilegios de administracion

create extension if not exists "uuid-ossp";

-- =========================
-- Tablas base
-- =========================

create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  position int,
  level text check (level in ('BASICA', 'MEDIA')),
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  course_id uuid references public.courses(id) on delete set null,
  rut text null,
  created_at timestamptz not null default now()
);

create table if not exists public.absences (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) on delete set null,
  start_date date not null,
  end_date date not null,
  observation text null,
  document_url text null,
  status text not null default 'PENDIENTE',
  created_at timestamptz not null default now(),
  constraint absences_status_check check (status in ('PENDIENTE', 'JUSTIFICADA')),
  constraint absences_date_range_check check (end_date >= start_date)
);

create table if not exists public.tests (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete set null,
  date date not null,
  subject text not null,
  type text not null,
  description text null,
  created_at timestamptz not null default now()
);

create table if not exists public.inspectorate_records (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) on delete set null,
  date_time timestamptz not null,
  observation text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.feriados_chile (
  fecha date primary key,
  descripcion text not null,
  es_irrenunciable boolean not null default false
);

-- =========================
-- Perfiles y roles app
-- =========================

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('teacher', 'staff', 'superuser')),
  created_at timestamptz not null default now()
);

-- Rol actual segun auth.uid(); para anon se resuelve a teacher.
create or replace function public.current_role()
returns text
language sql
stable
set search_path = public
as $$
  select coalesce(
    (select p.role from public.profiles p where p.user_id = auth.uid()),
    'teacher'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
set search_path = public
as $$
  select public.current_role() in ('staff', 'superuser');
$$;

create or replace function public.is_superuser()
returns boolean
language sql
stable
set search_path = public
as $$
  select public.current_role() = 'superuser';
$$;

-- Crea profile por defecto al crear usuario auth (default role = teacher)
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, role)
  values (new.id, 'teacher')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row
execute function public.handle_new_user_profile();

-- =========================
-- Vista docente publica (sin RUT ni document_url)
-- =========================

create or replace view public.teacher_public_view as
select
  a.id as absence_id,
  s.full_name as student_name,
  c.name as course_name,
  c.level as course_level,
  a.start_date,
  a.end_date,
  a.status,
  a.observation
from public.absences a
join public.students s on s.id = a.student_id
join public.courses c on c.id = s.course_id;

-- =========================
-- RPC publica (security definer) para vista docente + pruebas afectadas
-- =========================
-- Criterio mensual de ausencias:
--   se incluyen ausencias que se superponen al mes:
--   a.start_date <= fin_mes AND a.end_date >= inicio_mes

create or replace function public.teacher_get_public_absences(
  p_month int,
  p_year int,
  p_level text default null
)
returns table (
  absence_id uuid,
  student_name text,
  course_name text,
  course_level text,
  start_date date,
  end_date date,
  status text,
  observation text,
  affected_tests_count int,
  affected_tests_json jsonb
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_month_start date;
  v_month_end date;
begin
  if p_month is null or p_month < 1 or p_month > 12 then
    raise exception 'p_month must be between 1 and 12';
  end if;
  if p_year is null or p_year < 2000 or p_year > 2100 then
    raise exception 'p_year must be between 2000 and 2100';
  end if;

  v_month_start := make_date(p_year, p_month, 1);
  v_month_end := (v_month_start + interval '1 month - 1 day')::date;

  return query
  select
    a.id as absence_id,
    s.full_name as student_name,
    c.name as course_name,
    c.level as course_level,
    a.start_date,
    a.end_date,
    a.status,
    a.observation,
    coalesce(ta.affected_tests_count, 0)::int as affected_tests_count,
    coalesce(ta.affected_tests_json, '[]'::jsonb) as affected_tests_json
  from public.absences a
  join public.students s on s.id = a.student_id
  join public.courses c on c.id = s.course_id
  left join lateral (
    select
      count(*)::int as affected_tests_count,
      jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'date', t.date,
          'subject', t.subject,
          'type', t.type
        )
        order by t.date
      ) as affected_tests_json
    from public.tests t
    where t.course_id = c.id
      and t.date between a.start_date and a.end_date
      and t.date between v_month_start and v_month_end
  ) ta on true
  where a.start_date <= v_month_end
    and a.end_date >= v_month_start
    and (p_level is null or c.level = p_level)
  order by a.start_date desc, s.full_name asc;
end;
$$;

-- =========================
-- Indices recomendados
-- =========================

create index if not exists idx_tests_course_date
  on public.tests(course_id, date);

create index if not exists idx_absences_student_dates
  on public.absences(student_id, start_date, end_date);

create index if not exists idx_students_course
  on public.students(course_id);

-- =========================
-- RLS ON
-- =========================

alter table public.courses enable row level security;
alter table public.students enable row level security;
alter table public.absences enable row level security;
alter table public.tests enable row level security;
alter table public.inspectorate_records enable row level security;
alter table public.feriados_chile enable row level security;
alter table public.profiles enable row level security;

-- =========================
-- Grants de interfaz publica SOLO por RPC (sin SELECT anon en vistas/tablas)
-- =========================

revoke all on public.teacher_public_view from public;
revoke all on public.teacher_public_view from anon;
revoke all on public.teacher_public_view from authenticated;
grant select on public.teacher_public_view to authenticated;

revoke all on function public.teacher_get_public_absences(int, int, text) from public;
grant execute on function public.teacher_get_public_absences(int, int, text) to anon, authenticated;

comment on function public.teacher_get_public_absences(int, int, text)
is 'RPC publico para nivel docente sin login. Expone datos minimos de ausencia + pruebas afectadas.';
