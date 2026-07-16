# Sprint 007

## Goal

Build a production-ready **Super Admin invitation management system**.

## Deliverables

- Settings → User Management
- Invite User form (Full Name, Email, Company, Role)
- Secure hashed invitation tokens (72h expiry, single-use)
- Invitation email via Resend (with manual-link fallback)
- Accept invitation → create password → login
- Audit log for invitation lifecycle
- SQL migration `20260716000300_sprint007_invitations.sql`

## Explicit rules

- No public registration
- Only Super Admins can invite
- Token never stored in plaintext (SHA-256 hash only)

## Apply migration

Run in Supabase SQL Editor:

`supabase/migrations/20260716000300_sprint007_invitations.sql`
