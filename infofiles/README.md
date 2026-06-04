# Infofiles (Mehrjahres-Archiv)

Sportograf-Exporte nach **Archiv-Jahr** sortiert — nicht nach der ID des Events, das du **dieses Jahr** planst.

## Ordnerstruktur

```
infofiles/
  2025/
    8832_infofile.txt
    8832_gpxTrack.gpx
    9012_infofile.txt
    9012_gpxTrack.gpx
  2024/
    7711_infofile.txt
    7711_gpxTrack.gpx
  catalog.json          ← wird von npm run scan:infofiles erzeugt
```

| Teil im Namen | Bedeutung |
|---------------|-----------|
| `8832` | Sportograf-Event-ID **dieses Archiv-Events** (Vorjahr / vergangenes Rennen) |
| `2025/` | **Archiv-Jahr** im Tool — TL wählt „2024“ oder „2025“ auf der Karte |

Du kannst **2025 und optional 2024** befüllen; der TL sieht dann, für welche Jahre Daten da sind.

## Nach dem Upload

```bash
npm run scan:infofiles
```

Erzeugt `catalog.json` mit allen Events und Jahren (txt / txt+gpx).

## Verknüpfung mit aktuellem Event

1. Neues Event anlegen (`event_id` = z. B. `23040` — **dieses Jahr**).
2. **`prev_event_id`** = Haupt-Vorjahr für Galerie-Link (z. B. `8832`).
3. Zusätzliche Jahre: in der App **Archiv 2024 + 2025 verknüpfen** → `event_archives` (mehrere Zeilen pro Event).

Siehe [docs/features/historical-data.md](../docs/features/historical-data.md).

## Git

Große `.txt` / `.gpx` werden nicht committed (siehe `.gitignore`). `catalog.json` kann committed werden, wenn klein genug.
