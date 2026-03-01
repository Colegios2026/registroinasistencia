-- 005_teacher_public_absence_detail_split.sql
-- Speed up public teacher list by removing JSON aggregation from list RPC
-- and moving detailed affected tests to a dedicated RPC by absence.

drop function if exists public.teacher_get_public_absences(int, int, text, uuid);

create or replace function public.teacher_get_public_absences(
  p_month int,
  p_year int,
  p_level text default null,
  p_course_id uuid default null
)
returns table (
  absence_id uuid,
  student_name text,
  course_id uuid,
  course_name text,
  course_level text,
  start_date date,
  end_date date,
  status text,
  observation text,
  affected_tests_count int
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
    c.id as course_id,
    c.name as course_name,
    c.level as course_level,
    a.start_date,
    a.end_date,
    a.status,
    a.observation,
    coalesce(ta.affected_tests_count, 0)::int as affected_tests_count
  from public.absences a
  join public.students s on s.id = a.student_id
  join public.courses c on c.id = s.course_id
  left join lateral (
    select count(*)::int as affected_tests_count
    from public.tests t
    where t.course_id = c.id
      and t.date between a.start_date and a.end_date
      and t.date between v_month_start and v_month_end
  ) ta on true
  where a.start_date <= v_month_end
    and a.end_date >= v_month_start
    and (p_level is null or c.level = p_level)
    and (p_course_id is null or c.id = p_course_id)
  order by a.start_date desc, s.full_name asc;
end;
$$;

create or replace function public.teacher_get_public_absence_detail(
  p_absence_id uuid
)
returns table (
  id uuid,
  date date,
  subject text,
  type text
)
language sql
security definer
set search_path = public
as $$
  select
    t.id,
    t.date,
    t.subject,
    t.type
  from public.absences a
  join public.students s on s.id = a.student_id
  join public.tests t on t.course_id = s.course_id
  where a.id = p_absence_id
    and t.date between a.start_date and a.end_date
  order by t.date;
$$;

revoke all on function public.teacher_get_public_absences(int, int, text, uuid) from public;
grant execute on function public.teacher_get_public_absences(int, int, text, uuid) to anon, authenticated;

revoke all on function public.teacher_get_public_absence_detail(uuid) from public;
grant execute on function public.teacher_get_public_absence_detail(uuid) to anon, authenticated;

comment on function public.teacher_get_public_absences(int, int, text, uuid)
is 'Vista docente publica por mes/anio + filtros. Devuelve lista liviana sin JSON de detalle.';

comment on function public.teacher_get_public_absence_detail(uuid)
is 'Detalle de pruebas afectadas para una inasistencia de la vista docente publica.';
