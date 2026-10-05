-- Admin-adjustable height (px) for homepage image banners.
alter table public.home_reviews_banner
  add column if not exists height_px integer not null default 340
    check (height_px >= 140 and height_px <= 720);

alter table public.home_after_browse_banner
  add column if not exists height_px integer not null default 240
    check (height_px >= 120 and height_px <= 640);

notify pgrst, 'reload schema';
