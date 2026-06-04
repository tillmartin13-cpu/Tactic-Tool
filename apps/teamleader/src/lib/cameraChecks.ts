import { supabase } from './supabase';
import { downloadUrl } from './storage';

export interface CameraCheckReviewRow {
  id: string;
  status: string;
  rejection_comment: string | null;
  storage_path: string;
  created_at: string;
  photographer: { id: string; name: string; kuerzel: string | null };
  imageUrl: string | null;
}

export async function listPendingCameraChecks(eventId: string): Promise<CameraCheckReviewRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('camera_checks')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const rows: CameraCheckReviewRow[] = [];
  for (const row of data ?? []) {
    const { data: p } = await supabase
      .from('profiles')
      .select('id, name, kuerzel')
      .eq('id', row.photographer_id)
      .single();
    const imageUrl = await downloadUrl('cameraChecks', row.storage_path);
    rows.push({
      id: row.id,
      status: row.status,
      rejection_comment: row.rejection_comment,
      storage_path: row.storage_path,
      created_at: row.created_at,
      photographer: p ?? { id: row.photographer_id, name: '?', kuerzel: null },
      imageUrl,
    });
  }
  return rows;
}

export async function reviewCameraCheck(
  id: string,
  status: 'approved' | 'rejected',
  reviewerId: string,
  rejectionComment?: string,
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase
    .from('camera_checks')
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      rejection_comment: status === 'rejected' ? rejectionComment ?? '' : null,
    })
    .eq('id', id);
  if (error) throw error;
}
