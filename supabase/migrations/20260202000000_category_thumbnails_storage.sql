-- Public bucket for category card images uploaded from the admin panel.
-- Apply in Supabase SQL Editor or `supabase db push` so uploads from /admin/categories work.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'category-thumbnails',
  'category-thumbnails',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Category thumbnails public read" on storage.objects;
create policy "Category thumbnails public read"
on storage.objects for select
to public
using (bucket_id = 'category-thumbnails');
