-- Sprint 007 hardening: one pending invite per email + O(1) auth email lookup.

create unique index if not exists invitations_one_pending_per_email_idx
  on public.invitations (lower(email))
  where status = 'pending';

create or replace function public.auth_user_exists_by_email(p_email text)
returns boolean
language sql
stable
security definer
set search_path = auth, public
as $$
  select exists (
    select 1
    from auth.users
    where lower(email) = lower(trim(p_email))
  );
$$;

revoke all on function public.auth_user_exists_by_email(text) from public;
grant execute on function public.auth_user_exists_by_email(text) to service_role;
