// ---------------------------------------------------------------------------
// Commodities API Layer
// Fetches Gold and Brent Oil prices from public Yahoo Finance endpoints.
// ---------------------------------------------------------------------------

export interface CommodityQuote {
  name: string;
  price: number;
  changePercent: number;
  fecha: string;
}

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

/**
 * Fetches a single commodity quote from Yahoo Finance.
 */
async function fetchYahooQuote(symbol: string, name: string): Promise<CommodityQuote | null> {
  try {
    const res = await fetch(`${YAHOO_BASE}/${symbol}?interval=1d&range=2d`, {
      next: { revalidate: 300 }, // 5 minutes cache
      headers: {
        // Some public APIs block strict default fetch agents
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.error(`[fetchYahooQuote] HTTP ${res.status} for ${symbol}`);
      return null;
    }

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const prevClose = meta?.previousClose ?? meta?.chartPreviousClose;

    if (!meta || typeof meta.regularMarketPrice !== "number" || typeof prevClose !== "number") {
      console.error(`[fetchYahooQuote] Invalid meta for ${symbol}`);
      return null;
    }

    const price = meta.regularMarketPrice;
    const changePercent = ((price - prevClose) / prevClose) * 100;
    // meta.regularMarketTime is a unix epoch timestamp in seconds
    const fecha = new Date((meta.regularMarketTime ?? Math.floor(Date.now() / 1000)) * 1000).toISOString();

    return {
      name,
      price,
      changePercent,
      fecha,
    };
  } catch (error) {
    console.error(`[fetchYahooQuote] Failed to fetch ${name}`, error);
    return null;
  }
}

/**
 * Fetches Gold (GC=F) and Brent Crude (BZ=F) quotes.
 */
export async function fetchCommodities(): Promise<CommodityQuote[]> {
  const [gold, brent] = await Promise.all([
    fetchYahooQuote("GC=F", "ORO"),
    fetchYahooQuote("BZ=F", "PETROLEO BRENT"),
  ]);

  const results: CommodityQuote[] = [];
  if (gold) results.push(gold);
  if (brent) results.push(brent);

  return results;
}

/**
 * Fetches 1 year of historical daily closing prices for a given commodity symbol.
 * Maps Yahoo Finance's columnar response (array of timestamps, array of prices)
 * into a standard array of { fecha, valor } objects.
 */
export async function fetchCommodityHistory(symbol: string): Promise<{ fecha: string; valor: number }[]> {
  try {
    const res = await fetch(`${YAHOO_BASE}/${symbol}?interval=1d&range=1y`, {
      next: { revalidate: 3600 }, // 1 hour cache for historical data
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.error(`[fetchCommodityHistory] HTTP ${res.status} for ${symbol}`);
      return [];
    }

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
      console.error(`[fetchCommodityHistory] Invalid historical data payload for ${symbol}`);
      return [];
    }

    const timestamps: number[] = result.timestamp;
    const closes: (number | null)[] = result.indicators.quote[0].close;

    const history: { fecha: string; valor: number }[] = [];
    
    for (let i = 0; i < timestamps.length; i++) {
        const val = closes[i];
        if (typeof val === "number" && !isNaN(val)) {
            // Convert UNIX epoch (seconds) to YYYY-MM-DD
            const dateStr = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
            // Format to 2 decimal places to keep precision clean
            const roundedVal = Number(val.toFixed(2));
            history.push({ fecha: dateStr, valor: roundedVal });
        }
    }

    return history;
  } catch (error) {
    console.error(`[fetchCommodityHistory] Failed to fetch history for ${symbol}`, error);
    return [];
  }
}
