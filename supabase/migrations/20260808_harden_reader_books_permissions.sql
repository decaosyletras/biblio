begin;

-- 20260807 ya fue aplicada en algunos entornos. Este archivo separado limita
-- las columnas que puede escribir el navegador sin reescribir el historial.
revoke all on table public.reader_books from anon, authenticated;

grant select, delete
  on table public.reader_books
  to authenticated;

grant insert (user_id, book_id, is_read)
  on table public.reader_books
  to authenticated;

grant update (is_read)
  on table public.reader_books
  to authenticated;

-- Se reemplazan únicamente las políticas afectadas por el endurecimiento.
-- La identidad debe ser la de la sesión y el libro debe seguir aprobado.
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
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.books
      where books.id = reader_books.book_id
        and books.approved = true
    )
  );

commit;
