-- Profile creation is handled by public.handle_new_user(), which runs as a
-- SECURITY DEFINER function owned by postgres. Browser clients only need to
-- edit the non-privileged username and bio fields on their own profile.

begin;

alter table public.profiles enable row level security;

-- Prevent browser roles from creating or deleting profile rows directly.
-- The auth.users trigger remains responsible for profile creation.
revoke insert, delete
  on table public.profiles
  from anon, authenticated;

-- Remove the table-wide UPDATE privilege, which also allowed changes to
-- privileged or structural fields such as admin, id and created_at.
revoke update
  on table public.profiles
  from anon, authenticated;

-- Restore only the two profile fields edited by the current application.
grant update (username, bio)
  on table public.profiles
  to authenticated;

-- Direct client-side profile creation is no longer supported.
drop policy if exists "Users can insert own profile"
  on public.profiles;

-- Replace the broad public update policy with an authenticated-only policy.
drop policy if exists "Users can update own profile"
  on public.profiles;

drop policy if exists "profiles_update_own_safe_fields"
  on public.profiles;

create policy "profiles_update_own_safe_fields"
  on public.profiles
  as permissive
  for update
  to authenticated
  using (
    (select auth.uid()) = id
  )
  with check (
    (select auth.uid()) = id
  );

commit;
