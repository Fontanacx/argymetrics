// ---------------------------------------------------------------------------
// Shared Yahoo Finance API Helper
// ---------------------------------------------------------------------------

import type { YahooChartMeta, YahooChartResult } from "../types";
import { isFiniteNumber, isRecord, readFiniteNumber } from "./guards";

function parseYahooMeta(value: unknown): YahooChartMeta {
  if (!isRecord(value)) return {};
  return {
    regularMarketPrice: readFiniteNumber(value, "regularMarketPrice"),
    previousClose: readFiniteNumber(value, "previousClose"),
    chartPreviousClose: readFiniteNumber(value, "chartPreviousClose"),
    regularMarketChangePercent: readFiniteNumber(value, "regularMarketChangePercent"),
    regularMarketDayHigh: readFiniteNumber(value, "regularMarketDayHigh"),
    regularMarketDayLow: readFiniteNumber(value, "regularMarketDayLow"),
    regularMarketVolume: readFiniteNumber(value, "regularMarketVolume"),
    regularMarketTime: readFiniteNumber(value, "regularMarketTime"),
  };
}

/**
 * Validates a raw Yahoo chart payload (`{ chart: { result: [{ meta, timestamp,
 * indicators: { quote: [{ close }] } }] } }`) and returns its first result in a
 * flat, typed shape. Missing arrays become `[]`; non-numeric closes become `null`.
 */
function parseYahooChart(payload: unknown): YahooChartResult | null {
  if (!isRecord(payload) || !isRecord(payload.chart)) return null;

  const results = payload.chart.result;
  if (!Array.isArray(results) || !isRecord(results[0])) return null;

  const first = results[0];

  // Keep timestamps aligned with closes: if any entry is invalid, drop the series.
  const rawTimestamps: unknown[] = Array.isArray(first.timestamp) ? first.timestamp : [];
  const validTimestamps = rawTimestamps.filter(isFiniteNumber);
  const timestamp = validTimestamps.length === rawTimestamps.length ? validTimestamps : [];

  let close: (number | null)[] = [];
  if (isRecord(first.indicators) && Array.isArray(first.indicators.quote)) {
    const quote: unknown = first.indicators.quote[0];
    if (isRecord(quote) && Array.isArray(quote.close)) {
      close = quote.close.map((c: unknown) => (isFiniteNumber(c) ? c : null));
    }
  }

  return { meta: parseYahooMeta(first.meta), timestamp, close };
}

/**
 * Fetches and validates a Yahoo Finance chart payload.
 * Returns null on HTTP error, network failure or unexpected response shape.
 */
export async function fetchYahooChart(
  symbol: string,
  range: string,
  revalidate: number
): Promise<YahooChartResult | null> {
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

    const data: unknown = await res.json();
    const parsed = parseYahooChart(data);
    if (!parsed) {
      console.error(`[fetchYahooChart] Unexpected response shape for ${symbol}`);
    }
    return parsed;
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

/**
 * Daily percentage change for a Yahoo chart result.
 *
 * Prefers `regularMarketChangePercent`, then `previousClose`, and finally
 * falls back to the second-to-last valid close of the series. Returns `null`
 * when none of them can be computed.
 */
export function computeYahooVariation(data: YahooChartResult, price: number): number | null {
  const { meta } = data;

  if (typeof meta.regularMarketChangePercent === "number") {
    return meta.regularMarketChangePercent;
  }
  if (typeof meta.previousClose === "number" && meta.previousClose > 0) {
    return ((price - meta.previousClose) / meta.previousClose) * 100;
  }

  const validCloses = data.close.filter((c): c is number => typeof c === "number" && !isNaN(c));
  if (validCloses.length >= 2) {
    const yesterdayClose = validCloses[validCloses.length - 2];
    if (yesterdayClose > 0) {
      return ((price - yesterdayClose) / yesterdayClose) * 100;
    }
  }

  return null;
}
