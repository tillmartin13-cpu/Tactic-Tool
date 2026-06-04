# Supabase Edge Functions

Planned functions (Resend email triggers):

- `send-team-email` — TL/Office sends team mail (+ optional WhatsApp invite link from event) — see [send-team-email/README.md](./send-team-email/README.md)
- `import-event-archive` — CSV/JSON + GPX → `event_archives`, `archive_tracks`, `archive_spots` (planned)
- `on-spot-assignment` — photographer notified when assigned to a spot
- `on-camera-check-status` — approved / rejected emails
- `on-camera-check-submitted` — notify teamleaders
- `on-spot-report` — notify teamleaders

Implement after Supabase project is linked and Resend API key is set as a secret.
