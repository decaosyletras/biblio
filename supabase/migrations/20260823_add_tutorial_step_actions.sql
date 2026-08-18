begin;

-- Los pasos continúan dentro de tutorials.steps. Esta migración añade sus
-- acciones y deja la versión publicada actual como base reproducible. Al
-- reutilizar el objeto existente por id se conserva cualquier imagePath.
update public.tutorials as tutorial
set
  steps = jsonb_build_array(
    coalesce(
      (
        select step
        from jsonb_array_elements(tutorial.steps) as step
        where step ->> 'id' = 'a1000000-0000-4000-8000-000000000001'
        limit 1
      ),
      '{"id":"a1000000-0000-4000-8000-000000000001","imagePath":null}'::jsonb
    ) || jsonb_build_object(
      'title', 'Crea tu cuenta o inicia sesión',
      'text', 'Si es tu primera vez, crea una cuenta. Si ya tienes una, inicia sesión.',
      'actions', '[{"label":"Iniciar sesión","href":"/login"},{"label":"Crear mi cuenta","href":"/register"}]'::jsonb
    ),
    coalesce(
      (
        select step
        from jsonb_array_elements(tutorial.steps) as step
        where step ->> 'id' = 'a1000000-0000-4000-8000-000000000002'
        limit 1
      ),
      '{"id":"a1000000-0000-4000-8000-000000000002","imagePath":null}'::jsonb
    ) || jsonb_build_object(
      'title', 'Entra a Mi espacio',
      'text', 'Desde aquí podrás administrar tu perfil, biblioteca y página de autor.',
      'actions', '[{"label":"Ir a Mi espacio","href":"/me"}]'::jsonb
    ),
    coalesce(
      (
        select step
        from jsonb_array_elements(tutorial.steps) as step
        where step ->> 'id' = 'a1000000-0000-4000-8000-000000000003'
        limit 1
      ),
      '{"id":"a1000000-0000-4000-8000-000000000003","imagePath":null}'::jsonb
    ) || jsonb_build_object(
      'title', 'Busca tu autor',
      'text', 'Si uno de tus libros ya aparece en el catálogo, abre su ficha y selecciona Reclamar autor.',
      'actions', '[{"label":"Buscar uno de mis libros","href":"/libros"},{"label":"Mi libro no aparece: agregarlo","href":"/contact"}]'::jsonb
    ),
    coalesce(
      (
        select step
        from jsonb_array_elements(tutorial.steps) as step
        where step ->> 'id' = 'a1000000-0000-4000-8000-000000000006'
        limit 1
      ),
      '{"id":"a1000000-0000-4000-8000-000000000006","imagePath":null}'::jsonb
    ) || jsonb_build_object(
      'title', 'Edita tu página',
      'text', 'Cuando tengas acceso aprobado, entra a Mi espacio y pulsa Editar mi página.',
      'actions', '[{"label":"Abrir mi espacio de autor","href":"/me#mis-solicitudes"}]'::jsonb
    ),
    coalesce(
      (
        select step
        from jsonb_array_elements(tutorial.steps) as step
        where step ->> 'id' = 'a1000000-0000-4000-8000-000000000007'
        limit 1
      ),
      '{"id":"a1000000-0000-4000-8000-000000000007","imagePath":null}'::jsonb
    ) || jsonb_build_object(
      'title', 'Personaliza y revisa tu página',
      'text', 'Completa la información que quieras, guarda los cambios y revisa cómo la verán tus lectores.',
      'actions', '[{"label":"Continuar con mi página","href":"/me#mis-solicitudes"}]'::jsonb
    ),
    coalesce(
      (
        select step
        from jsonb_array_elements(tutorial.steps) as step
        where step ->> 'title' = 'Explora la web'
           or step ->> 'id' = 'a1000000-0000-4000-8000-000000000008'
        limit 1
      ),
      '{"id":"a1000000-0000-4000-8000-000000000008","imagePath":null}'::jsonb
    ) || jsonb_build_object(
      'title', 'Explora la web',
      'text', 'Explora y conoce todas las opciones que tenemos para tu página de autor. ✨',
      'actions', '[{"label":"Descubrir autores","href":"/authors"},{"label":"Explorar libros","href":"/libros"}]'::jsonb
    )
  ),
  updated_at = now()
where tutorial.slug = 'autores';

