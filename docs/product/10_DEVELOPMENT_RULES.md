# 10 — Development Rules

**Status:** Binding engineering rules for RIVA  
**Applies after:** Product Bible approval (and during doc-only freeze)

---

## 1. Purpose

Encode how RIVA is built so the architecture stays scalable and the Product Bible remains authoritative.

---

## 2. Meta rules (current phase)

1. **Stop feature development** until Product Bible approval.  
2. **Documentation only** for product-defining work in this freeze.  
3. **Do not** change application code, database, or UI for new product scope during the freeze (except critical production fixes with explicit approval).

---

## 3. Documentation first

| Rule | Practice |
| --- | --- |
| Spec before build | Update `/docs/product` (or linked ADR) before implementing product changes |
| Bible precedence | If chat disagrees with the bible, the bible wins until revised |
| Same PR docs | Product-impacting PRs include doc updates when behavior/IA/data changes |
| No silent scope | “While we’re here” features need checklist against [02_PRODUCT_PRINCIPLES.md](./02_PRODUCT_PRINCIPLES.md) |

---

## 4. No duplicated code / no duplicated domains

1. One workflow → one domain module.  
2. Shared logic lives in shared libraries — do not copy-paste across portals.  
3. Client Portal must not reimplement Agent Portal business rules; share domain services.  
4. If two features need the same policy, extract it before shipping the second.  
5. Review PRs specifically for duplication.

---

## 5. Scalable architecture

| Rule | Meaning |
| --- | --- |
| Honor hierarchy | Platform → Company → Business Unit → Client Workspace scoping on every query |
| Tenancy checks | Server-side enforcement; never trust client scope alone |
| Explicit visibility | Portal publish flags; default deny for client surfaces |
| Async-ready | Automation actions designed to run as jobs with logs |
| Avoid N² hacks | No unbounded list scans where indexed lookups/RPCs belong |
| Soft deletes / archive | Prefer status lifecycles over destructive history loss |

---

## 6. API first

1. Define server actions / API contracts for domain operations before UI polish.  
2. UI is a consumer of domain APIs — not the source of business rules.  
3. Portals (Agent / Client) call the same domain layer with different authorization.  
4. External channels (email, WhatsApp, payments) sit behind provider interfaces.  
5. Version or evolve contracts deliberately; don’t break Client Portal silently.

---

## 7. Security and access

1. Invitation-first until Phase 8.  
2. Least privilege roles.  
3. Audit sensitive actions (invites, payments, permission changes, portal publish).  
4. Never log raw secrets or invitation tokens.  
5. Separated sessions/surfaces for Agent vs Client.

---

## 8. Review before commit

Before committing:

- [ ] Principles checklist considered  
- [ ] No unintended scope  
- [ ] Duplication reviewed  
- [ ] Docs updated if needed  
- [ ] Types make sense for domain changes  

Do not commit secrets (`.env`, keys).

---

## 9. Verify before push

Required gates for code changes:

1. **TypeScript** passes  
2. **ESLint** passes  
3. **Production build** passes  
4. Relevant manual/smoke checks for touched portals  

Push only after local gates pass. Fix failures with new commits (no force-push to main).

---

## 10. Branch and delivery hygiene

| Rule | Practice |
| --- | --- |
| Small PRs | Prefer phase-aligned vertical slices |
| Main protected | Reviews required for product code |
| Migrations | Forward-only; documented; never casual destructive edits |
| Feature flags | Use for risky portal/automation launches when needed |

---

## 11. Testing expectations (progressive)

| Layer | Expectation |
| --- | --- |
| Domain logic | Unit tests for critical state transitions (finance, invites, approvals) |
| Authorization | Tests that cross-tenant access fails |
| Automation | Tests for idempotency of reminder/email triggers |
| Portal visibility | Tests that unpublished artifacts stay hidden |

Depth increases by phase; Foundation may be lighter, Finance/Portal/Automation must be strict.

---

## 12. AI feature rules (Phase 6+)

1. AI never becomes system of record.  
2. Money and legal mutations require human confirmation unless explicitly approved later.  
3. Prompts/tools must be tenant-scoped.  
4. Outputs that email/notify clients should be reviewable or template-bound.

---

## 13. Definition of ready (engineering)

A story is ready to build only if:

1. Mapped to a roadmap phase  
2. Layer + entity named  
3. Workflow described  
4. API/domain touchpoints listed  
5. Automation impact noted  
6. Naming is functional  

---

## 14. Definition of done (engineering)

1. Implements the approved workflow  
2. Respects tenancy and portal separation  
3. Docs updated  
4. Gates green (types, lint, build)  
5. Reviewed  
6. Pushed to the agreed branch / released per process  

---

## 15. Enforcement

| Role | Duty |
| --- | --- |
| Engineering | Apply rules in design and PR review |
| Product | Block work that skips bible updates |
| Anyone | May halt a PR that violates P1–P12 or these rules |

**Violations** are corrected before merge — not noted as follow-ups by default.
