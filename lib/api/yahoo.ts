// ---------------------------------------------------------------------------
// Shared Yahoo Finance API Helper
// ---------------------------------------------------------------------------

/**
 * Fetches a raw Yahoo Finance chart payload.
 * Returns null on HTTP error or network failure.
 */
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

/**
 * Converts Yahoo Finance's columnar `timestamps[]` + `closes[]` arrays
 * into a standardised `{ fecha: "YYYY-MM-DD", valor: number }[]` array.
 *
 * Skips null or NaN close values that Yahoo sometimes emits for non-trading days.
 */
export function parseYahooHistory(
  timestamps: number[],
  closes: (number | null)[]
): { fecha: string; valor: number }[] {
  const history: { fecha: string; valor: number }[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const val = closes[i];
    if (typeof val === "number" && !isNaN(val)) {
      const fecha = new Date(timestamps[i] * 1000).toISOString().split("T")[0];
      history.push({ fecha, valor: Number(val.toFixed(2)) });
    }
  }
  return history;
}

