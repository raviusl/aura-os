# Sprint 007

## Goal

Build a production-ready **Super Admin invitation management system**.

## Deliverables

- Settings → User Management (users table + invitations)
- Invite User dialog (Full Name, Email, Company, Role)
- Resend expired invitations / cancel pending invitations
- Secure hashed invitation tokens (72h expiry, single-use)
- Invitation email via Resend (with manual-link fallback)
- Accept invitation → create password → login
- Audit log for invitation lifecycle
- SQL migrations:
  - `20260716000300_sprint007_invitations.sql`
  - `20260716000400_sprint007_invitation_hardening.sql`
  - `20260717000100_sprint007_list_managed_users.sql`

## Explicit rules

- No public registration
- Only Super Admins can invite
- Token never stored in plaintext (SHA-256 hash only)
- Audit metadata must never include invitation tokens or invite URLs
- Invitation is claimed before Auth user creation (single-use under concurrency)

## Apply migrations

Run in Supabase SQL Editor (in order):

1. `supabase/migrations/20260716000300_sprint007_invitations.sql`
2. `supabase/migrations/20260716000400_sprint007_invitation_hardening.sql`
3. `supabase/migrations/20260717000100_sprint007_list_managed_users.sql`

Also set `NEXT_PUBLIC_APP_URL` to the public production origin before sending invites.
