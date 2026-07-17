# Sprint 014 — Project Domain

**Status:** Implemented  
**Product:** RIVA  
**Depends on:** Sprint 012 Workspace Foundation · Sprint 013 Company Domain  
**Constraint:** Project domain only · No wedding/business module logic · No Sprint 015

---

## 1. Objective

Implement the **Project domain** on top of Workspace + Company:

1. Project entity + repository layer  
2. Project linked to Company (and Workspace)  
3. Project Context Provider for client components  
4. Project CRUD server actions  
5. Status, owner, and timestamps  
6. Dashboard loads projects from the active company

---

## 2. Domain model

### Project (belongs to Company)

| Field | Notes |
| --- | --- |
| `id` | UUID primary key |
| `workspace_id` | Parent workspace FK |
| `company_id` | Parent company FK |
| `name` | Display name |
| `project_type` | Optional: wedding, corporate, birthday, concert, exhibition, other |
| `status` | `draft` · `active` · `archived` |
| `owner_id` | Auth user who owns the project (Sprint 014 migration) |
| `created_at` / `updated_at` | Timestamps |

### Repository pattern

| Layer | Location |
| --- | --- |
| Repository (Supabase) | `src/core/project/repository.ts` |
| Domain service | `src/core/project/project.ts` |
| Server actions | `src/core/actions/project-actions.ts` |

---

## 3. Project context

### Server resolution

Projects loaded via `listProjectsByCompany(workspaceId, companyId)` using the active session context.

### Client context (Sprint 014)

| Artifact | Purpose |
| --- | --- |
| `ProjectContextProvider` | Nested inside `CompanyContextProvider`; provides company-scoped project list |
| `useProjectContext()` | Full project context value |
| `useCompanyProjects()` | Shortcut for projects + scope ids |

---

## 4. CRUD actions

| Action | Permission |
| --- | --- |
| `createProjectAction` | `project.write` (membership-scoped) |
| `updateProjectAction` | `project.write` |
| `activateProjectAction` | `project.write` |
| `archiveProjectAction` | `project.write` |
| `restoreProjectAction` | `project.write` |

Create sets `owner_id` to the signed-in user by default.

---

## 5. Delivered artifacts

| Area | Location |
| --- | --- |
| Migration | `supabase/migrations/20260717060000_sprint014_project_domain.sql` |
| Repository | `src/core/project/repository.ts` |
| Domain CRUD | `src/core/project/project.ts` |
| Context provider | `src/features/project/components/project-context-provider.tsx` |
| Dashboard panel | `src/features/project/components/projects-panel.tsx` |
| Routes | `/dashboard/projects`, `/dashboard/projects/new` |
| Schemas | `updateProjectSchema`, `projectIdSchema` |

---

## 6. Compatibility

- **Sprint 011–013:** Unchanged; project permissions use existing `project.read` / `project.write` RBAC keys  
- **Dashboard V0 data** (weddings, tasks, finance) remains user-scoped prototype data; only the **Projects panel** is company-scoped

---

## 7. Schema change

Single additive migration: `projects.owner_id` (nullable FK to `auth.users`). All other project columns unchanged from Sprint 009.

---

## 8. Explicit non-goals

- Wedding / corporate project business modules  
- Project-level RLS policies  
- Active project cookie / switcher  
- Sprint 015 navigation shell

---

## 9. Apply migration

```bash
# After Sprint 012
supabase/migrations/20260717060000_sprint014_project_domain.sql
```
