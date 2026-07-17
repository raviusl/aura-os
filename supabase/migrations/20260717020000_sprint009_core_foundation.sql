-- RIVA Sprint 009 — Core Foundation
-- Workspace (root) → Company → People / Projects
-- Documentation/spec companion: docs/SPRINT009.md
-- No business modules (wedding/corporate/portal) in this migration.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Workspaces (tenant root container)
-- ---------------------------------------------------------------------------
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  status text not null default 'active'
    check (status in ('provisioning', 'active', 'suspended', 'archived')),
  timezone text not null default 'UTC',
  locale text not null default 'en',
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspaces_slug_unique unique (slug)
);

create index if not exists workspaces_status_idx on public.workspaces (status);

-- ---------------------------------------------------------------------------
-- Companies (belong to one Workspace; many per Workspace)
-- ---------------------------------------------------------------------------
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  slug text not null,
  status text not null default 'active'
    check (status in ('active', 'suspended', 'archived')),
  country text,
  timezone text,
  locale text,
  currency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_workspace_slug_unique unique (workspace_id, slug)
);

create index if not exists companies_workspace_id_idx on public.companies (workspace_id);
create index if not exists companies_workspace_status_idx
  on public.companies (workspace_id, status);

-- ---------------------------------------------------------------------------
-- Role catalog (extensible)
-- ---------------------------------------------------------------------------
create table if not exists public.roles (
  key text primary key,
  label text not null,
  description text,
  is_system boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  key text primary key,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_key text not null references public.roles (key) on delete cascade,
  permission_key text not null references public.permissions (key) on delete cascade,
  primary key (role_key, permission_key)
);

insert into public.roles (key, label, description) values
  ('owner', 'Owner', 'Full workspace control'),
  ('admin', 'Admin', 'Workspace and company administration'),
  ('planner', 'Planner', 'Plans and delivers projects'),
  ('coordinator', 'Coordinator', 'Coordinates execution'),
  ('finance', 'Finance', 'Finance and billing operations'),
  ('vendor', 'Vendor', 'External vendor participant'),
  ('client', 'Client', 'Client participant')
on conflict (key) do nothing;

insert into public.permissions (key, description) values
  ('workspace.read', 'View workspace'),
  ('workspace.write', 'Update workspace settings'),
  ('company.read', 'View companies in workspace'),
  ('company.write', 'Create and update companies'),
  ('people.read', 'View people'),
  ('people.write', 'Create and update people'),
  ('people.invite', 'Invite people into the workspace'),
  ('people.assign_role', 'Assign roles to people'),
  ('project.read', 'View projects'),
  ('project.write', 'Create and update projects'),
  ('permission.manage', 'Manage roles and permissions')
on conflict (key) do nothing;

insert into public.role_permissions (role_key, permission_key)
select r.key, p.key
from public.roles r
cross join public.permissions p
where r.key = 'owner'
on conflict do nothing;

insert into public.role_permissions (role_key, permission_key)
select 'admin', permission_key
from public.role_permissions
where role_key = 'owner'
  and permission_key <> 'permission.manage'
on conflict do nothing;

insert into public.role_permissions (role_key, permission_key) values
  ('planner', 'workspace.read'),
  ('planner', 'company.read'),
  ('planner', 'people.read'),
  ('planner', 'project.read'),
  ('planner', 'project.write'),
  ('coordinator', 'workspace.read'),
  ('coordinator', 'company.read'),
  ('coordinator', 'people.read'),
  ('coordinator', 'project.read'),
  ('coordinator', 'project.write'),
  ('finance', 'workspace.read'),
  ('finance', 'company.read'),
  ('finance', 'people.read'),
  ('finance', 'project.read'),
  ('vendor', 'workspace.read'),
  ('vendor', 'project.read'),
  ('client', 'workspace.read'),
  ('client', 'project.read')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Unified People model
-- ---------------------------------------------------------------------------
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid references public.companies (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  full_name text not null,
  status text not null default 'invited'
    check (status in ('invited', 'active', 'disabled', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint people_workspace_email_unique unique (workspace_id, email)
);

create index if not exists people_workspace_id_idx on public.people (workspace_id);
create index if not exists people_company_id_idx on public.people (company_id);
create index if not exists people_user_id_idx on public.people (user_id);
create index if not exists people_workspace_status_idx
  on public.people (workspace_id, status);

create table if not exists public.person_roles (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people (id) on delete cascade,
  role_key text not null references public.roles (key) on delete restrict,
  created_at timestamptz not null default now(),
  constraint person_roles_unique unique (person_id, role_key)
);

create index if not exists person_roles_person_id_idx on public.person_roles (person_id);
create index if not exists person_roles_role_key_idx on public.person_roles (role_key);

-- ---------------------------------------------------------------------------
-- Project skeleton (no business module logic)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  project_type text
    check (
      project_type is null
      or project_type in (
        'wedding',
        'corporate',
        'birthday',
        'concert',
        'exhibition',
        'other'
      )
    ),
  status text not null default 'draft'
    check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_workspace_id_idx on public.projects (workspace_id);
create index if not exists projects_company_id_idx on public.projects (company_id);
create index if not exists projects_workspace_status_idx
  on public.projects (workspace_id, status);

-- ---------------------------------------------------------------------------
-- Core invitations (invitation-only onboarding into People)
-- ---------------------------------------------------------------------------
create table if not exists public.core_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid references public.companies (id) on delete set null,
  email text not null,
  full_name text not null,
  role_key text not null references public.roles (key) on delete restrict,
  token_hash text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'expired', 'revoked')),
  invited_by_user_id uuid references auth.users (id) on delete set null,
  invited_person_id uuid references public.people (id) on delete set null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists core_invitations_one_pending_per_email_idx
  on public.core_invitations (workspace_id, lower(email))
  where status = 'pending';

create index if not exists core_invitations_workspace_id_idx
  on public.core_invitations (workspace_id);
create index if not exists core_invitations_status_idx
  on public.core_invitations (status);
create index if not exists core_invitations_expires_at_idx
  on public.core_invitations (expires_at);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists workspaces_set_updated_at on public.workspaces;
create trigger workspaces_set_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

drop trigger if exists people_set_updated_at on public.people;
create trigger people_set_updated_at
  before update on public.people
  for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists core_invitations_set_updated_at on public.core_invitations;
create trigger core_invitations_set_updated_at
  before update on public.core_invitations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: enabled, no tenant policies yet (deny-by-default + service_role only).
-- See docs/SECURITY.md — why deferred, when to introduce, migration strategy.
-- ---------------------------------------------------------------------------
alter table public.workspaces enable row level security;
alter table public.companies enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.people enable row level security;
alter table public.person_roles enable row level security;
alter table public.projects enable row level security;
alter table public.core_invitations enable row level security;

revoke all on table public.workspaces from anon, authenticated;
revoke all on table public.companies from anon, authenticated;
revoke all on table public.roles from anon, authenticated;
revoke all on table public.permissions from anon, authenticated;
revoke all on table public.role_permissions from anon, authenticated;
revoke all on table public.people from anon, authenticated;
revoke all on table public.person_roles from anon, authenticated;
revoke all on table public.projects from anon, authenticated;
revoke all on table public.core_invitations from anon, authenticated;

grant all on table public.workspaces to service_role;
grant all on table public.companies to service_role;
grant all on table public.roles to service_role;
grant all on table public.permissions to service_role;
grant all on table public.role_permissions to service_role;
grant all on table public.people to service_role;
grant all on table public.person_roles to service_role;
grant all on table public.projects to service_role;
grant all on table public.core_invitations to service_role;
