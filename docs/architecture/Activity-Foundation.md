# Activity Foundation

**Status:** Project 018 foundation documentation
**Scope:** Permanent Activity domain definitions and Project 017 Audit
compatibility only. No generation, persistence, filtering, search, rendering,
notifications, API, UI, or business logic.

---

## 1. Purpose

Activity provides RIVA's universal operational history model. It powers future
timeline history, notifications, AI summaries, audit correlation, and
analytics without coupling source domains to a presentation or persistence
engine.

Activity and the existing Audit foundation share actor and target vocabulary
but serve distinct needs:

- **Activity** is human-readable operational history.
- **Audit** is structured evidence of attempted and completed actions.

Project 018 upgrades Activity to a self-contained model with embedded actor,
target, action, category, result, and visibility values. Existing Audit and
invitation audit behavior remains unchanged.

---

## 2. Domain models

### Activity

A universal timeline event scoped to a Workspace and optionally a Company and
Project. It embeds an actor, polymorphic target, action, category, result,
visibility boundary, extensible metadata, and creation timestamp.

### ActivityActor

Identifies who or what generated an Activity or Audit record. Supported actor
types are:

- `person`
- `system`
- `ai`
- `automation`

System, AI, and Automation actors do not require a Person reference.

### ActivityTarget

Identifies a polymorphic domain target. Supported target types include:

- Workspace
- Company
- Project
- Client
- Vendor
- Task
- Timeline
- Meeting
- Document
- File
- Invoice
- User

### ActivityAction

Classifies events using enum values for Created, Updated, Deleted,
Restored, Assigned, Unassigned, Uploaded, Downloaded, Commented, Mentioned,
Completed, Cancelled, Archived, Logged In, and Logged Out activities.

### ActivityCategory

Provides an extensible grouping for Activities. Project 018 defines no
category catalog or seed data.

### ActivityResult

Records whether an Activity is `success`, `failed`, `denied`, `cancelled`, or
`pending`.

### ActivityVisibility

Defines the future audience boundary as `private`, `internal`, `workspace`,
`company`, or `public`. Project 018 does not enforce visibility.

### AuditLog

Captures an actor, action, entity type/ID, previous/new values, result, request
context, and timestamp. Immutability and storage guarantees are future
implementation concerns.

### AuditAction

Classifies the action represented by an Audit record using the permanent action
code vocabulary.

### AuditResult

Classifies an Audit outcome as:

- `success`
- `failed`
- `denied`

---

## 3. Activity flow

```text
Actor
  ↓
Action (ActivityAction)
  ↓
Target (ActivityTarget)
  ↓
Activity Timeline
```

1. `ActivityActor` identifies a Person, system, AI, or Automation actor.
2. `ActivityAction` describes what happened.
3. `ActivityTarget` identifies the affected domain entity.
4. `ActivityResult` records the outcome.
5. `ActivityVisibility` records the future audience boundary.
6. `Activity` records the event and its scope.
7. Future timeline views may consume these records without changing source
   domain models.

Project 018 does not generate, filter, aggregate, or render Activities.

---

## 4. Audit flow

```text
Actor
  ↓
Audit Action
  ↓
Entity
  ↓
Audit Record
```

1. `ActivityActor` identifies who or what attempted an action.
2. `AuditAction` classifies the attempted operation.
3. Entity type and ID identify the affected record.
4. `AuditLog` captures previous/new values and request context.
5. `AuditResult` records success, failure, or denial.

Project 017 does not define redaction, retention, immutability, or compliance
policies.

---

## Relationships

```text
Workspace
  └── Activity
        ├── ActivityActor
        ├── ActivityTarget
        ├── ActivityAction
        ├── ActivityCategory
        ├── ActivityResult
        └── ActivityVisibility
```

- Every Activity belongs to one Workspace.
- Company and Project scope are optional.
- Actor and Target are embedded references, not loaded domain aggregates.
- Category remains an extensible reference model.
- Result and Visibility are explicit enums.
- Metadata is intentionally schema-neutral for future module-specific context.

---

## Architecture

```text
src/types/activity/
├── Activity.ts
├── ActivityActor.ts
├── ActivityTarget.ts
├── ActivityAction.ts
├── ActivityCategory.ts
├── ActivityVisibility.ts
├── ActivityResult.ts
├── ActivityType.ts          # Project 017 compatibility
├── AuditLog.ts
├── AuditAction.ts
├── AuditResult.ts
└── index.ts

src/lib/activity/
├── ActivityFoundation.ts
├── ActivityEnums.ts
├── ActivityHelpers.ts
├── activity.ts
├── actors.ts
├── catalog.ts
├── audit.ts
└── index.ts
```

- `src/types/activity/` owns permanent Activity & Audit definitions.
- `src/lib/activity/` provides stable barrel exports.
- Existing modules and invitation audit code remain untouched.
- Metadata and audit values remain opaque until persistence and privacy rules
  are established.

---

## 5. Future extensions

### Global Timeline

Aggregate Activities across all authorized Workspace and Company scopes.

### Project Timeline

Display Project-specific operational history alongside Project Timeline events.

### Client Timeline

Combine Client participation, communication, and status history.

### AI Activity

Record AI actions using explicit AI actors and AI Action targets.

### Security Audit

Add redaction, request correlation, retention, tamper resistance, and security
analysis.

### Compliance History

Add immutable storage, export, retention policies, and regulatory evidence.

Additional future work may include repository mapping, validation schemas,
filtering, search, notification triggers, API/UI integration, and archival.

---

## Explicit non-goals (Project 018)

- No CRUD, repositories, API, SQL, migrations, or services
- No timeline rendering, filtering, or search
- No notifications
- No activity generation or audit persistence
- No business rules or validation
- No UI
