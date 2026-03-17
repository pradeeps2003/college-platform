-- 1. Create a function that initiates the profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'student'
  );
  return new;
end;
$$;

-- 2. Create the trigger to call this function on every new signup
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. FIX: Backfill profiles for existing users who don't have one
-- This fixes your current "Foreign Key Constraint" error for your existing user.
insert into public.profiles (id, email, full_name, role)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  'student'
from auth.users
where id not in (select id from public.profiles);
