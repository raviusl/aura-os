# Supabase

## Auth — invitation only (required)

Aura OS does **not** allow public Sign Up.

1. Open **Supabase Dashboard → Authentication → Providers → Email**
2. **Disable** public sign-ups (“Enable sign ups”)
3. Keep email/password sign-in enabled
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/callback?next=/auth/update-password`
   - (and the same paths for production `NEXT_PUBLIC_APP_URL`)

Bootstrap Super Admins via `SUPER_ADMIN_EMAILS` in `.env.local` (see `.env.example` and [docs/AUTH.md](../docs/AUTH.md)).

New users are created only by Super Admin invite (`inviteUser` server module) — UI for Invite User comes later.

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
