begin;

-- Actualiza únicamente el texto inicial. Si un administrador ya guardó el
-- tutorial, updated_by tendrá valor y se conservan todos sus cambios.
update public.tutorials
set
  steps = '[
    {"id":"a1000000-0000-4000-8000-000000000001","title":"Crea tu cuenta o inicia sesión","text":"Si es tu primera vez, crea una cuenta. Si ya tienes una, inicia sesión.","imagePath":null},
    {"id":"a1000000-0000-4000-8000-000000000002","title":"Entra a Mi espacio","text":"Desde aquí podrás administrar tu perfil, biblioteca y página de autor.","imagePath":null},
    {"id":"a1000000-0000-4000-8000-000000000003","title":"Busca tu autor","text":"Si uno de tus libros ya aparece en el catálogo, abre su ficha y selecciona Reclamar autor.","imagePath":null},
    {"id":"a1000000-0000-4000-8000-000000000004","title":"O agrega tu primer libro","text":"Si todavía no apareces, entra a Mi espacio y selecciona Agregar uno de mis libros. Tu nuevo autor quedará asociado a tu cuenta.","imagePath":null},
    {"id":"a1000000-0000-4000-8000-000000000005","title":"Agrega tus demás libros","text":"Cuando tu autor esté aprobado o pendiente, su nombre aparecerá fijo para que cada libro quede asociado correctamente.","imagePath":null},
    {"id":"a1000000-0000-4000-8000-000000000006","title":"Edita tu página","text":"Cuando tengas acceso aprobado, entra a Mi espacio y pulsa Editar mi página.","imagePath":null},
    {"id":"a1000000-0000-4000-8000-000000000007","title":"Personaliza y revisa tu página","text":"Completa la información que quieras, guarda los cambios y revisa cómo la verán tus lectores.","imagePath":null}
  ]'::jsonb,
  updated_at = now()
where slug = 'autores'
  and updated_by is null;

commit;
