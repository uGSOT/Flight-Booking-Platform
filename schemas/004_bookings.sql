-- 004_bookings.sql
-- Bookings and their children: passengers, add-ons, payments.
-- Also defines the booking-reference generator (BK-YYYY-####).

-- ── Booking reference generator ─────────────────────────────────────────────
create sequence if not exists public.booking_ref_seq start 42;

create or replace function public.generate_booking_ref()
returns text
language sql
volatile
as $$
  select 'BK-' || extract(year from now())::int
      || '-' || lpad(nextval('public.booking_ref_seq')::text, 4, '0');
$$;

-- ── Bookings ────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id                uuid primary key default gen_random_uuid(),
  ref               text not null unique default public.generate_booking_ref(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  flight_id         uuid references public.flights(id) on delete set null,
  return_flight_id  uuid references public.flights(id) on delete set null,
  fare_tier         text check (fare_tier in ('saver','regular','flexi')),
  trip_type         text not null default 'one_way' check (trip_type in ('one_way','round')),
  cabin             text not null default 'Economy',
  status            text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  base_amount       integer not null default 0,
  addons_amount     integer not null default 0,
  discount_amount   integer not null default 0,
  total_amount      integer not null default 0,
  promo_code        text,
  created_at        timestamptz not null default now()
);

create index if not exists bookings_user_idx on public.bookings (user_id);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_created_idx on public.bookings (created_at);

-- ── Passengers ──────────────────────────────────────────────────────────────
create table if not exists public.booking_passengers (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.bookings(id) on delete cascade,
  type        text not null default 'Adult' check (type in ('Adult','Child','Infant')),
  first_name  text not null,
  last_name   text,
  dob         date,
  gender      text check (gender in ('Male','Female','Other')),
  passport_no text
);

create index if not exists passengers_booking_idx on public.booking_passengers (booking_id);

-- ── Add-ons (seat / meal) ────────────────────────────────────────────────────
create table if not exists public.booking_addons (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.bookings(id) on delete cascade,
  type        text not null check (type in ('seat','meal')),
  label       text not null,          -- e.g. '5A' or 'Vegan meal + beverage'
  amount      integer not null default 0
);

create index if not exists addons_booking_idx on public.booking_addons (booking_id);

-- ── Payments ─────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id                  uuid primary key default gen_random_uuid(),
  booking_id          uuid not null references public.bookings(id) on delete cascade,
  razorpay_order_id   text,
  razorpay_payment_id text,
  amount              integer not null,
  currency            text not null default 'INR',
  status              text not null default 'created' check (status in ('created','captured','failed')),
  created_at          timestamptz not null default now()
);

create index if not exists payments_booking_idx on public.payments (booking_id);
