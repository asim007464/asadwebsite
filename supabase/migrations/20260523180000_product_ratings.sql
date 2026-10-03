-- Admin-managed product rating shown on storefront (stars + count).
alter table public.products
  add column if not exists rating_avg numeric(2,1) not null default 0
    check (rating_avg >= 0 and rating_avg <= 5);

alter table public.products
  add column if not exists rating_count integer not null default 0
    check (rating_count >= 0);

notify pgrst, 'reload schema';
