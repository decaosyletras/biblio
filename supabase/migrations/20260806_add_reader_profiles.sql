begin;

create table if not exists public.reader_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text not null default '',
  bio text not null default '',
  avatar_url text not null default '',
  instagram_url text not null default '',
  tiktok_url text not null default '',
  website_url text not null default '',
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reader_profiles_username_length
    check (char_length(username) between 3 and 30),
  constraint reader_profiles_display_name_length
    check (char_length(display_name) between 1 and 60),
  constraint reader_profiles_bio_length
    check (char_length(bio) <= 240),
  constraint reader_profiles_avatar_url_length
    check (char_length(avatar_url) <= 2048),
  constraint reader_profiles_instagram_url_length
    check (char_length(instagram_url) <= 500),
  constraint reader_profiles_tiktok_url_length
    check (char_length(tiktok_url) <= 500),
  constraint reader_profiles_website_url_length
    check (char_length(website_url) <= 500),
  constraint reader_profiles_username_format
    check (username ~ '^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$')
);

create unique index if not exists reader_profiles_username_lower_unique
  on public.reader_profiles (lower(username));

alter table public.reader_profiles enable row level security;

-- Username changes now pass through the authenticated reader-profile API so
-- the private account row and the public reader row stay synchronized.
revoke update (username)
  on table public.profiles
  from authenticated;

revoke all on table public.reader_profiles from anon, authenticated;

-- Only explicitly public fields can be requested from the browser. The
-- auth user id stays server-only even when the reader publishes the profile.
grant select (
  username,
  display_name,
  bio,
  avatar_url,
  instagram_url,
  tiktok_url,
  website_url,
  is_public,
  created_at,
  updated_at
) on table public.reader_profiles to anon, authenticated;

drop policy if exists "reader_profiles_public_read"
  on public.reader_profiles;

create policy "reader_profiles_public_read"
  on public.reader_profiles
  for select
  to anon, authenticated
  using (is_public = true);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'reader-avatars',
  'reader-avatars',
  true,
  1048576,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "reader_avatars_insert_own"
  on storage.objects;
drop policy if exists "reader_avatars_select_own"
  on storage.objects;
drop policy if exists "reader_avatars_update_own"
  on storage.objects;
drop policy if exists "reader_avatars_delete_own"
  on storage.objects;

create policy "reader_avatars_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'reader-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "reader_avatars_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'reader-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "reader_avatars_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'reader-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'reader-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "reader_avatars_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'reader-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

commit;
