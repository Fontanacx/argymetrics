import type { CryptoRate, CryptoHistoryEntry } from "../types";
import { REVALIDATE_CRYPTO, REVALIDATE_HISTORICAL } from "@/lib/constants";
import { fetchYahooChart, parseYahooHistory } from "./yahoo";

// ---------------------------------------------------------------------------
// Crypto API Layer
// Fetches BTC and ETH prices from Yahoo Finance via the shared yahoo helper.
// ---------------------------------------------------------------------------

/**
 * Fetches a single crypto quote from Yahoo Finance.
 */
async function fetchYahooCrypto(symbol: string): Promise<CryptoRate | null> {
  const data = await fetchYahooChart(symbol, "2d", REVALIDATE_CRYPTO);
  if (!data) return null;

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
  // We stamp it with now, since we only use fecha for the "Actualizado" UI label,
  // and this reflects our server's fetch time.
  const fecha = new Date().toISOString();

  return { valor, variacion, fecha };
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
 * Uses the shared `parseYahooHistory` helper for consistent date/value normalisation.
 */
export async function fetchCryptoHistory(
  symbol: string
): Promise<CryptoHistoryEntry[]> {
  const data = await fetchYahooChart(symbol, "1y", REVALIDATE_HISTORICAL);
  if (!data) return [];

  const result = data?.chart?.result?.[0];

  if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
    console.error(
      `[fetchCryptoHistory] Invalid historical data payload for ${symbol}`
    );
    return [];
  }

  return parseYahooHistory(result.timestamp, result.indicators.quote[0].close);
}
