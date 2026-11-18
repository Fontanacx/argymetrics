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

/**
 * EUR/USD cross implied by DolarAPI: euro oficial / dólar oficial, computed
 * separately for compra and venta. `null` when any input is missing or <= 0.
 */
function computeEurUsd(
  dolares: DollarRate[],
  euro: DollarQuote | null
): FxFactors["eurUsd"] {
  const oficial = dolares.find((d) => d.casa === "oficial");
  if (
    !euro ||
    !oficial ||
    euro.compra <= 0 ||
    euro.venta <= 0 ||
    oficial.compra <= 0 ||
    oficial.venta <= 0
  ) {
    return null;
  }
  return { compra: euro.compra / oficial.compra, venta: euro.venta / oficial.venta };
}

/**
 * Fetches the live factors used to synthesise Euro/Real variants and their
 * histories. Requests share URLs and revalidation with `fetchAllDollars`, so
 * Next.js dedupes them within a render.
 */
export async function fetchFxFactors(): Promise<FxFactors> {
  const [dolares, euro] = await Promise.all([fetchDolaresList(), fetchCotizacion("eur")]);
  const list = dolares ?? [];
  return {
    tarjetaMultiplier: computeTarjetaMultiplier(list),
    eurUsd: computeEurUsd(list, euro),
  };
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
 * - Euro Blue / Real Blue = (foreign oficial / dólar oficial) × dólar blue.
 *   Euro Blue is omitted when the euro quote is unavailable.
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
    const dolarOficial = dolares.find((d) => d.casa === "oficial");

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

    // Euro Blue = (EUR oficial / USD oficial) × USD blue, only with real euro data.
    const eurUsd = computeEurUsd(dolares, euroQuote);
    if (euroQuote && dolarBlue && eurUsd) {
      rates.push({
        ...euroQuote,
        casa: "euroblue",
        nombre: "Euro Blue",
        compra: round2(eurUsd.compra * dolarBlue.compra),
        venta: round2(eurUsd.venta * dolarBlue.venta),
        fechaActualizacion: dolarBlue.fechaActualizacion,
      });
    }

    // Real Oficial + Real Blue + Real Tarjeta
    if (realQuote) {
      rates.push({ ...realQuote, casa: "real", nombre: "Real Oficial" });

      // Real Blue via cross-rate: BRL/USD = Real_ARS / Dolar_ARS, then × Dolar Blue
      if (dolarBlue && dolarOficial && dolarOficial.compra > 0 && dolarOficial.venta > 0) {
        const brlUsdCompra = realQuote.compra / dolarOficial.compra;
        const brlUsdVenta = realQuote.venta / dolarOficial.venta;
        rates.push({
          ...realQuote,
          casa: "realblue",
          nombre: "Real Blue",
          compra: round2(brlUsdCompra * dolarBlue.compra),
          venta: round2(brlUsdVenta * dolarBlue.venta),
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
