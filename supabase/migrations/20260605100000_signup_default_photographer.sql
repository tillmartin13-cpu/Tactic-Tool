-- Self-signup: default global role photographer; kuerzel from signup form
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  role_val text;
  kuerzel_val text;
begin
  role_val := coalesce(new.raw_user_meta_data->>'role', 'photographer');
  if lower(trim(new.email)) = 'till@sportograf.com' then
    role_val := 'admin';
  end if;
  if role_val not in ('admin', 'teamleader', 'office', 'photographer') then
    role_val := 'photographer';
  end if;

  kuerzel_val := nullif(upper(trim(coalesce(new.raw_user_meta_data->>'kuerzel', ''))), '');

  insert into public.profiles (id, name, kuerzel, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    kuerzel_val,
    role_val
  );
  return new;
end;
$$;
