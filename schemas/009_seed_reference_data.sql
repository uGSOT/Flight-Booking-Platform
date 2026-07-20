-- 009_seed_reference_data.sql
-- Seed public reference data: airports, airlines, and a sample route with fares.
-- Idempotent: safe to re-run (uses ON CONFLICT / existence guards).

-- ── Airports ────────────────────────────────────────────────────────────────
insert into public.airports (iata, city, name, country) values
  ('DEL','Delhi','Indira Gandhi Intl. Airport','India'),
  ('BOM','Mumbai','Chhatrapati Shivaji Intl. Airport','India'),
  ('GOI','Goa','Dabolim Airport','India'),
  ('BLR','Bengaluru','Kempegowda Intl. Airport','India'),
  ('HYD','Hyderabad','Rajiv Gandhi Intl. Airport','India'),
  ('CCU','Kolkata','Netaji Subhas Chandra Bose Intl. Airport','India'),
  ('MAA','Chennai','Chennai Intl. Airport','India')
on conflict (iata) do nothing;

-- ── Airlines ────────────────────────────────────────────────────────────────
insert into public.airlines (code, name, color) values
  ('AI','Air India','#d31f26'),
  ('IX','Air India Express','#e8763a'),
  ('9I','Alliance Air','#e63946'),
  ('6E','IndiGo','#2b3990'),
  ('SQ','Singapore Air','#f5a623'),
  ('UK','Vistara','#4b286d'),
  ('QP','Akasa Air','#ff6a13')
on conflict (code) do nothing;

-- ── Sample flights + fares (DEL ↔ BOM) — only when no flights exist yet ──────
do $$
declare
  indigo uuid;
  ai     uuid;
  fid    uuid;
begin
  if exists (select 1 from public.flights limit 1) then
    return;
  end if;

  select id into indigo from public.airlines where code = '6E';
  select id into ai     from public.airlines where code = 'AI';

  -- IndiGo 6E-638 DEL→BOM, non-stop
  insert into public.flights (airline_id, flight_no, from_iata, to_iata, depart_time, arrive_time, duration_min, stops, refundable)
  values (indigo, '6E-638', 'DEL', 'BOM', '06:20', '08:40', 140, 0, 'Partial Refundable')
  returning id into fid;
  insert into public.fares (flight_id, tier, base_price, checkin_baggage_kg, free_seat, free_meal, recommended) values
    (fid, 'saver',   5390, 15, false, false, false),
    (fid, 'regular', 5790, 15, true,  true,  true),
    (fid, 'flexi',   6640, 20, true,  true,  false);

  -- Air India AI-779 DEL→BOM, 1 stop
  insert into public.flights (airline_id, flight_no, from_iata, to_iata, depart_time, arrive_time, duration_min, stops, refundable)
  values (ai, 'AI-779', 'DEL', 'BOM', '12:45', '16:18', 213, 1, 'Free Cancellation')
  returning id into fid;
  insert into public.fares (flight_id, tier, base_price, checkin_baggage_kg, free_seat, free_meal, recommended) values
    (fid, 'saver',   3785, 15, false, false, false),
    (fid, 'regular', 4065, 15, true,  true,  true),
    (fid, 'flexi',   4659, 20, true,  true,  false);
end $$;
