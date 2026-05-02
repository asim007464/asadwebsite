-- OTP sign-up / forgot-password codes (hashed server-side via app + service role).
-- Run this in Supabase Dashboard → SQL → New query, then Execute.
-- Re-run the whole file after updates: new Supabase projects require explicit GRANTs
-- or PostgREST returns "schema cache" / missing-table errors even when the table exists.

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

-- Data API: server uses service_role; RLS has no policies so anon/authenticated cannot read rows.
grant select, insert, update, delete on table public.email_verification_codes to service_role;

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

notify pgrst, 'reload schema';
