-- Separate mobile heights for homepage image banners (desktop keeps height_px).
alter table public.home_reviews_banner
  add column if not exists height_mobile_px integer not null default 220
    check (height_mobile_px >= 120 and height_mobile_px <= 720);

alter table public.home_after_browse_banner
  add column if not exists height_mobile_px integer not null default 160
    check (height_mobile_px >= 100 and height_mobile_px <= 640);

-- Backfill: slightly shorter than desktop when still at the column default.
update public.home_reviews_banner
set height_mobile_px = greatest(140, least(720, round(height_px * 0.65)::integer))
where height_mobile_px = 220;

update public.home_after_browse_banner
set height_mobile_px = greatest(120, least(640, round(height_px * 0.7)::integer))
where height_mobile_px = 160;

notify pgrst, 'reload schema';
