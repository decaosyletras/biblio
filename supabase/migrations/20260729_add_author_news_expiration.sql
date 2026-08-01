-- NULL significa que la novedad permanece visible indefinidamente.
-- Cuando hay una fecha, la novedad se muestra hasta ese día inclusive.
alter table public.authors
  add column if not exists news_expires_on date;

comment on column public.authors.news_expires_on is
  'Último día en que la novedad del autor debe mostrarse; NULL indica que no caduca.';
