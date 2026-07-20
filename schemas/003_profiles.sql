-- 003_profiles.sql
-- User profiles, 1:1 with auth.users. `id` == auth.users.id.
-- Auto-created on signup by the trigger in 005.

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  phone        text unique,
  first_name   text,
  last_name    text,
  dob          date,
  gender       text check (gender in ('Male','Female','Other')),
  email        text,
  company_name text,          -- GSTIN block (optional, business invoices)
  gstin        text,
  role         text not null default 'user' check (role in ('user','admin')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
