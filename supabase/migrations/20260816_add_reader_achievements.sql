begin;

alter table public.reader_profiles
  add column if not exists show_achievements boolean not null default true;

grant select (show_achievements)
  on table public.reader_profiles
  to anon, authenticated;

create table if not exists public.reader_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_key text not null,
  period_key text not null default 'lifetime',
  first_unlocked_at timestamptz not null default now(),
  celebrated_at timestamptz,
  primary key (user_id, achievement_key, period_key),
  constraint reader_achievements_key_format
    check (achievement_key ~ '^[a-z0-9-]{3,60}$'),
  constraint reader_achievements_period_length
    check (char_length(period_key) between 1 and 30)
);

create index if not exists reader_achievements_user_unlocked_idx
  on public.reader_achievements (user_id, first_unlocked_at desc);

alter table public.reader_achievements enable row level security;

revoke all on table public.reader_achievements from anon, authenticated;

grant select
  on table public.reader_achievements
  to authenticated;

drop policy if exists "reader_achievements_select_own"
  on public.reader_achievements;

create policy "reader_achievements_select_own"
  on public.reader_achievements
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

commit;
