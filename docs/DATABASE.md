# Database

Current Aura OS schema as defined in Sprint 001 migrations.

Source of truth:

- `supabase/migrations/20260716000100_sprint001_command_center.sql`
- `supabase/migrations/20260716000200_sprint001_schema_repair.sql`
- Type mirror: `src/types/database.ts`

All listed tables live in the `public` schema, use Row Level Security, and (except where noted) are owned by `user_id` → `auth.users(id)`.

## Entity overview

```text
auth.users
    │
    ├── profiles (1:1)
    │
    ├── clients ──────────────┐
    │       │                 │
    │       ▼                 │
    ├── weddings ◄────────────┤
    │       │                 │
    │       ├─────────────────┤
    ├── meetings              │
    ├── tasks                 │
    └── financial_records ────┘
```

## Tables

### `profiles`

Extends Supabase Auth users with display metadata. Created automatically on signup via `handle_new_user`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK; FK → `auth.users(id)` ON DELETE CASCADE |
| `full_name` | `text` | Nullable |
| `display_name` | `text` | Nullable |
| `avatar_url` | `text` | Nullable |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()`; maintained by trigger |

**RLS:** select / insert / update own row (`auth.uid() = id`).

---

### `clients`

CRM contacts for the planner.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK; default `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE |
| `name` | `text` | Required |
| `email` | `text` | Nullable |
| `phone` | `text` | Nullable |
| `status` | `text` | `active` \| `follow_up` \| `archived` (default `active`) |
| `follow_up_at` | `date` | Nullable |
| `notes` | `text` | Nullable |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()`; maintained by trigger |

**Indexes:** `user_id`, `follow_up_at`  
**RLS:** all operations where `auth.uid() = user_id`.

---

### `weddings`

Wedding projects managed by the planner.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK; default `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE |
| `client_id` | `uuid` | Nullable FK → `clients(id)` ON DELETE SET NULL |
| `name` | `text` | Required |
| `wedding_date` | `date` | Required |
| `venue` | `text` | Nullable |
| `status` | `text` | `inquiry` \| `confirmed` \| `in_progress` \| `completed` \| `cancelled` (default `inquiry`) |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()`; maintained by trigger |

**Indexes:** `user_id`, `wedding_date`  
**RLS:** all operations where `auth.uid() = user_id`.

---

### `meetings`

Scheduled meetings, optionally linked to a client and/or wedding.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK; default `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE |
| `title` | `text` | Required |
| `starts_at` | `timestamptz` | Required |
| `ends_at` | `timestamptz` | Nullable |
| `client_id` | `uuid` | Nullable FK → `clients(id)` ON DELETE SET NULL |
| `wedding_id` | `uuid` | Nullable FK → `weddings(id)` ON DELETE SET NULL |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()`; maintained by trigger |

**Indexes:** `user_id`, `starts_at`  
**RLS:** all operations where `auth.uid() = user_id`.

---

### `tasks`

Work items with priority and status, optionally linked to a wedding and/or client.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK; default `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE |
| `title` | `text` | Required |
| `priority` | `text` | `low` \| `medium` \| `high` \| `urgent` (default `medium`) |
| `due_at` | `timestamptz` | Nullable |
| `owner_id` | `uuid` | Nullable FK → `auth.users(id)` ON DELETE SET NULL |
| `status` | `text` | `todo` \| `in_progress` \| `done` \| `cancelled` (default `todo`) |
| `wedding_id` | `uuid` | Nullable FK → `weddings(id)` ON DELETE SET NULL |
| `client_id` | `uuid` | Nullable FK → `clients(id)` ON DELETE SET NULL |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()`; maintained by trigger |

**Indexes:** `user_id`, `due_at`  
**RLS:** all operations where `auth.uid() = user_id`.

---

### `financial_records`

Revenue, expense, and payment records.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK; default `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE |
| `record_type` | `text` | `revenue` \| `expense` \| `payment` |
| `amount` | `numeric(14,2)` | Required; `>= 0` |
| `currency` | `text` | Default `HKD` in command-center migration; repair migration used `MYR` for new empty installs — align to product preference when changing schema |
| `status` | `text` | `pending` \| `paid` \| `outstanding` \| `cancelled` (default `pending`) |
| `occurred_on` | `date` | Default `current_date` |
| `description` | `text` | Nullable |
| `wedding_id` | `uuid` | Nullable FK → `weddings(id)` ON DELETE SET NULL |
| `client_id` | `uuid` | Nullable FK → `clients(id)` ON DELETE SET NULL |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()`; maintained by trigger |

**Indexes:** `user_id`, `occurred_on`  
**RLS:** all operations where `auth.uid() = user_id`.

## Shared database behavior

| Mechanism | Purpose |
| --- | --- |
| Extension `pgcrypto` | UUID generation |
| `set_updated_at()` | Trigger function; bumps `updated_at` on row update |
| `handle_new_user()` | Security-definer trigger on `auth.users` insert → creates `profiles` row |

## Legacy / non-Aura tables

Some Supabase projects may still contain pre-Aura tables (for example `wedding_projects`). Those are **not** part of the Aura OS schema and are not documented here. Sprint 001 repair migrations intentionally do not drop them.

## Sprint 002 note

No database changes in this sprint. Documentation only.
