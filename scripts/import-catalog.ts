import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  const raw = readFileSync(path.join(root, '.env'), 'utf8');
  const url = raw.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim();
  const key = raw.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();
  if (!url || !key) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  return createClient(url, key);
}

async function main() {
  const catalog = JSON.parse(
    readFileSync(path.join(root, 'infofiles/catalog.json'), 'utf8'),
  ) as {
    entries: Array<{
      sourceEventId: string;
      archiveYear: number;
      hasInfofile: boolean;
      hasGpx: boolean;
      spotGroupCount?: number;
      totalImages?: number;
      eventDateEnd?: string;
    }>;
  };

  const sb = loadEnv();
  const rows = catalog.entries.map((e) => ({
    source_event_id: e.sourceEventId,
    archive_year: e.archiveYear,
    has_infofile: e.hasInfofile,
    has_gpx: e.hasGpx,
    spot_group_count: e.spotGroupCount ?? null,
    total_images: e.totalImages ?? null,
    event_date_end: e.eventDateEnd ?? null,
    scanned_at: new Date().toISOString(),
  }));

  const BATCH = 200;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await sb.from('infofile_catalog').upsert(chunk, {
      onConflict: 'source_event_id,archive_year',
    });
    if (error) throw error;
    inserted += chunk.length;
    console.log(`Upserted ${inserted}/${rows.length}`);
  }

  console.log('Done:', inserted, 'catalog entries');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
