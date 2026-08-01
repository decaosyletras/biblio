begin;

insert into public.interview_questions (question, sort_order)
values
  ('¿Qué nombre usas en el mundo literario y por qué lo elegiste?', 0),
  ('¿Cuál ha sido tu búsqueda más rara por “razones de investigación”?', 1),
  ('¿Qué tan fácil te resulta justificar las acciones de tus antagonistas?', 2),
  ('¿Tu carpeta de proyectos está organizada o llena de archivos “final_FINAL”?', 3),
  ('¿Cuál es el lugar más raro donde se te ocurrió una idea brillante?', 4),
  ('¿Hay una historia que te persigue porque nunca la terminaste?', 5),
  ('¿Has escrito una frase que también necesitabas escuchar?', 6),
  ('¿Qué haces cuando tu historia deja de hablarte y pierdes la inspiración?', 7),
  ('¿Has escondido mensajes, referencias o bromas secretas en tus libros?', 8),
  ('¿Qué consejo le darías a tu versión que empezaba a escribir?', 9)
on conflict (question) do update
set
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

-- Conserva las respuestas de la pregunta inicial al sustituirla por su versión breve.
insert into public.author_interview_answers (
  author_id,
  question_id,
  answer,
  is_visible,
  created_at,
  updated_at
)
select
  answers.author_id,
  replacement.id,
  answers.answer,
  answers.is_visible,
  answers.created_at,
  answers.updated_at
from public.author_interview_answers as answers
join public.interview_questions as original
  on original.id = answers.question_id
join public.interview_questions as replacement
  on replacement.question = '¿Cuál ha sido tu búsqueda más rara por “razones de investigación”?'
where original.question = '¿Cuál ha sido la búsqueda más rara que hiciste por “razones de investigación” al momento de escribir?'
on conflict (author_id, question_id) do nothing;

delete from public.interview_questions
where question = '¿Cuál ha sido la búsqueda más rara que hiciste por “razones de investigación” al momento de escribir?';

-- Ajusta respuestas existentes antes de endurecer el límite de la columna.
update public.author_interview_answers
set
  answer = left(answer, 700),
  updated_at = now()
where char_length(answer) > 700;

alter table public.author_interview_answers
  drop constraint if exists author_interview_answers_answer_check;

alter table public.author_interview_answers
  add constraint author_interview_answers_answer_check
  check (char_length(answer) between 1 and 700);

commit;
