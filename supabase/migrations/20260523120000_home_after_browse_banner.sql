-- Full-width image strip after homepage Browse categories / showcase grid (Admin → After browse banner).
create table if not exists public.home_after_browse_banner (
  id integer primary key default 1 check (id = 1),
  image_url text not null default '',
  link_href text not null default '',
  alt_text text not null default '',
  is_active boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.home_after_browse_banner (id)
values (1)
on conflict (id) do nothing;

alter table public.home_after_browse_banner enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'home_after_browse_banner'
      and policyname = 'Public read home after browse banner active'
  ) then
    create policy "Public read home after browse banner active"
      on public.home_after_browse_banner for select using (is_active = true);
  end if;
end$$;
