-- Photographers assigned to an event (pool for drag & drop onto spots)
create table if not exists event_photographers (
  event_id uuid not null references events on delete cascade,
  photographer_id uuid not null references profiles on delete cascade,
  created_at timestamptz default now(),
  primary key (event_id, photographer_id)
);

create index if not exists event_photographers_event_idx on event_photographers (event_id);

alter table event_photographers enable row level security;

drop policy if exists "dev_all_event_photographers" on event_photographers;
create policy "dev_all_event_photographers" on event_photographers
  for all using (true) with check (true);
