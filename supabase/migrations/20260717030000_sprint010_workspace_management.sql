-- RIVA Sprint 010 — Workspace Management
-- Extends workspaces: status lifecycle, settings fields, custom domain prep.
-- No permanent delete. RLS posture unchanged (see docs/SECURITY.md).

-- ---------------------------------------------------------------------------
-- Status: pending | active | suspended | archived
-- (replaces Sprint 009 "provisioning" with "pending")
-- ---------------------------------------------------------------------------
update public.workspaces
set status = 'pending'
where status = 'provisioning';

alter table public.workspaces
  drop constraint if exists workspaces_status_check;

alter table public.workspaces
  add constraint workspaces_status_check
  check (status in ('pending', 'active', 'suspended', 'archived'));

-- ---------------------------------------------------------------------------
-- Settings + future custom domain
-- ---------------------------------------------------------------------------
alter table public.workspaces
  add column if not exists country text,
  add column if not exists logo_url text,
  add column if not exists custom_domain text;

alter table public.workspaces
  drop constraint if exists workspaces_country_check;

alter table public.workspaces
  add constraint workspaces_country_check
  check (country is null or country ~ '^[A-Z]{2}$');

alter table public.workspaces
  drop constraint if exists workspaces_logo_url_check;

alter table public.workspaces
  add constraint workspaces_logo_url_check
  check (
    logo_url is null
    or (
      char_length(logo_url) <= 2048
      and logo_url ~* '^https?://'
    )
  );

alter table public.workspaces
  drop constraint if exists workspaces_custom_domain_check;

alter table public.workspaces
  add constraint workspaces_custom_domain_check
  check (
    custom_domain is null
    or (
      char_length(custom_domain) <= 253
      and custom_domain = lower(custom_domain)
      and custom_domain !~ '\s'
    )
  );

create unique index if not exists workspaces_custom_domain_unique_idx
  on public.workspaces (custom_domain)
  where custom_domain is not null;

comment on column public.workspaces.custom_domain is
  'Reserved for future custom domain routing. Not provisioned in Sprint 010.';

comment on column public.workspaces.logo_url is
  'Public HTTPS URL for workspace logo. Upload/storage pipeline comes later.';
