# Sprint 016 — Vendor Domain

**Status:** Implemented  
**Product:** RIVA  
**Depends on:** Sprint 012–015 (Workspace · Company · Project · Client)  
**Constraint:** Vendor domain only · No Sprint 017

---

## 1. Objective

Implement the **Vendor domain** on top of Project + Client foundation:

1. Vendor entity  
2. Link Vendor to Company (required) and Project (optional)  
3. VendorRepository + VendorService  
4. Vendor Context Provider  
5. CRUD server actions  
6. Vendor categories  
7. Dashboard panel + navigation

---

## 2. Domain model

### Table: `vendors`

| Field | Notes |
| --- | --- |
| `id` | UUID primary key |
| `workspace_id` | Parent workspace |
| `company_id` | Parent company (required) |
| `project_id` | Optional FK → `projects` |
| `name` | Display name |
| `email` / `phone` | Optional contact |
| `category` | See categories below |
| `status` | `active` · `inactive` · `archived` |
| `notes` | Optional text |
| `created_at` / `updated_at` | Timestamps |

### Categories

Photographer · Videographer · Decorator · Makeup Artist · Live Band · Emcee · Venue · Catering · Florist · Others

Keys: `photographer`, `videographer`, `decorator`, `makeup_artist`, `live_band`, `emcee`, `venue`, `catering`, `florist`, `others`

### Permissions

| Key | Intent |
| --- | --- |
| `vendor.read` | View vendors |
| `vendor.write` | Create / update / archive vendors |

---

## 3. Layers

| Layer | Location |
| --- | --- |
| Migration | `supabase/migrations/20260717080000_sprint016_vendor_domain.sql` |
| Repository | `src/core/vendor/repository.ts` |
| Service | `src/core/vendor/vendor.ts` |
| Actions | `src/core/actions/vendor-actions.ts` |
| Context | `src/features/vendor/components/vendor-context-provider.tsx` |
| UI | `vendors-panel`, `vendor-list-item`, `create-vendor-form` |
| Routes | `/dashboard/vendors`, `/dashboard/vendors/new` |
| Nav | Sidebar already points to `/dashboard/vendors` |

---

## 4. Compatibility

- Sprint 011–015 unchanged  
- Membership permission checks via `requireMembershipPermission`  
- Role key `vendor` (RBAC participant) is distinct from permission keys `vendor.read` / `vendor.write`

---

## 5. Explicit non-goals

- Vendor portal  
- Booking / contract modules  
- Sprint 017

---

## 6. Apply migration

```bash
# After Sprint 015
supabase/migrations/20260717080000_sprint016_vendor_domain.sql
```
