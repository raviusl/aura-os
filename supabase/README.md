# Supabase

## Auth — invitation only (required)

Aura OS does **not** allow public Sign Up.

1. Open **Supabase Dashboard → Authentication → Providers → Email**
2. **Disable** public sign-ups (“Enable sign ups”)
3. Keep email/password sign-in enabled
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/callback?next=/auth/update-password`
   - `http://localhost:3000/invite/accept`
   - (and the same paths for production `NEXT_PUBLIC_APP_URL`)

5. Run Sprint 007 migrations in SQL Editor (in order):

- `supabase/migrations/20260716000300_sprint007_invitations.sql`
- `supabase/migrations/20260716000400_sprint007_invitation_hardening.sql`
- `supabase/migrations/20260717000100_sprint007_list_managed_users.sql`

6. Run Sprint 009 Core Foundation migration:

- `supabase/migrations/20260717020000_sprint009_core_foundation.sql`

Bootstrap Super Admins via `SUPER_ADMIN_EMAILS` in `.env.local`.  
Set `NEXT_PUBLIC_APP_URL` to the public origin used in invite emails.  
Configure `RESEND_API_KEY` to send invitation emails (optional for local; invite URL is shown if unset).

See [docs/AUTH.md](../docs/AUTH.md).

## Sprint 001 — apply schema repair (required)

Your project already has partial tables (`clients`, `tasks`, `wedding_projects`) with a different shape than Aura OS expects.

1. Open Supabase Dashboard → **SQL Editor**
2. Run this file in full:

`supabase/migrations/20260716000200_sprint001_schema_repair.sql`

This will:
- create missing `profiles`, `weddings`, `meetings`, `financial_records`
- add missing columns on empty `clients` / `tasks`
- enable RLS + profile bootstrap on auth user creation

It will **not** drop `wedding_projects`.

## Optional CLI

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```
