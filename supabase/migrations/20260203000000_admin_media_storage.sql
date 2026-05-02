-- Public bucket for admin panel image uploads (products, site pages, hero, reviews banner, categories).
-- Apply via Supabase SQL Editor or `supabase db push`.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'admin-media',
  'admin-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admin media public read" on storage.objects;
create policy "Admin media public read"
on storage.objects for select
to public
using (bucket_id = 'admin-media');
