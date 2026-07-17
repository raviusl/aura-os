# Supabase Foundation

**Status:** Sprint 002 foundation documentation  
**Scope:** Client / server / middleware / admin boundaries only. No SQL. No schema design.

---

## Existing implementation (reused)

RIVA already ships a typed Supabase layer under `src/lib/supabase/`. Sprint 002 **reuses** these files and does not duplicate them:

| File | Role |
| --- | --- |
| `src/lib/supabase/client.ts` | Browser (Client Component) Supabase client |
| `src/lib/supabase/server.ts` | Server Component / Route Handler / Server Action client |
| `src/lib/supabase/middleware.ts` | Edge middleware session refresh + route gates |
| `src/lib/supabase/admin.ts` | Service-role client for trusted server-only ops |
| `src/lib/supabase/index.ts` | Public re-exports |

Related support:

| Path | Role |
| --- | --- |
| `src/lib/env.ts` | Zod-validated public / server env accessors |
| `src/types/database.ts` | Generated / hand-maintained `Database` schema types |
| `src/types/database/index.ts` | Package entry that re-exports schema types |
| `src/lib/database/` | Repository foundation (`BaseRepository`, `Repository`) |
| `supabase/migrations/` | Applied SQL migrations (not modified in this sprint) |

---

## Folder structure

```text
src/lib/supabase/
├── client.ts       # Browser client (anon / publishable key)
├── server.ts       # Cookie-aware server client (anon / publishable key)
├── middleware.ts   # Request session update + auth redirects
├── admin.ts        # Service-role client (server-only)
└── index.ts        # Barrel exports

src/lib/database/
├── BaseRepository.ts
└── Repository.ts

src/types/
├── database.ts           # Canonical Database type definitions
└── database/
    └── index.ts          # Re-export entry for types/database/

supabase/
└── migrations/           # SQL history (do not invent tables in Sprint 002)

docs/architecture/
└── Supabase-Foundation.md
```

---

## Client responsibilities (`client.ts`)

- Runs in the **browser** via `@supabase/ssr` `createBrowserClient`.
- Uses **public** env only: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Typed with `Database` from `@/types/database`.
- Safe for Client Components, hooks, and browser-side auth helpers.
- Must **never** receive the service-role key.

---

## Server responsibilities (`server.ts`)

- Runs on the **server** via `@supabase/ssr` `createServerClient`.
- Reads / writes the Next.js cookie store for the user session.
- Uses the same **public** anon/publishable key (user-scoped RLS context).
- Intended for Server Components, Server Actions, and Route Handlers.
- Cookie `set` may no-op in read-only Server Component contexts; session refresh is owned by middleware.

---

## Middleware responsibilities (`middleware.ts`)

- Exports `updateSession(request)` for Next.js middleware.
- Creates a request-scoped Supabase server client from request cookies.
- Refreshes the auth session and forwards updated cookies on the response.
- Applies coarse route gates (e.g. redirect unauthenticated users away from `/dashboard`).
- Must stay resilient: auth outages must not crash the entire app edge path.
- Still uses the **anon/publishable** key — not the service role.

---

## Admin client responsibilities (`admin.ts`)

- Trusted **server-only** client via `@supabase/supabase-js` `createClient`.
- Requires `SUPABASE_SERVICE_ROLE_KEY` (never `NEXT_PUBLIC_`).
- Bypasses RLS; use only for privileged server workflows (invites, provisioning, admin reads/writes).
- Disables session persistence / auto-refresh (stateless service client).
- Must **never** be imported into Client Components or shipped to the browser.

---

## Environment variables

Required placeholders live in `.env.local.example`:

| Variable | Surface | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Public | App origin |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Anon / publishable API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Service-role / secret key |

No secrets belong in the example file or in git.

---

## Repository foundation

`src/lib/database/` provides abstract bases only:

- `BaseRepository` — shared data-access root
- `Repository` — typed repository marker extending `BaseRepository`

Domain repositories (Project, Task, etc.) are **out of scope** for Sprint 002 and remain in `src/core/*/repository.ts` where already implemented.

---

## Explicit non-goals (Sprint 002)

- No new SQL or migrations
- No new tables
- No authentication UI / flow changes
- No API routes
- No dashboard or business modules
