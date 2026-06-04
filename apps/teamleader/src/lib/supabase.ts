import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Supabase client — requires .env (see root .env.example). */
export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}
