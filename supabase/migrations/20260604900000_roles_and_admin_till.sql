-- Roles: admin | teamleader | office | photographer
-- UI labels: Admin | Team Leader | Office | Photographer
-- Admin user: till@sportograf.com

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  role_val text;
begin
  role_val := coalesce(new.raw_user_meta_data->>'role', 'teamleader');
  if lower(trim(new.email)) = 'till@sportograf.com' then
    role_val := 'admin';
  end if;
  if role_val not in ('admin', 'teamleader', 'office', 'photographer') then
    role_val := 'teamleader';
  end if;

  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    role_val
  );
  return new;
end;
$$;

-- If auth user already exists, promote to admin
update public.profiles p
set role = 'admin',
    name = coalesce(nullif(trim(p.name), ''), 'Till')
from auth.users u
where p.id = u.id
  and lower(trim(u.email)) = 'till@sportograf.com';
