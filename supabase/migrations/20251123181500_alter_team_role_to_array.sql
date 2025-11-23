-- Alter team_role column to be an array of text
-- This will convert existing single values into single-element arrays
alter table public.bootcamp_enrollments
  alter column team_role type text[] using array[team_role];

-- Update the check constraint or validation if necessary (Supabase doesn't strictly enforce array length in SQL by default easily without a function, so we rely on app logic, but type change is key)
