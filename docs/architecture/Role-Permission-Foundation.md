# Role & Permission Foundation

**Status:** Project 008 foundation documentation  
**Scope:** Authorization domain models and relationships only. No engine,
checking, middleware, persistence, seed data, or business rules.

---

## 1. Purpose

The authorization foundation defines the permanent vocabulary for describing:

- Roles
- Permissions
- Permission groups
- Scoped roles
- Person-to-role assignments
- Role-to-permission references

It separates authorization definitions from authentication, membership, and
runtime access decisions.

Existing authentication catalogs and DB-backed RBAC code remain unchanged.
Project 008 introduces no authorization behavior.

---

## 2. Domain models

### Role

A named authorization role with:

- Stable ID and code
- Human-readable name and description
- Scope (`workspace`, `company`, or `project`)
- System-role marker
- Creation and update timestamps

### Permission

An atomic authorization capability with:

- Stable ID and code
- Human-readable name and description
- Extensible module and action identifiers
- Creation and update timestamps

Project 008 does not define a permission catalog or seed values.

### PermissionGroup

A descriptive grouping for related permissions. Group membership is reserved
for future extension.

### Scope role references

- `WorkspaceRole` associates a Role with a Workspace.
- `CompanyRole` associates a Role with a Company.
- `ProjectRole` associates a Role with a Project.

### RoleAssignment

References one Person, one Role, and one concrete scope target. It defines
assignment shape only and performs no validation or access checking.

### PermissionReference

References the relationship between one Role and one Permission. It does not
calculate effective permissions.

---

## 3. Relationships

```text
Person ── RoleAssignment ── Role
                            │
                            └── PermissionReference ── Permission

Role ── WorkspaceRole ── Workspace
Role ── CompanyRole   ── Company
Role ── ProjectRole   ── Project

PermissionGroup  (descriptive grouping; membership deferred)
```

The relationships are references rather than embedded aggregates. This keeps
identity, tenancy, and authorization definitions independently extensible.

---

## 4. Scope hierarchy

```text
Workspace
   ↓
Company
   ↓
Project
```

- Workspace is the top-level tenant boundary.
- Company is scoped to a Workspace.
- Project is scoped to a Company and Workspace.

`Role.scope` identifies the level where the role definition applies.
`RoleAssignment.scopeId` identifies the concrete Workspace, Company, or Project
target.

Project 008 does not define inheritance, precedence, conflict resolution, or
permission propagation between scope levels.

---

## Architecture

```text
src/types/authorization/
├── Role.ts
├── Permission.ts
├── PermissionGroup.ts
├── WorkspaceRole.ts
├── CompanyRole.ts
├── ProjectRole.ts
├── RoleAssignment.ts
├── PermissionReference.ts
└── index.ts

src/lib/authorization/
├── role.ts
├── permission.ts
├── relationships.ts
└── index.ts
```

- `src/types/authorization/` owns reusable domain definitions.
- `src/lib/authorization/` provides stable barrel exports.
- `src/lib/auth/` continues to own authentication foundation concerns.
- Existing `src/core/permissions/` behavior remains untouched.

---

## 5. Future extension

Future Projects may add:

- Permission group membership references
- Repository contracts and persistence mapping
- Validation schemas
- Role and permission catalogs
- Scope-aware authorization evaluation
- Inheritance and conflict-resolution rules
- Caching and audit records
- RLS or middleware integration

Those extensions are explicitly outside Project 008.

---

## Explicit non-goals (Project 008)

- No CRUD, API, SQL, repositories, or services
- No authorization middleware or permission checking
- No business rules or scope inheritance
- No UI
- No seed data
- No authentication changes
