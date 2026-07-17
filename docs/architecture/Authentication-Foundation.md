# Authentication Foundation

**Status:** Sprint 003 foundation documentation  
**Scope:** Auth infrastructure types, roles, permissions constants, session helpers, and middleware boundaries. No login UI. No SQL. No RLS.

---

## Existing implementation (reused)

| Area | Location | Notes |
| --- | --- | --- |
| Edge middleware | `src/middleware.ts` | Calls `updateSession` from Supabase middleware |
| Session refresh + route gates | `src/lib/supabase/middleware.ts` | Cookie refresh; redirects for `/dashboard`, `/login`, `/` |
| Browser / server / admin clients | `src/lib/supabase/*` | Established in Sprint 002 |
| Session user helper | `src/features/auth/lib/get-session-user.ts` | `supabase.auth.getUser()` |
| Workspace session context | `src/core/auth/context.ts`, `src/core/auth/session.ts` | User → Workspace → Company |
| Runtime RBAC | `src/core/permissions/rbac.ts` | DB-backed role/permission resolution (out of Sprint 003 scope to change) |
| Platform Super Admin | `src/features/auth/lib/platform-role.ts` | Uses `SUPER_ADMIN_EMAILS` |

Sprint 003 **extends** `src/lib/auth/` and adds `src/types/auth/` without replacing the modules above.

---

## Folder structure

```text
src/lib/auth/
├── index.ts          # authConfig + role/permission catalogs (client-safe)
├── roles.ts          # Role definition re-exports
├── permissions.ts    # Permission constant re-exports
├── session.ts        # Server-only session helpers
└── guards.ts         # Server-only authenticated-presence guards

src/types/auth/
├── index.ts
├── Role.ts
├── Permission.ts
└── Session.ts

src/middleware.ts                 # Next.js middleware entry (reused)
src/lib/supabase/middleware.ts   # Session update implementation (reused)
```

---

## Authentication flow

1. User signs in through Supabase Auth (existing `/login` + `/auth/callback` — UI out of Sprint 003 scope to modify).
2. Supabase sets session cookies on the response.
3. On each matched request, `src/middleware.ts` → `updateSession()` refreshes the session and applies coarse route redirects.
4. Server code reads the current user via `getAuthSession()` / `getSessionUser()` (anon-key, cookie-scoped client).
5. Higher-level product context (workspace, company, membership) is resolved separately in `core/auth` — not part of this foundation layer’s responsibility.

```text
Browser → Next middleware (updateSession)
       → App Router (Server Components / Actions)
       → getAuthSession() / requireAuthenticated()
       → (later) workspace/company context + RBAC
```

---

## Session lifecycle

| Stage | Behavior |
| --- | --- |
| Create | Supabase Auth issues tokens after successful sign-in / invite accept |
| Persist | HTTP cookies managed by `@supabase/ssr` |
| Refresh | Middleware refreshes tokens and writes updated cookies |
| Read | `lib/auth/session.getAuthSession()` returns `{ user }` or `{ user: null }` |
| Guard | `lib/auth/guards.requireAuthenticated()` throws when signed out |
| End | Sign-out clears cookies (existing feature code; not changed here) |

Foundation session types live in `types/auth/Session.ts` (`AuthSession`, `AuthSessionUser`, `AuthenticatedSession`).

---

## Middleware responsibility

- Own the edge session refresh for Auth cookies.
- Apply **coarse** unauthenticated / authenticated redirects (e.g. protect `/dashboard`, bounce signed-in users off `/login`).
- Do **not** evaluate Owner/Admin/Manager roles or resource permissions.
- Do **not** load workspace or company context.
- Stay resilient if Supabase Auth is temporarily unreachable.

Configured entry: `src/middleware.ts` (unchanged in Sprint 003 — already wired).

---

## Role model

Sprint 003 foundation roles (definition only):

| Name | Key | Purpose |
| --- | --- | --- |
| Owner | `owner` | Full workspace control |
| Admin | `admin` | Administrative access |
| Manager | `manager` | Operational management |
| Member | `member` | Standard collaborator |
| Viewer | `viewer` | Read-only access |

Defined in `types/auth/Role.ts` and exposed via `lib/auth/roles.ts`.

**Note:** The product already has membership/RBAC role keys in `src/core/types.ts` (e.g. `founder`, `planner`, `coordinator`). Sprint 003 does not replace those. Foundation roles are the canonical auth-layer catalog for future alignment; runtime assignment remains in existing membership tables/code.

---

## Permission model

Sprint 003 provides **shapes and constants only**:

- Actions: `read`, `write`, `manage`, `invite`
- Resources: `workspace`, `company`, `project`, `client`, `vendor`, `people`, `permission`
- Types: `AuthPermissionKey`, `AuthPermissionDefinition`, `AuthPermissionSet`

No role→permission matrix and no enforcement logic are introduced here. Existing enforcement remains in `core/permissions/rbac.ts` and membership helpers.

---

## Environment variables

Authentication-related placeholders in `.env.local.example`:

| Variable | Required for |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Callback / redirect origins |
| `NEXT_PUBLIC_SUPABASE_URL` | Auth API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | User-scoped Auth client |
| `SUPABASE_SERVICE_ROLE_KEY` | Trusted server Auth/admin ops |
| `SUPER_ADMIN_EMAILS` | Platform Super Admin allowlist |

No secrets in example files.

---

## Explicit non-goals (Sprint 003)

- No login / signup UI changes
- No OAuth providers
- No user profile module
- No new SQL, tables, or RLS
- No API routes
- No dashboard or business module changes
- No permission evaluation logic in `lib/auth`
