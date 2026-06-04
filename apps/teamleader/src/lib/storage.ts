import { supabase } from './supabase';

const BUCKETS = {
  cameraChecks: 'camera_checks',
  tacticPdfs: 'tactic_pdfs',
  spotImages: 'spot_images',
} as const;

export async function uploadFile(
  bucket: keyof typeof BUCKETS,
  path: string,
  file: File,
): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.storage.from(BUCKETS[bucket]).upload(path, file, {
    upsert: true,
  });
  if (error) throw error;
  return path;
}

export function publicUrl(bucket: keyof typeof BUCKETS, path: string): string | null {
  if (!supabase) return null;
  const { data } = supabase.storage.from(BUCKETS[bucket]).getPublicUrl(path);
  return data.publicUrl;
}

export async function downloadUrl(
  bucket: keyof typeof BUCKETS,
  path: string,
): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.storage
    .from(BUCKETS[bucket])
    .createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}
