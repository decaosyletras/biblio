begin;

-- El consentimiento solo se escribe desde el callback de servidor despues de
-- verificar la identidad. RLS queda habilitado como una segunda barrera.
alter table public.user_consents enable row level security;

-- Aunque exista una politica permisiva previa, estos roles ya no tienen el
-- privilegio de mutar la tabla directamente mediante la API publica.
revoke insert, update, delete
on table public.user_consents
from anon, authenticated;

-- No se eliminan duplicados existentes. Si los hubiera, la migracion falla para
-- que se revisen de forma explicita sin destruir evidencia de consentimiento.
create unique index if not exists user_consents_user_policy_versions_uidx
on public.user_consents (
  user_id,
  privacy_version,
  terms_version
);

comment on index public.user_consents_user_policy_versions_uidx is
  'Impide consentimientos duplicados para el mismo usuario y versiones de politicas';

commit;
