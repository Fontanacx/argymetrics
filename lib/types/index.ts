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
  | "eurotarjeta"
  | "astropay"
  | "cocos"
  | "lemoncash"
  | "belo"
  | "buenbit"
  | "real"
  | "realblue"
  | "realtarjeta";

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

// ---------------------------------------------------------------------------
// Stocks
// ---------------------------------------------------------------------------

export interface StockData {
  symbol: string;           // e.g. "GGAL.BA"
  name: string;             // e.g. "Grupo Galicia"
  price: number;            // current price in ARS
  variation: number | null; // daily % change
  high: number;
  low: number;
  volume: number;
  history: StockHistoryEntry[]; // last 30 days for sparkline + modal
  updatedAt: string; // ISO date string of last known update
}

export interface StockHistoryEntry {
  fecha: string; // ISO date string "YYYY-MM-DD"
  valor: number; // closing price
}

// ---------------------------------------------------------------------------
// Market Indices (Merval, S&P 500, Nasdaq, Dow Jones)
// ---------------------------------------------------------------------------

export interface MarketIndex {
  symbol: string;           // e.g. "^MERV"
  name: string;             // e.g. "S&P Merval"
  value: number;            // current index value in points
  variation: number | null; // daily % change
  high: number;             // day high
  low: number;              // day low
  currency: "ARS" | "USD";  // display currency
  history: MarketIndexHistoryEntry[];
  updatedAt: string;        // ISO date string
}

export interface MarketIndexHistoryEntry {
  fecha: string;  // "YYYY-MM-DD"
  valor: number;  // closing value
}

// ---------------------------------------------------------------------------
// Daily Insights Briefing Types
// ---------------------------------------------------------------------------

export interface BriefingInput {
  date: string;                        // today formatted as "lunes 24 de marzo de 2026"
  blue: { value: number; variation: number | null };
  oficial: { value: number; variation: number | null };
  mep: { value: number; variation: number | null };
  ccl: { value: number; variation: number | null };
  cripto: { value: number; variation: number | null };
  brechaBlueOficial: number;           // percentage
  brechaBlueYesterday: number | null;  // to compare direction
  riesgoPais: { value: number; weeklyChange: number | null };
  inflacion: { value: number; date: string };
  gold: { value: number; variation: number | null };
  brent: { value: number; variation: number | null };
  stocks: {
    symbol: string;
    name: string;
    variation: number | null;
  }[];
  stocksEnVerde: number;   // count of stocks with positive variation
  stocksEnRojo: number;    // count of stocks with negative variation
  mep7dAverage: number | null; // 7-day average of MEP for freelancer comparison
  btc: { value: number; variation: number | null };
  eth: { value: number; variation: number | null };
  wallets: { name: string; compra: number; venta: number }[];
}

export interface SemaforoItem {
  label: string;
  status: "verde" | "amarillo" | "rojo";
  titulo: string;
  descripcion: string;
}

// ---------------------------------------------------------------------------
// LATAM currency rates (MXN, COP, UYU, PEN, CLP, PYG) — ARS-denominated
// ---------------------------------------------------------------------------

export interface LatamCurrencyRate {
  moneda: string;             // "MXN" | "COP" | "UYU" | "PEN" | "CLP" | "PYG"
  nombre: string;             // "Peso Mexicano", etc.
  compra: number;             // buy rate (ARS per 1 unit of foreign currency)
  venta: number;              // sell rate (ARS per 1 unit of foreign currency)
  fechaActualizacion: string; // ISO date string
}

// ---------------------------------------------------------------------------
// Commodities (Gold, Brent, Gas Natural)
// ---------------------------------------------------------------------------

export interface CommodityQuote {
  name: string;
  price: number;
  changePercent: number;
  fecha: string;
}
