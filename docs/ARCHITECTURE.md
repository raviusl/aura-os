# Architecture

High-level system architecture for Aura OS. This document describes the foundation stack only.

## Overview

```text
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                    │
│              Next.js App Router + React                 │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 Next.js (Frontend / BFF)                │
│  App Router · Middleware · Server Components · Routes   │
└───────────────────────────┬─────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        Supabase Auth   PostgreSQL   Supabase Storage
              │             │             │
              └─────────────┴─────────────┘
                            │
                     Supabase Platform
```

## Frontend

- **Next.js** (App Router)
- React + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query for client data fetching
- React Hook Form + Zod for forms and validation

Application code lives under `src/`:

| Area | Role |
| --- | --- |
| `src/app/` | Routes, layouts, API handlers |
| `src/features/` | Domain modules (auth, dashboard, …) |
| `src/components/` | Shared UI and layout |
| `src/lib/supabase/` | Browser, server, admin, and middleware clients |
| `src/config/` | Site and i18n configuration |
| `src/types/` | Shared types including database shapes |

## Backend

- **Supabase** as the backend platform
- Data access from the Next.js app via `@supabase/ssr` and `@supabase/supabase-js`
- Row Level Security (RLS) enforces per-user data isolation in PostgreSQL
- No separate custom API server in the current foundation

## Storage

- **Supabase Storage** for files and media (planned for Phase 2: uploads, gallery)
- Not yet wired into product features in Sprint 001 / 002

## Database

- **PostgreSQL** (hosted by Supabase)
- Schema managed via SQL migrations in `supabase/migrations/`
- See [DATABASE.md](./DATABASE.md) for current tables

## Authentication

- **Supabase Auth**
- Email-based sign-up / sign-in
- Session refresh via Next.js middleware (`src/middleware.ts` → `src/lib/supabase/middleware.ts`)
- Auth callback exchange at `src/app/auth/callback/route.ts`
- `public.profiles` extends `auth.users` (auto-created on signup)

## Security model

- RLS enabled on all public business tables
- Policies scope rows to `auth.uid()` (owner `user_id` or profile `id`)
- Service-role / admin client exists for privileged server operations only (`src/lib/supabase/admin.ts`)

## Environment

Required client/server env vars (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)

## Out of scope for Sprint 002

- New business features
- Schema or migration changes
- UI redesign
