-- Dedicated spot acronym (was stored in comment as kuerzel:XX)
alter table spots add column if not exists kuerzel text;

update spots
set kuerzel = trim(replace(comment, 'kuerzel:', ''))
where kuerzel is null and comment like 'kuerzel:%';
