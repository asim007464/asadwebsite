-- Expose catchy_headline on storefront listing queries (requires products.catchy_headline column).
alter table public.products add column if not exists catchy_headline text not null default '';

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
  coalesce(dv.price_pkr, 0) as min_price_pkr,
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
where p.is_active = true;
