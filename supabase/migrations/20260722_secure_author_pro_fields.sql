-- Anonymous book submissions continue through /api/libro-nuevo, whose
-- server-side service client can create a basic author safely.

alter table public.authors enable row level security;

alter table public.authors
  alter column pro set default false;

-- Direct browser writes are disabled. Author profile edits now pass through a
-- protected server route with an explicit field allowlist.
revoke insert, update
  on table public.authors
  from anon, authenticated;

-- Keep the existing legacy policies in place, but make them ineffective for
-- normal clients even if broad grants are restored later.
drop policy if exists "authors_block_direct_insert"
  on public.authors;
drop policy if exists "authors_block_direct_update"
  on public.authors;

create policy "authors_block_direct_insert"
  on public.authors
  as restrictive
  for insert
  to anon, authenticated
  with check (false);

create policy "authors_block_direct_update"
  on public.authors
  as restrictive
  for update
  to anon, authenticated
  using (false)
  with check (false);
