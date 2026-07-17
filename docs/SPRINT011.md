# Sprint 011 — Identity & Membership

**Status:** Implemented (awaiting CTO review)  
**Product:** RIVA  
**Depends on:** Sprint 009 Core Foundation · Sprint 010 Workspace Management  
**Constraint:** Identity only · No Company UI · No Wedding · No Project · No Dashboard rebuild

---

## 1. Objective

Build the **identity layer** for RIVA:

1. Workspace membership (multi-workspace)  
2. Invitation lifecycle (token / accept / reject / expire)  
3. Active workspace switching (extends Sprint 010)  
4. Membership status lifecycle  
5. RBAC integration with Sprint 009 role foundation  

---

## 2. Membership model

A `people` row **is** a workspace membership. One Auth user may have many `people` rows across workspaces.

### Membership roles (invite + management UI)

| Role | Intent |
| --- | --- |
| `owner` | Full workspace control (includes `permission.manage`) |
| `admin` | Administration without permission catalog management |
| `member` | Standard operate access |
| `viewer` | Read-only |
| `guest` | Minimal access |

Legacy specialized roles from Sprint 009 (`planner`, `coordinator`, `finance`, `vendor`, `client`) remain in the role catalog for RBAC compatibility but are not the primary membership invite set.

### Membership status

| Status | Meaning |
| --- | --- |
| `pending` | Invited; not yet accepted (was `invited`) |
| `accepted` | Active membership (was `active`) |
| `suspended` | Temporarily blocked (was `disabled`) |
| `removed` | Soft-removed (was `archived`) |

Only `accepted` memberships can switch workspaces or pass permission checks.

---

## 3. Invitation lifecycle

| Action | Result |
| --- | --- |
| Invite | Creates `pending` person + `pending` `core_invitations` row + email/token |
| Accept | Claims token; creates Auth user **or** links existing Auth user; membership → `accepted`; sets active workspace cookie |
| Reject | Invitation → `rejected`; membership → `removed` |
| Expire | Pending past `expires_at` → `expired`; membership → `removed` |
| Revoke | Admin cancel of pending invite → `revoked`; membership → `removed` |

Accept supports **multi-workspace**: existing accounts join by verifying password (no second Auth user).

Token URL: `/invite/accept?token=…&source=core`

---

## 4. Active workspace

Unchanged cookie mechanism from Sprint 010 (`riva_active_workspace_id`), now keyed to `accepted` memberships only. Accept invitation sets the active workspace.

---

## 5. Delivered artifacts

| Area | Location |
| --- | --- |
| SQL migration | `supabase/migrations/20260717040000_sprint011_identity_membership.sql` |
| Membership domain | `src/core/membership/membership.ts` |
| People / status | `src/core/people/people.ts` |
| Invitation | `src/core/auth/invitation.ts` |
| Actions | `src/core/actions/membership-actions.ts` |
| Types / schemas | `src/core/types.ts`, `src/core/schemas.ts` |
| Members UI | `/dashboard/settings/members` · `src/features/membership/**` |
| Accept / reject UI | `src/core/auth/accept-core-invitation-form.tsx` |
| Security posture | Unchanged — see [SECURITY.md](./SECURITY.md) |

### Schema notes

- Seeded roles: `member`, `viewer`, `guest` + permission grants  
- Unique `(workspace_id, user_id)` where `user_id` is not null  
- `core_invitations.status` includes `rejected`  
- `rejected_at` / `rejected_by_user_id` columns added  

---

## 6. RBAC integration

Permissions continue to resolve via:

`people` → `person_roles` → `role_permissions` → `permissions`

Membership role changes use `replaceMembershipRole` (single membership role assignment). Owner invariant: workspace must retain at least one owner.

---

## 7. Explicit non-goals

- Company management  
- Wedding / business modules  
- Project product logic  
- Dashboard redesign  
- Tenant-scoped RLS policies (still deferred per SECURITY.md)  

---

## 8. Apply migration

Run after Sprint 009 + 010:

`supabase/migrations/20260717040000_sprint011_identity_membership.sql`

---

## 9. Next

Wait for **CTO review**. Do not commit until approved. Do not start Sprint 012.
