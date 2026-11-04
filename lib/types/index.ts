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
  | "ripio"
  | "fiwind"
  | "satoshitango"
  | "decrypto"
  | "takenos"
  | "wallbit"
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
  /**
   * Variación porcentual del día (ej. -1.69 = bajó 1,69%). Solo disponible
   * cuando el dato proviene de Ámbito; `null`/ausente desde ArgentinaDatos.
   */
  variacion?: number | null;
}

export interface InflacionMensual {
  fecha: string;
  valor: number;
  /** Variación porcentual respecto del mismo mes del año anterior (INDEC). */
  interanual?: number;
  /** Variación porcentual acumulada desde diciembre del año anterior (INDEC). */
  acumulada?: number;
}

/** IPC por región estadística del INDEC (la API no publica apertura provincial). */
export interface IpcRegional {
  region: string;
  fecha: string;
  mensual: number;
  interanual: number;
  acumulada: number | null;
}

/** Salario real: evolución del índice de salarios descontando el IPC. */
export interface SalarioReal {
  fecha: string;
  /** Variación real mensual, en porcentaje. */
  mensual: number;
  /** Variación real interanual, en porcentaje. */
  interanual: number;
  /** Variación nominal mensual del índice de salarios. */
  nominalMensual: number;
  /** Variación nominal interanual del índice de salarios. */
  nominalInteranual: number;
  /** IPC mensual del mismo período. */
  inflacionMensual: number;
  /** IPC interanual del mismo período. */
  inflacionInteranual: number;
}

export interface SalarioRealHistoryEntry {
  fecha: string;
  /** Variación real interanual, en porcentaje. */
  valor: number;
}

/** EMAE: actividad económica mensual (nivel general). */
export interface ActividadEconomica {
  fecha: string;
  /** Variación interanual de la serie original. */
  interanual: number;
  /** Variación mensual de la serie desestacionalizada. */
  mensual: number;
  /** Índice base 2004=100, serie original. */
  indice: number;
}

export interface ActividadEconomicaHistoryEntry {
  fecha: string;
  /** Variación interanual de la serie original. */
  valor: number;
}

/** Canasta Básica Alimentaria y Total para el Hogar 2 del INDEC (4 integrantes, GBA). */
export interface CanastaBasica {
  fecha: string;
  cba: number;
  cbt: number;
  /** Variación mensual de la CBT. */
  variacionMensual: number | null;
  /** Variación interanual de la CBT. */
  variacionInteranual: number | null;
}

export interface CanastaBasicaHistoryEntry {
  fecha: string;
  cba: number;
  cbt: number;
}

/** Incidencia de la pobreza y la indigencia (EPH, 31 aglomerados urbanos). */
export interface Pobreza {
  fecha: string;
  /** Período INDEC, e.g. "20261S". */
  periodo: string;
  pobrezaPersonas: number;
  pobrezaHogares: number;
  indigenciaPersonas: number;
  indigenciaHogares: number;
  /** true cuando INDEC marca el dato como provisorio. */
  provisorio: boolean;
}

export interface PobrezaHistoryEntry {
  fecha: string;
  /** Tasa de pobreza de personas, en porcentaje. */
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

/** Series available in the cross-market historical comparison. */
export type HistoricalComparisonSeriesKey = "blue" | "mep" | "riesgo" | "inflacion";

export type HistoricalComparisonSeriesUnit = "ars" | "points" | "percent";

export type HistoricalComparisonPeriod = "7d" | "30d" | "90d" | "1y" | "custom";

export interface HistoricalComparisonPoint {
  fecha: string;
  valor: number;
}

export interface HistoricalComparisonSeries {
  key: HistoricalComparisonSeriesKey;
  label: string;
  unit: HistoricalComparisonSeriesUnit;
  data: HistoricalComparisonPoint[];
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
// BRL wallet quotes (Mercado Pago, Belo, Lemon, etc.)
// ---------------------------------------------------------------------------

export interface BrlWalletRate {
  id: string;
  nombre: string;
  /** ARS you receive per 1 BRL (provider buys BRL from you). */
  compra: number | null;
  /** ARS you pay per 1 BRL (provider sells BRL to you). */
  venta: number;
  fechaActualizacion: string;
  logo?: string;
  url?: string;
  /** Provider may charge extra fees on top of the quoted rate. */
  hasFees: boolean;
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

// ---------------------------------------------------------------------------
// BCRA International Reserves
// ---------------------------------------------------------------------------

export interface ReservasBCRA {
  fecha: string;   // ISO "YYYY-MM-DD"
  valor: number;   // millones de USD
  variacion?: number | null;
}

export interface ReservasHistoryEntry {
  fecha: string;   // ISO "YYYY-MM-DD"
  valor: number;   // millones de USD
}
