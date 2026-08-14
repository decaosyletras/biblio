begin;

create table if not exists public.tutorials (
  slug text primary key,
  title text not null check (char_length(btrim(title)) between 1 and 100),
  description text not null default '' check (char_length(description) <= 300),
  sort_order smallint not null default 0,
  steps jsonb not null default '[]'::jsonb check (jsonb_typeof(steps) = 'array'),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint tutorials_known_slug_check check (slug in ('autores', 'lectores'))
);

alter table public.tutorials enable row level security;

drop policy if exists "Tutorials are publicly readable" on public.tutorials;
create policy "Tutorials are publicly readable"
  on public.tutorials
  for select
  to anon, authenticated
  using (true);

revoke insert, update, delete on table public.tutorials from anon, authenticated;
grant select on table public.tutorials to anon, authenticated;

insert into public.tutorials (slug, title, description, sort_order, steps)
values
  (
    'autores',
    'Crea tu página de autor',
    'Reclama tu autoría y prepara un espacio para conectar con tus lectores.',
    1,
    '[
      {"id":"a1000000-0000-4000-8000-000000000001","title":"Crea tu cuenta o inicia sesión","text":"Si es tu primera vez, crea una cuenta. Si ya tienes una, inicia sesión.","imagePath":null},
      {"id":"a1000000-0000-4000-8000-000000000002","title":"Entra a Mi espacio","text":"Desde aquí podrás administrar tu perfil, biblioteca y página de autor.","imagePath":null},
      {"id":"a1000000-0000-4000-8000-000000000003","title":"Encuentra uno de tus libros","text":"Busca una obra tuya en el catálogo y abre su ficha.","imagePath":null},
      {"id":"a1000000-0000-4000-8000-000000000004","title":"Reclama tu autor","text":"Pulsa Reclamar autor y envía los datos de verificación. Solo necesitas reclamar uno de tus libros.","imagePath":null},
      {"id":"a1000000-0000-4000-8000-000000000005","title":"Espera la aprobación","text":"Revisaremos tu solicitud. Puedes consultar su estado desde Mi espacio.","imagePath":null},
      {"id":"a1000000-0000-4000-8000-000000000006","title":"Edita tu página","text":"Cuando sea aprobada, entra a Mi espacio y pulsa Editar mi página.","imagePath":null},
      {"id":"a1000000-0000-4000-8000-000000000007","title":"Personaliza y revisa tu página","text":"Completa la información que quieras, guarda los cambios y revisa cómo la verán tus lectores.","imagePath":null}
    ]'::jsonb
  ),
  (
    'lectores',
    'Crea tu perfil de lector',
    'Organiza tus lecturas y decide qué quieres compartir con otras personas.',
    2,
    '[
      {"id":"b1000000-0000-4000-8000-000000000001","title":"Crea tu cuenta o inicia sesión","text":"Si es tu primera vez, crea una cuenta. Si ya tienes una, inicia sesión.","imagePath":null},
      {"id":"b1000000-0000-4000-8000-000000000002","title":"Entra a Mi espacio","text":"Desde aquí podrás administrar tu perfil, biblioteca y página de autor.","imagePath":null},
      {"id":"b1000000-0000-4000-8000-000000000003","title":"Crea tu perfil lector","text":"Desde Mi espacio, pulsa Crear perfil lector.","imagePath":null},
      {"id":"b1000000-0000-4000-8000-000000000004","title":"Personaliza tu perfil","text":"Añade tus datos y elige qué información quieres mostrar públicamente.","imagePath":null},
      {"id":"b1000000-0000-4000-8000-000000000005","title":"Abre Mi biblioteca","text":"Entra a Mi biblioteca para organizar tus lecturas.","imagePath":null},
      {"id":"b1000000-0000-4000-8000-000000000006","title":"Agrega y organiza tus libros","text":"Desde Biblioteca general puedes agregar libros, marcarlos como leídos y elegir tus favoritos.","imagePath":null},
      {"id":"b1000000-0000-4000-8000-000000000007","title":"Revisa tu perfil","text":"Vuelve a Mi espacio para comprobar qué información se muestra en tu perfil público.","imagePath":null}
    ]'::jsonb
  )
on conflict (slug) do nothing;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'tutorial-images',
  'tutorial-images',
  true,
  1048576,
  array['image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Tutorial images are publicly readable" on storage.objects;
create policy "Tutorial images are publicly readable"
  on storage.objects
  for select
  to public
  using (bucket_id = 'tutorial-images');

-- Las cargas y eliminaciones pasan por rutas del servidor que validan el rol
-- administrativo. No se habilitan escrituras directas desde el navegador.

commit;
