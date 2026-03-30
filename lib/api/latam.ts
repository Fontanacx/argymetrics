import { DOLARAPI_BASE, REVALIDATE_DOLLARS } from "@/lib/constants";
import type { LatamCurrencyRate } from "@/lib/types";

// DolarAPI regional endpoints for cross-rates
const MX_API = "https://mx.dolarapi.com/v1/cotizaciones";
const CO_API = "https://co.dolarapi.com/v1/cotizaciones";
const CL_API = "https://cl.dolarapi.com/v1/cotizaciones";
const ER_API = "https://open.er-api.com/v6/latest/USD"; // Fallback for unsupported LATAM currencies like PYG

interface RegionalCotizacion {
  moneda: string;
  casa?: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

/**
 * Fetches ARS → LATAM currency rates (MXN, COP, UYU, PEN).
 * Since Argentina's DolarAPI only provides UYU natively, we calculate
 * cross-rates for MXN, COP, and PEN using regional DolarAPI endpoints.
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
      fetch(MX_API, {
        next: { revalidate: REVALIDATE_DOLLARS },
      }),
      fetch(CO_API, {
        next: { revalidate: REVALIDATE_DOLLARS },
      }),
      fetch(CL_API, {
        next: { revalidate: REVALIDATE_DOLLARS },
      }),
      fetch(ER_API, {
        next: { revalidate: REVALIDATE_DOLLARS },
      }),
    ]);

    if (!arsCclRes.ok || !mxRes.ok || !coRes.ok || !clRes.ok || !erRes.ok) {
      console.error(
        `[fetchLatamCurrencies] HTTP error. CCL: ${arsCclRes.status}, MX: ${mxRes.status}, CO: ${coRes.status}, CL: ${clRes.status}, ER: ${erRes.status}`
      );
      return [];
    }

    const [arsCcl, mxQuotes, coQuotes, clQuotes, erData] = await Promise.all([
      arsCclRes.json() as Promise<RegionalCotizacion>,
      mxRes.json() as Promise<RegionalCotizacion[]>,
      coRes.json() as Promise<RegionalCotizacion[]>,
      clRes.json() as Promise<RegionalCotizacion[]>,
      erRes.json() as Promise<{ rates: Record<string, number> }>,
    ]);

    const currencies: LatamCurrencyRate[] = [];
    const now = new Date().toISOString();

    // Base cross-rate function (for MXN): ARS per 1 Foreign = (ARS / USD) / (Foreign / USD)
    const calcCrossRate = (arsRate: number, foreignPerUsd: number) => {
      if (!foreignPerUsd) return 0;
      return arsRate / foreignPerUsd;
    };

    // 1. UYU (Cross-rate via ER-API + CCL)
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

    // 2. MXN (Cross-rate via USD + CCL)
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

    // For COP and PEN, the CO API provides an ARS quote directly (1 ARS = X COP).
    // This provides a strictly accurate relative price.
    const arsCop = coQuotes.find((q) => q.moneda === "ARS");

    // 3. COP (Direct via ARS cross-rate)
    if (arsCop) {
      // If 1 ARS = arsCop.compra COP
      // Then 1 COP = 1 / arsCop.compra ARS.
      currencies.push({
        moneda: "COP",
        nombre: "Peso Colombiano",
        compra: 1 / arsCop.compra,
        venta: 1 / arsCop.venta,
        fechaActualizacion: arsCop.fechaActualizacion || now,
      });
    }

    // 4. PEN (Cross-rate using ARS logic)
    const penCop = coQuotes.find((q) => q.moneda === "PEN");
    if (arsCop && penCop) {
      // 1 PEN = penCop.compra COP
      // 1 COP = 1 / arsCop.compra ARS
      // Therefore: 1 PEN = penCop.compra / arsCop.compra ARS
      currencies.push({
        moneda: "PEN",
        nombre: "Sol Peruano",
        compra: penCop.compra / arsCop.compra,
        venta: penCop.venta / arsCop.venta,
        fechaActualizacion: penCop.fechaActualizacion || now,
      });
    }

    // 5. CLP (Direct via ARS cross-rate from CL API)
    const arsClp = clQuotes.find((q) => q.moneda === "ARS");
    if (arsClp) {
      // 1 ARS = arsClp.compra CLP
      // Then 1 CLP = 1 / arsClp.compra ARS
      currencies.push({
        moneda: "CLP",
        nombre: "Peso Chileno",
        compra: 1 / arsClp.compra,
        venta: 1 / arsClp.venta,
        fechaActualizacion: arsClp.fechaActualizacion || now,
      });
    }

    // 6. PYG (Guaraní Paraguayo via ExchangeRate-API cross-rate)
    // ER-API provides: 1 USD = X PYG. DolarAPI provides: 1 USD = Y ARS (CCL).
    // So 1 PYG = Y / X ARS.
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

    return currencies;
  } catch (error) {
    console.error("[fetchLatamCurrencies] Network error:", error);
    return [];
  }
}
