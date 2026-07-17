# Sprint 009 — Core Foundation

**Status:** Implemented (awaiting CTO review)  
**Product:** RIVA  
**Constraint:** No business modules · No Client Portal · No AI · No Dashboard UI rebuild

---

## 1. Objective

Build the **core platform foundation** only:

1. Workspace foundation  
2. Company foundation  
3. Unified People model  
4. Authentication (login / logout / invitation-only)  
5. Permission foundation (RBAC)  
6. Project skeleton  

---

## 2. Hierarchy (Sprint 009)

```text
Workspace  (root container)
  └── Company  (many per workspace)
        ├── People (+ roles)
        └── Project (skeleton only)
```

Every core object belongs to exactly one **Workspace**.

> Note: Earlier Product Bible docs used Company → Business Unit → Client Workspace.  
> Sprint 009 implements Workspace as the root container with Companies inside it, as directed for foundation build. Later sprints may reconcile naming with the Product Bible.

---

## 3. Delivered artifacts

| Area | Location |
| --- | --- |
| SQL migration | `supabase/migrations/20260717020000_sprint009_core_foundation.sql` |
| Core domain | `src/core/**` |
| Server actions | `src/core/actions/core-actions.ts` |
| Types | `src/core/types.ts` + `src/types/database.ts` |
| Core invite accept | `/invite/accept?source=core&token=…` |

---

## 4. Unified People + roles

Single `people` table. Roles are data-driven via `roles`, `permissions`, `role_permissions`, and `person_roles`.

Seeded roles:

- owner  
- admin  
- planner  
- coordinator  
- finance  
- vendor  
- client  

Future roles can be added without forking architecture.

---

## 5. Authentication

- Login / logout remain invitation-only (no public sign-up).
- Core invitations create a Person + role, then accept flow creates Auth user and links `people.user_id`.
- Existing Sprint 007 invitations remain for Prototype V0 compatibility.

---

## 6. Explicit non-goals (this sprint)

- Wedding / Corporate / Birthday modules  
- Client Portal product UI  
- AI  
- Dashboard UI redesign  
- Business workflow logic on Project  

---

## 7. Apply migration

Run in Supabase SQL Editor:

`supabase/migrations/20260717020000_sprint009_core_foundation.sql`

---

## 8. Next

Wait for **CTO review**. Do not start Sprint 010.
