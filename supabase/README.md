# Supabase

## Sprint 001 — apply schema repair (required)

Your project already has partial tables (`clients`, `tasks`, `wedding_projects`) with a different shape than Aura OS expects.

1. Open Supabase Dashboard → **SQL Editor**
2. Run this file in full:

`supabase/migrations/20260716000200_sprint001_schema_repair.sql`

This will:
- create missing `profiles`, `weddings`, `meetings`, `financial_records`
- add missing columns on empty `clients` / `tasks`
- enable RLS + profile bootstrap on signup

It will **not** drop `wedding_projects`.

## Auth notes

- Email signup is enabled on the project.
- `mailer_autoconfirm` is currently **false** — new users may need to confirm email before login unless you enable autoconfirm in Auth settings.
- Use a real email domain (addresses like `@example.com` are rejected by Supabase).

## Optional CLI

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```
