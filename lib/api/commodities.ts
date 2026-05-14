// ---------------------------------------------------------------------------
// Commodities API Layer
// Fetches Gold, Brent Oil, and Natural Gas prices from Yahoo Finance.
// ---------------------------------------------------------------------------
import type { CommodityQuote } from "../types";
import { fetchYahooChart, parseYahooHistory } from "./yahoo";

/**
 * Fetches a single commodity quote from Yahoo Finance.
 */
async function fetchYahooQuote(symbol: string, name: string): Promise<CommodityQuote | null> {
  const data = await fetchYahooChart(symbol, "2d", 300);
  if (!data) return null;

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
}

/**
 * Fetches Gold (GC=F), Brent Crude (BZ=F), and Natural Gas (NG=F) quotes.
 */
export async function fetchCommodities(): Promise<CommodityQuote[]> {
  const [gold, brent, gas] = await Promise.all([
    fetchYahooQuote("GC=F", "ORO"),
    fetchYahooQuote("BZ=F", "PETROLEO BRENT"),
    fetchYahooQuote("NG=F", "GAS NATURAL"),
  ]);

  const results: CommodityQuote[] = [];
  if (gold) results.push(gold);
  if (brent) results.push(brent);
  if (gas) results.push(gas);

  return results;
}

/**
 * Fetches 1 year of historical daily closing prices for a given commodity symbol.
 * Uses the shared `parseYahooHistory` helper for consistent date/value normalisation.
 */
export async function fetchCommodityHistory(symbol: string): Promise<{ fecha: string; valor: number }[]> {
  const data = await fetchYahooChart(symbol, "1y", 3600);
  if (!data) return [];

  const result = data?.chart?.result?.[0];
  if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
    console.error(`[fetchCommodityHistory] Invalid historical data payload for ${symbol}`);
    return [];
  }

  return parseYahooHistory(result.timestamp, result.indicators.quote[0].close);
}
