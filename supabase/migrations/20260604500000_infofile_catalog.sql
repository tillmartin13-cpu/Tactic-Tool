-- Global index of uploaded Sportograf infofiles (before / besides link to a planning event)

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

comment on table infofile_catalog is 'Scanned from infofiles/{year}/{id}_infofile.txt — TL sees which archive years exist';
comment on column infofile_catalog.archive_year is 'Folder year (2024, 2025), UI label „Archiv 2025“';

create index infofile_catalog_archive_year_idx on infofile_catalog (archive_year);

-- Multiple archive years per planning event (replaces single prev_event_id-only mental model)
comment on column events.prev_event_id is 'Primary / default Vorjahr Sportograf-ID; additional years via event_archives';
