-- Named stations / obstacles per event (obstacle, highrocks)
create table if not exists event_layers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events on delete cascade,
  name text not null,
  lat double precision,
  lng double precision,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create index if not exists event_layers_event_idx on event_layers (event_id);

alter table event_layers enable row level security;
drop policy if exists "dev_all_event_layers" on event_layers;
create policy "dev_all_event_layers" on event_layers for all using (true) with check (true);

-- Reusable High Rocks station templates
create table if not exists layer_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz default now()
);

alter table layer_templates enable row level security;
drop policy if exists "dev_all_layer_templates" on layer_templates;
create policy "dev_all_layer_templates" on layer_templates for all using (true) with check (true);
