-- Per-product sale discount (% off list price). 0 = no sale.
alter table public.products
  add column if not exists sale_percent numeric(5,2) not null default 0
    check (sale_percent >= 0 and sale_percent <= 100);

-- Recreate listings so grids get sale_percent and sale-adjusted min_price_pkr.
drop view if exists public.product_listings cascade;

create view public.product_listings as
select
  p.id,
  p.name,
  p.slug,
  p.description,
  p.catchy_headline,
  p.category_id,
  p.brand_id,
  p.is_active,
  case
    when coalesce(p.sale_percent, 0) > 0 then
      greatest(
        0,
        round(coalesce(dv.price_pkr, 0)::numeric * (100 - p.sale_percent) / 100.0)
      )::integer
    else coalesce(dv.price_pkr, 0)
  end as min_price_pkr,
  (
    select pi.url
    from public.product_images pi
    where pi.product_id = p.id
    order by pi.sort_order asc, pi.created_at asc
    limit 1
  ) as image_url,
  p.is_featured,
  p.featured_sort_order,
  p.meta_keywords,
  p.meta_description,
  p.sale_percent,
  dv.id as default_variant_id,
  dv.sku as default_variant_sku,
  dv.title as default_variant_title,
  dv.price_pkr as default_variant_price_pkr
from public.products p
left join lateral (
  select v.id, v.sku, v.title, v.price_pkr
  from public.product_variants v
  where v.product_id = p.id and v.is_active = true
  order by v.price_pkr asc, v.created_at asc
  limit 1
) dv on true
where p.is_active = true
;

notify pgrst, 'reload schema';
