create table public.learning_reports (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  student_number text null,
  student_email public.citext null,
  section_number integer null,
  rating smallint null,
  comment text null,
  mode text null,
  teacher_name text null,
  chat_history jsonb null,
  contribution_analysis jsonb null,
  metadata jsonb null,
  constraint learning_reports_pkey primary key (id),
  constraint learning_reports_rating_check check (
    (
      (rating >= 0)
      and (rating <= 5)
    )
  )
) TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_number_suffix integer NOT NULL,
  name_prefix text,
  section_number integer,
  random_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  password text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);