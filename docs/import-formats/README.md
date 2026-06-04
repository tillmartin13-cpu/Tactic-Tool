# Archiv-Import — Formate

## Sportograf Infofile (Standard)

- Spezifikation: [infofile-format.md](./infofile-format.md)
- Beispiel Event **8832**: [examples/8832/](./examples/8832/)

Lege weitere Events als `{eventId}_infofile.txt` + `{eventId}_gpxTrack.gpx` unter `examples/` oder im Ordner `infofiles/` im Repo-Root ab.

Geplante Edge Function: `import-event-archive` (ruft `parseInfofile` auf).
