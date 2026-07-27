import { MarketIndex, MarketIndexHistoryEntry } from "../types";
import { INDEX_TICKERS, INDEX_NAMES, INDEX_CURRENCIES, REVALIDATE_INDICES } from "@/lib/constants";
import { fetchYahooChart, parseYahooHistory } from "./yahoo";

export async function getMarketIndices(): Promise<MarketIndex[]> {
  const promises = INDEX_TICKERS.map(async (symbol) => {
    const data = await fetchYahooChart(symbol, "1y", REVALIDATE_INDICES);
    if (!data) return null;

    const result = data?.chart?.result?.[0];
    const meta = result?.meta;

    if (!meta || typeof meta.regularMarketPrice !== "number") {
      console.error(`[getMarketIndices] Invalid meta for ${symbol}`);
      return null;
    }

    const value = meta.regularMarketPrice;

    // Daily variation
    let variation: number | null = null;
    if (typeof meta.regularMarketChangePercent === "number") {
      variation = meta.regularMarketChangePercent;
    } else if (typeof meta.previousClose === "number" && meta.previousClose > 0) {
      variation = ((value - meta.previousClose) / meta.previousClose) * 100;
    } else if (result?.indicators?.quote?.[0]?.close) {
      // Fallback: manually calculate from the end of the history array
      const closes: (number | null)[] = result.indicators.quote[0].close;
      const validCloses = closes.filter((c): c is number => typeof c === "number" && !isNaN(c));
      if (validCloses.length >= 2) {
        const yesterdayClose = validCloses[validCloses.length - 2];
        if (yesterdayClose > 0) {
          variation = ((value - yesterdayClose) / yesterdayClose) * 100;
        }
      }
    }

    const high = meta.regularMarketDayHigh ?? value;
    const low = meta.regularMarketDayLow ?? value;

    // Build 1-year daily history
    const rawHistory = result?.timestamp && result?.indicators?.quote?.[0]?.close
      ? parseYahooHistory(result.timestamp, result.indicators.quote[0].close)
      : [];
    // MarketIndexHistoryEntry is structurally identical to parseYahooHistory output
    const history: MarketIndexHistoryEntry[] = rawHistory;

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
    } as MarketIndex;
  });

  const results = await Promise.all(promises);
  return results.filter((idx): idx is MarketIndex => idx !== null);
}
