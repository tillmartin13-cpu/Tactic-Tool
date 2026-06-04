# Tactic Tool (Phase 2)

Monorepo for the Sportograf **Tactic Tool** — planning app (Teamleader + internal **Office**) and Photographer frontend.

Supabase project name: **Eventplaner**.

**Roles:** `admin`, `teamleader`, `office`, `photographer` — see [docs/roles.md](docs/roles.md).

**v1 reference (do not edit for Phase 2):** `C:\Users\Till\Desktop\Apps\TL App\spotinfo-netlify\`

## Structure

```
apps/
  teamleader/     # TL + Office app → separate Vercel project
  photographer/   # Photographer app → separate Vercel project
packages/
  auth/           # Roles & permission helpers
  gpx/            # GPX/KML/KM logic (port from v1)
  map/            # Shared Leaflet components
  ui/             # Shared UI + Tailwind preset
  url-resolver/   # Short URL → coordinates (Edge API)
supabase/
  migrations/     # PostgreSQL schema
  functions/      # Email triggers (planned)
docs/
```

## Quick start

```bash
npm install
cp .env.example .env   # add Supabase URL + anon key when ready
npm run dev:tl
```

Build all apps:

```bash
npm run build
```

## Stack

- React 18 + Vite + Tailwind
- Supabase (Auth, DB, Storage, Edge Functions)
- Leaflet / react-leaflet
- Hosting: **Vercel** (see [docs/vercel.md](docs/vercel.md))

## Features (planned)

- [Vorjahresdaten](docs/features/historical-data.md) — GPX, Spot-Positionen, Fotografie-Zeiten, Fotoanzahl als Referenz-Layer
- [Fahrgemeinschaften](docs/features/carpool.md) — Autos anlegen, Kürzel per Drag & Drop zuordnen
- [Team-Kommunikation](docs/features/team-communications.md) — E-Mail ans Team; **eine** WhatsApp-Gruppe = nur Einladungslink speichern (kein Telefon-Zwang)

## Next steps

1. Port `@sg/gpx` from v1 `index.html`
2. Apply Supabase migration + RLS policies
3. Auth + role-based routing per app
4. Edge Function `send-team-email` + Event-UI für WhatsApp-Link
