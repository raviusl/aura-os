# Workspace Foundation

**Status:** Sprint 004 foundation documentation  
**Scope:** Workspace domain definitions and boundaries only. No SQL. No API. No UI.

---

## Existing implementation (reused)

The repository already contains runtime workspace behavior. Sprint 004 does not
replace it.

| Area | Location | Notes |
| --- | --- | --- |
| Workspace runtime operations | `src/core/workspace/workspace.ts` | Existing create/read/settings/status helpers |
| Active workspace resolution | `src/core/workspace/active-workspace.ts` | Cookie-backed active workspace selection |
| Workspace provisioning | `src/core/workspace/provision.ts` | Existing setup flow |
| Membership runtime operations | `src/core/membership/memberships.ts` | Existing membership persistence and permissions |
| Workspace UI | `src/features/workspace/` | Existing forms/switcher preserved |

Sprint 004 adds a foundation type surface under `src/types/workspace/` and a
thin library facade under `src/lib/workspace/`.

---

## Folder structure

```text
src/types/workspace/
├── Workspace.ts
├── WorkspaceMember.ts
├── WorkspaceSettings.ts
└── index.ts

src/lib/workspace/
├── index.ts
├── workspace.ts
├── member.ts
└── settings.ts
```

---

## Workspace lifecycle

A workspace represents the top-level tenant boundary for RIVA. The foundation
types model the lifecycle as a status value only:

| Status | Meaning |
| --- | --- |
| `pending` | Workspace exists but is not fully active |
| `active` | Workspace is available for normal operation |
| `suspended` | Workspace access is temporarily restricted |
| `archived` | Workspace is retained but no longer active |

Runtime lifecycle transitions are handled by existing `core/workspace` modules.
Sprint 004 introduces no new persistence, mutation, or workflow code.

---

## Workspace ownership

Ownership is modeled as a relationship between a workspace and a user or
membership. The Sprint 004 foundation keeps ownership out of the base
`Workspace` interface so it can remain a simple tenant identity object:

- Workspace ID
- Name
- Slug
- Status
- Timezone
- Locale
- Created At
- Updated At

Existing runtime code may include additional database fields such as owner,
currency, country, logo, or domain. Those remain implementation details of
current core modules until a later sprint formalizes them.

---

## Member relationship

`WorkspaceMember` describes the minimum relationship between a user and a
workspace:

- User ID
- Workspace ID
- Role
- Invitation Status

The role uses the authentication foundation role key type from Sprint 003.
Invitation status is definition-only and does not create invitation flows,
tables, or permission logic.

---

## Settings relationship

`WorkspaceSettings` groups future configuration into stable buckets:

- Branding
- Locale
- Timezone
- Preferences

Settings are modeled as type definitions only. Existing settings forms and
database-backed workspace fields remain untouched.

---

## Future expansion

Future sprints can extend this foundation by mapping these definitions to:

- Database-generated types
- Repository interfaces
- Workspace settings persistence
- Membership role alignment
- Workspace-level permission policies
- UI forms and validation schemas

Those expansions are explicitly out of scope for Sprint 004.

---

## Explicit non-goals (Sprint 004)

- No SQL or Supabase table changes
- No API routes
- No React components
- No pages or dashboard changes
- No CRUD
- No business modules
