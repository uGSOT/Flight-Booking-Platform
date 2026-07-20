-- 002_reference_tables.sql
-- Public reference data: airports, airlines, flights and fares.
-- These are read-only for clients (public read, no client writes) — RLS in 006.

-- ── Airports ────────────────────────────────────────────────────────────────
create table if not exists public.airports (
  iata    text primary key,             -- e.g. 'DEL'
  city    text not null,
  name    text not null,                -- full airport name
  country text not null default 'India'
);

-- ── Airlines ────────────────────────────────────────────────────────────────
create table if not exists public.airlines (
  id       uuid primary key default gen_random_uuid(),
  code     text not null unique,        -- e.g. '6E'
  name     text not null,               -- e.g. 'IndiGo'
  color    text,                        -- brand colour for the logo badge
  logo_url text
);

-- ── Flights ─────────────────────────────────────────────────────────────────
create table if not exists public.flights (
  id           uuid primary key default gen_random_uuid(),
  airline_id   uuid not null references public.airlines(id) on delete restrict,
  flight_no    text not null,           -- e.g. '6E-638'
  from_iata    text not null references public.airports(iata) on delete restrict,
  to_iata      text not null references public.airports(iata) on delete restrict,
  depart_time  time not null,
  arrive_time  time not null,
  duration_min integer not null check (duration_min > 0),
  stops        integer not null default 0 check (stops >= 0),
  refundable   text not null default 'Partial Refundable',
  created_at   timestamptz not null default now(),
  check (from_iata <> to_iata)
);

create index if not exists flights_route_idx on public.flights (from_iata, to_iata);
create index if not exists flights_airline_idx on public.flights (airline_id);

-- ── Fares ───────────────────────────────────────────────────────────────────
create table if not exists public.fares (
  id                uuid primary key default gen_random_uuid(),
  flight_id         uuid not null references public.flights(id) on delete cascade,
  tier              text not null check (tier in ('saver','regular','flexi')),
  base_price        integer not null check (base_price >= 0),
  cabin_baggage_kg  integer not null default 7,
  checkin_baggage_kg integer not null default 15,
  free_seat         boolean not null default false,
  free_meal         boolean not null default false,
  cancellation_fee  integer not null default 4999,
  date_change_fee   integer not null default 4999,
  recommended       boolean not null default false,
  unique (flight_id, tier)
);

create index if not exists fares_flight_idx on public.fares (flight_id);
