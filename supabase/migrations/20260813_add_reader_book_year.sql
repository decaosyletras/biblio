begin;

-- El momento en que se marcó como leído ya vive en read_at. read_year es
-- deliberadamente opcional: representa el año que el lector confirma para
-- estadísticas y resúmenes, no una fecha inferida por la aplicación.
alter table public.reader_books
  add column if not exists read_year smallint;

alter table public.reader_books
  drop constraint if exists reader_books_read_year_range;

alter table public.reader_books
  add constraint reader_books_read_year_range
  check (read_year is null or read_year between 1900 and 9999);

create index if not exists reader_books_user_year_idx
  on public.reader_books (user_id, read_year)
  where is_read = true and read_year is not null;

-- Al devolver un libro a pendiente se limpian tanto la marca automática como
-- el año opcional para que no aparezca en futuros resúmenes por error.
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
    new.read_year = null;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.sync_reader_book_state_dates() from public;

-- El navegador puede proponer el año, pero únicamente para filas propias por
-- las políticas RLS existentes. Las fechas siguen siendo controladas por el
-- trigger y no se conceden como columnas editables.
grant update (read_year)
  on table public.reader_books
  to authenticated;

commit;
