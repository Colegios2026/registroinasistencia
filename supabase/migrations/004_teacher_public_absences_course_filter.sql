-- 004_teacher_public_absences_course_filter.sql
-- Add optional course filter to the public teacher RPC.

drop function if exists public.teacher_get_public_absences(int, int, text);

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
    c.id as course_id,
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
    and (p_course_id is null or c.id = p_course_id)
  order by a.start_date desc, s.full_name asc;
end;
$$;

revoke all on function public.teacher_get_public_absences(int, int, text, uuid) from public;
grant execute on function public.teacher_get_public_absences(int, int, text, uuid) to anon, authenticated;

comment on function public.teacher_get_public_absences(int, int, text, uuid)
is 'Vista docente publica por mes/anio con opcion de filtrar por nivel y curso especifico.';
