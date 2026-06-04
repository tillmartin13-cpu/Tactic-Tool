# Zwei Apps, Rollen pro Event

## Zwei getrennte Frontends

| App | URL (Beispiel) | Zweck |
|-----|----------------|--------|
| **Teamleader** | https://tactic-tool-teamleader.vercel.app | Event planen: GPX, Spots, Fotografen zuweisen, SpotInfo (TL) |
| **Photographer** | eigenes Vercel-Projekt (`apps/photographer`) | Mein Spot, Kamera-Check, Spot-Report |

Gleicher Supabase-Login, **unterschiedliche Oberfläche** — nicht ein Frontend mit Tabs.

Env optional: `VITE_PHOTO_APP_URL` auf der Teamleader-App (Link „Fotografen-App“).

## Zwei Ebenen von „Rolle“

### 1. Globales Profil (`profiles.role`)

| Wert | Bedeutung |
|------|-----------|
| `admin` | Sportograf — alle Events, volle Rechte |
| `office` | Sportograf Office — zugewiesene Events, lesen (+ definierte Aktionen) |
| `teamleader` | Dauerhaft TL-Zugang zur Planungs-App (selten für Freelancer) |
| `photographer` | Standard nach **Registrierung** — Freelancer-Konto |

### 2. Rolle **pro Event** (entscheidend)

| Tabelle | Bedeutung |
|---------|-----------|
| `event_teamleaders` | User ist **Teamleiter** für dieses Event |
| `event_office` | User ist **Office** für dieses Event |
| `event_photographers` + `spot_assignments` | User ist **Fotograf** für dieses Event / diesen Spot |

**Beispiel:** Max ist in `event_teamleaders` für Event A → Planungs-App mit Bearbeitung für A.  
Für Event B nur in `spot_assignments` → nur Fotografen-App für B, **kein** TL-Zugriff auf B.

## Wer darf welche App öffnen?

**Planungs-App (Teamleader):**

- `admin`, `office`, globales `teamleader`, **oder**
- mindestens ein Eintrag in `event_teamleaders` (oder Event selbst erstellt → automatisch TL)

**Fotografen-App:**

- `photographer` oder Zuweisung zu Event/Spot (`event_photographers` / `spot_assignments`)

Eine Person kann **beide** Apps nutzen.

## Registrierung

`/signup` in der Teamleader-App (später auch Photographer-App):

- E-Mail, Passwort, Name, optional Kürzel
- Neues Profil: `role = photographer`
- TL-Rechte: Admin trägt User in `event_teamleaders` ein (UI dafür folgt)

Supabase: **Authentication → Providers → Email** aktiv; für Tests **Confirm email** aus oder Auto Confirm.

SQL: `20260605100000_signup_default_photographer.sql`

## Konto erstellen vs. Event-Rechte

| Aktion | Wo |
|--------|-----|
| Konto anlegen | App `/signup` oder Supabase Users |
| Zum Event als TL | `event_teamleaders` (Admin / bestehender TL) |
| Als Fotograf am Event | `event_photographers` + Spot-Zuweisung |

Siehe auch [auth-setup.md](./auth-setup.md), [roles.md](./roles.md).
