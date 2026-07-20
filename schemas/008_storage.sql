-- 008_storage.sql
-- Storage buckets + policies.
--   assets  — public read (airline logos, route images, offer banners)
--   avatars — private, owner-scoped (optional profile photos)

insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

-- Public read for the assets bucket.
drop policy if exists "assets public read" on storage.objects;
create policy "assets public read" on storage.objects
  for select using (bucket_id = 'assets');

-- Owner-scoped access to avatars: files are stored under a folder named after
-- the user's id, e.g. avatars/<uid>/photo.png.
drop policy if exists "avatars owner read" on storage.objects;
create policy "avatars owner read" on storage.objects
  for select using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars owner write" on storage.objects;
create policy "avatars owner write" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
