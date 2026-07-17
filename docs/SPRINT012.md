# Sprint 012 — Workspace Foundation

**Status:** Implemented  
**Product:** RIVA  
**Depends on:** Sprint 009 Core Foundation · Sprint 010 Workspace Management · Sprint 011 Identity & Membership  
**Constraint:** Foundation only · No Wedding/Project modules · No dashboard data rebuild

---

## 1. Objective

Align the core tenancy model with the **Product Blueprint**:

1. Workspace domain (`owner_id`, logo, timezone, currency)  
2. Company domain (belongs to Workspace; `type`, `logo_url`)  
3. Canonical **Membership** — User ↔ Workspace ↔ Company ↔ Role  
4. Sprint 012 RBAC roles: Founder, Admin, Planner, Coordinator, Sales, Viewer  
5. Post-login flow: User → Workspace → Company → Dashboard  
6. Dashboard loads active Workspace + Company context

---

## 2. Domain model

### Workspace

| Field | Notes |
| --- | --- |
| `id` | UUID primary key |
| `name` | Display name |
| `slug` | Unique kebab-case identifier |
| `logo_url` | Optional HTTPS URL |
| `owner_id` | Auth user who founded the workspace |
| `timezone` | IANA timezone |
| `currency` | ISO 4217 (3-letter) |
| `created_at` / `updated_at` | Timestamps |

### Company (belongs to Workspace)

| Field | Notes |
| --- | --- |
| `id` | UUID primary key |
| `workspace_id` | Parent workspace |
| `name` / `slug` | Company identity |
| `type` | `agency` · `brand` · `venue` · `corporate` · `wedding` · `other` |
| `logo_url` | Optional HTTPS URL |
| `created_at` / `updated_at` | Timestamps |

### Membership (canonical)

| Field | Notes |
| --- | --- |
| `user_id` | Auth user (nullable while pending) |
| `workspace_id` | Workspace scope |
| `company_id` | Company scope |
| `role_key` | Sprint 012 role |
| `email` / `full_name` | Identity |
| `status` | `pending` · `accepted` · `suspended` · `removed` |
| `person_id` | Optional link to legacy `people` row |

### RBAC roles (Sprint 012)

| Role | Intent |
| --- | --- |
| `founder` | Full workspace control (replaces legacy `owner`) |
| `admin` | Administration |
| `planner` | Planning operations |
| `coordinator` | Coordination operations |
| `sales` | Sales / pipeline |
| `viewer` | Read-only |

Legacy roles (`owner`, `member`, `guest`, etc.) remain in the catalog for RBAC compatibility. Migration maps `owner` → `founder`.

---

## 3. Post-login context flow

```
Login → /dashboard/enter
  ├─ 0 workspaces → /dashboard/workspaces/new
  ├─ 1 workspace, 0 companies → provision default company
  ├─ 1 workspace, 1 company → set cookies → /dashboard
  ├─ N workspaces → /dashboard/select-workspace
  └─ workspace set, N companies → /dashboard/select-company
```

### Active context cookies

| Cookie | Purpose |
| --- | --- |
| `riva_active_workspace_id` | Current workspace |
| `riva_active_company_id` | Current company within workspace |

`resolveSessionContext()` returns workspace, company, membership, and permissions for dashboard routes.

---

## 4. Delivered artifacts

| Area | Location |
| --- | --- |
| SQL migration | `supabase/migrations/20260717050000_sprint012_workspace_foundation.sql` |
| Membership domain | `src/core/membership/memberships.ts` |
| Session context | `src/core/auth/context.ts` |
| Active company | `src/core/company/active-company.ts` |
| Provision (workspace + company + founder) | `src/core/workspace/provision.ts` |
| Context actions | `src/core/actions/context-actions.ts` |
| Onboarding routes | `/dashboard/enter`, `/dashboard/select-workspace`, `/dashboard/select-company` |
| Switchers | `workspace-switcher.tsx`, `company-switcher.tsx` |
| Context banner | `src/features/context/components/context-banner.tsx` |
| Types / schemas | `src/core/types.ts`, `src/core/schemas.ts`, `src/types/database.ts` |

---

## 5. Architecture notes

### Dual membership path

Sprint 011 `people` rows remain for invitation lifecycle. Sprint 012 `memberships` is the **canonical** record for workspace/company context resolution. New invites and provisioning create both; backfill migration populates `memberships` from existing `people` rows.

### RLS

Unchanged posture: RLS enabled on `memberships`, no tenant policies, service-role domain access. See [SECURITY.md](./SECURITY.md).

### Explicit non-goals

- Company CRUD UI (beyond switcher / select)  
- Wedding / Project tenancy scoping in dashboard data  
- RLS tenant policies  
- Logo upload (URL field only)

---

## 6. Apply migration

```bash
# SQL Editor or CLI — after Sprint 011
supabase/migrations/20260717050000_sprint012_workspace_foundation.sql
```
