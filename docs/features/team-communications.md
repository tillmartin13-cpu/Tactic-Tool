# Team-Kommunikation (E-Mail & WhatsApp)

Teamleiter und Office sollen das eingeteilte **Event-Team** direkt aus SpotInfo erreichen — **ohne viele Extra-Daten** (keine Pflicht-Telefonnummern, kein Adressbuch im Tool).

## Ziele

1. **E-Mail ans Team** aus dem Tool (ein Klick).
2. **Eine WhatsApp-Gruppe pro Event** — Link im Tool hinterlegen; optional in derselben Team-Mail mitsenden.
3. Kein automatisches Gruppenerstellen (API nicht verfügbar); **kein** Sammeln von Handynummern für v1.

---

## E-Mail ans Team (Phase 2 — umsetzbar)

### UX (Teamleader-App)

Event-Detail → **„Team informieren“**:

- Vorschau: Empfängerliste (Name, Kürzel, E-Mail) aus `spot_assignments` + zugewiesene Fotografen ohne Duplikate.
- Optional: zusätzlicher Freitext vom TL.
- Checkboxen: Taktik-PDF-Link, Link zur Fotografen-App, Spot-Übersicht (PDF/HTML), **WhatsApp-Einladungslink** (falls hinterlegt).
- Button **„E-Mail senden“** → Supabase Edge Function → **Resend**.

### Technik

| Baustein | Details |
|----------|---------|
| Versand | Supabase Edge Function `send-team-email` |
| Provider | [Resend](https://resend.com) (`RESEND_API_KEY` als Secret) |
| Absender | z. B. `spotinfo@sportograf.com` (Domain verifizieren) |
| Audit | Tabelle `team_broadcasts` (wer, wann, an wie viele, Betreff) |
| Berechtigung | `admin`, `teamleader`, `office` auf zugewiesenen Events |

### E-Mail-Inhalt (Standardvorlage)

- Betreff: `SG SpotInfo: {event_name} ({event_id}) — Team-Info`
- Event: Datum, Typ, Name
- Pro Fotograf: Kürzel, Spot-KM, Kurzkommentar TL, Links (Navigate / Street View / Mapillary)
- Link: Fotografen-App Event-URL
- Optional: Taktik-PDF
- Optional: **WhatsApp-Gruppen-Einladung** (siehe unten)

---

## WhatsApp — eine Gruppe, wenig Daten

**Gruppe im Tool automatisch erstellen: nein** (offizielle API). Stattdessen **ein Link-Feld pro Event** — sonst nichts Pflichtiges.

| Feld | Beispiel |
|------|----------|
| `whatsapp_group_invite_url` | `https://chat.whatsapp.com/...` |
| `whatsapp_group_name` | optional: „SG 23040 Team“ |

**Zwei Wege für den TL:**

1. Gruppe in der **WhatsApp-App** anlegen → Link kopieren → in SpotInfo **einfügen**.
2. **Im Tool** (später): Kurzanleitung + Textfeld zum Einfügen nach dem Erstellen — optional Button „WhatsApp öffnen“ (deeplink zur App, kein Gruppen-API-Call).

Ohne Link: Team-E-Mail funktioniert trotzdem (nur ohne WhatsApp-Abschnitt).

---

## Datenmodell

Siehe Migration `20260604200000_team_communications.sql`:

- `events.whatsapp_group_invite_url`, `events.whatsapp_group_name`
- `team_broadcasts` — Protokoll gesendeter Mails

---

## API (geplant)

### `POST` Edge Function `send-team-email`

```json
{
  "eventId": "uuid",
  "customMessage": "optional string",
  "includeTacticPdf": true,
  "includeSpotSummary": true,
  "includeWhatsappInvite": true
}
```

Response: `{ "ok": true, "recipientCount": 12, "broadcastId": "uuid" }`

### Berechtigungsprüfung

Sender muss `admin` sein oder in `event_teamleaders` / `event_office` für dieses Event.

---

## Offene Punkte

- [ ] E-Mail nur an Fotografen **mit Spot-Zuweisung**?
- [ ] **Office** darf Team-Mail senden? (aktuell: ja)
- [ ] Fahrgemeinschaften-Block in Team-Mail? (siehe [carpool.md](./carpool.md))

---

## UI-Platzhalter

Teamleader-App: Panel **„Team informieren“** (nach Event-CRUD) — siehe `apps/teamleader/src/features/team-comms/TeamCommsPanel.tsx` (Stub).
