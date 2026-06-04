import { supabase } from './supabase';

export interface SpotReportRow {
  id: string;
  lat: number;
  lng: number;
  km_results: { name: string; km: number }[] | null;
  reported_at: string;
  photographer: { name: string; kuerzel: string | null };
}

export async function listSpotReports(eventId: string): Promise<SpotReportRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('spot_reports')
    .select('*')
    .eq('event_id', eventId)
    .order('reported_at', { ascending: false });
  if (error) throw error;

  const out: SpotReportRow[] = [];
  for (const row of data ?? []) {
    const { data: p } = await supabase
      .from('profiles')
      .select('name, kuerzel')
      .eq('id', row.photographer_id)
      .single();
    out.push({
      id: row.id,
      lat: row.lat,
      lng: row.lng,
      km_results: row.km_results,
      reported_at: row.reported_at,
      photographer: p ?? { name: '?', kuerzel: null },
    });
  }
  return out;
}
