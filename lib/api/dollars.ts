import type { DollarRate, DollarCasa, DollarQuote, FxFactors } from "../types";
import {
  DOLARAPI_BASE,
  REVALIDATE_DOLLARS,
  DISPLAYED_CASAS,
  TARJETA_TAX_MULTIPLIER,
} from "@/lib/constants";
import { parseDollarQuote, parseDollarRate, parseDollarRates } from "./guards";

const round2 = (value: number): number => Number(value.toFixed(2));

// ---------------------------------------------------------------------------
// Low-level DolarAPI fetchers (validated, never throw)
// ---------------------------------------------------------------------------

/** GET /v1/dolares — returns `null` on HTTP/network failure, `[]` on a bad payload. */
async function fetchDolaresList(): Promise<DollarRate[] | null> {
  try {
    const res = await fetch(`${DOLARAPI_BASE}/v1/dolares`, {
      next: { revalidate: REVALIDATE_DOLLARS },
    });

    if (!res.ok) {
      console.error(`[fetchAllDollars] HTTP ${res.status}: ${res.statusText}`);
      return null;
    }

    const data: unknown = await res.json();
    return parseDollarRates(data);
  } catch (error) {
    console.error("[fetchAllDollars] Network error:", error);
    return null;
  }
}

/** GET /v1/cotizaciones/{code} (eur, brl, ...) — `null` when unavailable or invalid. */
async function fetchCotizacion(code: "eur" | "brl"): Promise<DollarQuote | null> {
  try {
    const res = await fetch(`${DOLARAPI_BASE}/v1/cotizaciones/${code}`, {
      next: { revalidate: REVALIDATE_DOLLARS },
    });

    if (!res.ok) {
      console.error(`[fetchCotizacion] ${code}: HTTP ${res.status}`);
      return null;
    }

    const data: unknown = await res.json();
    const quote = parseDollarQuote(data);
    if (!quote) console.error(`[fetchCotizacion] ${code}: unexpected response shape`);
    return quote;
  } catch (error) {
    console.error(`[fetchCotizacion] ${code}: Network error`, error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Synthetic-rate factors
// ---------------------------------------------------------------------------

/**
 * Tarjeta multiplier derived from DolarAPI's own quotes
 * (`tarjeta.venta / oficial.venta`). Falls back to `TARJETA_TAX_MULTIPLIER`
 * (30% percepción de Ganancias) when either casa is missing or invalid.
 */
function computeTarjetaMultiplier(dolares: DollarRate[]): number {
  const tarjeta = dolares.find((d) => d.casa === "tarjeta");
  const oficial = dolares.find((d) => d.casa === "oficial");
  if (tarjeta && oficial && tarjeta.venta > 0 && oficial.venta > 0) {
    return tarjeta.venta / oficial.venta;
  }
  return TARJETA_TAX_MULTIPLIER;
}

/** Midpoint of a quote, or `null` when either side is not positive. */
function midpoint(quote: { compra: number; venta: number }): number | null {
  return quote.compra > 0 && quote.venta > 0 ? (quote.compra + quote.venta) / 2 : null;
}

/**
 * US dollars per unit of a foreign currency (EUR, BRL), implied by DolarAPI.
 *
 * DolarAPI's EUR/BRL quotes are wholesale BCRA references with an almost null
 * spread, so they are compared against the wholesale dollar (mayorista), using
 * midpoints. Dividing compra by compra and venta by venta against the retail
 * oficial (≈3% spread) inverted the synthetic Blue quotes (compra > venta).
 * Falls back to the oficial midpoint when mayorista is missing.
 */
function computeUsdCross(dolares: DollarRate[], quote: DollarQuote | null): number | null {
  if (!quote) return null;
  const foreignMid = midpoint(quote);
  const mayorista = dolares.find((d) => d.casa === "mayorista");
  const oficial = dolares.find((d) => d.casa === "oficial");
  const usdMid = (mayorista && midpoint(mayorista)) ?? (oficial && midpoint(oficial)) ?? null;
  if (foreignMid === null || usdMid === null) return null;
  return foreignMid / usdMid;
}

/**
 * Fetches the live tarjeta multiplier used to synthesise tarjeta histories.
 * The request shares URL and revalidation with `fetchAllDollars`, so Next.js
 * dedupes it within a render.
 */
export async function fetchFxFactors(): Promise<FxFactors> {
  const dolares = await fetchDolaresList();
  return { tarjetaMultiplier: computeTarjetaMultiplier(dolares ?? []) };
}

// ---------------------------------------------------------------------------
// Fetch all dollar rates from DolarAPI
// ---------------------------------------------------------------------------

/**
 * Fetches current exchange rates for all dollar types from DolarAPI.
 *
 * Returns only the casas configured in `DISPLAYED_CASAS`, filtering out
 * any other types not shown on the dashboard. Euro and Real variants are
 * synthesised from DolarAPI's own cross quotes:
 * - Tarjeta variants use `tarjeta.venta / oficial.venta` (fallback 1.30).
 * - Euro Blue / Real Blue = (USD per EUR/BRL) × dólar blue compra/venta, so
 *   they keep the blue spread. Omitted when the cross is unavailable.
 *
 * Uses Next.js `fetch` with `revalidate` for server-side ISR caching.
 * On network or HTTP errors, returns an empty array so the UI can
 * render gracefully with a "no data" state.
 */
export async function fetchAllDollars(): Promise<DollarRate[]> {
  try {
    const [dolares, euroQuote, realQuote] = await Promise.all([
      fetchDolaresList(),
      fetchCotizacion("eur"),
      fetchCotizacion("brl"),
    ]);

    if (!dolares) return [];

    const rates: DollarRate[] = [...dolares];
    const tarjetaMultiplier = computeTarjetaMultiplier(dolares);
    const dolarBlue = dolares.find((d) => d.casa === "blue");

    // Euro Oficial + Euro Tarjeta
    if (euroQuote) {
      rates.push({ ...euroQuote, casa: "euro", nombre: "Euro Oficial" });
      rates.push({
        ...euroQuote,
        casa: "eurotarjeta",
        nombre: "Euro Tarjeta",
        compra: round2(euroQuote.compra * tarjetaMultiplier),
        venta: round2(euroQuote.venta * tarjetaMultiplier),
      });
    }

    // Euro Blue = (USD per EUR) × USD blue, only with real euro data.
    const eurUsd = computeUsdCross(dolares, euroQuote);
    if (euroQuote && dolarBlue && eurUsd !== null) {
      rates.push({
        ...euroQuote,
        casa: "euroblue",
        nombre: "Euro Blue",
        compra: round2(eurUsd * dolarBlue.compra),
        venta: round2(eurUsd * dolarBlue.venta),
        fechaActualizacion: dolarBlue.fechaActualizacion,
      });
    }

    // Real Oficial + Real Blue + Real Tarjeta
    if (realQuote) {
      rates.push({ ...realQuote, casa: "real", nombre: "Real Oficial" });

      // Real Blue = (USD per BRL) × USD blue
      const brlUsd = computeUsdCross(dolares, realQuote);
      if (dolarBlue && brlUsd !== null) {
        rates.push({
          ...realQuote,
          casa: "realblue",
          nombre: "Real Blue",
          compra: round2(brlUsd * dolarBlue.compra),
          venta: round2(brlUsd * dolarBlue.venta),
          fechaActualizacion: dolarBlue.fechaActualizacion,
        });
      }

      rates.push({
        ...realQuote,
        casa: "realtarjeta",
        nombre: "Real Tarjeta",
        compra: round2(realQuote.compra * tarjetaMultiplier),
        venta: round2(realQuote.venta * tarjetaMultiplier),
      });
    }

    // Filter only the casas configured to be displayed
    return rates.filter((rate) => DISPLAYED_CASAS.includes(rate.casa));
  } catch (error) {
    console.error("[fetchAllDollars] Unexpected error:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Fetch a single dollar rate
// ---------------------------------------------------------------------------

/**
 * Fetches the current exchange rate for a single dollar type.
 *
 * @param casa - The dollar type identifier (e.g. "oficial", "blue").
 * @returns The rate object, or `null` if the request fails.
 */
export async function fetchDollar(casa: DollarCasa): Promise<DollarRate | null> {
  try {
    const res = await fetch(`${DOLARAPI_BASE}/v1/dolares/${casa}`, {
      next: { revalidate: REVALIDATE_DOLLARS },
    });

    if (!res.ok) return null;

    const data: unknown = await res.json();
    return parseDollarRate(data);
  } catch {
    return null;
  }
}
