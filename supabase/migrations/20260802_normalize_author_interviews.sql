begin;

create table public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null unique check (char_length(question) between 1 and 500),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.author_interview_answers (
  author_id uuid not null references public.authors(id) on delete cascade,
  question_id uuid not null references public.interview_questions(id) on delete cascade,
  answer text not null check (char_length(answer) between 1 and 5000),
  is_visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (author_id, question_id)
);

create index author_interview_answers_author_id_idx
  on public.author_interview_answers(author_id);

-- El catálogo existe aunque todavía no haya autores registrados.
insert into public.interview_questions (question, sort_order)
values (
  '¿Cuál ha sido la búsqueda más rara que hiciste por “razones de investigación” al momento de escribir?',
  0
)
on conflict (question) do nothing;

-- Convierte el catálogo repetido de la primera versión en preguntas globales.
insert into public.interview_questions (question, sort_order)
select question, min(sort_order)
from public.author_interview_questions
group by question
on conflict (question) do nothing;

-- Solo conserva filas que realmente tengan una respuesta.
insert into public.author_interview_answers (
  author_id,
  question_id,
  answer,
  is_visible,
  created_at,
  updated_at
)
select
  legacy.author_id,
  catalog.id,
  trim(legacy.answer),
  legacy.is_visible,
  legacy.created_at,
  legacy.updated_at
from public.author_interview_questions as legacy
join public.interview_questions as catalog
  on catalog.question = legacy.question
where nullif(trim(legacy.answer), '') is not null
on conflict (author_id, question_id) do update
set
  answer = excluded.answer,
  is_visible = excluded.is_visible,
  updated_at = excluded.updated_at;

drop trigger if exists add_default_author_interview_question on public.authors;
drop function if exists public.add_default_author_interview_question();
drop table public.author_interview_questions;

alter table public.interview_questions enable row level security;
alter table public.author_interview_answers enable row level security;

revoke all on table public.interview_questions from anon, authenticated;
revoke all on table public.author_interview_answers from anon, authenticated;
grant select on table public.interview_questions to anon, authenticated;
grant select on table public.author_interview_answers to anon, authenticated;

create policy "interview_questions_public_read"
  on public.interview_questions
  for select
  to anon, authenticated
  using (is_active = true);

create policy "author_interview_answers_public_read"
  on public.author_interview_answers
  for select
  to anon, authenticated
  using (is_visible = true and nullif(trim(answer), '') is not null);

commit;
