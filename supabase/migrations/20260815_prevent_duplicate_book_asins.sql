begin;

-- La migración se detiene sin modificar datos si ya existen dos libros con
-- el mismo ASIN en cualquiera de las tres columnas de Amazon.
do $$
declare
  duplicate_asin text;
begin
  select normalized_asin
    into duplicate_asin
  from (
    select
      books.id as book_id,
      upper(btrim(coalesce(candidate.value, ''))) as normalized_asin
    from public.books
    cross join lateral (
      values (books.asin_es), (books.asin_mx), (books.asin_us)
    ) as candidate(value)
  ) as existing_asins
  where normalized_asin <> ''
  group by normalized_asin
  having count(distinct book_id) > 1
  limit 1;

  if duplicate_asin is not null then
    raise unique_violation
      using
        message = format(
          'No se puede activar la protección: el ASIN %s ya pertenece a más de un libro.',
          duplicate_asin
        ),
        constraint = 'books_asin_unique_across_marketplaces';
  end if;
end;
$$;

-- Los valores existentes quedan en el mismo formato canónico que utiliza la
-- API. Las cadenas vacías se convierten a null para no ocupar índices únicos.
update public.books
set
  asin_es = nullif(upper(btrim(asin_es)), ''),
  asin_mx = nullif(upper(btrim(asin_mx)), ''),
  asin_us = nullif(upper(btrim(asin_us)), '')
where
  asin_es is distinct from nullif(upper(btrim(asin_es)), '')
  or asin_mx is distinct from nullif(upper(btrim(asin_mx)), '')
  or asin_us is distinct from nullif(upper(btrim(asin_us)), '');

create unique index if not exists books_asin_es_upper_unique
  on public.books ((upper(btrim(asin_es))))
  where nullif(btrim(asin_es), '') is not null;

create unique index if not exists books_asin_mx_upper_unique
  on public.books ((upper(btrim(asin_mx))))
  where nullif(btrim(asin_mx), '') is not null;

create unique index if not exists books_asin_us_upper_unique
  on public.books ((upper(btrim(asin_us))))
  where nullif(btrim(asin_us), '') is not null;

create or replace function public.enforce_unique_book_asins()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  candidate_asin text;
begin
  new.asin_es := nullif(upper(btrim(new.asin_es)), '');
  new.asin_mx := nullif(upper(btrim(new.asin_mx)), '');
  new.asin_us := nullif(upper(btrim(new.asin_us)), '');

  for candidate_asin in
    select distinct asin
    from unnest(array[new.asin_es, new.asin_mx, new.asin_us]) as asin
    where asin is not null
    order by asin
  loop
    -- Serializa comprobaciones del mismo ASIN aunque lleguen en columnas de
    -- mercados diferentes; los índices únicos cubren además cada columna.
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(candidate_asin, 0)
    );

    if exists (
      select 1
      from public.books as existing_book
      cross join lateral (
        values
          (existing_book.asin_es),
          (existing_book.asin_mx),
          (existing_book.asin_us)
      ) as existing_asin(value)
      where existing_book.id is distinct from new.id
        and upper(btrim(coalesce(existing_asin.value, ''))) = candidate_asin
    ) then
      raise unique_violation
        using
          message = 'Este ASIN ya está registrado en otro libro.',
          constraint = 'books_asin_unique_across_marketplaces';
    end if;
  end loop;

  return new;
end;
$$;

revoke all on function public.enforce_unique_book_asins() from public;

drop trigger if exists books_enforce_unique_asins on public.books;

create trigger books_enforce_unique_asins
before insert or update of asin_es, asin_mx, asin_us
on public.books
for each row
execute function public.enforce_unique_book_asins();

commit;
