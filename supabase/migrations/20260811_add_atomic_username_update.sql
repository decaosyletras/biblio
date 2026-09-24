begin;

create or replace function public.update_my_username(new_username text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_username text := lower(trim(new_username));
begin
  if current_user_id is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  if char_length(normalized_username) not between 3 and 30
    or normalized_username !~ '^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$'
    or normalized_username = any (
      array['admin', 'api', 'authors', 'login', 'me', 'readers', 'register']::text[]
    )
  then
    raise exception 'invalid_username' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.profiles
    where lower(username) = normalized_username
      and id <> current_user_id
  ) then
    raise exception 'username_taken' using errcode = '23505';
  end if;

  update public.profiles
  set username = normalized_username
  where id = current_user_id;

  if not found then
    raise exception 'profile_not_found' using errcode = 'P0002';
  end if;

  return normalized_username;
end;
$$;

revoke all on function public.update_my_username(text) from public;
grant execute on function public.update_my_username(text) to authenticated;

-- El usuario público del lector forma parte de una URL compartible. Se fija al
-- crear el perfil y no cambia cuando se edita el nombre de la cuenta privada.
create or replace function public.keep_reader_username_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.username is distinct from old.username then
    raise exception 'reader_username_immutable' using errcode = '22023';
  end if;

  return new;
end;
$$;

drop trigger if exists keep_reader_username_immutable
  on public.reader_profiles;

create trigger keep_reader_username_immutable
before update of username on public.reader_profiles
for each row
execute function public.keep_reader_username_immutable();

commit;
