# 09 — Sprint Plan

**Status:** CTO Technical Blueprint  
**Scope:** Planning only — no implementation

---

## 1. Purpose

Define the technical sprint sequence after the CTO Technical Blueprint is reviewed and locked. This plan does not start development.

---

## 2. Development gate

Before the first build sprint:

1. Product Bible approved.
2. Sprint 008 Blueprint approved.
3. CTO Technical Blueprint reviewed and locked.
4. Prototype V0 remains archived.
5. Rebuild scope approved explicitly.

---

## 3. Proposed sprint sequence

| Sprint | Theme | Outcome |
| --- | --- | --- |
| 009 | Technical foundation | New app spine, environment, quality gates, domain folder structure |
| 010 | Tenancy foundation | Company, Business Unit, context resolver, tenant-safe APIs |
| 011 | Authentication rebuild | Agent invitation, sessions, platform/admin separation |
| 012 | Permission engine | Scoped memberships, roles, capabilities |
| 013 | Navigation shell | `/platform`, `/app`, `/portal` route separation (minimal UI only when allowed) |
| 014 | Client Workspace core | Workspace lifecycle and module enablement |
| 015 | Core modules foundation | Tasks, timeline, meetings contracts |
| 016 | Files/storage foundation | Metadata, upload policy, portal-safe visibility |
| 017 | Finance foundation | Invoices/payments logical workflows |
| 018 | Client Portal foundation | Portal key resolution, landing projection, access |
| 019 | Notifications foundation | Domain events, inbox, email queue |
| 020 | Automation foundation | Rules, runs, reminders |
| 021 | SaaS readiness pass | Entitlements, quotas, deployment hardening |

Sprint numbers are provisional and require approval before execution.

---

## 4. Phase alignment

| Product phase | Technical sprints |
| --- | --- |
| Foundation | 009–012 |
| Agent Portal | 013–015 |
| Client Workspace | 014–017 |
| Client Portal | 018 |
| Automation | 019–020 |
| SaaS readiness | 021+ |

---

## 5. Sprint rules

- Every sprint starts with docs/spec confirmation.
- No feature begins without API/domain contract.
- No UI polish before domain and permission model.
- Every code sprint must pass TypeScript, ESLint, build, and review.
- Migrations, when eventually introduced, are forward-only and reviewed.

---

## 6. Multi-company and multi-country checkpoints

Every implementation sprint must answer:

- Where is `company_id` resolved?
- Which workspace/unit scope applies?
- Which locale/timezone/currency applies?
- What is the Client Portal projection impact?
- What happens for suspended companies?

---

## 7. Non-goals

This plan does not authorize Sprint 009. It only prepares the sequence for approval.
