begin;

-- Los enlaces públicos de autor usan el mismo límite que los del perfil lector.
-- NOT VALID evita bloquear la migración si existe algún dato histórico largo;
-- la restricción sí se aplica a todas las inserciones y actualizaciones nuevas.
alter table public.authors
  add constraint authors_public_links_length
  check (
    char_length(website) <= 500
    and char_length(instagram) <= 500
    and char_length(threads) <= 500
    and char_length(facebook) <= 500
    and char_length(tiktok) <= 500
    and char_length(youtube) <= 500
    and char_length(wattpad) <= 500
  ) not valid;

commit;
