# Activity & Audit Foundation

**Status:** Project 017 foundation documentation  
**Scope:** Permanent Activity & Audit domain definitions only. No generation,
persistence, filtering, search, rendering, notifications, API, UI, or business
logic.

---

## 1. Purpose

Activity & Audit provide RIVA's universal history layer.

Activity records explain what happened across Workspace, Company, People,
Client, Vendor, Project, Task, Timeline, Asset, Note, Comment, and future AI
actions. Audit records preserve security- and compliance-oriented change
history, including before/after values and outcomes.

The two concepts share actors and target vocabulary but serve distinct needs:

- **Activity** is human-readable operational history.
- **Audit** is structured evidence of attempted and completed actions.

Project 017 defines data structures only. Existing invitation audit behavior is
not modified.

---

## 2. Domain models

### Activity

A universal timeline event scoped to a Workspace and optionally a Company and
Project. It references an actor, polymorphic target, activity type, category,
human-readable title/description, extensible metadata, and creation timestamp.

### ActivityActor

Identifies who or what generated an Activity or Audit record. Supported actor
types are:

- `person`
- `system`
- `ai`

System and AI actors do not require a Person reference.

### ActivityTarget

Identifies a polymorphic domain target. Supported target types include:

- Workspace
- Company
- Person
- Client
- Vendor
- Project
- Task
- Timeline
- Asset
- Note
- Comment
- AI Action

### ActivityType

Classifies events using stable codes for future Created, Updated, Deleted,
Restored, Assigned, Unassigned, Uploaded, Downloaded, Commented, Mentioned,
Completed, Cancelled, Archived, Logged In, and Logged Out activities.

### ActivityCategory

Provides an extensible grouping for Activity Types. Project 017 defines no
category catalog or seed data.

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
Action (ActivityType)
  ↓
Target (ActivityTarget)
  ↓
Activity Timeline
```

1. `ActivityActor` identifies a Person, system, or AI actor.
2. `ActivityType` describes what happened.
3. `ActivityTarget` identifies the affected domain entity.
4. `Activity` records the display-oriented event and its scope.
5. Future timeline views may consume these records without changing source
   domain models.

Project 017 does not generate, filter, aggregate, or render Activities.

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

## Architecture

```text
src/types/activity/
├── Activity.ts
├── ActivityActor.ts
├── ActivityTarget.ts
├── ActivityType.ts
├── ActivityCategory.ts
├── AuditLog.ts
├── AuditAction.ts
├── AuditResult.ts
└── index.ts

src/lib/activity/
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

## Explicit non-goals (Project 017)

- No CRUD, repositories, API, SQL, migrations, or services
- No timeline rendering, filtering, or search
- No notifications
- No activity generation or audit persistence
- No business rules or validation
- No UI
