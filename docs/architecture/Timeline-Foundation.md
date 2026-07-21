# Timeline Foundation

**Status:** Project 011 foundation documentation  
**Scope:** Permanent Timeline domain definitions only. No scheduling, calendar,
reminder, notification, persistence, validation, API, UI, or business logic.

---

## 1. Purpose

Timeline organizes time-based activity inside a Project. It provides stable
models for date ranges, milestones, events, schedules, and reminders without
implementing scheduling behavior.

Project 011 establishes the vocabulary that future operational planning,
calendar, and notification capabilities can reuse.

---

## 2. Domain models

### Timeline

A named time-based container belonging to one Project, with optional start and
end dates and creation/update timestamps.

### Milestone

An ordered target point within a Timeline. `sequence` records its relative
position; Project 011 does not calculate ordering or progression.

### Event

A scheduled activity within a Timeline. An Event may reference a Task and has
an Event Type plus start/end timestamps.

### EventType

Describes Event classification through a stable ID, code, name, and
description. No catalog or seed values are included.

### Schedule

Separates planned Event timing from actual timing. It is a data structure only,
not a scheduling engine.

### Reminder

References a time when an Event should be recalled and a Reminder Type.
Delivery behavior is not defined.

### ReminderType

Describes Reminder classification through a stable ID, code, name, and
description.

### TimelineReference

Provides the full tenancy and Project reference:

```text
Workspace → Company → Project → Timeline
```

---

## 3. Relationships

```text
Project
   └── Timeline
         ├── Milestone[]
         └── Event[]
               ├── Task (optional)
               ├── EventType
               ├── Schedule
               └── Reminder[]
                     └── ReminderType
```

- Every Timeline belongs to one Project.
- Milestones and Events belong to one Timeline.
- An Event may reference one Task.
- A Schedule belongs to one Event.
- Reminders belong to one Event.
- Relationship loading and integrity rules are outside Project 011.

---

## 4. Timeline hierarchy

```text
Workspace
   ↓
Company
   ↓
Project
   ↓
Timeline
   ↓
Event
   ↓
Reminder
```

`TimelineReference` preserves the tenancy hierarchy through the Timeline level.
Event and Reminder models continue that hierarchy through direct parent
references.

Project 011 does not define:

- Timezone conversion
- Calendar synchronization
- Conflict detection
- Recurrence
- Schedule calculation
- Reminder delivery
- Notification behavior

---

## Architecture

```text
src/types/timeline/
├── Timeline.ts
├── Milestone.ts
├── Event.ts
├── EventType.ts
├── Schedule.ts
├── Reminder.ts
├── ReminderType.ts
├── TimelineReference.ts
└── index.ts

src/lib/timeline/
├── timeline.ts
├── event.ts
├── reminder.ts
└── index.ts
```

- `src/types/timeline/` owns permanent Timeline definitions.
- `src/lib/timeline/` provides stable barrel exports.
- Event-to-Task references reuse the Project 010 Task identity.

---

## 5. Future extension

Future Projects may add:

- Database and repository mapping
- Validation schemas
- Event and Reminder Type catalogs
- Scheduling and conflict engines
- Calendar synchronization
- Recurring events
- Timezone handling
- Reminder and notification delivery
- Audit history
- API and UI integrations

Those extensions are outside Project 011.

---

## Explicit non-goals (Project 011)

- No CRUD, API, SQL, repositories, or services
- No scheduling or calendar engine
- No reminder or notification engine
- No business rules or validation
- No UI
- No seed data
