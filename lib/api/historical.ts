import type {
  DollarCasa,
  DollarHistoryEntry,
  DollarWithHistory,
  DollarRate,
  RiesgoPaisHistoryEntry,
} from "../types";
import {
  ARGENTINADATOS_BASE,
  AMBITO_BASE,
  REVALIDATE_HISTORICAL,
  DISPLAYED_CASAS,
  HISTORY_DAYS,
} from "@/lib/constants";
import { fetchAllDollars, fetchFxFactors } from "./dollars";
import { isFiniteNumber, parseDollarHistory, parseRiesgoPaisHistory } from "./guards";

const AMBITO_DATE_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

// ---------------------------------------------------------------------------
// Helper: Fetch Real (BRL) historical data from Ámbito
// ---------------------------------------------------------------------------

/**
 * Parses Ámbito chart rows (`[["fecha","Real"],["DD/MM/YYYY", value], ...]`)
 * into history entries, skipping the header row and any invalid row.
 */
function parseAmbitoRealRows(raw: unknown): DollarHistoryEntry[] {
  if (!Array.isArray(raw)) return [];

  const entries: DollarHistoryEntry[] = [];
  for (const row of raw.slice(1)) {
    if (!Array.isArray(row)) continue;
    const [fechaRaw, value]: unknown[] = row;
    if (typeof fechaRaw !== "string" || !isFiniteNumber(value)) continue;

    const match = AMBITO_DATE_RE.exec(fechaRaw);
    if (!match) continue;

    const [, day, month, year] = match;
    entries.push({
      fecha: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
      compra: value,
      venta: value,
    });
  }
  return entries;
}

/**
 * Fetches Real (BRL) historical price data from Ámbito's chart API.
 *
 * We transform the rows into DollarHistoryEntry[] with the same value for
 * compra and venta (Ámbito provides only the close/venta price).
 *
 * For "realblue", we apply the current Dolar Blue / Dolar Oficial gap.
 * For "realtarjeta", we apply the live tarjeta multiplier (see `fetchFxFactors`).
 *
 * @param casa - "real", "realblue", or "realtarjeta"
 * @param maxDays - Maximum number of days to return
 */
