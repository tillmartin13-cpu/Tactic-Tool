-- Carpool / ride-sharing per event (minimal data)

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

-- App rule: one vehicle per photographer per event (reassign = delete old row, insert new).

comment on table event_vehicles is 'TL-defined cars/shuttles for carpool planning';
comment on table vehicle_passengers is 'Photographer assigned to one vehicle';
