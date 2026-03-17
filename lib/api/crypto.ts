import type { CryptoRate, CryptoHistoryEntry } from "../types";
import { REVALIDATE_CRYPTO, REVALIDATE_HISTORICAL } from "../constants";

// ---------------------------------------------------------------------------
// Crypto API Layer
// Fetches BTC and ETH prices from public Yahoo Finance endpoints.
// ---------------------------------------------------------------------------

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

/**
 * Fetches a single crypto quote from Yahoo Finance.
 */
async function fetchYahooCrypto(symbol: string): Promise<CryptoRate | null> {
  try {
    const res = await fetch(`${YAHOO_BASE}/${symbol}?interval=1d&range=2d`, {
      next: { revalidate: REVALIDATE_CRYPTO },
      headers: {
        // Some public APIs block strict default fetch agents
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.error(`[fetchYahooCrypto] HTTP ${res.status} for ${symbol}`);
      return null;
    }

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const prevClose = meta?.previousClose ?? meta?.chartPreviousClose;

    if (
      !meta ||
      typeof meta.regularMarketPrice !== "number" ||
      typeof prevClose !== "number"
    ) {
      console.error(`[fetchYahooCrypto] Invalid meta for ${symbol}`);
      return null;
    }

    const valor = meta.regularMarketPrice;
    const variacion = ((valor - prevClose) / prevClose) * 100;
    
    // Yahoo doesn't give a "clean" ISO date for the quote in meta without parsing the timestamp array.
    // We'll just stamp it with now, since we only use fecha for the "Actualizado" UI,
    // and this reflects our server's fetch time.
    const fecha = new Date().toISOString();

    return {
      valor,
      variacion,
      fecha,
    };
  } catch (error) {
    console.error(`[fetchYahooCrypto] Failed to fetch ${symbol}`, error);
    return null;
  }
}

/**
 * Fetches Bitcoin (BTC-USD) and Ethereum (ETH-USD) quotes.
 */
export async function fetchCryptos(): Promise<Record<string, CryptoRate | null>> {
  const [btc, eth] = await Promise.all([
    fetchYahooCrypto("BTC-USD"),
    fetchYahooCrypto("ETH-USD"),
  ]);

  return { btc, eth };
}

/**
 * Fetches 1 year of historical daily closing prices for a given crypto symbol.
 */
export async function fetchCryptoHistory(
  symbol: string
): Promise<CryptoHistoryEntry[]> {
  try {
    const res = await fetch(`${YAHOO_BASE}/${symbol}?interval=1d&range=1y`, {
      next: { revalidate: REVALIDATE_HISTORICAL },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.error(`[fetchCryptoHistory] HTTP ${res.status} for ${symbol}`);
      return [];
    }

    const data = await res.json();
    const result = data?.chart?.result?.[0];

    if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
      console.error(
        `[fetchCryptoHistory] Invalid historical data payload for ${symbol}`
      );
      return [];
    }

    const timestamps: number[] = result.timestamp;
    const closes: (number | null)[] = result.indicators.quote[0].close;

    const history: CryptoHistoryEntry[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const val = closes[i];
      if (typeof val === "number" && !isNaN(val)) {
        // Convert UNIX epoch (seconds) to YYYY-MM-DD
        const dateStr = new Date(timestamps[i] * 1000)
          .toISOString()
          .split("T")[0];
        // Format to 2 decimal places
        const roundedVal = Number(val.toFixed(2));
        history.push({ fecha: dateStr, valor: roundedVal });
      }
    }

    return history;
  } catch (error) {
    console.error(
      `[fetchCryptoHistory] Failed to fetch history for ${symbol}`,
      error
    );
    return [];
  }
}
