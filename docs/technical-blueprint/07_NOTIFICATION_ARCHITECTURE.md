# 07 — Notification Architecture

**Status:** CTO Technical Blueprint  
**Scope:** Notification and delivery design only

---

## 1. Purpose

Define how RIVA generates, stores, routes, and delivers notifications across Agent Portal, Client Portal, email, future WhatsApp, future push, and automation workflows.

---

## 2. Notification model

```mermaid
flowchart LR
  Event[Domain event] --> Rule[Notification rule]
  Rule --> Recipient[Recipient resolver]
  Recipient --> Inbox[Notification record]
  Inbox --> Channel[Delivery channel]
  Channel --> Log[Delivery log]
```

---

## 3. Notification sources

| Source | Examples |
| --- | --- |
| Workspace modules | task assigned, invoice sent, file published |
| Portal activity | payment received, approval decided |
| Automation | reminders, escalations, digests |
| Platform | company suspended, security alerts |
| Future AI | risk signals, generated summaries |

---

## 4. Recipient scopes

| Scope | Recipients |
| --- | --- |
| Company | owners/admins |
| Business Unit | unit admins/members |
| Workspace | assigned agents |
| Portal | portal users |
| Platform | platform admins |

Notifications are stored per recipient, not as one broad global row.

---

## 5. Channels

| Channel | Phase |
| --- | --- |
| In-app Agent notification | Core |
| In-app Client Portal notification | Client Portal phase |
| Email | Core automation |
| WhatsApp | Future |
| Mobile push | Mobile phase |
| Webhook | Future SaaS/integrations |

---

## 6. Multi-company support

Every notification carries `company_id`. Workspace notifications also carry `workspace_id`. Company A notifications can never resolve recipients in Company B.

---

## 7. Multi-country support

- Recipient locale drives copy/template selection.
- Recipient timezone drives reminder timing.
- Company country can determine allowed channels and compliance copy.
- Email/WhatsApp sender identity can vary by company/region.

---

## 8. Client Portal compatibility

Client notifications are portal-safe projections. They may reference:

- published file/gallery changes
- visible timeline updates
- invoices/payments
- approvals
- portal messages

They must not reference internal notes, private tasks, or agent-only vendor costs.

---

## 9. Delivery reliability

| Concern | Rule |
| --- | --- |
| Idempotency | Event + recipient + channel key prevents duplicates |
| Retries | Retry transient provider failures |
| Dead letters | Failed final attempts visible to admins |
| Audit | Sensitive messages logged |
| Preferences | Recipient/channel preferences respected where allowed |

---

## 10. SaaS considerations

- Channel quotas per company plan.
- Provider configuration per company in enterprise mode.
- Digest settings and compliance templates per region.

---

## 11. Non-goals

No provider integration, no worker code, no templates implemented.
