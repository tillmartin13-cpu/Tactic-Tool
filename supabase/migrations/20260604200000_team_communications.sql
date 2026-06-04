-- Team email broadcasts + WhatsApp invite link on events

alter table profiles
  add column if not exists phone_e164 text;

comment on column profiles.phone_e164 is 'Optional; not required for team comms (WhatsApp = group invite link on event only)';

alter table events
  add column if not exists whatsapp_group_invite_url text,
  add column if not exists whatsapp_group_name text;

comment on column events.whatsapp_group_invite_url is 'Paste from WhatsApp: https://chat.whatsapp.com/...';
comment on column events.whatsapp_group_name is 'Display name e.g. SG 23040 Team';

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

-- RLS (planned): TL/admin/office on event can insert team_broadcasts; read own event history