update public.tutorials as tutorial
set
  steps = jsonb_build_array(
    coalesce(
      (
        select step
        from jsonb_array_elements(tutorial.steps) as step
        where step ->> 'id' = 'b1000000-0000-4000-8000-000000000001'
        limit 1
      ),
      '{"id":"b1000000-0000-4000-8000-000000000001","imagePath":null}'::jsonb
    ) || jsonb_build_object(
      'title', 'Crea tu cuenta o inicia sesión',
      'text', 'Si es tu primera vez, crea una cuenta. Si ya tienes una, inicia sesión.',
      'actions', '[{"label":"Iniciar sesión","href":"/login"},{"label":"Crear mi cuenta","href":"/register"}]'::jsonb
    ),
    coalesce(
      (
        select step
        from jsonb_array_elements(tutorial.steps) as step
        where step ->> 'id' = 'b1000000-0000-4000-8000-000000000002'
        limit 1
      ),
      '{"id":"b1000000-0000-4000-8000-000000000002","imagePath":null}'::jsonb
    ) || jsonb_build_object(
      'title', 'Entra a Mi espacio',
      'text', 'Desde aquí podrás administrar tu perfil, biblioteca y página de autor.',
      'actions', '[{"label":"Ir a Mi espacio","href":"/me"}]'::jsonb
    ),
    coalesce(
      (
        select step
        from jsonb_array_elements(tutorial.steps) as step
        where step ->> 'id' = 'b1000000-0000-4000-8000-000000000003'
        limit 1
      ),
      '{"id":"b1000000-0000-4000-8000-000000000003","imagePath":null}'::jsonb
    ) || jsonb_build_object(
      'title', 'Crea tu perfil lector',
      'text', 'Desde Mi espacio, pulsa Crear perfil lector.',
      'actions', '[{"label":"Crear mi perfil lector","href":"/me/profile"}]'::jsonb
    ),
    coalesce(
      (
        select step
        from jsonb_array_elements(tutorial.steps) as step
        where step ->> 'id' = 'b1000000-0000-4000-8000-000000000004'
        limit 1
      ),
      '{"id":"b1000000-0000-4000-8000-000000000004","imagePath":null}'::jsonb
    ) || jsonb_build_object(
      'title', 'Personaliza tu perfil',
      'text', 'Añade tus datos y elige qué información quieres mostrar públicamente.',
      'actions', '[{"label":"Configurar mi perfil","href":"/me/profile"}]'::jsonb
    ),
    coalesce(
      (
        select step
        from jsonb_array_elements(tutorial.steps) as step
        where step ->> 'id' = 'b1000000-0000-4000-8000-000000000005'
        limit 1
      ),
      '{"id":"b1000000-0000-4000-8000-000000000005","imagePath":null}'::jsonb
    ) || jsonb_build_object(
      'title', 'Abre Mi biblioteca',
      'text', 'Entra a Mi biblioteca para organizar tus lecturas.',
      'actions', '[{"label":"Abrir Mi biblioteca","href":"/me/library"}]'::jsonb
    ),
    coalesce(
      (
        select step
        from jsonb_array_elements(tutorial.steps) as step
        where step ->> 'id' = 'b1000000-0000-4000-8000-000000000006'
        limit 1
      ),
      '{"id":"b1000000-0000-4000-8000-000000000006","imagePath":null}'::jsonb
    ) || jsonb_build_object(
      'title', 'Agrega y organiza tus libros',
      'text', 'Desde Biblioteca general puedes agregar libros o marcarlos como leídos. Después, entra a Mi biblioteca para organizar tus lecturas y elegir tus favoritos.',
      'actions', '[{"label":"Explorar biblioteca general","href":"/book-directory"},{"label":"Organizar Mi biblioteca","href":"/me/library"}]'::jsonb
    ),
    coalesce(
      (
        select step
        from jsonb_array_elements(tutorial.steps) as step
        where step ->> 'id' = 'b1000000-0000-4000-8000-000000000007'
        limit 1
      ),
      '{"id":"b1000000-0000-4000-8000-000000000007","imagePath":null}'::jsonb
    ) || jsonb_build_object(
      'title', 'Explora la web',
      'text', 'Explora y conoce todas las opciones que tenemos para tu perfil de lector. ✨',
      'actions', '[{"label":"Descubrir lectores","href":"/readers"},{"label":"Explorar libros","href":"/libros"}]'::jsonb
    )
  ),
  updated_at = now()
where tutorial.slug = 'lectores';

commit;
