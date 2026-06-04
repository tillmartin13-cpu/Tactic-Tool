# Fahrgemeinschaften (Logistik)

Viele Events scheitern an der **Anreise-Logistik**. TLs sollen im Tool sehen, wer mit wem fährt — ohne Excel.

## UX

Event-Detail → **„Fahrgemeinschaften“**:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Auto 1 (Till)  │  │  Auto 2         │  │  + Auto hinzu   │
│  ┌───┐ ┌───┐    │  │  ┌───┐          │  │                 │
│  │MK │ │AB │    │  │  │XY │          │  │                 │
│  └───┘ └───┘    │  │  └───┘          │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘

Nicht zugeordnet:  [ FS ]  [ JK ]     ← Kürzel-Pills, drag & drop
```

- TL legt **Autos** an (freier Name, z. B. „Auto Till“, „Mietbus“, „Zug“).
- Optional: Fahrer-Name, Kapazität, kurze Notiz („Abfahrt 6:00 Parkplatz P2“).
- **Fotografen-Kürzel** aus dem Event-Team (alle mit Spot-Zuweisung) erscheinen unter „Nicht zugeordnet“.
- **Drag & Drop** Kürzel auf ein Auto; zurückziehen = wieder unassigned.
- Ein Fotograf pro Auto (ein Slot) — kein Doppel auf zwei Autos.

Office: gleiche Ansicht, Bearbeitung wie bei Spots klären (aktuell: TL + Admin bearbeiten, Office lesen — in [roles.md](../roles.md) anpassbar).

## Daten (minimal)

| Tabelle | Zweck |
|---------|--------|
| `event_vehicles` | Autos pro Event |
| `vehicle_passengers` | `photographer_id` → `vehicle_id` |

Keine Adressen, keine Routenplanung in v1 — nur Zuordnung Kürzel ↔ Auto.

## Später (optional)

- Export in Team-E-Mail („Fahrgemeinschaften“-Abschnitt)
- Hinweis in WhatsApp-Gruppen-Mail („MK fährt mit Auto 1“)

## Implementierung

- UI: `@dnd-kit/core` (geplant)
- API: Supabase Realtime optional für Office + TL gleichzeitig
- Berechtigung: `@sg/auth` → `canEditCarpools()`
