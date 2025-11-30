export async function queryWDQS(sparql: string, timeoutMs: number = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    // Use GET with query parameter instead of POST to avoid CORS issues
    // Browsers block custom User-Agent headers in fetch requests
    const encodedQuery = encodeURIComponent(sparql);
    const res = await fetch(
      `https://query.wikidata.org/sparql?query=${encodedQuery}&format=json`,
      {
        method: "GET",
        headers: {
          Accept: "application/sparql-results+json",
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`WDQS error ${res.status}`);
    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Query timeout');
    }
    throw error;
  }
}
