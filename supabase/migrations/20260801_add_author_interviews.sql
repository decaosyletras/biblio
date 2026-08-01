create table public.author_interview_questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.authors(id) on delete cascade,
  question text not null check (char_length(question) between 1 and 500),
  answer text not null default '' check (char_length(answer) <= 5000),
  is_visible boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index author_interview_questions_author_id_sort_order_idx
  on public.author_interview_questions(author_id, sort_order);

alter table public.authors
  add column if not exists show_interview boolean not null default false;

alter table public.author_interview_questions enable row level security;

revoke all on table public.author_interview_questions from anon, authenticated;
grant select on table public.author_interview_questions to anon, authenticated;

create policy "author_interview_questions_public_read"
  on public.author_interview_questions
  for select
  to anon, authenticated
  using (is_visible = true and nullif(trim(answer), '') is not null);

create or replace function public.add_default_author_interview_question()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.author_interview_questions (author_id, question, sort_order)
  values (
    new.id,
    '¿Cuál ha sido la búsqueda más rara que hiciste por “razones de investigación” al momento de escribir?',
    0
  );
  return new;
end;
$$;

drop trigger if exists add_default_author_interview_question on public.authors;
create trigger add_default_author_interview_question
  after insert on public.authors
  for each row
  execute function public.add_default_author_interview_question();

insert into public.author_interview_questions (author_id, question, sort_order)
select
  authors.id,
  '¿Cuál ha sido la búsqueda más rara que hiciste por “razones de investigación” al momento de escribir?',
  0
from public.authors
where not exists (
  select 1
  from public.author_interview_questions
  where author_interview_questions.author_id = authors.id
);
