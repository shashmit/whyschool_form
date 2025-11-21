create table registrations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  phone text not null,
  team text not null
);

alter table registrations enable row level security;

create policy "Enable insert for all users" on registrations
  for insert
  with check (true);
