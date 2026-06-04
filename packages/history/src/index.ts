export type { ArchiveSpot, ArchiveSpotHint } from './types';
export type {
  InfofileHeader,
  InfofileAssignment,
  ParsedInfofile,
} from './parseInfofile';
export { parseInfofile } from './parseInfofile';
export type { InfofileCatalog, InfofileCatalogEntry } from './scanInfofiles';
export {
  scanInfofilesRoot,
  yearsWithCompletePairs,
  catalogEntriesForEvent,
} from './scanInfofiles';
export { formatArchiveSpotLabel } from './format';
export { findNearestArchiveSpot } from './nearest';

export const GALLERY_URL_PREFIX = 'https://www.sportograf.com/de/gallery/';

export function galleryUrlForEventId(eventId: string): string {
  return `${GALLERY_URL_PREFIX}${eventId}`;
}
