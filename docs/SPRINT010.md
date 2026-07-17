# Sprint 010 — Workspace Management

**Status:** Approved  
**Product:** RIVA  
**Depends on:** Sprint 009 Core Foundation (approved)  
**Constraint:** Workspace only · No Company UI · No Wedding/Client/Vendor · No Dashboard rebuild · No AI

---

## 1. Objective

Build **Workspace Management** on the Sprint 009 foundation:

1. Workspace CRUD (create / edit / archive / restore — no hard delete)  
2. Workspace switcher (multi-workspace from day one)  
3. Workspace settings (name, logo, timezone, country, currency, locale)  
4. Workspace status lifecycle  
5. Validation (required name, unique slug, custom domain prep)

---

## 2. Status model

| Status | Meaning |
| --- | --- |
| `pending` | Provisioned / not fully active (replaces Sprint 009 `provisioning`) |
| `active` | Normal operating state |
| `suspended` | Temporarily blocked |
| `archived` | Soft-removed; restorable |

Permanent delete is **not** supported.

---

## 3. Delivered artifacts

| Area | Location |
| --- | --- |
| SQL migration | `supabase/migrations/20260717030000_sprint010_workspace_management.sql` |
| Domain CRUD | `src/core/workspace/workspace.ts` |
| Active workspace + list | `src/core/workspace/active-workspace.ts` |
| Create + owner provision | `src/core/workspace/provision.ts` |
| Server actions | `src/core/actions/workspace-actions.ts` |
| Schemas | `src/core/schemas.ts` |
| Minimal UI | `src/features/workspace/components/**` |
| Routes | `/dashboard/workspaces`, `/dashboard/workspaces/new`, `/dashboard/settings/workspace` |
| Switcher | Dashboard header via `(dashboard)/layout.tsx` |
| Security posture | Unchanged — see [SECURITY.md](./SECURITY.md) |

### Schema additions on `workspaces`

- `country` (ISO-3166 alpha-2, nullable)  
- `logo_url` (HTTPS URL, nullable — upload deferred)  
- `custom_domain` (nullable, unique when set — provisioning deferred)  
- Status check updated to `pending | active | suspended | archived`

---

## 4. Architecture notes

### Active workspace

- Cookie: `riva_active_workspace_id` (httpOnly, SameSite=lax)  
- `resolveActiveWorkspace(userId)` validates membership and falls back to first workspace  
- `switchActiveWorkspace` requires an active `people` row for that user

### Create flow

`createWorkspaceAction` → `provisionWorkspaceForUser`:

1. Insert workspace  
2. Create `people` row as `owner` linked to the signed-in user  
3. Set active workspace cookie  

Does **not** create a Company (out of scope).

### Permissions

- Edit / archive / restore / suspend require `workspace.write`  
- Switch requires membership only  

### RLS

Still: RLS enabled, no tenant policies, service-role domain access. Documented in [SECURITY.md](./SECURITY.md).

---

## 5. Validation

- Name required (1–120)  
- Slug unique globally; kebab-case; auto-derived from name when omitted  
- Slug immutable in settings UI (stable for future domain routing)  
- Currency 3-letter; country optional ISO-2  
- Logo optional HTTPS URL  
- `custom_domain` column + unique index ready; UI shows “deferred”

---

## 6. Explicit non-goals (this sprint)

- Company management UI  
- Wedding / Client / Vendor modules  
- Dashboard redesign  
- AI  
- Custom domain DNS / TLS provisioning  
- Logo file upload / storage pipeline  
- Tenant-scoped RLS policies  

---

## 7. Apply migration

Run in Supabase SQL Editor (after Sprint 009):

`supabase/migrations/20260717030000_sprint010_workspace_management.sql`

---

## 8. Next

Workspace management approved. Continue with Sprint 011 — Identity & Membership.
