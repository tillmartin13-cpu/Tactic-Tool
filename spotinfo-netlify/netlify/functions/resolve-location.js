exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const url = event.queryStringParameters && event.queryStringParameters.url;
  if (!url) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'No URL provided' }) };
  }

  try {
    // Follow redirects to get the final URL
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const finalUrl = response.url;

    // Try all known Google Maps coordinate patterns
    const patterns = [
      /@(-?\d+\.?\d+),(-?\d+\.?\d+)/,
      /[?&]q=(-?\d+\.?\d+),(-?\d+\.?\d+)/,
      /maps\/place\/[^/]+\/@(-?\d+\.?\d+),(-?\d+\.?\d+)/,
      /[?&]ll=(-?\d+\.?\d+),(-?\d+\.?\d+)/,
      /!3d(-?\d+\.?\d+)!4d(-?\d+\.?\d+)/,
    ];

    for (const pattern of patterns) {
      const m = finalUrl.match(pattern);
      if (m) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            lat: parseFloat(m[1]),
            lng: parseFloat(m[2]),
            finalUrl,
            src: 'Google Maps'
          })
        };
      }
    }

    // No coords found — return the final URL so the client can try
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ finalUrl, error: 'No coordinates found in URL' })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
