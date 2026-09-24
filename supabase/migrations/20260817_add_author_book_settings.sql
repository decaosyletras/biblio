begin;

-- El orden de un libro pertenece a la pagina de cada autor, no al libro
-- global. Esta tabla cubre tanto libros de un solo autor como coautorias sin
-- cambiar el significado historico de book_authors.
create table if not exists public.author_book_settings (
  author_id uuid not null references public.authors(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  author_order integer not null default 0,
  primary key (author_id, book_id),
  constraint author_book_settings_order_nonnegative
    check (author_order >= 0)
);

create index if not exists author_book_settings_author_order_idx
  on public.author_book_settings (author_id, author_order, book_id);

-- Conserva el orden visible actual para relaciones directas y coautorias.
-- UNION elimina el duplicado cuando el autor principal tambien aparece en
-- book_authors.
insert into public.author_book_settings (
  author_id,
  book_id,
  author_order
)
select
  associations.author_id,
  associations.book_id,
  greatest(coalesce(books.author_order, 0), 0)
from (
  select books.author_id, books.id as book_id
  from public.books
  where books.author_id is not null

  union

  select book_authors.author_id, book_authors.book_id
  from public.book_authors
) as associations
join public.books
  on books.id = associations.book_id
on conflict (author_id, book_id) do nothing;

alter table public.author_book_settings enable row level security;

revoke all
  on table public.author_book_settings
  from anon, authenticated;

-- El orden ya es informacion publica en las paginas de autor. Las escrituras
-- se realizan exclusivamente en la ruta de servidor tras validar la
-- reclamacion aprobada.
grant select
  on table public.author_book_settings
  to anon, authenticated;

drop policy if exists "author_book_settings_public_read"
  on public.author_book_settings;

create policy "author_book_settings_public_read"
  on public.author_book_settings
  for select
  to anon, authenticated
  using (true);

commit;
