import type { HistoryMetrics, HistoryRange } from "../types";

// ---------------------------------------------------------------------------
// Range → day count mapping
// ---------------------------------------------------------------------------

/** Number of calendar days for each range preset */
export const RANGE_DAYS: Record<HistoryRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

// ---------------------------------------------------------------------------
// Metrics computation
// ---------------------------------------------------------------------------

/**
 * Computes aggregate statistics from a numerical time series.
 *
 * @param values - Array of numeric data points sorted ascending by date.
 * @returns High, low, average, and percentage change, or null if data is empty.
 */
export function computeMetrics(values: number[]): HistoryMetrics | null {
  if (values.length === 0) return null;

  const high = Math.max(...values);
  const low = Math.min(...values);
  const average = values.reduce((sum, v) => sum + v, 0) / values.length;

  const first = values[0];
  const last = values[values.length - 1];
  const changePercent = first !== 0 ? ((last - first) / first) * 100 : 0;

  return {
    high: Math.round(high * 100) / 100,
    low: Math.round(low * 100) / 100,
    average: Math.round(average * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
  };
}
