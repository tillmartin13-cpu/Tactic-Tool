import { resolveLocationFromUrl } from './resolve';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

export async function handleResolveLocation(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(request.url).searchParams.get('url');
  if (!url) {
    return Response.json({ error: 'No URL provided' }, { status: 400, headers: corsHeaders });
  }

  try {
    const result = await resolveLocationFromUrl(url);
    return Response.json(result, { status: 200, headers: corsHeaders });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}
