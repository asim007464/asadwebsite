-- Seed data — home appliances demo (safe to tweak). Re-run SQL editor if you need fresh rows.
--
-- If you see "column is_featured does not exist", run the block below once (or apply supabase/schema.sql).

alter table public.products add column if not exists is_featured boolean not null default false;
alter table public.products add column if not exists featured_sort_order integer not null default 0;
create index if not exists products_featured_sort_idx on public.products (is_featured, featured_sort_order) where is_featured = true;

alter table public.products add column if not exists meta_keywords text not null default '';
alter table public.products add column if not exists meta_description text not null default '';
alter table public.categories add column if not exists thumbnail_url text not null default '';
alter table public.categories add column if not exists hero_icon_hint text not null default '';

create or replace view public.product_listings as
select
  p.id,
  p.name,
  p.slug,
  p.description,
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
where p.is_active = true
;

insert into public.categories (name, slug) values
  ('Fans & Cooling', 'fans-cooling'),
  ('Lighting & LEDs', 'lighting-leds'),
  ('Heaters', 'heaters'),
  ('Kitchen Appliances', 'kitchen-appliances'),
  ('Personal Care & Grooming', 'personal-care'),
  ('Power & Cables', 'power-cables'),
  ('Breakers & Protection', 'breakers-protection'),
  ('Conduits & Accessories', 'conduits-accessories'),
  ('Switches & Sockets', 'switches-sockets'),
  ('Wires & Cables', 'wires-cables')
on conflict (slug) do nothing;

insert into public.brands (name, slug) values
  ('Home Essentials', 'home-essentials'),
  ('BrightLite', 'brightlite'),
  ('KitchenPro', 'kitchenpro')
on conflict (slug) do nothing;

with
  c as (select id from public.categories where slug='fans-cooling' limit 1),
  b as (select id from public.brands where slug='home-essentials' limit 1)
insert into public.products (name, slug, description, category_id, brand_id)
select
  'Ceiling Fan 56 inch with Remote',
  'ceiling-fan-56-remote',
  'Large-room ceiling fan with RF remote, reversible airflow, and quiet motor—ideal for lounges and bedrooms.',
  (select id from c),
  (select id from b)
on conflict (slug) do nothing;

with p as (select id from public.products where slug='ceiling-fan-56-remote' limit 1)
insert into public.product_variants (product_id, sku, title, options, price_pkr, compare_at_price_pkr, weight_grams)
select
  (select id from p),
  v.sku,
  v.title,
  v.options::jsonb,
  v.price_pkr,
  v.compare_at_price_pkr,
  v.weight_grams
from (values
  ('CF-56-WHT', '56″ Matte White + Remote', '{"size_in":"56","finish":"Matte white","remote":"Included"}', 17800, 19500, 5200),
  ('CF-56-WLN', '56″ Walnut Blades + Remote', '{"size_in":"56","finish":"Walnut blades","remote":"Included"}', 18900, 20600, 5400),
  ('CF-56-BLK', '56″ Matte Black + Remote', '{"size_in":"56","finish":"Matte black","remote":"Included"}', 18450, 20200, 5300)
) as v(sku, title, options, price_pkr, compare_at_price_pkr, weight_grams)
on conflict (sku) do nothing;

insert into public.inventory (variant_id, qty_available)
select id, 40
from public.product_variants
where sku in ('CF-56-WHT','CF-56-WLN','CF-56-BLK')
on conflict (variant_id) do update set qty_available=excluded.qty_available, updated_at=now();

insert into public.product_images (product_id, url, alt, sort_order)
select
  p.id,
  'https://images.unsplash.com/photo-1585771720464-a89680577fb9?auto=format&fit=crop&w=1200&q=80',
  'Ceiling fan product photo',
  0
from public.products p
where p.slug='ceiling-fan-56-remote'
on conflict do nothing;

-- Extra demo products (so Featured picks can show 5 cards)

with
  c as (select id from public.categories where slug='wires-cables' limit 1),
  b as (select id from public.brands where slug='home-essentials' limit 1)
insert into public.products (name, slug, description, category_id, brand_id)
select
  'House Wiring Copper Cable (7/29)',
  'house-wiring-copper-cable-7-29',
  'High quality copper conductor cable for home wiring — choose length and core options per variant.',
  (select id from c),
  (select id from b)
on conflict (slug) do nothing;

