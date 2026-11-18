import type { StockData } from "../types";
import { INTERNATIONAL_STOCK_TICKERS, INTERNATIONAL_STOCK_NAMES, REVALIDATE_INTERNATIONAL_STOCKS } from "@/lib/constants";
import { computeYahooVariation, fetchYahooChart, parseYahooHistory } from "./yahoo";

export async function getInternationalStocks(): Promise<StockData[]> {
  const promises = INTERNATIONAL_STOCK_TICKERS.map(async (symbol): Promise<StockData | null> => {
    const data = await fetchYahooChart(symbol, "1y", REVALIDATE_INTERNATIONAL_STOCKS);
    if (!data) return null;

    const meta = data.meta;

    if (typeof meta.regularMarketPrice !== "number") {
      console.error(`[getInternationalStocks] Invalid meta for ${symbol}`);
      return null;
    }

    const price = meta.regularMarketPrice;
    const variation = computeYahooVariation(data, price);

    const high = meta.regularMarketDayHigh ?? price;
    const low = meta.regularMarketDayLow ?? price;
    const volume = meta.regularMarketVolume ?? 0;

    const history = parseYahooHistory(data.timestamp, data.close);

    const updatedAt = typeof meta.regularMarketTime === "number"
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : new Date().toISOString();

    return {
      symbol,
      name: INTERNATIONAL_STOCK_NAMES[symbol] || symbol,
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
