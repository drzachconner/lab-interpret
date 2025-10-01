-- Phase-1 HIPAA-compliant database schema with RLS and encryption (Fixed types)

-- 0) Extensions
create extension if not exists pgcrypto;     -- optional, for column encryption
create extension if not exists pg_trgm;      -- optional, for fuzzy search later

-- 1) Drop existing conflicting constraints if any
alter table if exists public.profiles drop constraint if exists profiles_auth_fk;

-- Recreate profiles table with proper types
drop table if exists public.profiles cascade;
create table public.profiles (
  id           uuid primary key default gen_random_uuid(),
  auth_id      uuid not null,              -- mirrors auth.users.id (uuid type)
  sex          text check (sex in ('Male','Female','Other','Unknown')) default 'Unknown',
  age_bucket   text,                       -- e.g. "35-44"
  fs_token     text,                       -- store OAuth token (server only usage)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (auth_id)
);

-- Link to Supabase auth with proper uuid to uuid reference
alter table public.profiles
  add constraint profiles_auth_fk
  foreign key (auth_id) references auth.users(id) on delete cascade;

-- LAB ORDERS: tracks orders & raw results (encrypted optional)
drop table if exists public.lab_orders cascade;
create table public.lab_orders (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  panel          text not null,                          -- e.g. "CBC", "Methylation Bundle"
  status         text not null default 'created',        -- created|authorized|collected|resulted|failed
  fs_order_id    text,                                   -- Fullscript order id (if applicable)
  raw_result     jsonb,                                  -- store parsed lab JSON (no identifiers) for Phase 1
  raw_result_enc bytea,                                  -- encrypted version
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- INTERPRETATIONS: AI output linked to a lab order
drop table if exists public.interpretations cascade;
create table public.interpretations (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  lab_order_id   uuid not null references public.lab_orders(id) on delete cascade,
  analysis       jsonb not null,                         -- LLM output (no PHI)
  created_at     timestamptz not null default now()
);

-- Helpful indexes
create index idx_profiles_auth   on public.profiles(auth_id);
create index idx_orders_user     on public.lab_orders(user_id);
create index idx_interp_user     on public.interpretations(user_id);
create index idx_interp_order    on public.interpretations(lab_order_id);

-- 2) Enable RLS on each table
alter table public.profiles        enable row level security;
alter table public.lab_orders      enable row level security;
alter table public.interpretations enable row level security;

-- 3) Owner-only RLS policies

-- PROFILES
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = auth_id);

create policy "profiles_insert_self"
  on public.profiles
  for insert
  with check (auth.uid() = auth_id);

create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = auth_id)
  with check (auth.uid() = auth_id);

-- LAB ORDERS
create policy "orders_select_own"
  on public.lab_orders
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = lab_orders.user_id and p.auth_id = auth.uid()
    )
  );

create policy "orders_insert_own"
  on public.lab_orders
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = lab_orders.user_id and p.auth_id = auth.uid()
    )
  );

create policy "orders_update_own"
  on public.lab_orders
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = lab_orders.user_id and p.auth_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = lab_orders.user_id and p.auth_id = auth.uid()
    )
  );

-- INTERPRETATIONS
create policy "interp_select_own"
  on public.interpretations
  for select
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = interpretations.user_id
        and p.auth_id = auth.uid()
    )
  );

create policy "interp_insert_own"
  on public.interpretations
  for insert
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = interpretations.user_id
        and p.auth_id = auth.uid()
    )
  );

create policy "interp_update_own"
  on public.interpretations
  for update
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = interpretations.user_id
        and p.auth_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = interpretations.user_id
        and p.auth_id = auth.uid()
    )
  );

-- 4) Helper functions for encryption
create or replace function public.lab_orders_set_raw_result(_order_id uuid, _json jsonb, _key text)
returns void language plpgsql security definer as $$
begin
  update public.lab_orders
    set raw_result_enc = pgp_sym_encrypt(_json::text, _key),
        updated_at = now()
  where id = _order_id;
end$$;

create or replace function public.lab_orders_get_raw_result(_order_id uuid, _key text)
returns jsonb language plpgsql stable security definer as $$
declare
  plaintext text;
begin
  select pgp_sym_decrypt(raw_result_enc, _key)
    into plaintext
  from public.lab_orders
  where id = _order_id;

  if plaintext is null then
    return null;
  end if;

  return plaintext::jsonb;
end$$;

-- 5) Guardrails
-- Block anonymous access
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;

-- Updated timestamps
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

create trigger trg_profiles_updated
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger trg_orders_updated
before update on public.lab_orders
for each row execute function public.set_updated_at();