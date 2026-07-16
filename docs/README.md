# Aura OS Documentation

Internal documentation for **Aura OS** — an AI operating system for service businesses (wedding planning first).

## Contents

| Document | Purpose |
| --- | --- |
| [ROADMAP.md](./ROADMAP.md) | Product phases and planned modules |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System stack and high-level design |
| [DATA_MODEL.md](./DATA_MODEL.md) | Target core data model (entities, files, roles) |
| [USER_JOURNEY.md](./USER_JOURNEY.md) | Role-based journeys, workflows, and permissions |
| [PRODUCT_BLUEPRINT.md](./PRODUCT_BLUEPRINT.md) | Event OS modules and product architecture |
| [NAVIGATION.md](./NAVIGATION.md) | Top nav, sidebar behavior, navigation rules |
| [SIDEBAR_STRUCTURE.md](./SIDEBAR_STRUCTURE.md) | Nested left-sidebar information architecture |
| [PAGE_HIERARCHY.md](./PAGE_HIERARCHY.md) | Parent–child page trees |
| [URL_STRUCTURE.md](./URL_STRUCTURE.md) | REST-friendly routes and Viewer URLs |
| [DATABASE.md](./DATABASE.md) | Current PostgreSQL tables and relationships |
| [UI_GUIDELINES.md](./UI_GUIDELINES.md) | Visual and interaction design principles |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Tokens, naming, and UI component inventory |
| [SPRINT002.md](./SPRINT002.md) | Sprint 002 objectives and scope |
| [SPRINT004.md](./SPRINT004.md) | Sprint 004 objectives and scope |
| [SPRINT005.md](./SPRINT005.md) | Sprint 005 objectives and scope |
| [SPRINT006.md](./SPRINT006.md) | Sprint 006 objectives and scope |

## Current status

- **Sprint 001** delivered the Command Center foundation: auth, dashboard shell, and core schema (`profiles`, `clients`, `weddings`, `meetings`, `tasks`, `financial_records`).
- **Sprint 002** established documentation and architecture foundations.
- **Sprint 003** defines the target core data model (Workspace, Event templates, Files, Viewer roles).
- **Sprint 004** defines complete user journeys for ten roles (Owner through Guest).
- **Sprint 005** defines the product blueprint, navigation IA, page hierarchy, and URL structure.
- **Sprint 006** initializes the design system foundation (UI primitives + tokens) — no business pages or schema changes.

## Related project docs

- Root [README.md](../README.md) — setup and local development
- [supabase/README.md](../supabase/README.md) — migration and auth notes
