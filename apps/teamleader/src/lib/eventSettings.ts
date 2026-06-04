import { supabase } from './supabase';

export interface ProfileOption {
  id: string;
  name: string;
  kuerzel: string | null;
  role: string;
}

export async function listProfilesForRole(role: string): Promise<ProfileOption[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, kuerzel, role')
    .eq('role', role)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function listEventTeamleaders(eventId: string): Promise<string[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('event_teamleaders')
    .select('user_id')
    .eq('event_id', eventId);
  return (data ?? []).map((r) => r.user_id);
}

export async function addEventTeamleader(eventId: string, userId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase
    .from('event_teamleaders')
    .upsert({ event_id: eventId, user_id: userId });
  if (error) throw error;
}

export async function removeEventTeamleader(eventId: string, userId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  await supabase
    .from('event_teamleaders')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);
}

export async function updateEventMeta(
  eventId: string,
  patch: {
    whatsapp_group_invite_url?: string | null;
    whatsapp_group_name?: string | null;
    name?: string | null;
  },
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('events').update(patch).eq('id', eventId);
  if (error) throw error;
}

export async function uploadTacticPdf(eventId: string, file: File): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const path = `${eventId}/${Date.now()}_${file.name}`;
  const { error: up } = await supabase.storage.from('tactic_pdfs').upload(path, file);
  if (up) throw up;
  const { error } = await supabase.from('tactic_pdfs').insert({
    event_id: eventId,
    storage_path: path,
    name: file.name,
  });
  if (error) throw error;
}
