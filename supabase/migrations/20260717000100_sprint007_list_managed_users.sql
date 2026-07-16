-- Sprint 007 UI: list managed users for Super Admin User Management.

create or replace function public.list_managed_users()
returns table (
  id uuid,
  email text,
  full_name text,
  display_name text,
  company text,
  role text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = auth, public
as $$
  select
    p.id,
    u.email::text,
    p.full_name,
    p.display_name,
    p.company,
    p.role,
    p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  order by p.created_at desc;
$$;

revoke all on function public.list_managed_users() from public;
grant execute on function public.list_managed_users() to service_role;
