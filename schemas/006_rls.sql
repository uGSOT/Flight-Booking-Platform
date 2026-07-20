-- 006_rls.sql
-- Row Level Security. RLS is ON for every table (default-deny).
-- Owners see/manage their own rows; admins (is_admin()) see everything;
-- reference tables are public-read.

-- ── Enable RLS ──────────────────────────────────────────────────────────────
alter table public.airports           enable row level security;
alter table public.airlines           enable row level security;
alter table public.flights            enable row level security;
alter table public.fares              enable row level security;
alter table public.profiles           enable row level security;
alter table public.bookings           enable row level security;
alter table public.booking_passengers enable row level security;
alter table public.booking_addons     enable row level security;
alter table public.payments           enable row level security;

-- ── Reference tables: public read, no client writes ─────────────────────────
drop policy if exists airports_read on public.airports;
create policy airports_read on public.airports for select using (true);

drop policy if exists airlines_read on public.airlines;
create policy airlines_read on public.airlines for select using (true);

drop policy if exists flights_read on public.flights;
create policy flights_read on public.flights for select using (true);

drop policy if exists fares_read on public.fares;
create policy fares_read on public.fares for select using (true);

-- ── Profiles: self read/update; admins read all ─────────────────────────────
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ── Bookings: owner CRUD; admins read + update (e.g. status change) ──────────
drop policy if exists bookings_select on public.bookings;
create policy bookings_select on public.bookings
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists bookings_insert on public.bookings;
create policy bookings_insert on public.bookings
  for insert with check (user_id = auth.uid());

drop policy if exists bookings_update on public.bookings;
create policy bookings_update on public.bookings
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ── Booking children: access follows the parent booking ─────────────────────
-- Helper predicate re-used across child tables.
drop policy if exists passengers_all on public.booking_passengers;
create policy passengers_all on public.booking_passengers
  for all using (
    exists (select 1 from public.bookings b
            where b.id = booking_id and (b.user_id = auth.uid() or public.is_admin()))
  )
  with check (
    exists (select 1 from public.bookings b
            where b.id = booking_id and b.user_id = auth.uid())
  );

drop policy if exists addons_all on public.booking_addons;
create policy addons_all on public.booking_addons
  for all using (
    exists (select 1 from public.bookings b
            where b.id = booking_id and (b.user_id = auth.uid() or public.is_admin()))
  )
  with check (
    exists (select 1 from public.bookings b
            where b.id = booking_id and b.user_id = auth.uid())
  );

drop policy if exists payments_all on public.payments;
create policy payments_all on public.payments
  for all using (
    exists (select 1 from public.bookings b
            where b.id = booking_id and (b.user_id = auth.uid() or public.is_admin()))
  )
  with check (
    exists (select 1 from public.bookings b
            where b.id = booking_id and b.user_id = auth.uid())
  );

-- NOTE: reference-table writes and payment verification happen server-side via
-- Edge Functions using the service-role key, which bypasses RLS.
