import { StockData } from "../types";
import { INTERNATIONAL_STOCK_TICKERS, INTERNATIONAL_STOCK_NAMES, REVALIDATE_INTERNATIONAL_STOCKS } from "@/lib/constants";
import { fetchYahooChart, parseYahooHistory } from "./yahoo";

export async function getInternationalStocks(): Promise<StockData[]> {
  const promises = INTERNATIONAL_STOCK_TICKERS.map(async (symbol) => {
    const data = await fetchYahooChart(symbol, "1y", REVALIDATE_INTERNATIONAL_STOCKS);
    if (!data) return null;

    const result = data?.chart?.result?.[0];
    const meta = result?.meta;

    if (!meta || typeof meta.regularMarketPrice !== "number") {
      console.error(`[getInternationalStocks] Invalid meta for ${symbol}`);
      return null;
    }

    const price = meta.regularMarketPrice;

    let variation: number | null = null;

    if (typeof meta.regularMarketChangePercent === "number") {
      variation = meta.regularMarketChangePercent;
    } else if (typeof meta.previousClose === "number" && meta.previousClose > 0) {
      variation = ((price - meta.previousClose) / meta.previousClose) * 100;
    } else if (result?.indicators?.quote?.[0]?.close) {
      const closes: (number | null)[] = result.indicators.quote[0].close;
      const validCloses = closes.filter((c): c is number => typeof c === "number" && !isNaN(c));
      if (validCloses.length >= 2) {
        const yesterdayClose = validCloses[validCloses.length - 2];
        if (yesterdayClose > 0) {
          variation = ((price - yesterdayClose) / yesterdayClose) * 100;
        }
      }
    }

    const high = meta.regularMarketDayHigh ?? price;
    const low = meta.regularMarketDayLow ?? price;
    const volume = meta.regularMarketVolume ?? 0;

    const history = result?.timestamp && result?.indicators?.quote?.[0]?.close
      ? parseYahooHistory(result.timestamp, result.indicators.quote[0].close)
      : [];

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
    } as StockData;
  });

  const results = await Promise.all(promises);
  return results.filter((stock): stock is StockData => stock !== null);
}
