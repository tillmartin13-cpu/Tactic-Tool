const COORD_PATTERNS = [
  /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
  /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
  /maps\/place\/[^/]+\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
  /[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
  /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
];

export interface ResolveSuccess {
  lat: number;
  lng: number;
  finalUrl: string;
  src: string;
}

export interface ResolvePartial {
  finalUrl: string;
  error: string;
}

export async function resolveLocationFromUrl(
  inputUrl: string,
): Promise<ResolveSuccess | ResolvePartial> {
  const response = await fetch(inputUrl, {
    method: 'GET',
    redirect: 'follow',
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  const finalUrl = response.url;

  for (const pattern of COORD_PATTERNS) {
    const m = finalUrl.match(pattern);
    if (m) {
      return {
        lat: parseFloat(m[1]),
        lng: parseFloat(m[2]),
        finalUrl,
        src: 'Google Maps',
      };
    }
  }

  return { finalUrl, error: 'No coordinates found in URL' };
}
