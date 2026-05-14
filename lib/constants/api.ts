export const DOLARAPI_BASE = "https://dolarapi.com";
export const ARGENTINADATOS_BASE = "https://api.argentinadatos.com";
export const AMBITO_BASE = "https://mercados.ambito.com";
export const CRIPTOYA_BASE = "https://criptoya.com/api";
export const REVALIDATE_DOLLARS = 0;
export const REVALIDATE_RIESGO_PAIS = 120;
export const REVALIDATE_CRYPTO = 60;
export const REVALIDATE_INFLACION = 3600;
export const REVALIDATE_HISTORICAL = 3600;
export const REVALIDATE_STOCKS = 300;
export const REVALIDATE_INDICES = 300; // 5 minutes, same as stocks

// ---------------------------------------------------------------------------
// Synthetic exchange rate multipliers
// Update these if Argentine tax regulations change.
// ---------------------------------------------------------------------------

/** Approximate EUR/USD cross rate used to synthesise Euro Blue prices. */
export const EUR_USD_CROSS_RATE = 1.086;

/**
 * Tax multiplier for "tarjeta" variants.
 * Represents Argentina's Impuesto PAIS (30%) + Ganancias (30%) on card FX.
 */
export const TARJETA_TAX_MULTIPLIER = 1.6;
