-- Aura OS Sprint 001 schema repair
-- Safe for empty tables. Does not drop data.
-- Run in Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- Missing tables required by Command Center
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

-- Align existing empty clients/tasks tables with app expectations
alter table public.clients add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.clients add column if not exists name text;
alter table public.clients add column if not exists follow_up_at date;
alter table public.clients add column if not exists updated_at timestamptz default now();

alter table public.tasks add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.tasks add column if not exists due_at timestamptz;
alter table public.tasks add column if not exists owner_id uuid references auth.users (id) on delete set null;
alter table public.tasks add column if not exists client_id uuid references public.clients (id) on delete set null;
alter table public.tasks add column if not exists updated_at timestamptz default now();

-- Backfill name for clients if required later (nullable until app writes rows)
-- App inserts always provide name + user_id.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

alter table public.profiles enable row level security;
alter table public.weddings enable row level security;
alter table public.meetings enable row level security;
alter table public.financial_records enable row level security;
alter table public.clients enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "clients_all_own" on public.clients;
create policy "clients_all_own" on public.clients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "weddings_all_own" on public.weddings;
create policy "weddings_all_own" on public.weddings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "meetings_all_own" on public.meetings;
create policy "meetings_all_own" on public.meetings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tasks_all_own" on public.tasks;
create policy "tasks_all_own" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "financial_records_all_own" on public.financial_records;
create policy "financial_records_all_own" on public.financial_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
