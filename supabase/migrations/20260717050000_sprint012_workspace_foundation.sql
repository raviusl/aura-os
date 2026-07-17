-- RIVA Sprint 012 — Workspace Foundation (Product Blueprint alignment)
-- memberships table, workspaces.owner_id, companies.type/logo_url, founder/sales roles.
-- RLS posture unchanged (see docs/SECURITY.md).

-- ---------------------------------------------------------------------------
-- Workspaces: owner_id
-- ---------------------------------------------------------------------------
alter table public.workspaces
  add column if not exists owner_id uuid references auth.users (id) on delete set null;

create index if not exists workspaces_owner_id_idx
  on public.workspaces (owner_id);

-- ---------------------------------------------------------------------------
-- Companies: type + logo_url
-- ---------------------------------------------------------------------------
alter table public.companies
  add column if not exists type text,
  add column if not exists logo_url text;

alter table public.companies
  drop constraint if exists companies_type_check;

alter table public.companies
  add constraint companies_type_check
  check (
    type is null
    or type in ('agency', 'brand', 'venue', 'corporate', 'wedding', 'other')
  );

alter table public.companies
  drop constraint if exists companies_logo_url_check;

alter table public.companies
  add constraint companies_logo_url_check
  check (
    logo_url is null
    or (
      char_length(logo_url) <= 2048
      and logo_url ~* '^https?://'
    )
  );

-- ---------------------------------------------------------------------------
-- Sprint 012 RBAC roles: Founder, Sales (+ existing Planner, Coordinator, Admin, Viewer)
-- ---------------------------------------------------------------------------
insert into public.roles (key, label, description) values
  ('founder', 'Founder', 'Workspace founder with full control'),
  ('sales', 'Sales', 'Sales and pipeline operations'),
  ('viewer', 'Viewer', 'Read-only workspace access')
on conflict (key) do nothing;

-- Founder inherits owner permissions
insert into public.role_permissions (role_key, permission_key)
select 'founder', permission_key
from public.role_permissions
where role_key = 'owner'
on conflict do nothing;

-- Sales: read + limited write
insert into public.role_permissions (role_key, permission_key) values
  ('sales', 'workspace.read'),
  ('sales', 'company.read'),
  ('sales', 'people.read'),
  ('sales', 'project.read'),
  ('sales', 'project.write')
on conflict do nothing;

-- Viewer permissions (if not already seeded via member)
insert into public.role_permissions (role_key, permission_key) values
  ('viewer', 'workspace.read'),
  ('viewer', 'company.read'),
  ('viewer', 'people.read'),
  ('viewer', 'project.read')
on conflict do nothing;

-- Map legacy owner assignments to founder
update public.person_roles
set role_key = 'founder'
where role_key = 'owner';

update public.core_invitations
set role_key = 'founder'
where role_key = 'owner';

-- ---------------------------------------------------------------------------
-- Memberships: User ↔ Workspace ↔ Company ↔ Role
-- ---------------------------------------------------------------------------
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  role_key text not null references public.roles (key) on delete restrict,
  email text not null,
  full_name text not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'suspended', 'removed')),
  person_id uuid references public.people (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists memberships_workspace_user_company_idx
  on public.memberships (workspace_id, user_id, company_id)
  where user_id is not null;

create unique index if not exists memberships_workspace_email_company_pending_idx
  on public.memberships (workspace_id, lower(email), company_id)
  where status = 'pending' and user_id is null;

create index if not exists memberships_user_id_idx
  on public.memberships (user_id);
create index if not exists memberships_workspace_id_idx
  on public.memberships (workspace_id);
create index if not exists memberships_company_id_idx
  on public.memberships (company_id);
create index if not exists memberships_status_idx
  on public.memberships (status);

drop trigger if exists memberships_set_updated_at on public.memberships;
create trigger memberships_set_updated_at
  before update on public.memberships
  for each row execute function public.set_updated_at();

-- Backfill owner_id from founder/owner people rows
update public.workspaces w
set owner_id = p.user_id
from public.people p
inner join public.person_roles pr on pr.person_id = p.id
where p.workspace_id = w.id
  and p.user_id is not null
  and p.status = 'accepted'
  and pr.role_key in ('founder', 'owner')
  and w.owner_id is null;

-- Backfill memberships from accepted people with company_id
insert into public.memberships (
  user_id,
  workspace_id,
  company_id,
  role_key,
  email,
  full_name,
  status,
  person_id
)
select
  p.user_id,
  p.workspace_id,
  coalesce(
    p.company_id,
    (
      select c.id
      from public.companies c
      where c.workspace_id = p.workspace_id
      order by c.created_at asc
      limit 1
    )
  ) as company_id,
  coalesce(
    (
      select pr.role_key
      from public.person_roles pr
      where pr.person_id = p.id
      order by case pr.role_key
        when 'founder' then 1
        when 'owner' then 1
        when 'admin' then 2
        else 3
      end
      limit 1
    ),
    'member'
  ) as role_key,
  p.email,
  p.full_name,
  p.status,
  p.id
from public.people p
where p.status in ('accepted', 'pending', 'suspended')
  and coalesce(
    p.company_id,
    (
      select c.id
      from public.companies c
      where c.workspace_id = p.workspace_id
      limit 1
    )
  ) is not null
  and not exists (
    select 1
    from public.memberships m
    where m.person_id = p.id
  );

-- RLS: deny by default; service role only (unchanged posture)
alter table public.memberships enable row level security;
revoke all on table public.memberships from anon, authenticated;
grant all on table public.memberships to service_role;

comment on table public.memberships is
  'Sprint 012: canonical User ↔ Workspace ↔ Company ↔ Role membership record.';

comment on column public.workspaces.owner_id is
  'Auth user who founded the workspace. Mirrors founder membership.';
