# Fotograf-Zuweisung

## Ablauf

1. **Fotografen zum Event** — linke Spalte, Button **+**, Fotograf aus Systemliste wählen (`profiles.role = photographer`).
2. **Auf Spot ziehen** — Karte oder Spot-Liste; Pin zeigt Fotografen-Kürzel (mehrere mit ` · `).
3. **Spot-Modal** — Dropdown „+ Fotograf zuweisen“; Chips mit × zum Entfernen.

## Datenbank

- `event_photographers` — Pool pro Event
- `spot_assignments` — Zuweisung Spot ↔ Fotograf (mehrere pro Spot möglich)

Migration: `supabase/migrations/20260605000000_event_photographers.sql`

## Berechtigung

Nur **Admin** und **Team Leader** (`canEditSpots`). Office: nur lesen.
