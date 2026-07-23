-- 011_seed_flights.sql
-- Generate a broad flight inventory (popular routes × airlines × times) so
-- search returns real results. Idempotent-ish: only runs when few flights exist.

do $$
declare
  r record;
  a record;
  i int;
  dep time;
  dur int;
  px int;
  fid uuid;
begin
  -- Skip if inventory already looks seeded.
  if (select count(*) from public.flights) > 20 then
    return;
  end if;

  for r in
    select * from (values
      ('DEL','BOM'),('BOM','DEL'),('BLR','DEL'),('DEL','BLR'),
      ('HYD','BLR'),('BLR','HYD'),('CCU','DEL'),('DEL','CCU'),
      ('MAA','BOM'),('BOM','MAA'),('GOI','BOM'),('BOM','GOI'),
      ('DEL','HYD'),('HYD','DEL'),('BLR','BOM'),('BOM','BLR')
    ) as t(f, tt)
  loop
    for a in select id, code from public.airlines loop
      for i in 1..2 loop
        dep := make_time(5 + (random() * 16)::int, (random() * 59)::int, 0);
        dur := 80 + (random() * 160)::int;
        px  := 2800 + (random() * 13000)::int;

        insert into public.flights
          (airline_id, flight_no, from_iata, to_iata, depart_time, arrive_time, duration_min, stops, refundable)
        values
          (a.id,
           a.code || '-' || (100 + (random() * 899)::int)::text,
           r.f, r.tt,
           dep,
           dep + make_interval(mins => dur),
           dur,
           case when random() < 0.6 then 0 when random() < 0.85 then 1 else 2 end,
           (array['Partial Refundable','Non Refundable','Free Cancellation'])[1 + (random() * 2)::int])
        returning id into fid;

        insert into public.fares (flight_id, tier, base_price, checkin_baggage_kg, free_seat, free_meal, recommended) values
          (fid, 'saver',   px,                    15, false, false, false),
          (fid, 'regular', round(px * 1.074)::int, 15, true,  true,  true),
          (fid, 'flexi',   round(px * 1.231)::int, 20, true,  true,  false);
      end loop;
    end loop;
  end loop;
end $$;
