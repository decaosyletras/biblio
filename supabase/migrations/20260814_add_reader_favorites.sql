begin;

alter table public.reader_books
  add column if not exists is_favorite boolean not null default false,
  add column if not exists favorited_at timestamptz;

alter table public.reader_books
  drop constraint if exists reader_books_favorite_requires_read;

alter table public.reader_books
  add constraint reader_books_favorite_requires_read
  check (not is_favorite or is_read);

alter table public.reader_profiles
  add column if not exists show_favorites boolean not null default true;

create index if not exists reader_books_user_favorites_idx
  on public.reader_books (user_id, favorited_at desc)
  where is_favorite = true;

-- Las fechas de lectura y favorito son controladas por el servidor. Al volver
-- un libro a pendiente se limpian también el año y el favorito.
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
    new.is_favorite = false;
  end if;

  if new.is_favorite then
    if tg_op = 'INSERT' then
      new.favorited_at = coalesce(new.favorited_at, now());
    elsif old.is_favorite = false then
      new.favorited_at = coalesce(new.favorited_at, now());
    end if;
  else
    new.favorited_at = null;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.sync_reader_book_state_dates() from public;

grant update (is_favorite)
  on table public.reader_books
  to authenticated;

grant select (show_favorites)
  on table public.reader_profiles
  to anon, authenticated;

commit;
