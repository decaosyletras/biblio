-- Payment records and Stripe event state are server-managed data.

alter table public.author_payments enable row level security;

revoke all privileges
  on table public.author_payments
  from anon, authenticated;

grant select, insert, update, delete
  on table public.author_payments
  to service_role;

drop policy if exists "author_payments_block_client_access"
  on public.author_payments;

create policy "author_payments_block_client_access"
  on public.author_payments
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- PostgreSQL unique indexes still allow multiple NULL values. These indexes
-- make webhook upserts reliable without deleting historical records.
create unique index if not exists author_payments_stripe_session_id_key
  on public.author_payments (stripe_session_id);

create unique index if not exists author_payments_stripe_subscription_id_key
  on public.author_payments (stripe_subscription_id);

-- Only one recoverable/live subscription may exist for an author.
create unique index if not exists author_payments_one_live_subscription_per_author
  on public.author_payments (author_id)
  where status in ('active', 'trialing', 'past_due');

create table if not exists public.stripe_events (
  event_id text primary key,
  event_type text not null,
  stripe_created_at timestamptz not null,
  status text not null default 'processing'
    check (status in ('processing', 'completed', 'failed')),
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;

revoke all privileges
  on table public.stripe_events
  from anon, authenticated;

grant select, insert, update, delete
  on table public.stripe_events
  to service_role;

drop policy if exists "stripe_events_block_client_access"
  on public.stripe_events;

create policy "stripe_events_block_client_access"
  on public.stripe_events
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);
