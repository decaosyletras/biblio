-- One in-progress Checkout attempt per author prevents concurrent subscriptions.

create table if not exists public.stripe_checkout_attempts (
  author_id uuid primary key references public.authors(id) on delete cascade,
  user_id uuid not null,
  plan text not null
    check (plan in ('monthly', 'quarterly', 'semiannual')),
  idempotency_key text not null unique,
  stripe_session_id text unique,
  status text not null default 'pending'
    check (status in ('pending', 'created', 'completed', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stripe_checkout_attempts enable row level security;

revoke all privileges
  on table public.stripe_checkout_attempts
  from anon, authenticated;

grant select, insert, update, delete
  on table public.stripe_checkout_attempts
  to service_role;

drop policy if exists "stripe_checkout_attempts_block_client_access"
  on public.stripe_checkout_attempts;

create policy "stripe_checkout_attempts_block_client_access"
  on public.stripe_checkout_attempts
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);
