import type { StockData } from "../types";
import { STOCK_TICKERS, STOCK_NAMES, REVALIDATE_STOCKS } from "@/lib/constants";
import { computeYahooVariation, fetchYahooChart, parseYahooHistory } from "./yahoo";

export async function getArgentineStocks(): Promise<StockData[]> {
  const promises = STOCK_TICKERS.map(async (symbol): Promise<StockData | null> => {
    const data = await fetchYahooChart(symbol, "1y", REVALIDATE_STOCKS);
    if (!data) return null;

    const meta = data.meta;

    if (typeof meta.regularMarketPrice !== "number") {
      console.error(`[getArgentineStocks] Invalid meta for ${symbol}`);
      return null;
    }

    const price = meta.regularMarketPrice;

    // Pure daily variation, strictly ignoring 1-year chartPreviousClose
    const variation = computeYahooVariation(data, price);

    const high = meta.regularMarketDayHigh ?? price;
    const low = meta.regularMarketDayLow ?? price;
    const volume = meta.regularMarketVolume ?? 0;

    // 1-year daily history (structurally identical to StockHistoryEntry)
    const history = parseYahooHistory(data.timestamp, data.close);

    const updatedAt = typeof meta.regularMarketTime === "number"
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : new Date().toISOString();

    return {
      symbol,
      name: STOCK_NAMES[symbol] || symbol,
      price,
      variation,
      high,
      low,
      volume,
      history,
      updatedAt,
    };
  });

  const results = await Promise.all(promises);
  return results.filter((stock): stock is StockData => stock !== null);
}
