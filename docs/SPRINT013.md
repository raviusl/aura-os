# Sprint 013 — Company Domain

**Status:** Implemented  
**Product:** RIVA  
**Depends on:** Sprint 012 Workspace Foundation  
**Constraint:** Company domain only · No Wedding/Project modules · No dashboard data rebuild · No Sprint 014

---

## 1. Objective

Implement the **Company domain** on top of the Workspace foundation:

1. Company entity + repository layer  
2. Workspace → Company link (one workspace, many companies)  
3. Company Context Provider for client components  
4. Company switching (cookie + membership validation)  
5. Dashboard loads active company context  
6. Company management UI (list, create, settings)

---

## 2. Domain model

### Company (belongs to Workspace)

| Field | Notes |
| --- | --- |
| `id` | UUID primary key |
| `workspace_id` | Parent workspace FK |
| `name` / `slug` | Company identity (slug unique per workspace) |
| `type` | `agency` · `brand` · `venue` · `corporate` · `wedding` · `other` |
| `logo_url` | Optional HTTPS URL |
| `status` | `active` · `suspended` · `archived` |
| `timezone` / `locale` / `currency` / `country` | Optional overrides |
| `created_at` / `updated_at` | Timestamps |

### Repository pattern

| Layer | Location |
| --- | --- |
| Repository (Supabase) | `src/core/company/repository.ts` |
| Domain service | `src/core/company/company.ts` |
| Active company + cookies | `src/core/company/active-company.ts` |
| Server actions | `src/core/actions/company-actions.ts` |

---

## 3. Company context

### Server context (unchanged from Sprint 012)

`resolveSessionContext()` → User → Workspace → Company → Role + permissions

### Client context (Sprint 013)

| Artifact | Purpose |
| --- | --- |
| `CompanyContextProvider` | Wraps dashboard layout; provides active company to client components |
| `useCompanyContext()` | Full context value (workspace, company, membership, permissions, company list) |
| `useActiveCompany()` | Shortcut for active company fields |
| `useCompanyPermissions()` | Permission set for client-side UI gating |

Active company cookie: `riva_active_company_id` (cleared on workspace switch).

---

## 4. Delivered artifacts

| Area | Location |
| --- | --- |
| Repository | `src/core/company/repository.ts` |
| Domain CRUD | `src/core/company/company.ts` |
| Context provider | `src/features/company/components/company-context-provider.tsx` |
| Switcher | `src/features/company/components/company-switcher.tsx` |
| List / create / settings UI | `src/features/company/components/**` |
| Routes | `/dashboard/companies`, `/dashboard/companies/new`, `/dashboard/settings/company` |
| Schemas | `updateCompanySettingsSchema`, `companyIdSchema` in `src/core/schemas.ts` |
| Layout integration | `(dashboard)/layout.tsx` wraps `CompanyContextProvider` |

---

## 5. Compatibility

- **Sprint 011:** `people` invitation path unchanged; company list falls back to `people.company_id` when no `memberships` rows exist  
- **Sprint 012:** `memberships` remains canonical for context resolution and switching  
- **Create company:** Creates `memberships` row for creator (`admin`, `accepted`) and sets active company cookie

---

## 6. Explicit non-goals

- Dashboard V0 data scoping by `company_id`  
- Company logo upload (URL field only)  
- Business Unit / Client Workspace hierarchy  
- Sprint 014 navigation shell

---

## 7. No migration required

Company schema was introduced in Sprint 009/012. Sprint 013 is application-layer only.
