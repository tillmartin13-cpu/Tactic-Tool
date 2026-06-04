# Handover — Implementierungsstand (Phase 2)

Stand nach Batch „alles aus Handover“. Zum Testen auf Vercel deployen + Supabase-Migrationen ausführen.

## Zwei Apps

| App | Zielgerät | Status |
|-----|-----------|--------|
| **Teamleader** | Desktop-first, auch Handy | https://tactic-tool-teamleader.vercel.app — Planung, SpotInfo, TL-Tools |
| **Photographer** | Mobile-first | Eigenes Vercel-Projekt (`apps/photographer`) — Meine Events, Spot, Kamera-Check, Report |

Design-Details: `docs/design-targets.md`

## Teamleader — umgesetzt

- GPX, KMZ/KML, Karte (Pfeile, Höhe, Ambiguity, Paste/Short-URL)
- Spots + Fotograf-Zuweisung (Drag & Drop, Modal)
- Auth: Login, **Signup**, Rollen **pro Event** (`event_teamleaders`)
- Event-Einstellungen: TL zuweisen, WhatsApp-Link, Taktik-PDF Upload
- Kamera-Check Review (Approve/Reject)
- SpotInfo: PDF-Export (`@sg/export`), Fotografen-Reports Liste
- Stationen/Layers (obstacle/highrocks)
- Fahrgemeinschaften (Autos anlegen)
- Team-Broadcast (DB-Eintrag; E-Mail Edge Functions vorbereitet)
- Archiv-Panel + Vorjahresgalerie-Link
- Spot-Kommentar + Layer-Feld

## Photographer — umgesetzt

- Login / Signup
- Meine Events (aus Zuweisungen)
- Spot: Karte read-only, Navigate, SV, Mapillary, TL-Kommentar
- Taktik-PDF Link
- Kamera-Check Upload + Status
- Spot-Report (Link/Koordinaten)

## Supabase — Migrationen nacheinander

1. `20260605000000_event_photographers.sql`
2. `20260605100000_signup_default_photographer.sql`
3. `20260605200000_event_layers.sql`
4. `20260604600000_dev_rls.sql` (aktualisiert — bei Bedarf neue Policies für neue Tabellen)

## Storage Buckets (Dashboard anlegen, public oder signed)

- `camera_checks`
- `tactic_pdfs`
- `spot_images`

## Noch offen / bewusst reduziert

- Resend E-Mails (Edge Functions nur README/Stubs)
- Produktions-RLS (weiterhin Dev-Policies)
- Archiv-Spots als read-only Overlay auf Karte (Katalog da, UI-Button noch minimal)
- Spot-Referenzbilder Upload UI
- High Rocks **Layer-Templates** aus DB (Tabelle da, UI minimal)
- Photographer-Vercel-Projekt + `VITE_PHOTO_APP_URL` / `VITE_TL_APP_URL` cross-links
- Office-Zuweisung UI (`event_office`)
- Vollständige Fotografen-Verwaltung (globale Liste)

## Env (Vercel)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PHOTO_APP_URL=https://…-photographer….vercel.app
VITE_TL_APP_URL=https://tactic-tool-teamleader.vercel.app
```
