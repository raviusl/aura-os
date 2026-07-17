# Sprint 015 — Client Domain

**Status:** Implemented  
**Product:** RIVA  
**Depends on:** Sprint 012–014 (Workspace · Company · Project)  
**Constraint:** Client domain only · No Client Portal · No Sprint 016

---

## 1. Objective

Implement the **Client domain** on top of Project + Company:

1. Client entity  
2. Link Client to Company and optional Project  
3. ClientRepository + ClientService  
4. Client Context Provider  
5. CRUD server actions  
6. Dashboard panel + navigation  
7. Client types: Bride, Groom, Corporate Client, Individual

---

## 2. Domain model

### Table: `crm_clients`

Distinct from V0 `public.clients` (user-scoped prototype CRM). Core clients are multi-tenant.

| Field | Notes |
| --- | --- |
| `id` | UUID primary key |
| `workspace_id` | Parent workspace |
| `company_id` | Parent company (required) |
| `project_id` | Optional FK → `projects` (e.g. Bride + Groom on one wedding) |
| `name` | Display name |
| `email` / `phone` | Optional contact |
| `client_type` | `bride` · `groom` · `corporate` · `individual` |
| `status` | `active` · `follow_up` · `archived` |
| `follow_up_at` | Optional date |
| `notes` | Optional text |
| `created_at` / `updated_at` | Timestamps |

### Permissions

| Key | Intent |
| --- | --- |
| `client.read` | View clients |
| `client.write` | Create / update / archive clients |

---

## 3. Layers

| Layer | Location |
| --- | --- |
| Migration | `supabase/migrations/20260717070000_sprint015_client_domain.sql` |
| Repository | `src/core/client/repository.ts` |
| Service | `src/core/client/client.ts` |
| Actions | `src/core/actions/client-actions.ts` |
| Context | `src/features/client/components/client-context-provider.tsx` |
| UI | `clients-panel`, `client-list-item`, `create-client-form` |
| Routes | `/dashboard/clients`, `/dashboard/clients/new` |
| Nav | Sidebar Clients → `/dashboard/clients` (CRM redirects here) |

---

## 4. Compatibility

- **Sprint 011–014:** Unchanged; membership permission checks via `requireMembershipPermission`  
- **V0 `clients`:** Left intact for prototype dashboard follow-ups / Quick Actions  
- **Dashboard:** Core Clients panel is company-scoped; V0 follow-up count remains separate

---

## 5. Explicit non-goals

- Client Portal  
- Merging V0 `clients` into core  
- Wedding module business logic  
- Sprint 016

---

## 6. Apply migration

```bash
# After Sprint 014
supabase/migrations/20260717070000_sprint015_client_domain.sql
```
