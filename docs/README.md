# Aura OS Documentation

Internal documentation for **Aura OS** — an AI operating system for service businesses (wedding planning first).

## Contents

| Document | Purpose |
| --- | --- |
| [ROADMAP.md](./ROADMAP.md) | Product phases and planned modules |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System stack and high-level design |
| [DATA_MODEL.md](./DATA_MODEL.md) | Target core data model (entities, files, roles) |
| [DATABASE.md](./DATABASE.md) | Current PostgreSQL tables and relationships |
| [UI_GUIDELINES.md](./UI_GUIDELINES.md) | Visual and interaction design principles |
| [SPRINT002.md](./SPRINT002.md) | Sprint 002 objectives and scope |

## Current status

- **Sprint 001** delivered the Command Center foundation: auth, dashboard shell, and core schema (`profiles`, `clients`, `weddings`, `meetings`, `tasks`, `financial_records`).
- **Sprint 002** established documentation and architecture foundations.
- **Sprint 003** defines the target core data model (Workspace, Event templates, Files, Viewer roles) — architecture docs only; no schema or UI changes.

## Related project docs

- Root [README.md](../README.md) — setup and local development
- [supabase/README.md](../supabase/README.md) — migration and auth notes
