-- 010_booking_details.sql
-- Add a JSONB snapshot column to bookings. Flights are generated client-side,
-- so each booking stores the full flight/trip/passenger/add-on snapshot here
-- while the scalar columns stay queryable for RLS, filtering and reporting.
-- (Also folded into 004 for fresh installs; this ALTER covers existing DBs.)

alter table public.bookings add column if not exists details jsonb not null default '{}'::jsonb;
