-- Optional separate mobile images for homepage banners (desktop keeps existing URL columns).
alter table public.home_reviews_banner
  add column if not exists background_image_mobile_url text not null default '',
  add column if not exists separate_mobile_image boolean not null default false;

alter table public.home_after_browse_banner
  add column if not exists image_mobile_url text not null default '',
  add column if not exists separate_mobile_image boolean not null default false;

alter table public.hero_slides
  add column if not exists mobile_url text not null default '',
  add column if not exists separate_mobile_image boolean not null default false;

notify pgrst, 'reload schema';
