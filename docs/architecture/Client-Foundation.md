# Client Foundation

**Status:** Project 013 foundation documentation  
**Scope:** Permanent Client domain definitions only. No CRM behavior,
persistence, validation, API, forms, UI, or portal.

---

## 1. Purpose

Client represents a Person participating as a client within a Workspace and
Company. It extends the People Foundation by reference rather than duplicating
human identity, profile, or contact data.

One Person may participate as a Client in multiple company or project contexts
while retaining one canonical identity.

The existing database-oriented CRM Client implementation remains unchanged.

---

## 2. Domain models

### Client

A scoped Client identity containing:

- Client ID
- Canonical Person ID
- Workspace and Company IDs
- Client Type and Status IDs
- Creation and update timestamps

Name, email, phone, and profile fields are intentionally absent because they
belong to the referenced Person and Person contacts.

### ClientType

Describes Client classification through a stable ID, code, name, and
description.

Possible future values include Bride, Groom, Corporate, Individual, and Family.
They are examples only; Project 013 includes no seed data.

### ClientStatus

Describes a named Client lifecycle status with an optional presentation color.
No statuses or transition rules are prescribed.

### ClientProject

References Client participation in one Project and an extensible relationship
identifier.

### ClientContact

References a `PersonContact` owned by the Client's canonical Person. Contact
details are never copied into the Client model.

### ClientReference

Provides the minimal identity and tenancy relationship:

```text
Person + Workspace + Company → Client
```

---

## 3. Relationships

```text
Person
   ├── PersonProfile
   ├── PersonContact[]
   └── Client
         ├── ClientType
         ├── ClientStatus
         ├── ClientContact ── PersonContact
         └── ClientProject[] ── Project
```

- Every Client references exactly one Person identity.
- A Person may have multiple Client records in different scopes.
- Every Client belongs to one Workspace and Company.
- A Client may participate in multiple Projects.
- Client contacts reference People contacts rather than duplicating values.
- Relationship loading and integrity rules are outside Project 013.

---

## 4. Client hierarchy

```text
Workspace
   ↓
Company
   ↓
People
   ↓
Client
   ↓
Project
```

The hierarchy distinguishes identity from participation:

- People owns universal human identity and contacts.
- Client describes that Person's client participation in a Company.
- ClientProject describes participation in one or more Projects.

Project 013 does not implement scope validation or lifecycle behavior.

---

## Architecture

```text
src/types/client/
├── Client.ts
├── ClientType.ts
├── ClientStatus.ts
├── ClientProject.ts
├── ClientContact.ts
├── ClientReference.ts
└── index.ts

src/lib/client/
├── client.ts
├── catalog.ts
├── relationships.ts
└── index.ts
```

- `src/types/client/` owns permanent Client definitions.
- `src/lib/client/` provides stable barrel exports.
- `src/types/people/` remains the source of Person and contact identity.
- Existing `src/core/client/` runtime behavior remains untouched.

---

## 5. Future extension

Future Projects may add:

- Database and repository mapping
- Validation schemas
- Client Type and Status catalogs
- Relationship catalogs
- Person-to-Client migration and deduplication
- Project participation management
- CRM workflows and follow-up behavior
- Portal access
- API and UI integrations
- Audit history

Those extensions are outside Project 013.

---

## Explicit non-goals (Project 013)

- No CRUD, API, SQL, repositories, or services
- No forms, UI, or portal
- No business rules or validation
- No duplicate Person identity or contact fields
- No seed data
