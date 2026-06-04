-- Historical / previous-year event data (read-only reference layer)

create table event_archives (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events on delete cascade,
  source_event_id text not null,
  season_year integer,
  label text,
  import_source text check (import_source in ('csv', 'json', 'api', 'manual', 'storage')),
  imported_at timestamptz default now(),
  imported_by uuid references profiles,
  notes text,
  unique (event_id, source_event_id, season_year)
);

create index event_archives_event_id_idx on event_archives (event_id);
create index event_archives_source_event_id_idx on event_archives (source_event_id);

comment on table event_archives is 'Linked previous-year snapshot for planning; does not replace live spots';

create table archive_tracks (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null references event_archives on delete cascade,
  name text not null,
  color text default '#64748b',
  geojson jsonb not null,
  storage_path text,
  created_at timestamptz default now()
);

create table archive_spots (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null references event_archives on delete cascade,
  lat double precision not null,
  lng double precision not null,
  km_results jsonb,
  photographer_kuerzel text,
  shoot_start timestamptz,
  shoot_end timestamptz,
  photo_count integer,
  comment text,
  source_payload jsonb,
  created_at timestamptz default now()
);

create index archive_spots_archive_id_idx on archive_spots (archive_id);

comment on column archive_spots.shoot_start is 'When photography started at this spot (archive)';
comment on column archive_spots.shoot_end is 'When photography ended at this spot (archive)';
comment on column archive_spots.photo_count is 'Photos taken at/near this spot if available from source system';
