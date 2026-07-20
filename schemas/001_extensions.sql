-- 001_extensions.sql
-- Enable required Postgres extensions. Run first.

-- UUID generation (gen_random_uuid) — bundled with pgcrypto on Supabase.
create extension if not exists pgcrypto;
