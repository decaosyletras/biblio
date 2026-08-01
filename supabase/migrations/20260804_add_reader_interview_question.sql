insert into public.interview_questions (question, sort_order)
values (
  '¿Qué esperas que un lector encuentre o se lleve al entrar en tus historias?',
  10
)
on conflict (question) do update
set
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();
