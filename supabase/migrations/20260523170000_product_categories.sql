-- Many-to-many: one product can belong to multiple categories.
create table if not exists public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (product_id, category_id)
);

create index if not exists product_categories_category_id_idx
  on public.product_categories(category_id);

create index if not exists product_categories_product_id_idx
  on public.product_categories(product_id);

-- Backfill from existing primary category_id
insert into public.product_categories (product_id, category_id, sort_order)
select p.id, p.category_id, 0
from public.products p
where p.category_id is not null
on conflict (product_id, category_id) do nothing;

alter table public.product_categories enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'product_categories'
      and policyname = 'Public read product categories'
  ) then
    create policy "Public read product categories"
      on public.product_categories for select using (true);
  end if;
end$$;

notify pgrst, 'reload schema';
