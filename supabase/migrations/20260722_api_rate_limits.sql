create table if not exists public.api_rate_limits (
  rate_key text primary key check (char_length(rate_key) <= 255),
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.api_rate_limits enable row level security;

revoke all privileges
  on table public.api_rate_limits
  from anon, authenticated;

grant select, insert, update, delete
  on table public.api_rate_limits
  to service_role;

drop policy if exists "api_rate_limits_block_client_access"
  on public.api_rate_limits;

create policy "api_rate_limits_block_client_access"
  on public.api_rate_limits
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  is_allowed boolean;
begin
  if p_key is null or char_length(p_key) = 0 or char_length(p_key) > 255 then
    raise exception 'invalid rate-limit key';
  end if;

  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate-limit configuration';
  end if;

  insert into public.api_rate_limits (
    rate_key,
    window_started_at,
    request_count,
    updated_at
  )
  values (
    p_key,
    now(),
    1,
    now()
  )
  on conflict (rate_key) do update
  set
    request_count = case
      when now() - api_rate_limits.window_started_at >=
        make_interval(secs => p_window_seconds)
      then 1
      else api_rate_limits.request_count + 1
    end,
    window_started_at = case
      when now() - api_rate_limits.window_started_at >=
        make_interval(secs => p_window_seconds)
      then now()
      else api_rate_limits.window_started_at
    end,
    updated_at = now()
  returning request_count <= p_limit into is_allowed;

  return is_allowed;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer)
  from public, anon, authenticated;

grant execute on function public.consume_rate_limit(text, integer, integer)
  to service_role;
