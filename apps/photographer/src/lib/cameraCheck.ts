import { supabase } from './supabase';

export interface CameraCheckRow {
  id: string;
  status: string;
  rejection_comment: string | null;
  storage_path: string;
  created_at: string;
}

export async function loadMyCameraCheck(
  eventUuid: string,
  userId: string,
): Promise<CameraCheckRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('camera_checks')
    .select('*')
    .eq('event_id', eventUuid)
    .eq('photographer_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function submitCameraCheck(
  eventUuid: string,
  userId: string,
  file: File,
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const path = `${eventUuid}/${userId}/${Date.now()}_${file.name}`;
  const { error: up } = await supabase.storage.from('camera_checks').upload(path, file, {
    upsert: true,
  });
  if (up) throw up;
  const { error } = await supabase.from('camera_checks').insert({
    event_id: eventUuid,
    photographer_id: userId,
    storage_path: path,
    status: 'pending',
  });
  if (error) throw error;
}
