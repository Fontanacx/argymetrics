// ---------------------------------------------------------------------------
// DolarAPI response shape (GET /v1/dolares)
// ---------------------------------------------------------------------------

export interface DollarRate {
  moneda: string;
  casa: DollarCasa;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

/** Known "casa" identifiers returned by DolarAPI */
export type DollarCasa =
  | "oficial"
  | "blue"
  | "bolsa"
  | "contadoconliqui"
  | "cripto"
  | "mayorista"
  | "tarjeta"
  | "euro"
  | "euroblue"
  | "eurotarjeta";

// ---------------------------------------------------------------------------
// ArgentinaDatos historical response (GET /v1/cotizaciones/dolares/{casa})
// ---------------------------------------------------------------------------

export interface DollarHistoryEntry {
  fecha: string;
  compra: number;
  venta: number;
  /** Present in API response but not always needed for display */
  casa?: DollarCasa;
}

// ---------------------------------------------------------------------------
// Enriched dollar data (current + history + variation)
// ---------------------------------------------------------------------------

export interface DollarWithHistory {
  /** Current rate */
  rate: DollarRate;
  /** Last 7 calendar days of data */
  history: DollarHistoryEntry[];
  /** Daily variation percentage (positive = up, negative = down, null = unavailable) */
  variacion: number | null;
}

// ---------------------------------------------------------------------------
// Indicators
// ---------------------------------------------------------------------------

export interface RiesgoPais {
  fecha: string;
  valor: number;
  /** Data origin: "criptoya" = live (~2 min lag), "argentinadatos" = fallback (~24-48 h lag) */
  source?: "criptoya" | "argentinadatos";
}

export interface InflacionMensual {
  fecha: string;
  valor: number;
}

export interface BandaCambiaria {
  piso: number;
  techo: number;
  fecha: string;
}

/** Historical entry for BCRA crawling-band data (mock/static) */
export interface BandaHistoryEntry {
  fecha: string;
  piso: number;
  techo: number;
  /** Optional official dollar rate for chart overlay */
  oficial?: number;
}

// ---------------------------------------------------------------------------
// Crypto (BTC, ETH)
// ---------------------------------------------------------------------------

export interface CryptoRate {
  valor: number;
  variacion: number;
  fecha: string;
}

export interface CryptoHistoryEntry {
  fecha: string;
  valor: number;
}

// ---------------------------------------------------------------------------
// Aggregate dashboard payload (used by Route Handlers + SWR)
// ---------------------------------------------------------------------------

export interface DollarsPayload {
  dollars: DollarWithHistory[];
  fetchedAt: string;
}

export interface IndicatorsPayload {
  riesgoPais: RiesgoPais | null;
  inflacion: InflacionMensual | null;
  bandas: BandaCambiaria;
  fetchedAt: string;
}

// ---------------------------------------------------------------------------
// Historical analytics
// ---------------------------------------------------------------------------

/** Available range presets for historical charts */
export type HistoryRange = "7d" | "30d" | "90d" | "1y";

/** Entry from the riesgo pais history endpoint */
export interface RiesgoPaisHistoryEntry {
  fecha: string;
  valor: number;
}

/** Computed statistics for a historical dataset */
export interface HistoryMetrics {
  high: number;
  low: number;
  average: number;
  /** Percentage change from first to last entry */
  changePercent: number;
}
