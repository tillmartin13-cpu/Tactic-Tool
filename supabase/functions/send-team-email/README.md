# send-team-email

Sends one team email for an event via Resend.

## Secrets

- `RESEND_API_KEY`
- `RESEND_FROM` (e.g. `SG SpotInfo <spotinfo@sportograf.com>`)
- `PHOTOGRAPHER_APP_URL` (base URL for links in template)

## Request

`POST` with JWT (teamleader / office / admin on event):

```json
{
  "eventId": "uuid",
  "customMessage": "optional",
  "includeTacticPdf": true,
  "includeSpotSummary": true,
  "includeWhatsappInvite": true
}
```

## Logic (to implement)

1. Authorize sender against `event_teamleaders`, `event_office`, or `role = admin`.
2. Load event + `whatsapp_group_invite_url`.
3. Resolve recipients: distinct photographers from `spot_assignments` → join `profiles` (email required).
4. Build HTML from template; attach WhatsApp block if URL set and `includeWhatsappInvite`.
5. `resend.emails.send({ to: [...] })` — prefer one email with BCC or individual sends per privacy policy.
6. Insert `team_broadcasts` row.

## Note on BCC vs individual

Use **individual sends** (or Resend batch) so rejection of one address does not block others; log `recipient_count`.
