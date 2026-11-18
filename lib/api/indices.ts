import type { MarketIndex } from "../types";
import { INDEX_TICKERS, INDEX_NAMES, INDEX_CURRENCIES, REVALIDATE_INDICES } from "@/lib/constants";
import { computeYahooVariation, fetchYahooChart, parseYahooHistory } from "./yahoo";

export async function getMarketIndices(): Promise<MarketIndex[]> {
  const promises = INDEX_TICKERS.map(async (symbol): Promise<MarketIndex | null> => {
    const data = await fetchYahooChart(symbol, "1y", REVALIDATE_INDICES);
    if (!data) return null;

    const meta = data.meta;

    if (typeof meta.regularMarketPrice !== "number") {
      console.error(`[getMarketIndices] Invalid meta for ${symbol}`);
      return null;
    }

    const value = meta.regularMarketPrice;
    const variation = computeYahooVariation(data, value);

    const high = meta.regularMarketDayHigh ?? value;
    const low = meta.regularMarketDayLow ?? value;

    // 1-year daily history (structurally identical to MarketIndexHistoryEntry)
    const history = parseYahooHistory(data.timestamp, data.close);

    const updatedAt =
      typeof meta.regularMarketTime === "number"
        ? new Date(meta.regularMarketTime * 1000).toISOString()
        : new Date().toISOString();

    return {
      symbol,
      name: INDEX_NAMES[symbol] || symbol,
      value,
      variation,
      high,
      low,
      currency: INDEX_CURRENCIES[symbol] || "USD",
      history,
      updatedAt,
    };
  });

  const results = await Promise.all(promises);
  return results.filter((idx): idx is MarketIndex => idx !== null);
}
