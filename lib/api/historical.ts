import type {
  DollarCasa,
  DollarHistoryEntry,
  DollarWithHistory,
  DollarRate,
  RiesgoPaisHistoryEntry,
} from "../types";
import {
  ARGENTINADATOS_BASE,
  REVALIDATE_HISTORICAL,
  DISPLAYED_CASAS,
  HISTORY_DAYS,
} from "../constants";
import { fetchAllDollars } from "./dollars";

// ---------------------------------------------------------------------------
// Fetch historical data for a single casa (sparkline — last 7 days)
// ---------------------------------------------------------------------------

/**
 * Fetches price history for a single dollar type from ArgentinaDatos.
 *
 * The API returns the complete history sorted ascending by date.
 * We slice to the last `HISTORY_DAYS` entries to keep payloads small.
 *
 * @param casa - Dollar type identifier (e.g. "blue", "oficial").
 * @returns Array of historical entries, or empty array on failure.
 */
export async function fetchDollarHistory(
  casa: DollarCasa
): Promise<DollarHistoryEntry[]> {
  try {
    const isEuroTarjeta = casa === "eurotarjeta";
    const isEuro = casa === "euro" || casa === "euroblue" || isEuroTarjeta;
    const endpointCasa = casa === "euroblue" ? "blue" : isEuro ? "oficial" : casa;
    
    // ArgentinaDatos lacks historical Euros. Synthesize using Dollars.
    const path = `dolares/${endpointCasa}`;

    const res = await fetch(
      `${ARGENTINADATOS_BASE}/v1/cotizaciones/${path}`,
      { next: { revalidate: REVALIDATE_HISTORICAL } }
    );

    if (!res.ok) {
      console.error(`[fetchDollarHistory] ${casa}: HTTP ${res.status}`);
      return [];
    }

    const data: DollarHistoryEntry[] = await res.json();

    if (!Array.isArray(data)) {
      console.error(`[fetchDollarHistory] ${casa}: unexpected response shape`);
      return [];
    }

    // API returns ascending by date — take the last N entries
    let result = data.slice(-HISTORY_DAYS);
    
    // Synthetically scale Dollar history to generate Euro histories
    if (isEuro) {
      // Approximate EUR/USD cross rate is 1.086. Euro Tarjeta adds 60% tax.
      const multiplier = isEuroTarjeta ? 1.086 * 1.6 : 1.086;
      result = result.map((entry) => ({
        ...entry,
        compra: Number((entry.compra * multiplier).toFixed(2)),
        venta: Number((entry.venta * multiplier).toFixed(2)),
      }));
    }
    
    return result;
  } catch (error) {
    console.error(`[fetchDollarHistory] ${casa}: Network error`, error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Compute daily variation from historical data
// ---------------------------------------------------------------------------

/**
 * Calculates the percentage change between the last two entries in a
 * price history series. Uses the `venta` (sell) price as the reference
 * since it is the price most consumers see.
 *
 * Handles edge cases:
 * - Fewer than 2 entries → returns null (not enough data)
 * - Missing or zero `venta` on either entry → returns null
 * - NaN / Infinity results → returns null
 *
 * @param history - Array of historical entries sorted ascending by date.
 * @returns Percentage change (e.g. 2.5 means +2.5%), or null if unavailable.
 */
function computeVariation(history: DollarHistoryEntry[]): number | null {
  if (history.length < 2) return null;

  const current = history[history.length - 1];
  const previous = history[history.length - 2];

  // Guard against missing, zero, or non-numeric values
  if (
    typeof current.venta !== "number" ||
    typeof previous.venta !== "number" ||
    previous.venta === 0 ||
    current.venta === 0
  ) {
    return null;
  }

  const variation = ((current.venta - previous.venta) / previous.venta) * 100;

  // Guard against NaN/Infinity from unexpected data
  if (!Number.isFinite(variation)) return null;

  // Round to 2 decimal places for clean display
  return Math.round(variation * 100) / 100;
}

// ---------------------------------------------------------------------------
// Fetch all displayed dollars with their histories (dashboard)
// ---------------------------------------------------------------------------

/**
 * Fetches current rates and 7-day price history for all displayed dollar
 * types, then combines them with a computed daily variation.
 *
 * All fetches (1 for current rates + N for histories) run in parallel
 * via `Promise.all` for minimal latency. If any individual history fetch
 * fails, that dollar still appears with an empty history and null variation.
 *
 * @returns Array of enriched dollar objects with rate, history, and variation.
 */
export async function fetchDollarsWithHistory(): Promise<DollarWithHistory[]> {
  const [rates, ...histories] = await Promise.all([
    fetchAllDollars(),
    ...DISPLAYED_CASAS.map((casa) => fetchDollarHistory(casa)),
  ]);

  // Build a map of casa -> history for O(1) lookup
  const historyByCasa = new Map<DollarCasa, DollarHistoryEntry[]>();
  DISPLAYED_CASAS.forEach((casa, i) => {
    historyByCasa.set(casa, histories[i]);
  });

  return rates.map((rate: DollarRate) => {
    const history = historyByCasa.get(rate.casa) ?? [];
    return {
      rate,
      history,
      variacion: computeVariation(history),
    };
  });
}

// ---------------------------------------------------------------------------
// Full history fetchers (analytics charts — up to 365 days)
// ---------------------------------------------------------------------------

/**
 * Fetches the full price history for a dollar type, sliced to the
 * last 365 entries. Used for the analytics charts, not the sparklines.
 *
 * @param casa - Dollar type identifier (e.g. "blue", "oficial").
 * @returns Array of historical entries (up to 365), or empty array on failure.
 */
export async function fetchFullDollarHistory(
  casa: DollarCasa
): Promise<DollarHistoryEntry[]> {
  try {
    const isEuroTarjeta = casa === "eurotarjeta";
    const isEuro = casa === "euro" || casa === "euroblue" || isEuroTarjeta;
    const endpointCasa = casa === "euroblue" ? "blue" : isEuro ? "oficial" : casa;
    
    // ArgentinaDatos lacks historical Euros. Synthesize using Dollars.
    const path = `dolares/${endpointCasa}`;

    const res = await fetch(
      `${ARGENTINADATOS_BASE}/v1/cotizaciones/${path}`,
      { next: { revalidate: REVALIDATE_HISTORICAL } }
    );

    if (!res.ok) {
      console.error(`[fetchFullDollarHistory] ${casa}: HTTP ${res.status}`);
      return [];
    }

    const data: DollarHistoryEntry[] = await res.json();

    if (!Array.isArray(data)) {
      console.error(`[fetchFullDollarHistory] ${casa}: unexpected response shape`);
      return [];
    }

    let result = data.slice(-365);

    // Synthetically scale Dollar history to generate Euro histories
    if (isEuro) {
      // Approximate EUR/USD cross rate is 1.086. Euro Tarjeta adds 60% tax.
      const multiplier = isEuroTarjeta ? 1.086 * 1.6 : 1.086;
      result = result.map((entry) => ({
        ...entry,
        compra: Number((entry.compra * multiplier).toFixed(2)),
        venta: Number((entry.venta * multiplier).toFixed(2)),
      }));
    }

    return result;
  } catch (error) {
    console.error(`[fetchFullDollarHistory] ${casa}: Network error`, error);
    return [];
  }
}

/**
 * Fetches the full riesgo pais history from ArgentinaDatos, sliced to
 * the last 365 entries.
 *
 * @returns Array of riesgo pais entries, or empty array on failure.
 */
export async function fetchRiesgoPaisHistory(): Promise<RiesgoPaisHistoryEntry[]> {
  try {
    const res = await fetch(
      `${ARGENTINADATOS_BASE}/v1/finanzas/indices/riesgo-pais`,
      { next: { revalidate: REVALIDATE_HISTORICAL } }
    );

    if (!res.ok) {
      console.error(`[fetchRiesgoPaisHistory] HTTP ${res.status}`);
      return [];
    }

    const data: RiesgoPaisHistoryEntry[] = await res.json();

    if (!Array.isArray(data)) {
      console.error("[fetchRiesgoPaisHistory] unexpected response shape");
      return [];
    }

    return data.slice(-365);
  } catch (error) {
    console.error("[fetchRiesgoPaisHistory] Network error", error);
    return [];
  }
}
