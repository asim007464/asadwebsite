-- Per-banner mobile visibility (admin can hide banners on phone screens only).
alter table public.home_reviews_banner
  add column if not exists visible_on_mobile boolean not null default true;

alter table public.home_after_browse_banner
  add column if not exists visible_on_mobile boolean not null default true;

alter table public.home_browse_showcase
  add column if not exists visible_on_mobile boolean not null default true;

notify pgrst, 'reload schema';
