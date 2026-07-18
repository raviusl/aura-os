# People Foundation

**Status:** Project 007 foundation documentation  
**Scope:** Human identity and relationship definitions only. No repository,
database schema, validation, API, UI, or business logic.

---

## Purpose

The People domain defines one reusable human identity independently from the
places where that person participates.

A Person may:

- Belong to multiple Workspaces
- Belong to multiple Companies
- Have multiple contact points
- Hold multiple scoped role references
- Participate in multiple future Projects

This separation prevents workspace or company membership records from becoming
the canonical human identity.

---

## Existing implementation (reused)

The repository already contains `src/core/people/people.ts` and related database
types in `src/core/types.ts`. That implementation currently represents people
as workspace-scoped records and provides runtime persistence, role assignment,
and permission behavior.

Project 007 does not replace or modify it. Instead, it adds a definition-only
foundation for future alignment:

```text
Person identity
├── Profile
├── Contacts
├── Workspace membership references
├── Company membership references
└── Scoped role references
```

---

## Architecture

```text
src/types/people/
├── Person.ts
├── PersonStatus.ts
├── PersonProfile.ts
├── PersonContact.ts
├── PersonRelationship.ts
├── PersonRoleReference.ts
├── WorkspaceMembershipReference.ts
├── CompanyMembershipReference.ts
└── index.ts

src/lib/people/
├── person.ts
├── profile.ts
├── contact.ts
├── relationships.ts
└── index.ts
```

- `src/types/people/` owns reusable data definitions.
- `src/lib/people/` provides stable barrel exports.
- `src/core/people/` retains all existing runtime behavior.

---

## Ownership

`Person` is the identity root. It owns identity lifecycle only:

- Person ID
- Person status
- Created At
- Updated At

`PersonProfile` contains descriptive attributes such as display name and avatar.
`PersonContact` represents independently addressable contact points.

Workspace, Company, Authentication, and future Project domains do not own the
Person identity. They reference it.

---

## Relationships

### Workspace membership

`WorkspaceMembershipReference` links one Person to one Workspace. A Person can
hold multiple workspace membership references.

### Company membership

`CompanyMembershipReference` links one Person to one Company within a
Workspace. A Person can hold multiple company membership references.

### Roles

`PersonRoleReference` points to a role key scoped to either a Workspace or a
Company. It does not embed permissions or role evaluation.

### Contacts

`PersonContact` supports multiple email, phone, address, or other contact
values. Contact persistence and validation are not part of Project 007.

### Future Project participation

Project participation is intentionally not defined yet. The relationship model
can be extended with Project references without changing the Person identity.

---

## Person status

The identity lifecycle is distinct from membership or invitation lifecycle:

| Status | Meaning |
| --- | --- |
| `active` | Identity is available for participation |
| `inactive` | Identity is temporarily inactive |
| `archived` | Identity is retained but no longer active |

Existing workspace membership statuses remain unchanged.

---

## Future extension

Future Projects may add:

- Persistence mapping and migration planning
- Repository contracts
- Contact validation and normalization
- Profile enrichment
- Identity deduplication
- Project participation references
- Membership lifecycle definitions
- Role and permission integration

Those changes are outside Project 007.

---

## Explicit non-goals (Project 007)

- No SQL or database schema
- No repositories or CRUD
- No validation schemas
- No API routes
- No UI or pages
- No authentication changes
- No Workspace or Company changes
- No permission or business logic
