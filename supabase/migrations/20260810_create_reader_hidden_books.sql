begin;

-- Un libro oculto no forma parte de la biblioteca personal. Se mantiene en una
-- tabla independiente para no cambiar el significado de reader_books.
create table if not exists public.reader_hidden_books (
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  hidden_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

create index if not exists reader_hidden_books_user_date_idx
  on public.reader_hidden_books (user_id, hidden_at desc);

create index if not exists reader_hidden_books_book_idx
  on public.reader_hidden_books (book_id);

alter table public.reader_hidden_books enable row level security;

revoke all on table public.reader_hidden_books from anon, authenticated;

grant select, delete
  on table public.reader_hidden_books
  to authenticated;

grant insert (user_id, book_id)
  on table public.reader_hidden_books
  to authenticated;

drop policy if exists "reader_hidden_books_select_own"
  on public.reader_hidden_books;
drop policy if exists "reader_hidden_books_insert_own"
  on public.reader_hidden_books;
drop policy if exists "reader_hidden_books_delete_own"
  on public.reader_hidden_books;

create policy "reader_hidden_books_select_own"
  on public.reader_hidden_books
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "reader_hidden_books_insert_own"
  on public.reader_hidden_books
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.books
      where books.id = reader_hidden_books.book_id
        and books.approved = true
    )
  );

create policy "reader_hidden_books_delete_own"
  on public.reader_hidden_books
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

commit;
