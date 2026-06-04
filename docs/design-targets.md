# Design-Ziele der zwei Apps

## Teamleader (`layout="planning"`)

- **Primär:** Desktop / Laptop — breite Planungsfläche (bis ~1920px), 3-Spalten-Workspace ab `xl` (Karte mittig, Fotografen links, Tools rechts).
- **Sekundär:** Smartphone — Karte zuerst, darunter scrollbare Panels; sticky Toolbar; Touch-Ziele für Phasen-Umschalter.

Technik: `AppShell layout="planning"`, CSS-Klassen `.tl-workspace`, `.tl-toolbar`, `.tl-side-panel` in `apps/teamleader/src/index.css`.

## Photographer (`layout="field"`)

- **Primär:** Smartphone — schmale Spalte (`max-w-lg`), große Buttons (`Button size="touch"`), Karte ~42vh, `safe-area` unten, Inputs 16px (kein iOS-Zoom).
- **Sekundär:** Desktop — zentrierte „Phone-Spalte“, gleiche UX wie am Handy.

Technik: `AppShell layout="field"`, Root-Klasse `.photo-app`, Komponenten-Klassen `.photo-page`, `.photo-card`, `.photo-map`, `.photo-action` in `apps/photographer/src/index.css`.

## Env

Cross-Links zwischen Apps unverändert über `VITE_TL_APP_URL` / `VITE_PHOTO_APP_URL`.
