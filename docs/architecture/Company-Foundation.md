# Company Foundation

**Status:** Project 005 foundation documentation  
**Scope:** Company domain definitions and boundaries only. No SQL, API, UI, CRUD,
or repository implementation.

---

## Existing implementation (reused)

The repository already contains runtime company behavior. Project 005 preserves
and does not duplicate it.

| Area | Location | Notes |
| --- | --- | --- |
| Company runtime operations | `src/core/company/company.ts` | Existing lifecycle and settings operations |
| Company data access | `src/core/company/repository.ts` | Existing repository implementation |
| Active company resolution | `src/core/company/active-company.ts` | Existing active-company context |
| Company UI | `src/features/company/` | Existing forms, switcher, and provider |
| Runtime domain types | `src/core/types.ts` | Existing database-oriented company shape |

Project 005 adds a definition-only type surface under `src/types/company/` and
a thin export facade under `src/lib/company/`.

---

## Folder structure

```text
src/types/company/
├── Company.ts
├── CompanyMetadata.ts
├── CompanyRelationships.ts
└── index.ts

src/lib/company/
├── company.ts
├── metadata.ts
├── relationships.ts
└── index.ts
```

---

## Company model

A company is an operating entity inside one workspace. Its foundation identity
contains:

- Company ID
- Name
- Slug
- Status
- Type
- Created At
- Updated At

The foundation model uses application-facing camel-case properties. Existing
runtime modules retain their database-oriented shape and behavior.

---

## Company status

Project 005 reuses the statuses already established by the runtime domain:

| Status | Meaning |
| --- | --- |
| `active` | Available for normal operation |
| `suspended` | Temporarily restricted |
| `archived` | Retained but no longer active |

Status transitions remain the responsibility of existing core modules. No
transition or validation logic is introduced here.

---

## Company type

The foundation catalog mirrors the existing company classifications:

- `agency`
- `brand`
- `venue`
- `corporate`
- `wedding`
- `other`

Classification is descriptive only and does not drive workflow in this Project.

---

## Company metadata

`CompanyMetadata` groups optional descriptive and regional values already
represented by the runtime domain:

- Logo URL
- Country
- Timezone
- Locale
- Currency

Metadata is definition-only. Project 005 adds no storage, validation, forms, or
update operations.

---

## Company relationships

`CompanyRelationships` captures the known aggregate boundary:

```text
Workspace → Company
```

Every company belongs to one workspace. Child collections such as memberships,
projects, clients, and vendors are intentionally not embedded in the Company
foundation model. Their existing runtime relationships remain unchanged and
can be formalized by their own Projects.

---

## Architecture boundaries

- `src/types/company/` owns reusable definitions.
- `src/lib/company/` exposes those definitions through stable barrel exports.
- `src/core/company/` continues to own existing runtime behavior.
- `src/features/company/` continues to own existing UI integration.
- Supabase schema and database mappings remain unchanged.

---

## Future expansion

Future Projects may align this foundation with:

- Database-generated types
- Validation schemas
- Repository contracts
- Membership and permission models
- Company settings persistence
- Domain-specific UI

Those changes are outside Project 005.

---

## Explicit non-goals (Project 005)

- No SQL or migrations
- No repository implementation
- No CRUD or business workflows
- No API routes
- No React components or pages
- No dashboard or routing changes
