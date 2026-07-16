# 02 — Product Principles

**Status:** Binding for all future RIVA features  
**Rule:** If a proposed feature violates a principle, it is rejected or redesigned before build.

---

## 1. Purpose

Product principles are the decision filter for RIVA. Every epic, sprint, and pull request must be justifiable against this list.

---

## 2. Core principles

### P1 — Hierarchy is sacred

All product structure follows:

**Platform → Company → Business Unit → Client Workspace → Client Modules → Client Portal → Automation → AI**

No feature may invent a second tenancy model, orphan data outside this tree, or skip layers without an explicit exception in the Product Bible.

---

### P2 — Two portals, never one mixed surface

| Portal | Audience |
| --- | --- |
| **Agent Portal** | Internal operators |
| **Client Portal** | Customers |

Agents must not “live” in the Client Portal. Clients must not navigate Agent OS modules. Shared *data* is fine; shared *shells* are not.

---

### P3 — Client Workspace is the system of record for delivery

Client work (timeline, tasks, files, finance, meetings, gallery, portal content) belongs to a **Client Workspace**.  

Company-level directories (vendors master list, templates, team) stay at Company / Business Unit — but delivery state is workspace-scoped.

---

### P4 — Invitation and access control first

RIVA prefers controlled access over open registration until Public SaaS (Phase 8).

- Agents join by invitation / admin provisioning.
- Clients access portals by invitation or secure share.
- Permissions are role- and scope-aware (Company / Unit / Workspace).

---

### P5 — Workflow over screens

Design **workflows** (states, actors, handoffs, approvals) before UI.  

A beautiful screen that does not advance a workflow is incomplete. See [05_AGENT_PORTAL.md](./05_AGENT_PORTAL.md) and [06_CLIENT_PORTAL.md](./06_CLIENT_PORTAL.md).

---

### P6 — Automation before AI

If a problem can be solved with deterministic rules (email, reminder, approval, status change), solve it with **Automation** first.  

AI is for judgment, drafting, ranking, and personalization — not for replacing missing workflows.

---

### P7 — API-first and documentation-first

- Product behavior is documented before implementation.
- Domain capabilities are designed as APIs / server boundaries, not only as pages.
- Docs in `/docs/product` outrank informal chat decisions unless the bible is updated.

---

### P8 — One concept, one home

No duplicated domains.  

Examples of violations: two unrelated “task” systems; finance in chat + finance module with no sync; portal timeline that is not the workspace timeline.

---

### P9 — Client experience is a product, not an export

The Client Portal is a first-class experience: landing, countdown, timeline, files, gallery, invoices, payments, notifications, music, background, personalization.  

It is not a PDF dump or a read-only clone of agent tables.

---

### P10 — Scalable by architecture, not by heroics

Design for:

- many Companies
- many Business Units per Company
- many Client Workspaces per Unit
- many agents and clients concurrently

Shortcuts that only work for one studio are temporary debt and must be labeled as such.

---

### P11 — Functional naming until marketing maturity

Use clear functional names in product and engineering until branding for modules is intentionally decided. See [09_NAMING_GUIDE.md](./09_NAMING_GUIDE.md).

---

### P12 — Review, verify, then ship

No merge of product-impacting work without:

1. Principle check  
2. Type / lint / build verification where code exists  
3. Explicit review  

See [10_DEVELOPMENT_RULES.md](./10_DEVELOPMENT_RULES.md).

---

## 3. Feature intake checklist

Before approving any feature, answer:

| # | Question | Required answer |
| --- | --- | --- |
| 1 | Which hierarchy layer does it belong to? | Named layer |
| 2 | Agent Portal, Client Portal, both (data only), or Platform? | Named surface |
| 3 | What workflow states change? | Listed |
| 4 | What entity owns the data? | From [04_DATA_ARCHITECTURE.md](./04_DATA_ARCHITECTURE.md) |
| 5 | Can automation handle part of it? | Yes/No + plan |
| 6 | Does it duplicate an existing concept? | Must be No |
| 7 | Does it require AI *now*? | Prefer No until Phase 6 |
| 8 | Does it satisfy P1–P12? | Yes |

---

## 4. Anti-patterns (reject)

- Building Client Portal chrome before Client Workspace modules exist
- Adding AI chat without structured workspace data
- Public signup before invitation / company provisioning model is stable
- Hard-coding “wedding” as the only object type in the core model
- Storing portal-only copies of timeline/finance that diverge from agent data
- Marketing names for unfinished modules
- Feature work during Product Bible approval freeze (current phase)

---

## 5. Principle ownership

| Role | Duty |
| --- | --- |
| Product | Keep principles current; approve exceptions in writing |
| Engineering | Enforce in design reviews and PR reviews |
| Design | Align IA and flows to principles — not the reverse |

**Exceptions** require a dated note in the Product Bible or an ADR linked from this folder.
