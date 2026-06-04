-- SG SpotInfo Phase 2 — initial schema (see handover doc)

create table profiles (
  id uuid references auth.users primary key,
  name text not null,
  kuerzel text unique,
  role text not null check (role in ('admin', 'teamleader', 'office', 'photographer')),
  created_at timestamptz default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  name text,
  date date,
  type text,
  prev_event_id text,
  created_by uuid references profiles,
  created_at timestamptz default now()
);

create table event_teamleaders (
  event_id uuid references events on delete cascade,
  user_id uuid references profiles on delete cascade,
  primary key (event_id, user_id)
);

-- Internal Sportograf office staff assigned to help a TL on an event
create table event_office (
  event_id uuid references events on delete cascade,
  user_id uuid references profiles on delete cascade,
  primary key (event_id, user_id)
);

create table tracks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events on delete cascade,
  name text not null,
  color text not null,
  geojson jsonb not null,
  created_at timestamptz default now()
);

create table spots (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events on delete cascade,
  lat double precision not null,
  lng double precision not null,
  km_results jsonb,
  comment text,
  layer text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table spot_assignments (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid references spots on delete cascade,
  photographer_id uuid references profiles on delete cascade,
  created_at timestamptz default now()
);

create table spot_images (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid references spots on delete cascade,
  storage_path text not null,
  created_at timestamptz default now()
);

create table tactic_pdfs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events on delete cascade,
  storage_path text not null,
  name text,
  created_at timestamptz default now()
);

create table camera_checks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events on delete cascade,
  photographer_id uuid references profiles on delete cascade,
  storage_path text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_comment text,
  reviewed_by uuid references profiles,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create table spot_reports (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events on delete cascade,
  photographer_id uuid references profiles on delete cascade,
  lat double precision not null,
  lng double precision not null,
  km_results jsonb,
  reported_at timestamptz default now()
);

-- RLS (planned):
--   admin / teamleader: full CRUD on events they own or are in event_teamleaders
--   office: read events in event_office; read tracks/spots/assignments; no event delete
--   photographer: read assigned spots only (via spot_assignments)
