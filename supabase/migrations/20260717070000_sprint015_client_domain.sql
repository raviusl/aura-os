-- RIVA Sprint 015 — Client Domain
-- Core CRM clients (company/project scoped). V0 public.clients remains untouched.
-- RLS posture unchanged (see docs/SECURITY.md).

-- ---------------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------------
insert into public.permissions (key, description) values
  ('client.read', 'View clients'),
  ('client.write', 'Create and update clients')
on conflict (key) do nothing;

-- Founder / owner / admin inherit via existing broad grants where applicable.
-- Grant to roles that already have project access.
insert into public.role_permissions (role_key, permission_key)
select r.key, p.key
from public.roles r
cross join public.permissions p
where r.key in ('founder', 'owner', 'admin')
  and p.key in ('client.read', 'client.write')
on conflict do nothing;

insert into public.role_permissions (role_key, permission_key) values
  ('planner', 'client.read'),
  ('planner', 'client.write'),
  ('coordinator', 'client.read'),
  ('coordinator', 'client.write'),
  ('sales', 'client.read'),
  ('sales', 'client.write'),
  ('viewer', 'client.read'),
  ('finance', 'client.read'),
  ('vendor', 'client.read'),
  ('client', 'client.read')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- crm_clients (core Client domain — distinct from V0 public.clients)
-- ---------------------------------------------------------------------------
create table if not exists public.crm_clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  name text not null,
  email text,
  phone text,
  client_type text
    check (
      client_type is null
      or client_type in ('bride', 'groom', 'corporate', 'individual')
    ),
  status text not null default 'active'
    check (status in ('active', 'follow_up', 'archived')),
  follow_up_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_clients_workspace_id_idx
  on public.crm_clients (workspace_id);
create index if not exists crm_clients_company_id_idx
  on public.crm_clients (company_id);
create index if not exists crm_clients_project_id_idx
  on public.crm_clients (project_id);
create index if not exists crm_clients_company_status_idx
  on public.crm_clients (company_id, status);

drop trigger if exists crm_clients_set_updated_at on public.crm_clients;
create trigger crm_clients_set_updated_at
  before update on public.crm_clients
  for each row execute function public.set_updated_at();

alter table public.crm_clients enable row level security;
revoke all on table public.crm_clients from anon, authenticated;
grant all on table public.crm_clients to service_role;

comment on table public.crm_clients is
  'Sprint 015: core Client domain (Company + optional Project). Distinct from V0 public.clients.';
