import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanInfofilesRoot, yearsWithCompletePairs } from '../packages/history/src/scanInfofiles';

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const infofilesDir = path.join(root, 'infofiles');

  const catalog = await scanInfofilesRoot(
    infofilesDir,
    (p) => readFile(p, 'utf8'),
    (d) => readdir(d),
    async (d) => (await stat(d)).isDirectory(),
  );

  const out = {
    ...catalog,
    completeYears: yearsWithCompletePairs(catalog),
  };

  await writeFile(
    path.join(infofilesDir, 'catalog.json'),
    JSON.stringify(out, null, 2),
    'utf8',
  );

  console.log(`Scanned ${catalog.entries.length} infofiles`);
  console.log('Archive years:', catalog.years.join(', ') || '(none)');
  console.log('Complete pairs (txt+gpx):', out.completeYears.join(', ') || '(none)');
  console.log('Written infofiles/catalog.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
