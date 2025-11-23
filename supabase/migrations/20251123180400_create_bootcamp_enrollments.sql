create table if not exists public.bootcamp_enrollments (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  name text not null,
  mobile text not null,
  email text not null,
  gender text not null,
  course text not null,
  year_semester text not null,
  roll_number text not null,
  team_role text not null,
  has_experience boolean not null default false,
  experience_topic text,
  constraint bootcamp_enrollments_pkey primary key (id)
);

-- Enable Row Level Security
alter table public.bootcamp_enrollments enable row level security;

-- Create policy to allow insert from anon (public)
create policy "Enable insert for all users" on public.bootcamp_enrollments
  for insert
  with check (true);

-- Create policy to allow select for service role only (optional, but good practice)
create policy "Enable select for service role only" on public.bootcamp_enrollments
  for select
  using (auth.role() = 'service_role');
