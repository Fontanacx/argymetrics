import { DOLARAPI_BASE, REVALIDATE_DOLLARS } from "@/lib/constants";
import type { LatamCurrencyRate } from "@/lib/types";

// DolarAPI regional endpoints for cross-rates
const MX_API = "https://mx.dolarapi.com/v1/cotizaciones";
const CO_API = "https://co.dolarapi.com/v1/cotizaciones";

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
    const [arsOficialRes, uyuRes, mxRes, coRes] = await Promise.all([
      fetch(`${DOLARAPI_BASE}/v1/dolares/oficial`, {
        next: { revalidate: REVALIDATE_DOLLARS },
      }),
      fetch(`${DOLARAPI_BASE}/v1/cotizaciones/uyu`, {
        next: { revalidate: REVALIDATE_DOLLARS },
      }),
      fetch(MX_API, {
        next: { revalidate: REVALIDATE_DOLLARS },
      }),
      fetch(CO_API, {
        next: { revalidate: REVALIDATE_DOLLARS },
      }),
    ]);

    if (!arsOficialRes.ok || !uyuRes.ok || !mxRes.ok || !coRes.ok) {
      console.error(
        `[fetchLatamCurrencies] HTTP error. ARS: ${arsOficialRes.status}, UYU: ${uyuRes.status}, MX: ${mxRes.status}, CO: ${coRes.status}`
      );
      return [];
    }

    const [arsOficial, uyuNative, mxQuotes, coQuotes] = await Promise.all([
      arsOficialRes.json() as Promise<RegionalCotizacion>,
      uyuRes.json() as Promise<RegionalCotizacion>,
      mxRes.json() as Promise<RegionalCotizacion[]>,
      coRes.json() as Promise<RegionalCotizacion[]>,
    ]);

    const currencies: LatamCurrencyRate[] = [];
    const now = new Date().toISOString();

    // Base cross-rate function (for MXN): ARS per 1 Foreign = (ARS / USD) / (Foreign / USD)
    const calcCrossRate = (arsRate: number, foreignPerUsd: number) => {
      if (!foreignPerUsd) return 0;
      return arsRate / foreignPerUsd;
    };

    // 1. UYU (Native ARS per UYU)
    if (uyuNative.moneda === "UYU") {
      currencies.push({
        moneda: "UYU",
        nombre: "Peso Uruguayo",
        compra: uyuNative.compra,
        venta: uyuNative.venta,
        fechaActualizacion: uyuNative.fechaActualizacion || now,
      });
    }

    // 2. MXN (Cross-rate via USD)
    const mxnUsd = mxQuotes.find((q) => q.moneda === "USD");
    if (mxnUsd) {
      currencies.push({
        moneda: "MXN",
        nombre: "Peso Mexicano",
        compra: calcCrossRate(arsOficial.compra, mxnUsd.compra),
        venta: calcCrossRate(arsOficial.venta, mxnUsd.venta),
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

    return currencies;
  } catch (error) {
    console.error("[fetchLatamCurrencies] Network error:", error);
    return [];
  }
}
