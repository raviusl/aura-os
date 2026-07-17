-- RIVA Sprint 011 — Identity & Membership
-- Workspace membership roles, membership status lifecycle, invitation reject.
-- RLS posture unchanged (see docs/SECURITY.md).

-- ---------------------------------------------------------------------------
-- Membership roles: owner, admin, member, viewer, guest
-- (legacy specialized roles retained for compatibility)
-- ---------------------------------------------------------------------------
insert into public.roles (key, label, description) values
  ('member', 'Member', 'Standard workspace member'),
  ('viewer', 'Viewer', 'Read-only workspace access'),
  ('guest', 'Guest', 'Limited guest access')
on conflict (key) do nothing;

insert into public.role_permissions (role_key, permission_key) values
  ('member', 'workspace.read'),
  ('member', 'company.read'),
  ('member', 'people.read'),
  ('member', 'project.read'),
  ('member', 'project.write'),
  ('viewer', 'workspace.read'),
  ('viewer', 'company.read'),
  ('viewer', 'people.read'),
  ('viewer', 'project.read'),
  ('guest', 'workspace.read'),
  ('guest', 'project.read')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Membership status: pending | accepted | suspended | removed
-- ---------------------------------------------------------------------------
update public.people set status = 'pending' where status = 'invited';
update public.people set status = 'accepted' where status = 'active';
update public.people set status = 'suspended' where status = 'disabled';
update public.people set status = 'removed' where status = 'archived';

alter table public.people
  drop constraint if exists people_status_check;

alter table public.people
  add constraint people_status_check
  check (status in ('pending', 'accepted', 'suspended', 'removed'));

alter table public.people
  alter column status set default 'pending';

-- One Auth user per workspace membership (when linked)
create unique index if not exists people_workspace_user_unique_idx
  on public.people (workspace_id, user_id)
  where user_id is not null;

-- ---------------------------------------------------------------------------
-- Invitation: add rejected; keep revoked for admin cancel
-- ---------------------------------------------------------------------------
alter table public.core_invitations
  drop constraint if exists core_invitations_status_check;

alter table public.core_invitations
  add constraint core_invitations_status_check
  check (status in ('pending', 'accepted', 'expired', 'revoked', 'rejected'));

alter table public.core_invitations
  add column if not exists rejected_at timestamptz;

alter table public.core_invitations
  add column if not exists rejected_by_user_id uuid references auth.users (id) on delete set null;

comment on column public.core_invitations.rejected_at is
  'Set when invitee rejects the invitation.';

comment on table public.people is
  'Unified people + workspace membership. Status is membership lifecycle.';
