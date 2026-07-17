# SECURITY — Row Level Security (RLS) Strategy

**Status:** Architecture note (Sprint 009)  
**Product:** RIVA  
**Audience:** Engineers maintaining core tenancy and authorization  
**Related:** [SPRINT009.md](./SPRINT009.md), [technical-blueprint/05_PERMISSION_MODEL.md](./technical-blueprint/05_PERMISSION_MODEL.md), migration `supabase/migrations/20260717020000_sprint009_core_foundation.sql`

---

## 1. Purpose

Document the intentional Sprint 009 decision to **enable RLS without tenant-scoped policies**, and define when and how those policies will be introduced. This note exists so future maintainers do not treat missing policies as an oversight or reopen tables to `anon` / `authenticated` without a migration plan.

---

## 2. Current state (Sprint 009)

| Control | Status |
| --- | --- |
| RLS enabled on core tables | Yes |
| Tenant-scoped `CREATE POLICY` | None |
| Table grants to `anon` / `authenticated` | Revoked |
| Table grants to `service_role` | Full |
| Authorization enforcement | Application layer (`src/core/**` RBAC) |
| Data access path | Server-only via `createAdminClient()` (service role) |

Sprint 009 comment in the migration:

> RLS: service role for foundation writes; authenticated read via policies later

**Effect:** deny-by-default at the database. Direct PostgREST / browser client access to core tables is blocked. Trusted server code bypasses RLS via `service_role` and must call domain RBAC before mutating data.

This matches the Sprint 007 invitation tables pattern (`invitations`, `invitation_audit_logs`).

---

## 3. Why RLS policies are intentionally deferred

1. **Foundation-first scope**  
   Sprint 009 delivered schema, domain services, invitation-only auth, and TypeScript RBAC. Expressing the same rules in SQL was out of scope and would have duplicated incomplete rules.

2. **RBAC is still evolving in application code**  
   Permissions resolve through `people` → `person_roles` → `roles` → `role_permissions` → `permissions`. Stable SQL helpers (`current_person_id()`, `person_has_permission(workspace_id, key)`, membership predicates) should be designed after those contracts settle, not before.

3. **Wrong policies are worse than no policies**  
   Premature `authenticated` SELECT/UPDATE policies that ignore workspace membership would create a false sense of security and leak cross-tenant data. Locked tables + service-role-only access is safer until policies are correct.

4. **Single enforcement path during rebuild**  
   All core writes go through `src/core` domain modules that assert permissions before using the admin client. Splitting enforcement between partial SQL policies and app RBAC during foundation would create drift and bypass paths.

5. **Client Portal and Agent Portal are not yet rebuilt**  
   Tenant-scoped RLS must distinguish agent membership, portal identity, and future vendor scopes. Those session models are not finalized in production code.

---

## 4. When RLS will be introduced

Introduce **tenant-scoped RLS** when all of the following are true:

| Gate | Condition |
| --- | --- |
| G1 | Workspace membership via `people.user_id` is stable and covered by tests |
| G2 | Permission keys and role seeds are treated as a versioned contract |
| G3 | Domain helpers for “current person in workspace” exist and are reused by API and SQL |
| G4 | At least one user-scoped Supabase client path is planned (not service-role-only forever) |
| G5 | Dedicated security migration + review, not bundled into an unrelated feature sprint |

**Target window:** Sprint **010–011** (tenancy / auth hardening), or the first sprint that exposes core tables to a non–service-role database role. Do **not** ship user-facing Agent Portal or Client Portal data access against core tables without completing this.

Until then, keep:

- RLS **enabled**
- **No** grants to `anon` / `authenticated` on core tenant tables
- Application RBAC as the **authoritative** permission check for server actions

---

## 5. Tables that must eventually have tenant-scoped RLS

### 5.1 Mandatory tenant-scoped (workspace-bound)

These tables carry `workspace_id` (or belong only through a workspace-bound parent) and **must** get policies that constrain rows to the caller’s workspace membership.

| Table | Tenant key | Policy intent (future) |
| --- | --- | --- |
| `workspaces` | `id` | Members may `SELECT` workspaces they belong to; writes gated by `workspace.write` / owner |
| `companies` | `workspace_id` | Members may `SELECT` companies in their workspace; writes gated by `company.write` |
| `people` | `workspace_id` | Members may `SELECT` people in workspace; writes gated by `people.write` / invite flows |
| `person_roles` | via `people.workspace_id` | Read with person; writes gated by `people.assign_role` |
| `projects` | `workspace_id` (+ `company_id`) | Scoped read/write by membership and `project.*` permissions |
| `core_invitations` | `workspace_id` | Admins with `people.invite` manage invites; accept path via controlled RPC or service role |

