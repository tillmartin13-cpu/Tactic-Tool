-- Use only if 20260604000000_initial_schema was already applied without office.

alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('admin', 'teamleader', 'office', 'photographer'));

create table if not exists event_office (
  event_id uuid references events on delete cascade,
  user_id uuid references profiles on delete cascade,
  primary key (event_id, user_id)
);
