-- 007_views.sql
-- Reporting views for Dashboard + Admin analytics.
-- security_invoker = true → views respect the querying user's RLS, so a normal
-- user only sees their own bookings, while an admin sees all.

-- ── Spend per month for the current user (user Reports) ─────────────────────
create or replace view public.v_user_monthly_spend
with (security_invoker = true) as
select
  date_trunc('month', created_at)::date as month,
  count(*)                              as trips,
  sum(total_amount)                     as spend
from public.bookings
where status <> 'cancelled'
group by 1
order by 1;

-- ── Daily revenue across the platform (admin Overview) ──────────────────────
create or replace view public.v_admin_daily_revenue
with (security_invoker = true) as
select
  created_at::date          as day,
  count(*)                  as bookings,
  sum(total_amount)         as revenue
from public.bookings
where status <> 'cancelled'
group by 1
order by 1;

-- ── Route stats (admin Routes report) ───────────────────────────────────────
create or replace view public.v_route_stats
with (security_invoker = true) as
select
  fa.iata || ' → ' || ta.iata as route,
  count(*)                     as bookings,
  sum(b.total_amount)          as revenue,
  round(avg(b.total_amount))   as avg_fare
from public.bookings b
join public.flights f on f.id = b.flight_id
join public.airports fa on fa.iata = f.from_iata
join public.airports ta on ta.iata = f.to_iata
where b.status <> 'cancelled'
group by 1
order by bookings desc;

-- ── Bookings grouped by status (admin Bookings report) ──────────────────────
create or replace view public.v_bookings_by_status
with (security_invoker = true) as
select status, count(*) as count
from public.bookings
group by status;
