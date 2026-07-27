-- Keep an in-progress Checkout session tied to both its plan and currency.

alter table public.stripe_checkout_attempts
  add column if not exists currency text;

update public.stripe_checkout_attempts
  set currency = 'usd'
  where currency is null;

alter table public.stripe_checkout_attempts
  alter column currency set default 'usd',
  alter column currency set not null;

alter table public.stripe_checkout_attempts
  drop constraint if exists stripe_checkout_attempts_currency_check;

alter table public.stripe_checkout_attempts
  add constraint stripe_checkout_attempts_currency_check
  check (currency in ('usd', 'mxn', 'eur'));
