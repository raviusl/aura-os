# Project Foundation

**Status:** Project 009 foundation documentation  
**Scope:** Permanent Project domain definitions only. No workflow engine,
timeline logic, persistence, validation, API, UI, or business rules.

---

## 1. Purpose

Project is RIVA's core operational object. It belongs to one Workspace and one
Company, has a classified type, lifecycle status and stage, and can reference
an owner, members, and timeline milestones.

Project 009 defines the stable vocabulary and relationships for that object
without implementing behavior.

Existing runtime Project CRUD and repository code remains unchanged.

---

## 2. Domain models

### Project

The aggregate identity contains:

- Project, Workspace, and Company IDs
- Stable code, name, and description
- Type, status, and stage IDs
- Planned start and end dates
- Owner Person ID
- Creation and update timestamps

### ProjectType

Describes the Project classification using a stable ID, code, name, and
description. Project 009 defines no catalog or seed values.

### ProjectStatus

Describes a named lifecycle status with an optional presentation color. Status
transition rules are not defined.

### ProjectStage

Describes an ordered lifecycle phase using `sequence`. Stage progression logic
is not defined.

### ProjectMember

References a Person and authorization Role participating in one Project.

### ProjectTimeline

References one milestone with planned and actual dates. It is a data structure,
not a timeline engine.

### ProjectReference

Provides the minimal tenancy reference:

```text
Workspace → Company → Project
```

---

## 3. Relationships

```text
Workspace
   └── Company
         └── Project
               ├── ProjectType
               ├── ProjectStatus
               ├── ProjectStage
               ├── Owner (Person)
               ├── ProjectMember ── Person + Role
               └── ProjectTimeline[]
```

- Every Project belongs to one Workspace and one Company.
- A Project references one type, status, and stage definition.
- A Project may reference one owner.
- A Project may have multiple member and timeline references.
- Relationship loading and consistency checks are outside Project 009.

The Project ID introduced here is also used by the Project-scoped authorization
reference from Project 008.

---

## 4. Project lifecycle overview

Project lifecycle is represented by two independent definitions:

- **Status** describes the Project's current lifecycle state.
- **Stage** describes its ordered operational phase.

Project 009 does not define:

- Allowed statuses or stages
- Transition rules
- Automatic progression
- Date calculation
- Completion behavior
- Workflow triggers

Those decisions belong to future workflow and business-rule Projects.

---

## Architecture

```text
src/types/project/
├── Project.ts
├── ProjectType.ts
├── ProjectStatus.ts
├── ProjectStage.ts
├── ProjectMember.ts
├── ProjectTimeline.ts
├── ProjectReference.ts
└── index.ts

src/lib/project/
├── project.ts
├── catalog.ts
├── relationships.ts
└── index.ts
```

- `src/types/project/` owns permanent Project definitions.
- `src/lib/project/` provides stable barrel exports.
- `src/core/project/` retains existing runtime behavior.
- `src/features/project/` retains existing UI behavior.

---

## 5. Future extension

Future Projects may add:

- Database and repository mapping
- Validation schemas
- Type, status, and stage catalogs
- Lifecycle transition rules
- Timeline and milestone engines
- Project membership management
- Ownership transfer
- Audit history
- API and UI integrations

Those extensions are outside Project 009.

---

## Explicit non-goals (Project 009)

- No CRUD, API, SQL, repositories, or services
- No workflow or timeline logic
- No business rules or validation
- No UI
- No seed data
