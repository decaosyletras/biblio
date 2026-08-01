update public.interview_questions
set
  question = '¿Tu carpeta de proyectos está organizada o llena de archivos “final_FINAL_elbueno_este_si”?',
  updated_at = now()
where question = '¿Tu carpeta de proyectos está organizada o llena de archivos “final_FINAL”?';
