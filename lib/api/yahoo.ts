// ---------------------------------------------------------------------------
// Shared Yahoo Finance API Helper
// ---------------------------------------------------------------------------

export async function fetchYahooChart(symbol: string, range: string, revalidate: number) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${range}`, {
      next: { revalidate },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.error(`[fetchYahooChart] HTTP ${res.status} for ${symbol}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`[fetchYahooChart] Failed to fetch ${symbol}`, error);
    return null;
  }
}
