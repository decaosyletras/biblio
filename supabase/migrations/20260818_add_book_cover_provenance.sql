begin;

alter table public.books
  add column if not exists cover_source text,
  add column if not exists cover_storage_path text,
  add column if not exists cover_rights_confirmed_at timestamptz,
  add column if not exists cover_updated_at timestamptz;

update public.books
set cover_source = case
  when nullif(btrim(asin_es), '') is not null
    or nullif(btrim(asin_mx), '') is not null
    or nullif(btrim(asin_us), '') is not null then 'amazon'
  when nullif(btrim(cover), '') is not null then 'legacy'
  else 'generic'
end
where cover_source is null
   or cover_source not in (
     'amazon',
     'author_upload',
     'admin_upload',
     'legacy',
     'generic'
   );

alter table public.books
  alter column cover_source set default 'generic',
  alter column cover_source set not null;

alter table public.books
  drop constraint if exists books_cover_source_check;

alter table public.books
  add constraint books_cover_source_check
  check (
    cover_source in (
      'amazon',
      'author_upload',
      'admin_upload',
      'legacy',
      'generic'
    )
  );

alter table public.books
  drop constraint if exists books_stored_cover_has_url_check;

alter table public.books
  add constraint books_stored_cover_has_url_check
  check (
    cover_source not in ('author_upload', 'admin_upload', 'legacy')
    or nullif(btrim(cover), '') is not null
  );

alter table public.books
  drop constraint if exists books_author_cover_has_audit_check;

alter table public.books
  add constraint books_author_cover_has_audit_check
  check (
    cover_source <> 'author_upload'
    or (
      nullif(btrim(cover_storage_path), '') is not null
      and cover_rights_confirmed_at is not null
    )
  );

create table if not exists public.book_cover_consents (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  author_id uuid not null references public.authors(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  storage_path text not null check (nullif(btrim(storage_path), '') is not null),
  image_sha256 text not null check (image_sha256 ~ '^[0-9a-f]{64}$'),
  consent_version text not null check (nullif(btrim(consent_version), '') is not null),
  consent_text text not null check (nullif(btrim(consent_text), '') is not null),
  accepted_at timestamptz not null default now()
);

create index if not exists book_cover_consents_book_accepted_idx
  on public.book_cover_consents (book_id, accepted_at desc);

create index if not exists book_cover_consents_user_idx
  on public.book_cover_consents (user_id)
  where user_id is not null;

alter table public.book_cover_consents enable row level security;

revoke all on table public.book_cover_consents from anon, authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'book-covers',
  'book-covers',
  true,
  1048576,
  array['image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Las escrituras del bucket pasan exclusivamente por la ruta autenticada del
-- servidor. No se crean politicas INSERT/UPDATE/DELETE para clientes.

commit;
