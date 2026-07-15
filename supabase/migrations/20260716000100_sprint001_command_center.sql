-- Aura OS Sprint 001: Command Center schema

create extension if not exists "pgcrypto";

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Clients / CRM
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  status text not null default 'active'
    check (status in ('active', 'follow_up', 'archived')),
  follow_up_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Weddings
create table if not exists public.weddings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  name text not null,
  wedding_date date not null,
  venue text,
  status text not null default 'inquiry'
    check (status in ('inquiry', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Meetings
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  client_id uuid references public.clients (id) on delete set null,
  wedding_id uuid references public.weddings (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'urgent')),
  due_at timestamptz,
  owner_id uuid references auth.users (id) on delete set null,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'done', 'cancelled')),
  wedding_id uuid references public.weddings (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Financial records
create table if not exists public.financial_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  record_type text not null
    check (record_type in ('revenue', 'expense', 'payment')),
  amount numeric(14, 2) not null check (amount >= 0),
  currency text not null default 'HKD',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'outstanding', 'cancelled')),
  occurred_on date not null default current_date,
  description text,
  wedding_id uuid references public.weddings (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists clients_user_id_idx on public.clients (user_id);
create index if not exists clients_follow_up_at_idx on public.clients (follow_up_at);
create index if not exists weddings_user_id_idx on public.weddings (user_id);
create index if not exists weddings_wedding_date_idx on public.weddings (wedding_date);
create index if not exists meetings_user_id_idx on public.meetings (user_id);
create index if not exists meetings_starts_at_idx on public.meetings (starts_at);
create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_due_at_idx on public.tasks (due_at);
create index if not exists financial_records_user_id_idx on public.financial_records (user_id);
create index if not exists financial_records_occurred_on_idx on public.financial_records (occurred_on);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

drop trigger if exists weddings_set_updated_at on public.weddings;
create trigger weddings_set_updated_at
  before update on public.weddings
  for each row execute function public.set_updated_at();

drop trigger if exists meetings_set_updated_at on public.meetings;
create trigger meetings_set_updated_at
  before update on public.meetings
  for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

drop trigger if exists financial_records_set_updated_at on public.financial_records;
create trigger financial_records_set_updated_at
  before update on public.financial_records
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.weddings enable row level security;
alter table public.meetings enable row level security;
alter table public.tasks enable row level security;
alter table public.financial_records enable row level security;

-- Profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Clients
drop policy if exists "clients_all_own" on public.clients;
create policy "clients_all_own" on public.clients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Weddings
drop policy if exists "weddings_all_own" on public.weddings;
create policy "weddings_all_own" on public.weddings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Meetings
drop policy if exists "meetings_all_own" on public.meetings;
create policy "meetings_all_own" on public.meetings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tasks
drop policy if exists "tasks_all_own" on public.tasks;
create policy "tasks_all_own" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Financial records
drop policy if exists "financial_records_all_own" on public.financial_records;
create policy "financial_records_all_own" on public.financial_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
