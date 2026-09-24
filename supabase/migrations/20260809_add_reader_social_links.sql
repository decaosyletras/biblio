begin;

-- El perfil lector ofrece las mismas redes públicas que la página de autor.
-- Se agregan en una migración nueva para no alterar 20260806 ya aplicada.
alter table public.reader_profiles
  add column if not exists wattpad_url text not null default '',
  add column if not exists threads_url text not null default '',
  add column if not exists facebook_url text not null default '',
  add column if not exists youtube_url text not null default '';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'reader_profiles_wattpad_url_length'
      and conrelid = 'public.reader_profiles'::regclass
  ) then
    alter table public.reader_profiles
      add constraint reader_profiles_wattpad_url_length
      check (char_length(wattpad_url) <= 500);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'reader_profiles_threads_url_length'
      and conrelid = 'public.reader_profiles'::regclass
  ) then
    alter table public.reader_profiles
      add constraint reader_profiles_threads_url_length
      check (char_length(threads_url) <= 500);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'reader_profiles_facebook_url_length'
      and conrelid = 'public.reader_profiles'::regclass
  ) then
    alter table public.reader_profiles
      add constraint reader_profiles_facebook_url_length
      check (char_length(facebook_url) <= 500);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'reader_profiles_youtube_url_length'
      and conrelid = 'public.reader_profiles'::regclass
  ) then
    alter table public.reader_profiles
      add constraint reader_profiles_youtube_url_length
      check (char_length(youtube_url) <= 500);
  end if;
end
$$;

-- La tabla conserva su RLS. Sólo se habilitan estas columnas públicas nuevas;
-- user_id y los datos de cuenta continúan fuera del alcance del navegador.
grant select (
  wattpad_url,
  threads_url,
  facebook_url,
  youtube_url
) on table public.reader_profiles to anon, authenticated;

commit;
