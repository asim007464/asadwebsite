-- Short marketing line shown on the product detail page (below the product name).
alter table public.products add column if not exists catchy_headline text not null default '';
