-- =============================================================================
-- Tactic Tool — complete schema for Supabase SQL Editor (Eventplaner)
-- Run this ONCE on an empty project. Paste all → Run.
-- =============================================================================

-- 1) Core tables
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

-- 2) Team communications
alter table profiles add column if not exists phone_e164 text;

alter table events
  add column if not exists whatsapp_group_invite_url text,
  add column if not exists whatsapp_group_name text;

create table team_broadcasts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events on delete cascade,
  sent_by uuid not null references profiles,
  channel text not null default 'email' check (channel in ('email')),
  subject text not null,
  body_preview text,
  recipient_count integer not null default 0,
  whatsapp_invite_included boolean not null default false,
  resend_message_id text,
  created_at timestamptz default now()
);

create index team_broadcasts_event_id_idx on team_broadcasts (event_id);

-- 3) Carpools
create table event_vehicles (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events on delete cascade,
  label text not null,
  driver_name text,
  capacity integer,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

create index event_vehicles_event_id_idx on event_vehicles (event_id);

create table vehicle_passengers (
  vehicle_id uuid not null references event_vehicles on delete cascade,
  photographer_id uuid not null references profiles on delete cascade,
  primary key (vehicle_id, photographer_id)
);

-- 4) Historical archives
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

-- 5) Infofile catalog (2024 / 2025 uploads)
create table infofile_catalog (
  source_event_id text not null,
  archive_year integer not null,
  has_infofile boolean not null default true,
  has_gpx boolean not null default false,
  spot_group_count integer,
  total_images bigint,
  event_date_end date,
  scanned_at timestamptz default now(),
  primary key (source_event_id, archive_year)
);

create index infofile_catalog_archive_year_idx on infofile_catalog (archive_year);

-- Done. RLS policies will be added in a later migration.
