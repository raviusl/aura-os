# RIVA OS

AI Operating System for Service Businesses.

## Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (`@supabase/ssr`)
- TanStack Query
- React Hook Form + Zod

## Prerequisites

- [Homebrew](https://brew.sh)
- Node.js 22+ (`brew install node`)
- Supabase CLI (optional, for local DB / typegen): `brew install supabase/tap/supabase`

## Getting started

1. Copy environment variables (already created locally as `.env.local` if you followed setup):

```bash
cp .env.example .env.local
```

2. Fill in your Supabase project values from **Project Settings → API**.

3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```text
src/
  app/                 # App Router (route groups, API, auth callback)
  components/
    ui/                # shadcn/ui primitives
    providers/         # App-wide providers (TanStack Query, toasts)
    layout/            # Shared app chrome
  features/            # Domain modules (auth, …)
  lib/
    supabase/          # Browser, server, admin, middleware clients
    env.ts             # Zod-validated environment access
  config/              # App/site configuration
  hooks/               # Shared hooks
  types/               # Shared types (incl. Database placeholder)
supabase/
  migrations/          # SQL migrations
```

## Supabase

- Browser client: `src/lib/supabase/client.ts`
- Server client: `src/lib/supabase/server.ts`
- Admin (service role): `src/lib/supabase/admin.ts`
- Session refresh: `src/middleware.ts` → `src/lib/supabase/middleware.ts`
- Auth code exchange: `src/app/auth/callback/route.ts`

Generate typed schema when your database is ready:

```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```
