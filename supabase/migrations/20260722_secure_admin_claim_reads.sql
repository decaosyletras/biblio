-- The browser only needs a small claim summary for public verification and
-- the authenticated user's own claim list. Administrative evidence is read
-- through /api/admin/author-claims after the server validates the admin role.

alter table public.author_claims enable row level security;

drop policy if exists "author_claims_safe_read_boundary"
  on public.author_claims;
drop policy if exists "author_claims_safe_read_access"
  on public.author_claims;

-- RESTRICTIVE makes this condition a ceiling even if an older permissive
-- SELECT policy still exists in the project.
create policy "author_claims_safe_read_boundary"
  on public.author_claims
  as restrictive
  for select
  to anon, authenticated
  using (
    status = 'approved'
    or auth.uid() = user_id
  );

-- Keep the legitimate public and owner queries working even in installations
-- that do not already have a permissive SELECT policy.
create policy "author_claims_safe_read_access"
  on public.author_claims
  as permissive
  for select
  to anon, authenticated
  using (
    status = 'approved'
    or auth.uid() = user_id
  );

-- proof_url and proof_notes are intentionally omitted. Revoking the table-wide
-- grant prevents clients from requesting those evidence columns directly.
revoke select on table public.author_claims from anon, authenticated;
grant select (
  id,
  user_id,
  author_id,
  status,
  created_at
) on table public.author_claims to anon, authenticated;

-- Claim creation and all status changes already pass through protected server
-- routes that use the service role after validating the current user or admin.
revoke insert, update, delete
  on table public.author_claims
  from anon, authenticated;

alter table public.profiles enable row level security;

drop policy if exists "profiles_safe_read_boundary"
  on public.profiles;
drop policy if exists "profiles_safe_read_access"
  on public.profiles;

-- A normal client can read its own profile. Public profile lookup remains
-- available only for users linked to an approved author claim.
create policy "profiles_safe_read_boundary"
  on public.profiles
  as restrictive
  for select
  to anon, authenticated
  using (
    auth.uid() = id
    or exists (
      select 1
      from public.author_claims
      where author_claims.user_id = profiles.id
        and author_claims.status = 'approved'
    )
  );

create policy "profiles_safe_read_access"
  on public.profiles
  as permissive
  for select
  to anon, authenticated
  using (
    auth.uid() = id
    or exists (
      select 1
      from public.author_claims
      where author_claims.user_id = profiles.id
        and author_claims.status = 'approved'
    )
  );
