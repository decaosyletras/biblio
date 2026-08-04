begin;

-- La existencia de una fila significa que el libro forma parte de la
-- biblioteca personal. "Leído" es un estado dentro de esa biblioteca, no una
-- colección separada; por eso no existe una columna in_library.
create table if not exists public.reader_books (
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  is_read boolean not null default false,
  added_at timestamptz not null default now(),
  read_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

create index if not exists reader_books_user_read_idx
  on public.reader_books (user_id, is_read, added_at desc);

create index if not exists reader_books_book_idx
  on public.reader_books (book_id);

create or replace function public.sync_reader_book_state_dates()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_read then
    if tg_op = 'INSERT' then
      new.read_at = coalesce(new.read_at, now());
    elsif old.is_read = false then
      new.read_at = coalesce(new.read_at, now());
    end if;
  else
    new.read_at = null;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.sync_reader_book_state_dates() from public;

drop trigger if exists reader_books_sync_state_dates
  on public.reader_books;

create trigger reader_books_sync_state_dates
before insert or update on public.reader_books
for each row
execute function public.sync_reader_book_state_dates();

alter table public.reader_books enable row level security;

revoke all on table public.reader_books from anon, authenticated;
grant select, insert, update, delete
  on table public.reader_books
  to authenticated;

drop policy if exists "reader_books_select_own"
  on public.reader_books;
drop policy if exists "reader_books_insert_own"
  on public.reader_books;
drop policy if exists "reader_books_update_own"
  on public.reader_books;
drop policy if exists "reader_books_delete_own"
  on public.reader_books;

create policy "reader_books_select_own"
  on public.reader_books
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "reader_books_insert_own"
  on public.reader_books
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "reader_books_update_own"
  on public.reader_books
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "reader_books_delete_own"
  on public.reader_books
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

commit;
