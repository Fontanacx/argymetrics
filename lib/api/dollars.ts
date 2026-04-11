import type { DollarRate, DollarCasa } from "../types";
import { DOLARAPI_BASE, REVALIDATE_DOLLARS, DISPLAYED_CASAS, EUR_USD_CROSS_RATE, TARJETA_TAX_MULTIPLIER } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Fetch all dollar rates from DolarAPI
// ---------------------------------------------------------------------------

/**
 * Fetches current exchange rates for all dollar types from DolarAPI.
 *
 * Returns only the casas configured in `DISPLAYED_CASAS`, filtering out
 * mayorista, tarjeta, and any other types not shown on the dashboard.
 *
 * Uses Next.js `fetch` with `revalidate` for server-side ISR caching.
 * On network or HTTP errors, returns an empty array so the UI can
 * render gracefully with a "no data" state.
 */
export async function fetchAllDollars(): Promise<DollarRate[]> {
  try {
    const [dolaresRes, euroOficialRes, realOficialRes] = await Promise.all([
      fetch(`${DOLARAPI_BASE}/v1/dolares`, { next: { revalidate: REVALIDATE_DOLLARS } }),
      fetch(`${DOLARAPI_BASE}/v1/cotizaciones/eur`, { next: { revalidate: REVALIDATE_DOLLARS } }),
      fetch(`${DOLARAPI_BASE}/v1/cotizaciones/brl`, { next: { revalidate: REVALIDATE_DOLLARS } }),
    ]);

    if (!dolaresRes.ok) {
      console.error(`[fetchAllDollars] HTTP ${dolaresRes.status}: ${dolaresRes.statusText}`);
      return [];
    }

    const dolaresData: DollarRate[] = await dolaresRes.json();
    
    // Add Euro and synthetically compute Euro Tarjeta if available
    if (euroOficialRes.ok) {
      const euroOficialRaw = await euroOficialRes.json();
      
      const euroData = {
        ...euroOficialRaw,
        casa: "euro",
        nombre: "Euro Oficial"
      };
      dolaresData.push(euroData);

      const euroTarjetaData = {
        ...euroOficialRaw,
        casa: "eurotarjeta",
        nombre: "Euro Tarjeta",
        compra: Number((euroOficialRaw.compra * TARJETA_TAX_MULTIPLIER).toFixed(2)),
        venta: Number((euroOficialRaw.venta * TARJETA_TAX_MULTIPLIER).toFixed(2)),
      };
      dolaresData.push(euroTarjetaData);
    }

    // Synthesize Euro Blue from Dolar Blue (since DolarAPI lacks an endpoint)
    const dolarBlue = dolaresData.find((d) => d.casa === "blue");
    const dolarOficial = dolaresData.find((d) => d.casa === "oficial");
    if (dolarBlue) {
      dolaresData.push({
        ...dolarBlue,
        casa: "euroblue",
        nombre: "Euro Blue",
        compra: Number((dolarBlue.compra * EUR_USD_CROSS_RATE).toFixed(2)),
        venta: Number((dolarBlue.venta * EUR_USD_CROSS_RATE).toFixed(2)),
      });
    }

    // Add Real Oficial and synthetically compute Real Blue + Real Tarjeta
    if (realOficialRes && realOficialRes.ok) {
      const realRaw = await realOficialRes.json();
      
      dolaresData.push({
        ...realRaw,
        casa: "real",
        nombre: "Real Oficial",
      });

      // Real Blue via cross-rate: BRL/USD = Real_ARS / Dolar_ARS, then × Dolar Blue
      if (dolarBlue && dolarOficial && dolarOficial.compra > 0 && dolarOficial.venta > 0) {
        const brlUsdCompra = realRaw.compra / dolarOficial.compra;
        const brlUsdVenta = realRaw.venta / dolarOficial.venta;
        dolaresData.push({
          ...realRaw,
          casa: "realblue",
          nombre: "Real Blue",
          compra: Number((brlUsdCompra * dolarBlue.compra).toFixed(2)),
          venta: Number((brlUsdVenta * dolarBlue.venta).toFixed(2)),
        });
      }

      // Real Tarjeta = Real Oficial × TARJETA_TAX_MULTIPLIER (PAIS + Ganancias taxes)
      dolaresData.push({
        ...realRaw,
        casa: "realtarjeta",
        nombre: "Real Tarjeta",
        compra: Number((realRaw.compra * TARJETA_TAX_MULTIPLIER).toFixed(2)),
        venta: Number((realRaw.venta * TARJETA_TAX_MULTIPLIER).toFixed(2)),
      });
    }

    // Filter only the casas configured to be displayed
    return dolaresData.filter((rate) => DISPLAYED_CASAS.includes(rate.casa as DollarCasa));
  } catch (error) {
    console.error("[fetchAllDollars] Network error:", error);
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

    return await res.json();
  } catch {
    return null;
  }
}
