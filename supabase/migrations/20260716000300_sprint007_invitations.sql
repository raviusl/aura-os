-- Aura OS Sprint 007: invitation system + audit log
-- Access via service role only (RLS enabled, no public policies).

create extension if not exists "pgcrypto";

-- Optional profile fields populated on invite accept
alter table public.profiles
  add column if not exists company text;

alter table public.profiles
  add column if not exists role text;

-- Invitations
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  company text not null,
  role text not null
    check (role in (
      'admin',
      'coordinator',
      'event_planner',
      'finance',
      'sales',
      'designer',
      'staff'
    )),
  token_hash text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'expired', 'revoked')),
  invited_by uuid not null references auth.users (id) on delete restrict,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_user_id uuid references auth.users (id) on delete set null,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invitations_email_idx on public.invitations (lower(email));
create index if not exists invitations_status_idx on public.invitations (status);
create index if not exists invitations_expires_at_idx on public.invitations (expires_at);

-- Audit log
create table if not exists public.invitation_audit_logs (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references public.invitations (id) on delete set null,
  action text not null
    check (action in (
      'created',
      'emailed',
      'email_failed',
      'accepted',
      'expired',
      'revoked',
      'resent'
    )),
  actor_id uuid references auth.users (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists invitation_audit_logs_invitation_id_idx
  on public.invitation_audit_logs (invitation_id);
create index if not exists invitation_audit_logs_created_at_idx
  on public.invitation_audit_logs (created_at desc);

-- updated_at trigger (reuse existing function if present)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists invitations_set_updated_at on public.invitations;
create trigger invitations_set_updated_at
  before update on public.invitations
  for each row execute function public.set_updated_at();

-- RLS: deny by default; service role bypasses RLS
alter table public.invitations enable row level security;
alter table public.invitation_audit_logs enable row level security;

revoke all on table public.invitations from anon, authenticated;
revoke all on table public.invitation_audit_logs from anon, authenticated;

grant all on table public.invitations to service_role;
grant all on table public.invitation_audit_logs to service_role;
