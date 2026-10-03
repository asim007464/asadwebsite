-- Admin-adjustable opacity for homepage promo banner background image + dark overlay.
alter table public.home_reviews_banner
  add column if not exists image_opacity integer not null default 100
    check (image_opacity >= 0 and image_opacity <= 100);

alter table public.home_reviews_banner
  add column if not exists overlay_opacity integer not null default 70
    check (overlay_opacity >= 0 and overlay_opacity <= 100);

notify pgrst, 'reload schema';
