# 10 — Coding Standards

**Status:** CTO Technical Blueprint  
**Scope:** Engineering rules for future rebuild

---

## 1. Purpose

Define the engineering standards that will govern RIVA implementation after the CTO Technical Blueprint is locked and development is explicitly authorized.

---

## 2. Core rules

1. Documentation first.
2. API/domain first.
3. No duplicated domain logic.
4. No tenant-unscoped data access.
5. No UI-owned business rules.
6. No Client Portal access to Agent-only data.
7. No production code without review/build gates.

---

## 3. Architecture boundaries

| Layer | Rule |
| --- | --- |
| UI | Presentation only; calls API/domain boundary |
| API | Validates input, resolves context, authorizes |
| Domain | Owns workflows and invariants |
| Persistence | Tenant-scoped adapters only |
| Providers | Email/storage/payment behind interfaces |
| Jobs | Idempotent, logged, tenant-scoped |

---

## 4. Multi-company coding rules

- Every domain read/write must know the resolved `company_id`.
- Never trust `company_id` from client body without server resolution.
- Do not fetch globally and filter in UI.
- Tests must include cross-company denial cases for sensitive logic.

---

## 5. Multi-workspace coding rules

- Workspace modules require `workspace_id`.
- Delivery entities carry workspace and company context.
- Module services do not write other module tables directly.
- Workspace archive/suspended company states block writes.

---

## 6. Multi-country coding rules

- Store timestamps in UTC.
- Render dates with context timezone.
- Store money as integer minor units plus currency code.
- Do not hard-code country, currency, date format, or language.

---

## 7. Client Portal rules

- Portal reads projections only.
- New agent-created artifacts default to not portal-visible.
- Portal mutations are explicit and narrow.
- Portal session/cookies remain separate from Agent Portal.

---

## 8. API standards

- Stable domain error codes.
- User-safe messages.
- No provider/raw database errors leaked.
- Idempotent commands where retries are possible.
- Explicit versioning for external/public APIs once exposed.

---

## 9. Testing standards

Minimum future test categories:

| Category | Required focus |
| --- | --- |
| Domain unit tests | workflow transitions |
| Authorization tests | cross-tenant denial |
| API tests | validation and error codes |
| Portal tests | unpublished data hidden |
| Job tests | idempotency and retries |
| Finance tests | currency/amount correctness |

---

## 10. Review checklist

Before merging future code:

- [ ] Product/technical blueprint alignment checked
- [ ] No duplicated logic
- [ ] Tenant scope enforced
- [ ] Permissions checked server-side
- [ ] Client Portal impact reviewed
- [ ] Multi-country assumptions reviewed
- [ ] TypeScript passes
- [ ] ESLint passes
- [ ] Production build passes

---

## 11. Non-goals

This document does not modify existing lint config, TypeScript config, or application code.