with p as (select id from public.products where slug='house-wiring-copper-cable-7-29' limit 1)
insert into public.product_variants (product_id, sku, title, options, price_pkr, compare_at_price_pkr, weight_grams)
select
  (select id from p),
  v.sku,
  v.title,
  v.options::jsonb,
  v.price_pkr,
  v.compare_at_price_pkr,
  v.weight_grams
from (values
  ('HW-7-29-2C-90', '7/29 Copper · 2 Core · 90m', '{"gauge":"7/29","cores":"2","length_m":"90","material":"Copper"}', 14500, 15900, 6400),
  ('HW-7-29-3C-90', '7/29 Copper · 3 Core · 90m', '{"gauge":"7/29","cores":"3","length_m":"90","material":"Copper"}', 18900, 20500, 8200)
) as v(sku, title, options, price_pkr, compare_at_price_pkr, weight_grams)
on conflict (sku) do nothing;

insert into public.inventory (variant_id, qty_available)
select id, 25
from public.product_variants
where sku in ('HW-7-29-2C-90','HW-7-29-3C-90')
on conflict (variant_id) do update set qty_available=excluded.qty_available, updated_at=now();

insert into public.product_images (product_id, url, alt, sort_order)
select
  p.id,
  'https://images.unsplash.com/photo-1581091012184-5c7c2ab6a9a3?auto=format&fit=crop&w=1200&q=80',
  'Copper cable spool',
  0
from public.products p
where p.slug='house-wiring-copper-cable-7-29'
on conflict do nothing;

with
  c as (select id from public.categories where slug='lighting-leds' limit 1),
  b as (select id from public.brands where slug='brightlite' limit 1)
insert into public.products (name, slug, description, category_id, brand_id)
select
  'LED Batten Light 20W (Cool White)',
  'led-batten-20w-cool-white',
  'Bright 20W LED batten for homes and shops — low power draw with clean, even diffusion.',
  (select id from c),
  (select id from b)
on conflict (slug) do nothing;

with p as (select id from public.products where slug='led-batten-20w-cool-white' limit 1)
insert into public.product_variants (product_id, sku, title, options, price_pkr, compare_at_price_pkr, weight_grams)
select
  (select id from p),
  v.sku,
  v.title,
  v.options::jsonb,
  v.price_pkr,
  v.compare_at_price_pkr,
  v.weight_grams
from (values
  ('LB-20-CW-2FT', '20W · 2ft · Cool White', '{"watt":"20","length_ft":"2","color_temp":"Cool white"}', 1750, 2100, 550),
  ('LB-20-CW-4FT', '20W · 4ft · Cool White', '{"watt":"20","length_ft":"4","color_temp":"Cool white"}', 2450, 2900, 780)
) as v(sku, title, options, price_pkr, compare_at_price_pkr, weight_grams)
on conflict (sku) do nothing;

insert into public.inventory (variant_id, qty_available)
select id, 60
from public.product_variants
where sku in ('LB-20-CW-2FT','LB-20-CW-4FT')
on conflict (variant_id) do update set qty_available=excluded.qty_available, updated_at=now();

insert into public.product_images (product_id, url, alt, sort_order)
select
  p.id,
  'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1200&q=80',
  'LED batten light',
  0
from public.products p
where p.slug='led-batten-20w-cool-white'
on conflict do nothing;

with
  c as (select id from public.categories where slug='kitchen-appliances' limit 1),
  b as (select id from public.brands where slug='kitchenpro' limit 1)
insert into public.products (name, slug, description, category_id, brand_id)
select
  'Blender & Grinder 2-in-1 (450W)',
  'blender-grinder-2in1-450w',
  'Daily kitchen helper with sturdy jar set — blend shakes, grind spices, and prep sauces fast.',
  (select id from c),
  (select id from b)
on conflict (slug) do nothing;

with p as (select id from public.products where slug='blender-grinder-2in1-450w' limit 1)
insert into public.product_variants (product_id, sku, title, options, price_pkr, compare_at_price_pkr, weight_grams)
select
  (select id from p),
  v.sku,
  v.title,
  v.options::jsonb,
  v.price_pkr,
  v.compare_at_price_pkr,
  v.weight_grams
from (values
  ('BG-450-BLK', '450W · Black · 2 jars', '{"watt":"450","color":"Black","jars":"2"}', 8950, 9900, 3200),
  ('BG-450-WHT', '450W · White · 2 jars', '{"watt":"450","color":"White","jars":"2"}', 8950, 9900, 3200)
) as v(sku, title, options, price_pkr, compare_at_price_pkr, weight_grams)
on conflict (sku) do nothing;

