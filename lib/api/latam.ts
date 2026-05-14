import { DOLARAPI_BASE, REVALIDATE_DOLLARS } from "@/lib/constants";
import type { LatamCurrencyRate } from "@/lib/types";

// ---------------------------------------------------------------------------
// DolarAPI regional endpoints for cross-rates
// ---------------------------------------------------------------------------
const MX_API = "https://mx.dolarapi.com/v1/cotizaciones";
const CO_API = "https://co.dolarapi.com/v1/cotizaciones";
const CL_API = "https://cl.dolarapi.com/v1/cotizaciones";
const ER_API = "https://open.er-api.com/v6/latest/USD"; // Fallback for PYG/UYU

interface RegionalCotizacion {
  moneda: string;
  casa?: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

/**
 * Fetches ARS → LATAM currency rates (MXN, COP, UYU, PEN, CLP, PYG).
 * Each currency is handled **independently**: if one upstream is down,
 * the remaining currencies are still included in the response.
 *
 * Base Cross-Rate Formula:
 * ARS_per_Foreign = ARS_per_USD / Foreign_per_USD
 */
export async function fetchLatamCurrencies(): Promise<LatamCurrencyRate[]> {
  try {
    const [arsCclRes, mxRes, coRes, clRes, erRes] = await Promise.all([
      fetch(`${DOLARAPI_BASE}/v1/dolares/contadoconliqui`, {
        next: { revalidate: REVALIDATE_DOLLARS },
      }),
      fetch(MX_API, { next: { revalidate: REVALIDATE_DOLLARS } }),
      fetch(CO_API, { next: { revalidate: REVALIDATE_DOLLARS } }),
      fetch(CL_API, { next: { revalidate: REVALIDATE_DOLLARS } }),
      fetch(ER_API, { next: { revalidate: REVALIDATE_DOLLARS } }),
    ]);

    // CCL rate is the base for all cross-rates — if it fails, abort.
    if (!arsCclRes.ok) {
      console.error(
        `[fetchLatamCurrencies] CCL rate unavailable (HTTP ${arsCclRes.status}). Cannot compute cross-rates.`
      );
      return [];
    }

    const arsCcl: RegionalCotizacion = await arsCclRes.json();
    const now = new Date().toISOString();
    const currencies: LatamCurrencyRate[] = [];

    // Helper: ARS per 1 Foreign = (ARS / USD) / (Foreign / USD)
    const calcCrossRate = (arsRate: number, foreignPerUsd: number) =>
      foreignPerUsd ? arsRate / foreignPerUsd : 0;

    // 1. UYU + 6. PYG — via ExchangeRate-API (independent failure)
    if (erRes.ok) {
      try {
        const erData: { rates: Record<string, number> } = await erRes.json();

        const uyuPerUsd = erData.rates?.["UYU"];
        if (uyuPerUsd) {
          currencies.push({
            moneda: "UYU",
            nombre: "Peso Uruguayo",
            compra: calcCrossRate(arsCcl.compra, uyuPerUsd),
            venta: calcCrossRate(arsCcl.venta, uyuPerUsd),
            fechaActualizacion: arsCcl.fechaActualizacion || now,
          });
        }

        const pygPerUsd = erData.rates?.["PYG"];
        if (pygPerUsd) {
          currencies.push({
            moneda: "PYG",
            nombre: "Guaraní Paraguayo",
            compra: arsCcl.compra / pygPerUsd,
            venta: arsCcl.venta / pygPerUsd,
            fechaActualizacion: now,
          });
        }
      } catch (e) {
        console.error("[fetchLatamCurrencies] ER-API parse error:", e);
      }
    } else {
      console.error(
        `[fetchLatamCurrencies] ER-API unavailable (HTTP ${erRes.status}). UYU/PYG skipped.`
      );
    }

    // 2. MXN — via MX DolarAPI (independent failure)
    if (mxRes.ok) {
      try {
        const mxQuotes: RegionalCotizacion[] = await mxRes.json();
        const mxnUsd = mxQuotes.find((q) => q.moneda === "USD");
        if (mxnUsd) {
          currencies.push({
            moneda: "MXN",
            nombre: "Peso Mexicano",
            compra: calcCrossRate(arsCcl.compra, mxnUsd.compra),
            venta: calcCrossRate(arsCcl.venta, mxnUsd.venta),
            fechaActualizacion: mxnUsd.fechaActualizacion || now,
          });
        }
      } catch (e) {
        console.error("[fetchLatamCurrencies] MX-API parse error:", e);
      }
    } else {
      console.error(
        `[fetchLatamCurrencies] MX-API unavailable (HTTP ${mxRes.status}). MXN skipped.`
      );
    }

    // 3. COP + 4. PEN — via CO DolarAPI (independent failure, same source)
    if (coRes.ok) {
      try {
        const coQuotes: RegionalCotizacion[] = await coRes.json();
        const arsCop = coQuotes.find((q) => q.moneda === "ARS");

        if (arsCop) {
          // 1 ARS = arsCop.compra COP → 1 COP = 1 / arsCop.compra ARS
          currencies.push({
            moneda: "COP",
            nombre: "Peso Colombiano",
            compra: 1 / arsCop.compra,
            venta: 1 / arsCop.venta,
            fechaActualizacion: arsCop.fechaActualizacion || now,
          });

          const penCop = coQuotes.find((q) => q.moneda === "PEN");
          if (penCop) {
            // 1 PEN = penCop.compra COP; 1 COP = 1/arsCop.compra ARS
            // → 1 PEN = penCop.compra / arsCop.compra ARS
            currencies.push({
              moneda: "PEN",
              nombre: "Sol Peruano",
              compra: penCop.compra / arsCop.compra,
              venta: penCop.venta / arsCop.venta,
              fechaActualizacion: penCop.fechaActualizacion || now,
            });
          }
        }
      } catch (e) {
        console.error("[fetchLatamCurrencies] CO-API parse error:", e);
      }
    } else {
      console.error(
        `[fetchLatamCurrencies] CO-API unavailable (HTTP ${coRes.status}). COP/PEN skipped.`
      );
    }

    // 5. CLP — via CL DolarAPI (independent failure)
    if (clRes.ok) {
      try {
        const clQuotes: RegionalCotizacion[] = await clRes.json();
        const arsClp = clQuotes.find((q) => q.moneda === "ARS");
        if (arsClp) {
          // 1 ARS = arsClp.compra CLP → 1 CLP = 1 / arsClp.compra ARS
          currencies.push({
            moneda: "CLP",
            nombre: "Peso Chileno",
            compra: 1 / arsClp.compra,
            venta: 1 / arsClp.venta,
            fechaActualizacion: arsClp.fechaActualizacion || now,
          });
        }
      } catch (e) {
        console.error("[fetchLatamCurrencies] CL-API parse error:", e);
      }
    } else {
      console.error(
        `[fetchLatamCurrencies] CL-API unavailable (HTTP ${clRes.status}). CLP skipped.`
      );
    }

    return currencies;
  } catch (error) {
    console.error("[fetchLatamCurrencies] Network error:", error);
    return [];
  }
}