async function fetchRealHistory(
  casa: DollarCasa,
  maxDays: number
): Promise<DollarHistoryEntry[]> {
  try {
    // Pick the best Ámbito period for the requested range
    const periodo = maxDays <= 7 ? "semanal" : maxDays <= 30 ? "mensual" : "anual";

    const res = await fetch(`${AMBITO_BASE}/real/grafico/${periodo}`, {
      next: { revalidate: REVALIDATE_HISTORICAL },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ArgyMetrics/1.0)" },
    });

    if (!res.ok) {
      console.error(`[fetchRealHistory] HTTP ${res.status}`);
      return [];
    }

    const raw: unknown = await res.json();

    let entries = parseAmbitoRealRows(raw);
    if (entries.length === 0) return [];

    // Sort ascending by date and slice to requested range
    entries.sort((a, b) => a.fecha.localeCompare(b.fecha));
    entries = entries.slice(-maxDays);

    // Apply multipliers for Blue / Tarjeta
    if (casa === "realblue") {
      // Approximate cross-rate gap: Dolar Blue / Dolar Oficial. Uses current rates.
      const dollars = await fetchAllDollars();
      const dolarBlue = dollars.find((d) => d.casa === "blue");
      const dolarOficial = dollars.find((d) => d.casa === "oficial");
      if (dolarBlue && dolarOficial && dolarOficial.venta > 0) {
        const gap = dolarBlue.venta / dolarOficial.venta;
        entries = entries.map((e) => ({
          ...e,
          compra: Number((e.compra * gap).toFixed(2)),
          venta: Number((e.venta * gap).toFixed(2)),
        }));
      }
    } else if (casa === "realtarjeta") {
      const { tarjetaMultiplier } = await fetchFxFactors();
      entries = entries.map((e) => ({
        ...e,
        compra: Number((e.compra * tarjetaMultiplier).toFixed(2)),
        venta: Number((e.venta * tarjetaMultiplier).toFixed(2)),
      }));
    }

    return entries;
  } catch (error) {
    console.error("[fetchRealHistory] Network error", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Shared per-casa history fetcher (ArgentinaDatos + synthetic Euro/Real)
// ---------------------------------------------------------------------------

/**
 * Fetches the last `days` history entries for a casa.
 *
 * - Real variants come from Ámbito.
 * - Dollar variants come from ArgentinaDatos.
 * - Euro variants are synthesised by scaling the dollar history with the
 *   current EUR/USD cross implied by DolarAPI (and the tarjeta multiplier for
 *   Euro Tarjeta). If the cross is unavailable, the Euro history is omitted
 *   (`[]`) rather than showing a wrong series.
 */
async function fetchCasaHistory(
  casa: DollarCasa,
  days: number,
  label: string
): Promise<DollarHistoryEntry[]> {
  try {
    const isReal = casa === "real" || casa === "realblue" || casa === "realtarjeta";
    const isEuroTarjeta = casa === "eurotarjeta";
    const isEuro = casa === "euro" || casa === "euroblue" || isEuroTarjeta;

    // ---------- Real variants: fetch from Ámbito ----------
    if (isReal) {
      return await fetchRealHistory(casa, days);
    }

    // ---------- Dollar / Euro variants: ArgentinaDatos ----------
    // ArgentinaDatos lacks historical Euros. Synthesize using Dollars.
    const endpointCasa = casa === "euroblue" ? "blue" : isEuro ? "oficial" : casa;

    const res = await fetch(
      `${ARGENTINADATOS_BASE}/v1/cotizaciones/dolares/${endpointCasa}`,
      { next: { revalidate: REVALIDATE_HISTORICAL } }
    );

    if (!res.ok) {
      console.error(`[${label}] ${casa}: HTTP ${res.status}`);
      return [];
    }

    const data: unknown = await res.json();

    if (!Array.isArray(data)) {
      console.error(`[${label}] ${casa}: unexpected response shape`);
      return [];
    }

    // API returns ascending by date — take the last N valid entries
    const result = parseDollarHistory(data).slice(-days);

    if (!isEuro) return result;

    const { eurUsd, tarjetaMultiplier } = await fetchFxFactors();
    if (!eurUsd) {
      console.error(`[${label}] ${casa}: EUR/USD cross unavailable`);
      return [];
    }

    const extra = isEuroTarjeta ? tarjetaMultiplier : 1;
    return result.map((entry) => ({
      ...entry,
      compra: Number((entry.compra * eurUsd.compra * extra).toFixed(2)),
      venta: Number((entry.venta * eurUsd.venta * extra).toFixed(2)),
    }));
  } catch (error) {
    console.error(`[${label}] ${casa}: Network error`, error);
    return [];
  }
}

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
  return fetchCasaHistory(casa, HISTORY_DAYS, "fetchDollarHistory");
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

/**
 * Computes the daily variation by comparing the live rate (from DolarAPI)
 * against the last available historical close (from ArgentinaDatos).
 *
 * This is more reliable than computeVariation() because ArgentinaDatos
 * sometimes lags and hasn't published today's entry yet. By using the
 * live rate we know the badge will always show during market hours.
 *
 * Rules:
 * - If the last history entry's date equals today's date, we treat it as an
 *   intraday partial and compare the live rate against the *previous* entry.
 * - Falls back to computeVariation(history) when the live rate is unavailable.
 *
 * @param rate    - The current live rate from DolarAPI.
 * @param history - Historical entries sorted ascending by date.
 * @returns Percentage change (e.g. -0.7 means -0.7%), or null if unavailable.
 */
function computeVariationWithLive(
  rate: DollarRate,
  history: DollarHistoryEntry[]
): number | null {
  if (rate.venta > 0 && history.length >= 1) {
    const today = new Date().toISOString().slice(0, 10);
    const lastEntry = history[history.length - 1];
    // If today's entry is already in history, compare against day before it
    const refEntry =
      lastEntry.fecha === today && history.length >= 2
        ? history[history.length - 2]
        : lastEntry;

    if (typeof refEntry.venta === "number" && refEntry.venta > 0) {
      const variation = ((rate.venta - refEntry.venta) / refEntry.venta) * 100;
      if (Number.isFinite(variation)) {
        return Math.round(variation * 100) / 100;
      }
    }
  }
  // Fallback: pure historical comparison
  return computeVariation(history);
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
      variacion: computeVariationWithLive(rate, history),
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
  return fetchCasaHistory(casa, 365, "fetchFullDollarHistory");
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

    const data: unknown = await res.json();

    if (!Array.isArray(data)) {
      console.error("[fetchRiesgoPaisHistory] unexpected response shape");
      return [];
    }

    return parseRiesgoPaisHistory(data).slice(-365);
  } catch (error) {
    console.error("[fetchRiesgoPaisHistory] Network error", error);
    return [];
  }
}
