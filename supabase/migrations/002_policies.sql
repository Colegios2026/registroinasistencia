-- 002_policies.sql
-- Policies RLS para staff/superuser.
-- Importante: este archivo asume que 001_init.sql ya fue ejecutado.

-- =========================
-- Limpieza de policies previas (idempotencia)
-- =========================

-- courses
drop policy if exists p_courses_staff_select on public.courses;
drop policy if exists p_courses_staff_insert on public.courses;
drop policy if exists p_courses_staff_update on public.courses;
drop policy if exists p_courses_superuser_delete on public.courses;

-- students
drop policy if exists p_students_staff_select on public.students;
drop policy if exists p_students_staff_insert on public.students;
drop policy if exists p_students_staff_update on public.students;
drop policy if exists p_students_superuser_delete on public.students;

-- absences
drop policy if exists p_absences_staff_select on public.absences;
drop policy if exists p_absences_staff_insert on public.absences;
drop policy if exists p_absences_staff_update on public.absences;
drop policy if exists p_absences_superuser_delete on public.absences;

-- tests
drop policy if exists p_tests_staff_select on public.tests;
drop policy if exists p_tests_staff_insert on public.tests;
drop policy if exists p_tests_staff_update on public.tests;
drop policy if exists p_tests_superuser_delete on public.tests;

-- inspectorate_records
drop policy if exists p_inspectorate_staff_select on public.inspectorate_records;
drop policy if exists p_inspectorate_staff_insert on public.inspectorate_records;
drop policy if exists p_inspectorate_staff_update on public.inspectorate_records;
drop policy if exists p_inspectorate_superuser_delete on public.inspectorate_records;

-- feriados_chile
drop policy if exists p_feriados_staff_select on public.feriados_chile;
drop policy if exists p_feriados_staff_insert on public.feriados_chile;
drop policy if exists p_feriados_staff_update on public.feriados_chile;
drop policy if exists p_feriados_superuser_delete on public.feriados_chile;

-- profiles
drop policy if exists p_profiles_self_select on public.profiles;
drop policy if exists p_profiles_superuser_select on public.profiles;
drop policy if exists p_profiles_superuser_insert on public.profiles;
drop policy if exists p_profiles_superuser_update on public.profiles;
drop policy if exists p_profiles_superuser_delete on public.profiles;

-- =========================
-- Staff + superuser: CRU en datos operativos
-- =========================

-- courses
create policy p_courses_staff_select
on public.courses
for select
to authenticated
using (public.is_staff());

create policy p_courses_staff_insert
on public.courses
for insert
to authenticated
with check (public.is_staff());

create policy p_courses_staff_update
on public.courses
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy p_courses_superuser_delete
on public.courses
for delete
to authenticated
using (public.is_superuser());

-- students
create policy p_students_staff_select
on public.students
for select
to authenticated
using (public.is_staff());

create policy p_students_staff_insert
on public.students
for insert
to authenticated
with check (public.is_staff());

create policy p_students_staff_update
on public.students
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy p_students_superuser_delete
on public.students
for delete
to authenticated
using (public.is_superuser());

-- absences
create policy p_absences_staff_select
on public.absences
for select
to authenticated
using (public.is_staff());

create policy p_absences_staff_insert
on public.absences
for insert
to authenticated
with check (public.is_staff());

create policy p_absences_staff_update
on public.absences
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy p_absences_superuser_delete
on public.absences
for delete
to authenticated
using (public.is_superuser());

-- tests
create policy p_tests_staff_select
on public.tests
for select
to authenticated
using (public.is_staff());

create policy p_tests_staff_insert
on public.tests
for insert
to authenticated
with check (public.is_staff());

create policy p_tests_staff_update
on public.tests
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy p_tests_superuser_delete
on public.tests
for delete
to authenticated
using (public.is_superuser());

-- inspectorate_records
create policy p_inspectorate_staff_select
on public.inspectorate_records
for select
to authenticated
using (public.is_staff());

create policy p_inspectorate_staff_insert
on public.inspectorate_records
for insert
to authenticated
with check (public.is_staff());

create policy p_inspectorate_staff_update
on public.inspectorate_records
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy p_inspectorate_superuser_delete
on public.inspectorate_records
for delete
to authenticated
using (public.is_superuser());

-- feriados_chile (opcional operacion interna)
create policy p_feriados_staff_select
on public.feriados_chile
for select
to authenticated
using (public.is_staff());

create policy p_feriados_staff_insert
on public.feriados_chile
for insert
to authenticated
with check (public.is_staff());

create policy p_feriados_staff_update
on public.feriados_chile
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy p_feriados_superuser_delete
on public.feriados_chile
for delete
to authenticated
using (public.is_superuser());

-- =========================
-- Profiles: administracion de roles
-- =========================

-- Usuario autenticado puede ver su propio profile (util para UI de sesion)
create policy p_profiles_self_select
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy p_profiles_superuser_select
on public.profiles
for select
to authenticated
using (public.is_superuser());

create policy p_profiles_superuser_insert
on public.profiles
for insert
to authenticated
with check (public.is_superuser());

create policy p_profiles_superuser_update
on public.profiles
for update
to authenticated
using (public.is_superuser())
with check (public.is_superuser());

create policy p_profiles_superuser_delete
on public.profiles
for delete
to authenticated
using (public.is_superuser());

-- =========================
-- Comentarios operativos
-- =========================

-- Asignar rol staff:
-- update public.profiles set role = 'staff' where user_id = '<UUID_DEL_USUARIO>';
--
-- Asignar rol superuser:
-- update public.profiles set role = 'superuser' where user_id = '<UUID_DEL_USUARIO>';
--
-- Volver a teacher:
-- update public.profiles set role = 'teacher' where user_id = '<UUID_DEL_USUARIO>';

