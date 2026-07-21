# Notes & Comments Foundation

**Status:** Project 016 foundation documentation  
**Scope:** Permanent Notes & Comments domain definitions only. No CRUD,
persistence, rich text, attachments, notifications, API, UI, or business logic.

---

## 1. Purpose

Notes & Comments provide RIVA's universal communication layer. Notes can attach
to operational domains across the platform, and Comments form threaded
discussion on those Notes.

Every Workspace, Company, Project, Client, Vendor, Task, Timeline, Meeting, and
future AI module can reuse this foundation without inventing a private
messaging model.

Project 016 defines structure only. Delivery engines remain future work.

---

## 2. Domain models

### Note

A titled communication artifact containing:

- Note ID
- Title and opaque content
- Creator Person ID
- Created, updated, and optional archived timestamps

Content remains plain text at the foundation layer. Rich text, markdown, and
attachments are out of scope.

### Comment

A reply on a Note containing:

- Comment ID and Note ID
- Optional parent Comment ID for nested replies
- Author Person ID
- Content
- Created, updated, and optional soft-delete timestamps

### CommentThread

A hierarchical tree of Comment nodes for one Note. The structure supports
unlimited nesting. Project 016 does not implement traversal, pagination, or
rendering.

### CommentMention

A future mention reference from a Comment to a Person. Presentation examples
such as `@Ravius`, `@Planner`, or `@Photographer` are UI concerns and are not
seeded here.

### CommentReaction

A future reaction reference from a Person to a Comment. Stable reaction codes
include `thumbs_up`, `heart`, `fire`, `party`, and `check`. Presentation glyphs
such as 👍 ❤️ 🔥 🎉 ✅ remain UI concerns.

### NoteReference

A polymorphic attachment of one Note to one target entity. Target types include:

- Workspace
- Company
- Project
- Client
- Vendor
- Task
- Timeline
- Meeting

One Note may have multiple references.

---

## 3. Relationships

```text
Person
   └── Note (createdBy)
         ├── NoteReference[] ── target entity
         └── Comment[]
               ├── parentCommentId ── Comment
               ├── CommentMention[] ── Person
               └── CommentReaction[] ── Person

CommentThread
   └── CommentThreadNode[]
         └── children CommentThreadNode[]
```

- Notes are authored by People.
- Comments belong to one Note and optionally nest under another Comment.
- Mentions and reactions reference People without embedding profiles.
- Note attachments are explicit references rather than embedded ownership.

---

## 4. Thread hierarchy

```text
Note
 └── Comment (root)
      ├── Comment (reply)
      │    └── Comment (nested reply)
      └── Comment (reply)
```

`Comment.parentCommentId` establishes the adjacency list. `CommentThread` and
`CommentThreadNode` prepare an unbounded tree shape for future rendering.

Project 016 does not define:

- Depth limits
- Soft-delete cascade rules
- Edit history
- Ordering algorithms
- Permission checks for replies

---

## Architecture

```text
src/types/notes/
├── Note.ts
├── Comment.ts
├── CommentThread.ts
├── CommentMention.ts
├── CommentReaction.ts
├── NoteReference.ts
└── index.ts

src/lib/notes/
├── note.ts
├── comment.ts
├── interactions.ts
├── reference.ts
└── index.ts
```

- `src/types/notes/` owns permanent Notes & Comments definitions.
- `src/lib/notes/` provides stable barrel exports.
- Existing modules remain untouched.
- Vendor and Meeting targets use opaque IDs until those foundations exist.

---

## 5. Future extension

Future Projects may add:

- Database and repository mapping
- Validation schemas
- Rich text / markdown content models
- Attachments and media references
- Mention resolution and autocomplete
- Reaction aggregation
- Notification delivery
- Soft-delete and moderation policies
- Thread pagination and search
- API and UI integrations
- Audit history

Those extensions are outside Project 016.

---

## Explicit non-goals (Project 016)

- No CRUD, API, SQL, repositories, or services
- No rich text editor, markdown, or attachments
- No notifications or mention delivery
- No business rules or validation
- No UI
- No seed data
