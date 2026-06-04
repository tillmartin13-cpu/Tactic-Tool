# Vercel Deployment — Tactic Tool

Monorepo with **two separate Vercel projects** (Teamleader + Photographer).

## 1. Teamleader app

| Setting | Value |
|---------|--------|
| Root Directory | `apps/teamleader` |
| Framework Preset | Vite |
| Include files outside root | **Enabled** (required for `packages/`) |

Environment variables (Project → Settings → Environment Variables):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The `vercel.json` in `apps/teamleader` runs install/build from the repo root.

**Edge API:** `GET /api/resolve-location?url=...` — short URL resolver (ported from v1 Netlify function).

## 2. Photographer app

Same as above, with Root Directory `apps/photographer`.

Suggested hostnames (example):

- `tactic-tl.sportograf.com` → teamleader project (example)
- `tactic.sportograf.com` → photographer project (example)

## Local development

```bash
npm install
npm run dev:tl      # http://localhost:5173
npm run dev:photo   # second terminal, port 5174 if needed
```

Copy `.env.example` to `.env` in the repo root (Vite loads env from app directory — copy or symlink into each app, or use root `.env` with `envDir` in vite config later).
