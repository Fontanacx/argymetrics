export const DOLARAPI_BASE = "https://dolarapi.com";
export const ARGENTINADATOS_BASE = "https://api.argentinadatos.com";
export const AMBITO_BASE = "https://mercados.ambito.com";
export const CRIPTOYA_BASE = "https://criptoya.com/api";
export const REVALIDATE_DOLLARS = 60;
export const REVALIDATE_RIESGO_PAIS = 120;
export const REVALIDATE_CRYPTO = 60;
export const REVALIDATE_WALLETS = 60;
export const REVALIDATE_INFLACION = 3600;
export const REVALIDATE_HISTORICAL = 3600;
export const REVALIDATE_STOCKS = 300;
export const REVALIDATE_INDICES = 300; // 5 minutes, same as stocks
export const REVALIDATE_INTERNATIONAL_STOCKS = 300;
export const REVALIDATE_RESERVAS = 3600;
export const BCRA_BASE = "https://api.bcra.gob.ar";

/** Las bandas se recalculan una vez por día hábil; 1 h alcanza de sobra. */
export const REVALIDATE_BANDAS = 3600;

/**
 * IDs de series diarias de la API de Estadísticas Monetarias v4.0 del BCRA
 * (`/estadisticas/v4.0/monetarias/{id}`).
 */
export const BCRA_SERIES = {
  /** Tipo de cambio mayorista de referencia (Com. A 3500). */
  mayorista: 5,
  /** Régimen de bandas cambiarias. Límite inferior. */
  bandaPiso: 1187,
  /** Régimen de bandas cambiarias. Límite superior. */
  bandaTecho: 1188,
} as const;
export const INDEC_BASE = "https://api.indec.gob.ar/v1";
export const COMPARAPIX_BASE = "https://api.comparapix.ar";

/** ComparaPix quotes refresh frequently; revalidate every 2 minutes. */
export const REVALIDATE_BRL_WALLETS = 120;

/** INDEC publica IPC, salarios, EMAE y canastas con frecuencia mensual. */
export const REVALIDATE_INDEC_MONTHLY = 21600; // 6 horas

/** Pobreza e indigencia se publican con frecuencia semestral. */
export const REVALIDATE_INDEC_SEMESTER = 86400; // 24 horas

// ---------------------------------------------------------------------------
// Synthetic exchange rate multipliers
// Update these if Argentine tax regulations change.
// ---------------------------------------------------------------------------

/**
 * Fallback multiplier for "tarjeta" variants, used only when DolarAPI's own
 * `tarjeta` / `oficial` quotes are unavailable.
 *
 * Represents the 30% percepción de Ganancias applied to card FX purchases
 * (Impuesto PAIS was abolished in December 2024, so the old 1.6 no longer
 * applies). The live factor is derived as tarjeta.venta / oficial.venta in
 * `lib/api/dollars.ts`.
 */
export const TARJETA_TAX_MULTIPLIER = 1.3;
