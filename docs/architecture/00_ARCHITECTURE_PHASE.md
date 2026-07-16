# Architecture Phase — Charter

**Status:** Approved  
**Product:** RIVA  
**Prototype V0:** **Archived** (do not extend)  
**Scale target:** 100,000 companies worldwide  
**Next:** Wait for **Sprint 008** — do not rebuild until then

---

## 1. Mandate

Feature development is **stopped completely**.

- Do **not** fix or optimize the current dashboard.
- Do **not** extend the Prototype V0 CRM.
- Do **not** write application code, schema migrations, or UI for new product scope.
- Do **not** rebuild the application until Sprint 008 explicitly starts.

This folder holds the **approved software architecture** for RIVA. Implementation waits for Sprint 008.

---

## 2. Prototype V0 — archived

| Status | Meaning |
| --- | --- |
| **Archived** | Historical prototype only |
| **Not maintained** | No feature work, no CRM optimization, no dashboard fixes |
| **Not the target** | Rebuild (when authorized) follows Product Bible + this architecture |

| Treat V0 as | Do not treat V0 as |
| --- | --- |
| Frozen reference / learning artifact | The tenancy model to extend |
| Auth/invite experiments | The navigation IA to polish |
| Temporary UI | The permission system of record |

When Sprint 008 authorizes rebuild, prefer **greenfield alignment** to this architecture over incremental refactors of V0 screens.

---

## 3. Architecture document set

| Doc | Focus |
| --- | --- |
| [01_NAVIGATION_ARCHITECTURE.md](./01_NAVIGATION_ARCHITECTURE.md) | Contexts, shells, routes, switchers |
| [02_WORKSPACE_ARCHITECTURE.md](./02_WORKSPACE_ARCHITECTURE.md) | Workspace types, lifecycle, isolation |
| [03_COMPANY_HIERARCHY.md](./03_COMPANY_HIERARCHY.md) | Platform → Company → Business Unit → … |
| [04_USER_PERMISSION_SYSTEM.md](./04_USER_PERMISSION_SYSTEM.md) | Identities, roles, scopes, evaluation |
| [05_CLIENT_WORKSPACE_STRUCTURE.md](./05_CLIENT_WORKSPACE_STRUCTURE.md) | Delivery container internals |
| [06_MODULE_SYSTEM.md](./06_MODULE_SYSTEM.md) | Module contracts, registry, enablement |
| [07_PORTAL_SYSTEM.md](./07_PORTAL_SYSTEM.md) | Agent vs Client portals, publish boundary |

Product vision remains in [`/docs/product`](../product/01_SOFTWARE_VISION.md). Architecture docs **implement** that vision at software-design depth.

---

## 4. Non-negotiable scale assumptions

Design every decision as if RIVA must serve:

- **100,000 Companies**
- **Multiple Business Units** per company
- **Millions of Client Workspaces** globally
- **Concurrent** agent and client portal traffic
- **Strict tenant isolation** (no cross-company leakage)
- **Regional** readiness (timezone, currency, locale per company)

Logical consequences (detail in child docs):

- Every query is **tenant-scoped** (`company_id` derived and enforced server-side)
- Memberships are **scoped** (company / unit / workspace) — not global roles alone
- Navigation is **context-driven** (active company → unit → workspace)
- Modules are **pluggable contracts**, not hard-wired pages
- Portals share **domain services**, never shared shells

---

## 5. Approval gate

```text
Product Bible (approved or in review)
        ↓
Architecture Phase documents (this folder)
        ↓
Explicit architecture approval
        ↓
Rebuild application from new architecture
```

**Until architecture approval: no feature rebuild, no V0 CRM optimization.**

**Approved.** Prototype V0 archived. **Waiting for Sprint 008** before any rebuild.
