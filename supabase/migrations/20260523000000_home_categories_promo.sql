-- Full-width clickable promo above "Browse categories" on the homepage (Admin → Categories promo).
create table if not exists public.home_categories_promo (
  id integer primary key default 1 check (id = 1),
  image_url text not null default '',
  link_href text not null default '',
  alt_text text not null default '',
  is_active boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.home_categories_promo (id)
values (1)
on conflict (id) do nothing;

alter table public.home_categories_promo enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'home_categories_promo'
      and policyname = 'Public read home categories promo active'
  ) then
    create policy "Public read home categories promo active"
      on public.home_categories_promo for select using (is_active = true);
  end if;
end$$;
