begin;

-- Una obra publicada por el autor vinculado pertenece a su espacio de autor,
-- no a sus lecturas personales. Se consideran autor principal y coautorias.
create or replace function public.current_user_authored_book(target_book_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.author_claims as claim
    where claim.user_id = (select auth.uid())
      and claim.status = 'approved'
      and (
        exists (
          select 1
          from public.books as book
          where book.id = target_book_id
            and book.author_id = claim.author_id
        )
        or exists (
          select 1
          from public.book_authors as relation
          where relation.book_id = target_book_id
            and relation.author_id = claim.author_id
        )
      )
  );
$$;

revoke all on function public.current_user_authored_book(uuid) from public;
revoke all on function public.current_user_authored_book(uuid) from anon;
grant execute on function public.current_user_authored_book(uuid)
  to authenticated, service_role;

-- Limpia solamente libros que ya estaban guardados u ocultos por la cuenta
-- que actualmente tiene una vinculacion de autor aprobada.
delete from public.reader_books as membership
where exists (
  select 1
  from public.author_claims as claim
  where claim.user_id = membership.user_id
    and claim.status = 'approved'
    and (
      exists (
        select 1
        from public.books as book
        where book.id = membership.book_id
          and book.author_id = claim.author_id
      )
      or exists (
        select 1
        from public.book_authors as relation
        where relation.book_id = membership.book_id
          and relation.author_id = claim.author_id
      )
    )
);

delete from public.reader_hidden_books as hidden
where exists (
  select 1
  from public.author_claims as claim
  where claim.user_id = hidden.user_id
    and claim.status = 'approved'
    and (
      exists (
        select 1
        from public.books as book
        where book.id = hidden.book_id
          and book.author_id = claim.author_id
      )
      or exists (
        select 1
        from public.book_authors as relation
        where relation.book_id = hidden.book_id
          and relation.author_id = claim.author_id
      )
    )
);

drop policy if exists "reader_books_insert_own"
  on public.reader_books;
drop policy if exists "reader_books_update_own"
  on public.reader_books;

create policy "reader_books_insert_own"
  on public.reader_books
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and not public.current_user_authored_book(book_id)
    and exists (
      select 1
      from public.books
      where books.id = reader_books.book_id
        and books.approved = true
    )
  );

create policy "reader_books_update_own"
  on public.reader_books
  for update
  to authenticated
  using (
    (select auth.uid()) = user_id
    and not public.current_user_authored_book(book_id)
  )
  with check (
    (select auth.uid()) = user_id
    and not public.current_user_authored_book(book_id)
    and exists (
      select 1
      from public.books
      where books.id = reader_books.book_id
        and books.approved = true
    )
  );

drop policy if exists "reader_hidden_books_insert_own"
  on public.reader_hidden_books;

create policy "reader_hidden_books_insert_own"
  on public.reader_hidden_books
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and not public.current_user_authored_book(book_id)
    and exists (
      select 1
      from public.books
      where books.id = reader_hidden_books.book_id
        and books.approved = true
    )
  );

commit;