### 5.2 Catalog tables (global, not tenant rows)

| Table | Policy intent (future) |
| --- | --- |
| `roles` | Authenticated (or agent) `SELECT` of catalog; writes only `permission.manage` / service role |
| `permissions` | Same as `roles` |
| `role_permissions` | Same as `roles` |

These are not workspace-partitioned, but they still need RLS policies (typically read-only for authenticated agents). They must **not** remain forever as “RLS on, no policy, service_role only” once user-scoped clients exist—otherwise catalog reads require service role forever.

### 5.3 Out of Sprint 009 (reminders for later modules)

Any future business table with `workspace_id` / `company_id` (tasks, files, invoices, portal projections, etc.) **must** ship with tenant-scoped RLS in the same migration that creates the table. Do not repeat the foundation deferral for product modules.

Prototype V0 tables (`clients`, `weddings`, …) remain archived; do not extend their per-user `user_id` RLS model into the new multi-tenant core.

---

## 6. Migration strategy: application RBAC → database RLS

Goal: **defense in depth**. Application RBAC remains the product authorization API. Database RLS becomes a hard tenant isolation backstop so a buggy query cannot cross workspaces.

### Phase A — Keep current posture (now)

1. RLS enabled; no tenant policies.
2. Revoke `anon` / `authenticated` on core tables.
3. Domain layer uses `createAdminClient()` only after `assertPersonPermission` / equivalent.
4. Never grant broad table access to user JWTs without Phase C policies.

### Phase B — SQL authorization primitives

Add a dedicated migration (name TBD, e.g. `sprint0XX_core_rls_helpers.sql`) with:

1. `security definer` helpers that resolve `auth.uid()` → `people` row(s) for a given `workspace_id`.
2. `person_has_permission(workspace_id uuid, permission_key text) returns boolean` using the same join path as `src/core/permissions/rbac.ts`.
3. Optional: `is_workspace_member(workspace_id uuid) returns boolean`.
4. Unit tests / SQL tests for cross-workspace denial.

Helpers must stay aligned with TypeScript RBAC. Prefer one source of truth for permission keys (seed data + shared constants).

### Phase C — Tenant policies (additive)

1. Keep RLS enabled.
2. `CREATE POLICY` for SELECT (and later INSERT/UPDATE/DELETE) using Phase B helpers.
3. Grant the **minimum** privileges to `authenticated` required by planned client/server user-scoped access.
4. Leave sensitive mutations on service role or narrow RPCs where token/invite flows need elevated access (`core_invitations` accept).
5. Do **not** drop application checks in the same change. App RBAC stays.

### Phase D — Dual enforcement + verification

1. Integration tests: member of workspace A cannot read B’s `companies` / `people` / `projects` via user-scoped client.
2. Negative tests: revoked role / disabled person loses access.
3. Audit: no new core domain path that uses service role without a documented reason (bootstrap, invite claim, cron).
4. Only after tests pass, optionally migrate selected reads from admin client to user-scoped client.

### Phase E — Steady state

| Layer | Responsibility |
| --- | --- |
| UI / Server Actions | Call domain APIs; never embed SQL authorization |
| Domain (`src/core`) | Capability checks, invariants, orchestration |
| Postgres RLS | Tenant isolation + permission-shaped policies as backstop |
| `service_role` | Bootstrap, invitations claim, jobs, admin tooling — never browser |

Application RBAC is **not** deleted when RLS lands. RLS does not replace product permission UX or API-level error messaging; it prevents cross-tenant leakage if the app errs.

---

## 7. Non-negotiable rules for maintainers

1. Do not disable RLS on core tables to “make the client work.”
2. Do not `GRANT` core tenant tables to `anon`.
3. Do not add broad `authenticated` policies without workspace predicates.
4. Do not ship a feature that queries core tables with the user JWT until Phase C for that table exists.
5. When adding a new workspace-scoped table, enable RLS **and** add tenant policies in the same migration (or keep it service-role-only with an explicit note linking here).
6. Any change to permission keys or role seeds must update both TypeScript RBAC and planned/actual SQL helpers.

---

## 8. Decision log

| Date | Decision |
| --- | --- |
| 2026-07-17 (Sprint 009) | Enable RLS on all core foundation tables; defer tenant policies; enforce via app RBAC + service role |
| TBD (Sprint 010–011 or first user-scoped core access) | Introduce helpers + tenant-scoped policies per this note |

---

## 9. Next

CTO review of Sprint 009 may approve foundation code with this deferral on record. Implement Phase B/C in a dedicated security/tenancy sprint—not as a drive-by change inside a UI feature.
