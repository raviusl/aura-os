# Sprint 008 — Blueprint Overview

**Status:** Documentation approved — waiting for Architecture Review / Blueprint lock  
**Product:** RIVA  
**Prototype V0:** Archived (no rebuild)  
**Next:** Do **not** begin Sprint 009 until Blueprint is reviewed and locked  
**Constraint:** No production code · No UI · No database migration · No React components

---

## 1. Purpose

Sprint 008 produces the **implementation-ready blueprints** that bridge the approved Product Bible ([`/docs/product`](../product/01_SOFTWARE_VISION.md)) and Software Architecture ([`/docs/architecture`](../architecture/00_ARCHITECTURE_PHASE.md)) into concrete, reviewable specifications.

These blueprints are the last documentation gate **before** development begins in a later sprint.

---

## 2. Deliverables

| # | Blueprint | File |
| --- | --- | --- |
| 1 | Workspace Blueprint | [01_WORKSPACE_BLUEPRINT.md](./01_WORKSPACE_BLUEPRINT.md) |
| 2 | Navigation Blueprint | [02_NAVIGATION_BLUEPRINT.md](./02_NAVIGATION_BLUEPRINT.md) |
| 3 | Permission Blueprint | [03_PERMISSION_BLUEPRINT.md](./03_PERMISSION_BLUEPRINT.md) |
| 4 | Database Blueprint | [04_DATABASE_BLUEPRINT.md](./04_DATABASE_BLUEPRINT.md) |
| 5 | Module Blueprint | [05_MODULE_BLUEPRINT.md](./05_MODULE_BLUEPRINT.md) |

Each blueprint documents the same eight lenses:

1. **Purpose**
2. **Entity hierarchy**
3. **Relationships**
4. **Future scalability**
5. **SaaS considerations**
6. **Multi-company support**
7. **Multi-country support**
8. **Client Portal compatibility**

---

## 3. Guardrails

- No `.ts` / `.tsx` / SQL / migration files created or modified.
- No changes to the running application.
- Blueprints must comply with Product Principles P1–P12.
- Where a blueprint refines an architecture doc, it **links** rather than contradicts.

---

## 4. Canonical hierarchy (context for every blueprint)

```text
Platform
  → Company
    → Business Unit
      → Client Workspace
        → Client Modules
          → Client Portal
            → Automation
              → AI
```

Scale assumption throughout: **100,000 companies**, multi-country, multi-currency, multi-language.

---

## 5. Approval gate

| Gate | Status |
| --- | --- |
| Sprint 008 Blueprint docs | **Approved** |
| Architecture Review | **Pending** |
| Blueprint lock | **Pending** |
| Sprint 009 / rebuild | **Blocked** until Blueprint is reviewed and locked |

**No production code. No Sprint 009. Wait for Architecture Review.**
