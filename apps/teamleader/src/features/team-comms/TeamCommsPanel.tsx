import { canSendTeamBroadcast } from '@sg/auth';
import type { UserRole } from '@sg/auth';
import { Button } from '@sg/ui';
import { useState } from 'react';
import { updateEventMeta } from '../../lib/eventSettings';
import { supabase } from '../../lib/supabase';

interface TeamCommsPanelProps {
  eventUuid: string;
  role: UserRole | null;
  whatsappUrl: string | null;
  canEdit: boolean;
}

export function TeamCommsPanel({ eventUuid, role, whatsappUrl, canEdit }: TeamCommsPanelProps) {
  const [wa, setWa] = useState(whatsappUrl ?? '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const allowed = role != null && canSendTeamBroadcast(role);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <h3 className="text-sm font-semibold text-navy">Team informieren</h3>
      <input
        className="mt-2 w-full rounded border px-2 py-1 text-xs"
        placeholder="WhatsApp Gruppen-Link"
        value={wa}
        disabled={!canEdit}
        onChange={(e) => setWa(e.target.value)}
      />
      {canEdit && (
        <Button
          variant="secondary"
          className="mt-1 w-full !text-xs"
          onClick={() => void updateEventMeta(eventUuid, { whatsapp_group_invite_url: wa || null })}
        >
          WhatsApp-Link speichern
        </Button>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noreferrer" className="mt-2 block text-xs text-navy underline">
          Gruppe öffnen
        </a>
      )}
      {allowed && (
        <div className="mt-3 space-y-1">
          <input
            className="w-full rounded border px-2 py-1 text-xs"
            placeholder="Betreff (E-Mail — Edge Function)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            className="w-full rounded border px-2 py-1 text-xs"
            rows={2}
            placeholder="Nachricht"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button
            variant="secondary"
            className="w-full !text-xs"
            disabled={!subject.trim()}
            onClick={async () => {
              if (!supabase) return;
              await supabase.from('team_broadcasts').insert({
                event_id: eventUuid,
                channel: 'email',
                subject: subject.trim(),
                body: body.trim(),
                sent_by: (await supabase.auth.getUser()).data.user?.id,
              });
              setSubject('');
              setBody('');
            }}
          >
            Broadcast protokollieren (E-Mail via Edge fn folgt)
          </Button>
        </div>
      )}
    </section>
  );
}
