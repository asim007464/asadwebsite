-- ASAD STORE - Supabase schema (Postgres)
-- Run this in Supabase SQL editor.

create extension if not exists pgcrypto;

-- Catalog
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists categories_parent_id_idx on public.categories(parent_id);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  featured_sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_brand_id_idx on public.products(brand_id);
create index if not exists products_is_active_idx on public.products(is_active);
-- Featured index is created after ALTER adds columns (below).

-- Variant options are stored in JSONB to support wiring specs:
-- e.g. {"gauge":"7/29","cores":"2","length_m":"90","color":"Red","material":"Copper"}
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  title text not null,
  options jsonb not null default '{}'::jsonb,
  price_pkr integer not null check (price_pkr >= 0),
  compare_at_price_pkr integer null check (compare_at_price_pkr is null or compare_at_price_pkr >= 0),
  weight_grams integer null check (weight_grams is null or weight_grams >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists product_variants_product_id_idx on public.product_variants(product_id);
create index if not exists product_variants_is_active_idx on public.product_variants(is_active);
create index if not exists product_variants_price_idx on public.product_variants(price_pkr);
create index if not exists product_variants_options_gin_idx on public.product_variants using gin (options);

create table if not exists public.inventory (
  variant_id uuid primary key references public.product_variants(id) on delete cascade,
  qty_available integer not null default 0 check (qty_available >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on public.product_images(product_id);
create index if not exists product_images_sort_idx on public.product_images(product_id, sort_order);

-- Homepage hero background carousel (URLs Ã¢â‚¬â€ e.g. Supabase Storage or CDN). Managed in Admin Ã¢â€ â€™ Hero slides.
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists hero_slides_active_sort_idx on public.hero_slides(is_active, sort_order);

alter table public.hero_slides enable row level security;

-- Homepage strip above testimonials/reviews — managed in Admin → Reviews banner.
create table if not exists public.home_reviews_banner (
  id integer primary key default 1 check (id = 1),
  background_image_url text not null default '',
  heading text not null default '',
  paragraph text not null default '',
  button_label text not null default '',
  button_href text not null default '/products',
  is_active boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.home_reviews_banner (id)
values (1)
on conflict (id) do nothing;

alter table public.home_reviews_banner enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='home_reviews_banner' and policyname='Public read home reviews banner active') then
    create policy "Public read home reviews banner active"
      on public.home_reviews_banner for select using (is_active = true);
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='hero_slides' and policyname='Public read hero slides') then
    create policy "Public read hero slides" on public.hero_slides for select using (is_active = true);
  end if;
end$$;

-- Backfill featured columns on older databases (safe if already present).
alter table public.products add column if not exists is_featured boolean not null default false;
alter table public.products add column if not exists featured_sort_order integer not null default 0;
create index if not exists products_featured_sort_idx on public.products (is_featured, featured_sort_order) where is_featured = true;

-- Simple storefront listing view: min price and main image.
-- Column order: keep min_price_pkr + image_url before is_featured so CREATE OR REPLACE VIEW upgrades cleanly (PG 42P16).
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

-- Orders (COD-first)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned');
  end if;
end$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status public.order_status not null default 'pending',
  payment_method text not null default 'cod',
  currency text not null default 'PKR',
  subtotal_pkr integer not null check (subtotal_pkr >= 0),
  shipping_pkr integer not null default 0 check (shipping_pkr >= 0),
  total_pkr integer not null check (total_pkr >= 0),
  customer_name text not null,
  customer_phone text not null,
  customer_email text null,
  shipping_address1 text not null,
  shipping_address2 text null,
  shipping_city text not null,
  shipping_province text null,
  shipping_postal_code text null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid null references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_title text not null,
  sku text not null,
  unit_price_pkr integer not null check (unit_price_pkr >= 0),
  quantity integer not null check (quantity > 0),
  line_total_pkr integer not null check (line_total_pkr >= 0),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- Minimal RLS: public read for catalog, orders writable only via service role
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory enable row level security;

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

do $$
begin
  -- Public read policies for catalog tables/views.
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='categories' and policyname='Public read categories') then
    create policy "Public read categories" on public.categories for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='brands' and policyname='Public read brands') then
    create policy "Public read brands" on public.brands for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='Public read products') then
    create policy "Public read products" on public.products for select using (is_active = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='product_variants' and policyname='Public read variants') then
    create policy "Public read variants" on public.product_variants for select using (is_active = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='product_images' and policyname='Public read images') then
    create policy "Public read images" on public.product_images for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='inventory' and policyname='Public read inventory') then
    create policy "Public read inventory" on public.inventory for select using (true);
  end if;
end$$;

-- =========================
-- Progressive migrations below (SEO, wishlist/CMS tables, OTP). Safe to run on existing DBs.
-- =========================

alter table public.products add column if not exists meta_keywords text not null default '';
alter table public.products add column if not exists meta_description text not null default '';

alter table public.categories add column if not exists thumbnail_url text not null default '';
alter table public.categories add column if not exists hero_icon_hint text not null default '';


create table if not exists public.storefront_settings (
  id integer primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.storefront_settings (id)
values (1)
on conflict (id) do nothing;


create table if not exists public.homepage_section_products (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('featured', 'gadgets')),
  product_id uuid not null references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (section, product_id)
);

create index if not exists homepage_section_products_section_sort_idx on public.homepage_section_products(section, sort_order);


create table if not exists public.email_verification_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  purpose text not null check (purpose in ('register', 'password_reset')),
  code_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists email_verification_codes_email_purpose_idx on public.email_verification_codes(email, purpose);
create index if not exists email_verification_codes_expires_idx on public.email_verification_codes(expires_at);

alter table public.email_verification_codes enable row level security;

-- Lookup auth.users id server-side after OTP (service role RPC only — do not expose to anon).
create or replace function public.lookup_auth_user_id(email_input text)
returns uuid
language sql
security definer
set search_path = auth
as $$
  select u.id from auth.users u where lower(trim(u.email)) = lower(trim(email_input)) limit 1;
$$;

revoke all on function public.lookup_auth_user_id(text) from public;
grant execute on function public.lookup_auth_user_id(text) to service_role;


--
-- Refresh product_listings view (adds SEO fields for storefront PDP meta / admin tooling).
--

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

