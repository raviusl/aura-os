# 09 — Naming Guide

**Status:** Temporary functional naming rules for RIVA  
**Principle:** Clarity now; marketing names later

---

## 1. Purpose

Prevent premature brand inventiveness from fragmenting the product. Use **functional names** in documentation, code, APIs, and admin UI until a deliberate naming pass.

---

## 2. Product name

| Context | Name |
| --- | --- |
| Product | **RIVA** |
| This bible | RIVA Product Bible |
| Prior engineering codename | May appear historically as Aura OS — do not invent new dual brands |

Do not create alternate product titles (e.g. “RIVA Studio”, “RIVA Cloud”) unless approved.

---

## 3. Hierarchy names (locked functional terms)

| Layer | Functional name | Avoid for now |
| --- | --- | --- |
| Top | Platform | “Universe”, “Grid” |
| Tenant | Company | “Orgverse”, cute spellings |
| Division | Business Unit | “Squad”, “Tribe” |
| Delivery container | Client Workspace | “Mission”, “Board”, “Magic Room” |
| Capabilities | Client Modules | Fantasy module brands |
| Customer surface | Client Portal | “Love Portal”, “Bride App” as official names |
| Operator surface | Agent Portal | “Cockpit”, “Command Deck” as official names |
| Execution plane | Automation | “Autopilot” as sole name |
| Intelligence | AI | Vendor model nicknames as product modules |

---

## 4. Entity names

Prefer domain English:

| Use | Don’t use yet |
| --- | --- |
| Client | Guest-of-honor as entity type |
| Vendor | Partner-star |
| Timeline | JourneyMap™ |
| Task | Quest |
| Meeting | Huddle (as entity) |
| Invoice / Payment | SparkPay |
| File / Gallery | Vault / Muse |
| Notification | Whisper |
| Approval | Blessing |

Internal code identifiers should stay boring: `client_workspace`, `portal_config`, `invoice`, `timeline_item`.

---

## 5. Portal section names

Use the functional section list from [06_CLIENT_PORTAL.md](./06_CLIENT_PORTAL.md):

Landing, Countdown, Timeline, Files, Gallery, Invoices, Payments, Notifications, Music, Background, Personalization.

Marketing microcopy *inside* a client-facing portal may be warmer; **module and route names** stay functional.

---

## 6. Role names

Prefer:

- Super Admin  
- Company Owner  
- Company Admin  
- Business Unit Admin  
- Agent (or specific function: Planner, Coordinator, Finance, Sales, Designer)  
- Client User  
- Vendor User (future)

Avoid theatrical ranks (“Captain”, “Maestro”) as system role keys.

---

## 7. When marketing names are allowed

A marketing name is allowed only when all are true:

1. The capability is shipped or firmly scheduled  
2. Product explicitly approves the name  
3. Functional name remains in docs/API as alias  
4. Naming guide is updated in the same change

---

## 8. File and doc naming

| Area | Pattern |
| --- | --- |
| Product Bible | `NN_TITLE.md` in `/docs/product` |
| Engineering docs | Existing `/docs` tree; defer to Product Bible on conflicts |
| Migrations / tables | snake_case functional |

---

## 9. Quick rename test

If a proposed name needs a brand explanation to understand what it *does*, reject it for now.
