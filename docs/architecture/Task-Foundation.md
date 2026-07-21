# Task Foundation

**Status:** Project 010 foundation documentation  
**Scope:** Permanent Task domain definitions only. No task engine, workflow,
automation, persistence, validation, API, UI, or business rules.

---

## 1. Purpose

Task is the smallest executable operational unit inside a Project. It captures
work identity, scheduling references, classification, assignment, hierarchy,
and dependency references without implementing execution behavior.

Project 010 establishes stable domain models that future Task capabilities can
reuse.

The existing database-specific Task shape remains unchanged.

---

## 2. Domain models

### Task

The operational identity contains:

- Task and Project IDs
- Optional parent Task ID
- Stable code, title, and description
- Status, priority, and type IDs
- Due, start, and completion timestamps
- Creator Person ID
- Creation and update timestamps

### TaskStatus

Describes a named Task lifecycle state with an optional presentation color.
No allowed statuses or transition rules are defined.

### TaskPriority

Describes ordered urgency using `level` and an optional presentation color.
No prioritization behavior is defined.

### TaskType

Describes a Task classification using a stable ID, code, name, and description.
No catalog or seed values are included.

### TaskAssignee

References one Person and authorization Role assigned to a Task.

### TaskDependency

Defines a directional reference from one Task to another dependency. The
relationship type remains extensible. No dependency resolution is implemented.

### TaskReference

Provides the full operational hierarchy reference:

```text
Workspace → Company → Project → Task
```

---

## 3. Relationships

```text
Project
   └── Task
         ├── Parent Task (optional)
         ├── TaskStatus
         ├── TaskPriority
         ├── TaskType
         ├── Creator (Person)
         ├── TaskAssignee ── Person + Role
         └── TaskDependency ── Task
```

- Every Task belongs to one Project.
- A Task may reference one parent Task.
- A Task references one status, priority, and type definition.
- A Task may have multiple assignee and dependency references.
- Relationship loading, validation, and consistency rules are outside Project
  010.

---

## 4. Task hierarchy

```text
Workspace
   ↓
Company
   ↓
Project
   ↓
Task
```

`TaskReference` preserves each tenancy level so future persistence and
authorization layers can enforce scope explicitly.

`parentTaskId` supports hierarchical work units, but Project 010 does not
implement:

- Tree traversal
- Depth constraints
- Parent-child lifecycle propagation
- Checklist behavior
- Completion rollups

---

## Architecture

```text
src/types/task/
├── Task.ts
├── TaskStatus.ts
├── TaskPriority.ts
├── TaskType.ts
├── TaskAssignee.ts
├── TaskDependency.ts
├── TaskReference.ts
└── index.ts

src/lib/task/
├── task.ts
├── catalog.ts
├── relationships.ts
└── index.ts
```

- `src/types/task/` owns permanent Task definitions.
- `src/lib/task/` provides stable barrel exports.
- Existing database Task types remain untouched.

---

## 5. Future extension

Future Projects may add:

- Database and repository mapping
- Validation schemas
- Status, priority, and type catalogs
- Task lifecycle transitions
- Parent-child hierarchy rules
- Dependency resolution
- Assignment management
- Checklist and notification engines
- Automation and audit history
- API and UI integrations

Those extensions are outside Project 010.

---

## Explicit non-goals (Project 010)

- No CRUD, API, SQL, repositories, or services
- No Task, checklist, workflow, or automation engine
- No notifications
- No business rules or validation
- No UI
- No seed data
