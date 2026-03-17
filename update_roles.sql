-- 1. Update the function to respect the role from metadata
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
    coalesce(new.raw_user_meta_data->>'role', 'student') -- Uses role from signup
  );
  return new;
end;
$$;

-- 2. Ensure your own user is a Super Admin
-- REPLACE with your actual email
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE email = 'your-email@example.com'; 
