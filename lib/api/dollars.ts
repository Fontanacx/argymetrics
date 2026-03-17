import type { DollarRate, DollarCasa } from "../types";
import { DOLARAPI_BASE, REVALIDATE_DOLLARS, DISPLAYED_CASAS } from "../constants";

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
    const [dolaresRes, euroOficialRes] = await Promise.all([
      fetch(`${DOLARAPI_BASE}/v1/dolares`, { next: { revalidate: REVALIDATE_DOLLARS } }),
      fetch(`${DOLARAPI_BASE}/v1/cotizaciones/eur`, { next: { revalidate: REVALIDATE_DOLLARS } }),
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
        compra: Number((euroOficialRaw.compra * 1.6).toFixed(2)),
        venta: Number((euroOficialRaw.venta * 1.6).toFixed(2)),
      };
      dolaresData.push(euroTarjetaData);
    }

    // Synthesize Euro Blue from Dolar Blue (since DolarAPI lacks an endpoint)
    const dolarBlue = dolaresData.find((d) => d.casa === "blue");
    if (dolarBlue) {
      dolaresData.push({
        ...dolarBlue,
        casa: "euroblue",
        nombre: "Euro Blue",
        compra: Number((dolarBlue.compra * 1.086).toFixed(2)),
        venta: Number((dolarBlue.venta * 1.086).toFixed(2)),
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
