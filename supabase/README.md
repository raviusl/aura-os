# Supabase

## Apply Sprint 001 schema

1. Open Supabase Dashboard → **SQL Editor**
2. Paste and run:

`supabase/migrations/20260716000100_sprint001_command_center.sql`

This creates `profiles`, `clients`, `weddings`, `meetings`, `tasks`, `financial_records`, RLS policies, and the auth profile trigger.

## Local CLI (optional)

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```
