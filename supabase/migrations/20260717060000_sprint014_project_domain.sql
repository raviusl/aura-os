-- RIVA Sprint 014 — Project Domain
-- Adds owner_id to projects (required for project ownership tracking).
-- RLS posture unchanged (see docs/SECURITY.md).

alter table public.projects
  add column if not exists owner_id uuid references auth.users (id) on delete set null;

create index if not exists projects_owner_id_idx
  on public.projects (owner_id);

comment on column public.projects.owner_id is
  'Auth user who owns the project within the company.';
