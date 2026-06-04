-- Dev RLS: allow anon/authenticated access until Auth + proper policies ship.
-- Run once in SQL Editor after RUN_IN_SQL_EDITOR.sql

alter table profiles enable row level security;
alter table events enable row level security;
alter table event_teamleaders enable row level security;
alter table event_office enable row level security;
alter table tracks enable row level security;
alter table spots enable row level security;
alter table spot_assignments enable row level security;
alter table spot_images enable row level security;
alter table tactic_pdfs enable row level security;
alter table camera_checks enable row level security;
alter table spot_reports enable row level security;
alter table team_broadcasts enable row level security;
alter table event_vehicles enable row level security;
alter table vehicle_passengers enable row level security;
alter table event_archives enable row level security;
alter table archive_tracks enable row level security;
alter table archive_spots enable row level security;
alter table infofile_catalog enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','events','event_teamleaders','event_office','event_photographers','tracks','spots',
    'spot_assignments','spot_images','tactic_pdfs','camera_checks','spot_reports',
    'team_broadcasts','event_vehicles','vehicle_passengers','event_archives',
    'archive_tracks','archive_spots','infofile_catalog'
  ]
  loop
    execute format('drop policy if exists dev_all_%s on %I', t, t);
    execute format(
      'create policy dev_all_%s on %I for all to anon, authenticated using (true) with check (true)',
      t, t
    );
  end loop;
end $$;
