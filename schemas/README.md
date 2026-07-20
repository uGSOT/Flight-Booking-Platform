# Database schemas

Sequential SQL migrations for the AirMe Supabase (Postgres) backend. Run the
files **in numeric order** — each builds on the previous.

| # | File | What it creates |
|---|------|-----------------|
| 001 | `001_extensions.sql` | Postgres extensions (`pgcrypto`) |
| 002 | `002_reference_tables.sql` | `airports`, `airlines`, `flights`, `fares` |
| 003 | `003_profiles.sql` | `profiles` (1:1 with `auth.users`) |
| 004 | `004_bookings.sql` | `bookings`, `booking_passengers`, `booking_addons`, `payments` + `generate_booking_ref()` |
| 005 | `005_functions.sql` | `is_admin()`, new-user → profile trigger, `updated_at` trigger |
| 006 | `006_rls.sql` | Row Level Security: enable + policies |
| 007 | `007_views.sql` | Reporting views (Dashboard + Admin) |
| 008 | `008_storage.sql` | Storage buckets (`assets`, `avatars`) + policies |
| 009 | `009_seed_reference_data.sql` | Seed airports, airlines, a sample route |

## How to run

**Supabase SQL Editor** — paste each file's contents in order and run.

**psql / CLI:**

```bash
# Using the connection string from Supabase → Project Settings → Database
for f in schemas/0*.sql; do
  echo "▶ $f"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$f"
done
```

**Supabase CLI (as migrations):** copy each file into `supabase/migrations/`
with a timestamped name, then `supabase db push`.

## Notes

- Files are written to be **idempotent** where practical (`create ... if not
  exists`, `create or replace`, `drop policy if exists`, `on conflict do
  nothing`), so re-running is safe.
- **RLS is default-deny.** Clients only reach their own rows; admins (via
  `is_admin()`) see everything. Reference tables are public-read.
- **Admin role:** set a user as admin with
  `update public.profiles set role = 'admin' where phone = '<+91…>';`
- Reference-table writes and payment verification are expected to run
  **server-side** (Edge Functions with the service-role key), which bypasses RLS.
- The app currently generates flight results client-side (`src/lib/mockFlights.js`);
  once real inventory lives in `flights`/`fares`, point the search there.
