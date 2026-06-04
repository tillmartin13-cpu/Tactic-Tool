# Vorjahresdaten verknüpfen

Sportograf hat für viele Events **Archivdaten**: GPX/Strecke, Spot-Positionen, **Fotografie-Zeiten** (von–bis), teils **Fotoanzahl** pro Spot/Fotograf. Diese sollen mit dem **aktuellen Event** verknüpft werden — ohne die laufende Planung zu überschreiben.

## Prinzip

| Layer | Zweck |
|-------|--------|
| **Live** (`tracks`, `spots`, …) | Planung dieses Jahres — editierbar |
| **Archiv** (`event_archives`, `archive_*`) | Vorjahr(e) — **read-only Referenz**, Karte als Geister-Layer |

## Zwei Ebenen

### 1. Upload-Katalog (global)

Alle Infofiles liegen unter `infofiles/2025/`, `infofiles/2024/`, …

```bash
npm run scan:infofiles   → infofiles/catalog.json
```

→ Tabelle `infofile_catalog` (gleiche Daten in Supabase nach Sync)

Der TL sieht: **„Archiv verfügbar: 2025, 2024“** und wie viele Events pro Jahr.

### 2. Verknüpfung mit **aktuellem** Planungs-Event

| Feld / Tabelle | Rolle |
|----------------|--------|
| `events.event_id` | Dieses Jahr, z. B. `23040` |
| `events.prev_event_id` | **Haupt-Vorjahr** (Galerie-Link), z. B. `8832` |
| `event_archives` | **Mehrere Jahre** möglich: 2024 → ID `7711`, 2025 → ID `9012`, … |

Dateinamen bleiben `{sourceEventId}_infofile.txt` — die **Sportograf-ID im Archiv**, nicht `23040`.

**Smart verknüpfen:** TL wählt beim Event „Archiv 2024“ + „Archiv 2025“ aus dem Katalog (oder Vorschlag über `prev_event_id` + Serie/Name).

## Datenfelder (Archiv)

Pro Spot im Archiv:

- Position (`lat`, `lng`, optional `km_results` wie heute)
- `photographer_kuerzel`
- `shoot_start`, `shoot_end` (Event-Tag + Uhrzeit oder volle Timestamps)
- `photo_count` (optional, wenn Quelle liefert)
- optional `comment` / Rohdaten in `source_payload jsonb`

Pro Archiv-Event:

- GPX/Strecke → `archive_tracks` (gleiches `geojson`-Format wie `tracks`)
- Metadaten: `source_event_id`, `season_year`, `imported_at`, `import_source`

## UX (Teamleader-App)

### 1. Event anlegen

- Feld **Vorjahres-Event-ID** (`prev_event_id`) — wie im Handover
- Button **„Vorjahresdaten laden“** wenn Archiv existiert oder Import anbieten

### 2. Karte

- Toggle **„Vorjahr anzeigen“** (halbtransparente Strecke + graue/blaue Spot-Pins)
- Aktuelle Spots: rot wie heute
- Klick Archiv-Spot → Panel: Zeiten, Fotoanzahl, Kürzel, „Als Vorlage übernehmen“

### 3. Planung unterstützen

- **„Spots aus Vorjahr übernehmen“** — kopiert Positionen in neue `spots` (TL bestätigt, KM neu berechnen am neuen GPX)
- Beim Setzen eines neuen Spots: **Nähe zu Archiv-Spot** → Hinweis: „2024: MK, 08:15–11:40, 1 240 Fotos“
- Link **Galerie Vorjahr**: `https://www.sportograf.com/de/gallery/{prev_event_id}`

### 4. Auswertung (später)

- Tabelle: Spot A 2024 vs 2025 — gleiche KM? gleiche Zeiten geplant?
- Heatmap Fotoanzahl entlang Strecke (wenn viele Spots mit `photo_count`)

## Import — Sportograf Infofile (bekannt)

Paar pro Event: `{eventId}_infofile.txt` + `{eventId}_gpxTrack.gpx`

- Format: [infofile-format.md](../import-formats/infofile-format.md)
- Beispiel: `docs/import-formats/examples/8832/`
- Parser: `parseInfofile()` in `@sg/history`

Pro **Fotograf-Kürzel** an einer **Station** `(n) - Titel`: Position, Bildanzahl, Von–Bis-Zeit.

GPX-Beispiel 8832 enthält nur Waypoints (kein Strecken-`trk`) — Renn-GPX ggf. separat vom TL.

Weitere Quellen später: API, CSV.

## Technik

- Migration: `20260604400000_event_archives.sql`
- Paket `@sg/history` (Typen + `findNearestArchiveSpot`, `formatArchiveHint`) — Stubs bis Import da ist
- Storage: große GPX in Supabase Storage, Referenz in `archive_tracks.storage_path` optional statt inline `geojson` wenn > Größenlimit

## Berechtigungen

- Lesen Archiv: TL, Office, Admin auf Event mit verknüpftem `event_archives`
- Import: TL + Admin
- Fotograf: kein Archiv (nur eigenes Event-Jahr)

## Offene Fragen

- [ ] Liegen Zeiten **pro Spot** oder **pro Fotograf gesamt** vor?
- [ ] Ist `photo_count` pro Spot, pro Fotograf am Event, oder beides?
- [ ] Ein Vorjahr oder mehrere (`prev_event_id` + Liste)?
- [ ] Beispiel-Export (anonymisiert) für Spalten-Mapping?
