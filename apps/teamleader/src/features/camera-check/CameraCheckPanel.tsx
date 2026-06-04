import { Button } from '@sg/ui';
import { useEffect, useState } from 'react';
import {
  listPendingCameraChecks,
  reviewCameraCheck,
  type CameraCheckReviewRow,
} from '../../lib/cameraChecks';
import { useAuth } from '../../lib/auth';

export function CameraCheckPanel({ eventUuid, canEdit }: { eventUuid: string; canEdit: boolean }) {
  const { profile } = useAuth();
  const [rows, setRows] = useState<CameraCheckReviewRow[]>([]);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  const load = () => void listPendingCameraChecks(eventUuid).then(setRows);

  useEffect(() => {
    load();
  }, [eventUuid]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <h3 className="text-sm font-semibold text-navy">Kamera-Checks</h3>
      <ul className="mt-2 max-h-64 space-y-3 overflow-y-auto">
        {rows.map((r) => (
          <li key={r.id} className="rounded border p-2 text-xs">
            <p className="font-bold">
              {r.photographer.kuerzel ?? r.photographer.name} — {r.status}
            </p>
            {r.imageUrl && (
              <a href={r.imageUrl} target="_blank" rel="noreferrer" className="text-navy underline">
                Bild ansehen
              </a>
            )}
            {canEdit && r.status === 'pending' && (
              <div className="mt-2 flex gap-1">
                <Button
                  className="!px-2 !py-0.5 !text-xs"
                  onClick={() => {
                    if (!profile) return;
                    void reviewCameraCheck(r.id, 'approved', profile.id).then(load);
                  }}
                >
                  ✓
                </Button>
                <Button
                  variant="danger"
                  className="!px-2 !py-0.5 !text-xs"
                  onClick={() => setRejectId(r.id)}
                >
                  ✗
                </Button>
              </div>
            )}
            {rejectId === r.id && (
              <div className="mt-2">
                <input
                  className="w-full rounded border px-1 py-0.5"
                  placeholder="Ablehnungsgrund"
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                />
                <Button
                  variant="danger"
                  className="mt-1 w-full !text-xs"
                  onClick={() => {
                    if (!profile || !rejectComment.trim()) return;
                    void reviewCameraCheck(r.id, 'rejected', profile.id, rejectComment).then(
                      () => {
                        setRejectId(null);
                        setRejectComment('');
                        load();
                      },
                    );
                  }}
                >
                  Ablehnen senden
                </Button>
              </div>
            )}
          </li>
        ))}
        {!rows.length && <li className="text-slate-500">Keine Einreichungen</li>}
      </ul>
    </section>
  );
}