insert into public.inventory (variant_id, qty_available)
select id, 18
from public.product_variants
where sku in ('BG-450-BLK','BG-450-WHT')
on conflict (variant_id) do update set qty_available=excluded.qty_available, updated_at=now();

insert into public.product_images (product_id, url, alt, sort_order)
select
  p.id,
  'https://images.unsplash.com/photo-1585238342028-4a8f8c6c39b5?auto=format&fit=crop&w=1200&q=80',
  'Blender on kitchen counter',
  0
from public.products p
where p.slug='blender-grinder-2in1-450w'
on conflict do nothing;

with
  c as (select id from public.categories where slug='heaters' limit 1),
  b as (select id from public.brands where slug='home-essentials' limit 1)
insert into public.products (name, slug, description, category_id, brand_id)
select
  'Room Heater Quartz 1200W',
  'room-heater-quartz-1200w',
  'Quick warm-up quartz heater with safety grill and two heat settings — ideal for bedrooms and offices.',
  (select id from c),
  (select id from b)
on conflict (slug) do nothing;

with p as (select id from public.products where slug='room-heater-quartz-1200w' limit 1)
insert into public.product_variants (product_id, sku, title, options, price_pkr, compare_at_price_pkr, weight_grams)
select
  (select id from p),
  v.sku,
  v.title,
  v.options::jsonb,
  v.price_pkr,
  v.compare_at_price_pkr,
  v.weight_grams
from (values
  ('RH-1200-2BAR', '1200W · 2 Quartz Bars', '{"watt":"1200","bars":"2","type":"Quartz"}', 5650, 6400, 2600),
  ('RH-1200-3BAR', '1200W · 3 Quartz Bars', '{"watt":"1200","bars":"3","type":"Quartz"}', 6950, 7800, 3000)
) as v(sku, title, options, price_pkr, compare_at_price_pkr, weight_grams)
on conflict (sku) do nothing;

insert into public.inventory (variant_id, qty_available)
select id, 22
from public.product_variants
where sku in ('RH-1200-2BAR','RH-1200-3BAR')
on conflict (variant_id) do update set qty_available=excluded.qty_available, updated_at=now();

insert into public.product_images (product_id, url, alt, sort_order)
select
  p.id,
  'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?auto=format&fit=crop&w=1200&q=80',
  'Room heater on floor',
  0
from public.products p
where p.slug='room-heater-quartz-1200w'
on conflict do nothing;

insert into public.hero_slides (url, alt, sort_order, is_active)
select v.url, v.alt, v.sort_order, v.is_active
from (values
  ('https://picsum.photos/id/312/1600/1200', 'Hero slide — demo backdrop 1', 0, true),
  ('https://picsum.photos/id/429/1600/1200', 'Hero slide — demo backdrop 2', 1, true),
  ('https://picsum.photos/id/292/1600/1200', 'Hero slide — demo backdrop 3', 2, true),
  ('https://picsum.photos/id/193/1600/1200', 'Hero slide — demo backdrop 4', 3, true),
  ('https://picsum.photos/id/866/1600/1200', 'Hero slide — demo backdrop 5', 4, true)
) as v(url, alt, sort_order, is_active)
where not exists (select 1 from public.hero_slides h where h.url = v.url);

-- Homepage featured strip (Admin → Featured picks)
update public.products
set is_featured = true, featured_sort_order = 0
where slug = 'ceiling-fan-56-remote';

update public.products
set is_featured = true, featured_sort_order = 1
where slug = 'house-wiring-copper-cable-7-29';

update public.products
set is_featured = true, featured_sort_order = 2
where slug = 'led-batten-20w-cool-white';

update public.products
set is_featured = true, featured_sort_order = 3
where slug = 'blender-grinder-2in1-450w';

update public.products
set is_featured = true, featured_sort_order = 4
where slug = 'room-heater-quartz-1200w';

-- Homepage strip above reviews (editable in Admin → Reviews banner).
-- Applies only while the banner is inactive and unset (won’t overwrite a configured banner).
update public.home_reviews_banner
set
  background_image_url = 'https://picsum.photos/id/866/2400/1200',
  heading = 'Real shoppers. Real COD orders.',
  paragraph = 'Read customer feedback below — then browse nationwide delivery with phone-confirmed COD.',
  button_label = 'Browse products',
  button_href = '/products',
  is_active = true,
  updated_at = now()
where
  id = 1
  and is_active is false
  and coalesce(trim(background_image_url), '') = ''
  and coalesce(trim(heading), '') = '';
