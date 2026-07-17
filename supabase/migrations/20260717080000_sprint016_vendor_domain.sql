-- RIVA Sprint 016 — Vendor Domain
-- Company-scoped vendors with optional project assignment.
-- RLS posture unchanged (see docs/SECURITY.md).

-- ---------------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------------
insert into public.permissions (key, description) values
  ('vendor.read', 'View vendors'),
  ('vendor.write', 'Create and update vendors')
on conflict (key) do nothing;

insert into public.role_permissions (role_key, permission_key)
select r.key, p.key
from public.roles r
cross join public.permissions p
where r.key in ('founder', 'owner', 'admin')
  and p.key in ('vendor.read', 'vendor.write')
on conflict do nothing;

insert into public.role_permissions (role_key, permission_key) values
  ('planner', 'vendor.read'),
  ('planner', 'vendor.write'),
  ('coordinator', 'vendor.read'),
  ('coordinator', 'vendor.write'),
  ('sales', 'vendor.read'),
  ('sales', 'vendor.write'),
  ('viewer', 'vendor.read'),
  ('finance', 'vendor.read'),
  ('vendor', 'vendor.read')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- vendors
-- ---------------------------------------------------------------------------
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  name text not null,
  email text,
  phone text,
  category text
    check (
      category is null
      or category in (
        'photographer',
        'videographer',
        'decorator',
        'makeup_artist',
        'live_band',
        'emcee',
        'venue',
        'catering',
        'florist',
        'others'
      )
    ),
  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vendors_workspace_id_idx on public.vendors (workspace_id);
create index if not exists vendors_company_id_idx on public.vendors (company_id);
create index if not exists vendors_project_id_idx on public.vendors (project_id);
create index if not exists vendors_company_status_idx
  on public.vendors (company_id, status);
create index if not exists vendors_company_category_idx
  on public.vendors (company_id, category);

drop trigger if exists vendors_set_updated_at on public.vendors;
create trigger vendors_set_updated_at
  before update on public.vendors
  for each row execute function public.set_updated_at();

alter table public.vendors enable row level security;
revoke all on table public.vendors from anon, authenticated;
grant all on table public.vendors to service_role;

comment on table public.vendors is
  'Sprint 016: Vendor domain (Company + optional Project).';
