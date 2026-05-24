-- Curated category + products for homepage "Browse categories" max-column grid (Admin → Browse showcase).
create table if not exists public.home_browse_showcase (
  id integer primary key default 1 check (id = 1),
  category_id uuid references public.categories(id) on delete set null,
  section_title text not null default '',
  is_active boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.home_browse_showcase (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.home_browse_showcase_products (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id)
);

create index if not exists home_browse_showcase_products_sort_idx
  on public.home_browse_showcase_products(sort_order);

alter table public.home_browse_showcase enable row level security;
alter table public.home_browse_showcase_products enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'home_browse_showcase'
      and policyname = 'Public read home browse showcase active'
  ) then
    create policy "Public read home browse showcase active"
      on public.home_browse_showcase for select using (is_active = true);
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'home_browse_showcase_products'
      and policyname = 'Public read home browse showcase products'
  ) then
    create policy "Public read home browse showcase products"
      on public.home_browse_showcase_products for select using (true);
  end if;
end$$;
