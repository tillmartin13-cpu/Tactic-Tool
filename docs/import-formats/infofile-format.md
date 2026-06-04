# Sportograf Infofile-Format

Beispiel im Repo: `docs/import-formats/examples/8832/` (Kopie aus TL App).

## Datei-Paar — immer vom **Vorjahres-Event**

Beide Dateien tragen die **Sportograf-Event-ID des Vorjahres** im Dateinamen (nicht die ID des aktuellen Planungs-Events).

| Datei | Inhalt |
|-------|--------|
| `{prevEventId}_infofile.txt` | Spots, Fotografen, Zeiten, Bildanzahl (Archiv) |
| `{prevEventId}_gpxTrack.gpx` | Waypoints zu denselben Kürzeln (Archiv) |

Beispiel Vorjahr **8832**:

```
8832_infofile.txt
8832_gpxTrack.gpx
```

Aktuelles Event in SpotInfo (z. B. `23040`) verknüpft das Archiv über **`events.prev_event_id = '8832'`** → Import legt `event_archives.source_event_id = '8832'` an.

## Kopfzeile (TXT)

```
EventId: 8832
Spots: 95
Total Images: 2798698
Time:	01.01.0001 23:00:00 to 28.05.2023 20:42:40
Duration: 738666.21:42:40
```

- **Spots:** Anzahl logischer Spot-Gruppen `(n) - …`
- **Total Images:** Summe Event
- **Time/Duration:** Event-Gesamt (ungültige Startdaten wie `01.01.0001` vorkommen → beim Import filtern)

## Spot-Gruppe

```
(1) - After Start Tower Hill - Mile 1.8
```

- `index` = 1
- `title` = Rest nach ` - ` (Stationsname, oft mit Mile / Distanz-Hinweis)

## Fotografen-Zeile (Kürzel)

Tab-eingerückt unter der Gruppe, z. B. `EK2`, `HV2LS1` (Hauptspot + „Line Spot“-Varianten).

| Feld | Beispiel |
|------|----------|
| Images | `348` |
| Time | `28.05.2023 10:02:07 until 28.05.2023 11:15:53` |
| Duration | `01:13:46` |
| Location | `51.50369 -0.08012` oder `NULL NULL` |

**Pro Fotograf an einer Station** = ein Datensatz → `archive_spots` (+ `station_index`, `station_title`).

## GPX (`_gpxTrack.gpx`)

- Nur `<wpt>` mit `<name>` = Kürzel, `<desc>` = Station + Images/First/Last/Duration
- Kein `<trk>` im Beispiel 8832 — Strecke für Karte ggf. separates Renn-GPX vom TL

## Import-Ziel (Supabase)

| Quelle | Ziel |
|--------|------|
| TXT + GPX | `event_archives` + `archive_spots` |
| Koordinaten | `lat`/`lng` (TXT bevorzugt; GPX als Fallback) |
| Images | `photo_count` |
| Time until | `shoot_start` / `shoot_end` |
| (n) title | `source_payload.stationTitle` + optional `layer` |

## Parser

`@sg/history` → `parseInfofile(txt)` — siehe `packages/history/src/parseInfofile.ts`.
