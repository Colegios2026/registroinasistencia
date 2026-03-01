-- 003_role_resolution_fix.sql
-- Hace que la resolución de rol sea autoritativa y estable para frontend auth.

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.role from public.profiles p where p.user_id = auth.uid()),
    'teacher'
  );
$$;

revoke all on function public.current_role() from public;
grant execute on function public.current_role() to anon, authenticated;

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

comment on function public.current_role() is
'Resuelve rol por auth.uid() contra public.profiles. SECURITY DEFINER para evitar falsos teacher por RLS.';

