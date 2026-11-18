import type {
  BcraFxPoint,
  DollarCasa,
  DollarHistoryEntry,
  DollarWithHistory,
  DollarRate,
  RiesgoPaisHistoryEntry,
} from "../types";
import {
  ARGENTINADATOS_BASE,
  BCRA_BASE,
  REVALIDATE_HISTORICAL,
  DISPLAYED_CASAS,
  HISTORY_DAYS,
} from "@/lib/constants";
import { todayBuenosAiresISO } from "@/lib/utils/bandas";
import { fetchAllDollars, fetchFxFactors } from "./dollars";
import { isFiniteNumber, isRecord, parseDollarHistory, parseRiesgoPaisHistory } from "./guards";

const round2 = (value: number): number => Number(value.toFixed(2));

// ---------------------------------------------------------------------------
// Low-level history sources
// ---------------------------------------------------------------------------

/**
 * Full daily history of a dollar casa from ArgentinaDatos, ascending by date.
 * Returns `[]` on HTTP/network failure or an unexpected payload.
 */
async function fetchArgentinaDatosHistory(
  endpointCasa: string,
  label: string
): Promise<DollarHistoryEntry[]> {
  try {
    const res = await fetch(
      `${ARGENTINADATOS_BASE}/v1/cotizaciones/dolares/${endpointCasa}`,
      { next: { revalidate: REVALIDATE_HISTORICAL } }
    );

    if (!res.ok) {
      console.error(`[${label}] ${endpointCasa}: HTTP ${res.status}`);
      return [];
    }

    const data: unknown = await res.json();
    if (!Array.isArray(data)) {
      console.error(`[${label}] ${endpointCasa}: unexpected response shape`);
      return [];
    }

    return parseDollarHistory(data);
  } catch (error) {
    console.error(`[${label}] ${endpointCasa}: Network error`, error);
    return [];
  }
}

/**
 * Daily BCRA quotes for a foreign currency
 * (`/estadisticascambiarias/v1.0/Cotizaciones/{code}`), ascending by date.
 *
 * Covers at least the last `days` business days. Returns `[]` on failure.
 */
async function fetchBcraFxHistory(
  code: "EUR" | "BRL",
  days: number,
  label: string
): Promise<BcraFxPoint[]> {
  try {
    const hasta = todayBuenosAiresISO();
    // Business days → calendar days, plus a margin for holidays.
    const calendarDays = Math.ceil((days * 7) / 5) + 20;
    const desde = new Date(Date.parse(`${hasta}T00:00:00Z`) - calendarDays * 86_400_000)
      .toISOString()
      .slice(0, 10);

    const res = await fetch(
      `${BCRA_BASE}/estadisticascambiarias/v1.0/Cotizaciones/${code}?fechadesde=${desde}&fechahasta=${hasta}&limit=1000`,
      { next: { revalidate: REVALIDATE_HISTORICAL } }
    );

    if (!res.ok) {
      console.error(`[${label}] BCRA ${code}: HTTP ${res.status}`);
      return [];
    }

    const body: unknown = await res.json();
    if (!isRecord(body) || body.status !== 200 || !Array.isArray(body.results)) {
      console.error(`[${label}] BCRA ${code}: unexpected response shape`);
      return [];
    }

    const points: BcraFxPoint[] = [];
    for (const day of body.results) {
      if (!isRecord(day) || typeof day.fecha !== "string" || !Array.isArray(day.detalle)) continue;
      const quote: unknown = day.detalle.find(
        (d: unknown) => isRecord(d) && d.codigoMoneda === code
      );
      if (!isRecord(quote)) continue;
      const { tipoCotizacion, tipoPase } = quote;
      if (isFiniteNumber(tipoCotizacion) && tipoCotizacion > 0 && isFiniteNumber(tipoPase) && tipoPase > 0) {
        points.push({ fecha: day.fecha, cotizacion: tipoCotizacion, pase: tipoPase });
      }
    }

    // The API returns the most recent day first.
    return points.sort((a, b) => a.fecha.localeCompare(b.fecha));
  } catch (error) {
    console.error(`[${label}] BCRA ${code}: Network error`, error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Euro / Real histories (BCRA official quotes)
// ---------------------------------------------------------------------------

type ForeignVariant = "oficial" | "blue" | "tarjeta";

const FOREIGN_CASAS: Partial<Record<DollarCasa, { code: "EUR" | "BRL"; variant: ForeignVariant }>> = {
  euro: { code: "EUR", variant: "oficial" },
  euroblue: { code: "EUR", variant: "blue" },
  eurotarjeta: { code: "EUR", variant: "tarjeta" },
  real: { code: "BRL", variant: "oficial" },
  realblue: { code: "BRL", variant: "blue" },
  realtarjeta: { code: "BRL", variant: "tarjeta" },
};

/**
 * History for the Euro / Real casas, built from the BCRA daily quotes:
 * - oficial: `tipoCotizacion` (same reference DolarAPI serves live).
 * - tarjeta: oficial × live tarjeta multiplier.
 * - blue: that day's USD-per-unit cross (`tipoPase`) × that day's dólar blue
 *   compra/venta from ArgentinaDatos, so the blue spread is preserved.
 */
async function fetchForeignHistory(
  code: "EUR" | "BRL",
  variant: ForeignVariant,
  days: number,
  label: string
): Promise<DollarHistoryEntry[]> {
  const fx = await fetchBcraFxHistory(code, days, label);
  if (fx.length === 0) return [];

  if (variant === "blue") {
    const blue = await fetchArgentinaDatosHistory("blue", label);
    const blueByDate = new Map(blue.map((e) => [e.fecha, e]));
    const entries: DollarHistoryEntry[] = [];
    for (const point of fx) {
      const b = blueByDate.get(point.fecha);
      if (!b) continue;
      entries.push({
        fecha: point.fecha,
        compra: round2(point.pase * b.compra),
        venta: round2(point.pase * b.venta),
      });
    }
    return entries.slice(-days);
  }

  const multiplier = variant === "tarjeta" ? (await fetchFxFactors()).tarjetaMultiplier : 1;
  return fx.slice(-days).map((point) => {
    const value = round2(point.cotizacion * multiplier);
    return { fecha: point.fecha, compra: value, venta: value };
  });
}

// ---------------------------------------------------------------------------
// Shared per-casa history fetcher
// ---------------------------------------------------------------------------

/**
 * Fetches the last `days` history entries for a casa.
 *
 * - Euro / Real variants come from the BCRA official quotes (see
 *   `fetchForeignHistory`).
 * - Dollar variants come from ArgentinaDatos.
 */
async function fetchCasaHistory(
  casa: DollarCasa,
  days: number,
  label: string
): Promise<DollarHistoryEntry[]> {
  const foreign = FOREIGN_CASAS[casa];
  if (foreign) {
    return fetchForeignHistory(foreign.code, foreign.variant, days, label);
  }

  // API returns ascending by date — take the last N valid entries
  const history = await fetchArgentinaDatosHistory(casa, label);
  return history.slice(-days);
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
    // Argentine calendar day: after 21:00 ART the UTC date is already tomorrow,
    // which made the badge compare the live rate against today's own close.
    const today = todayBuenosAiresISO();
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
