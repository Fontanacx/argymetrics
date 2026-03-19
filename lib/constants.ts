import type { DollarCasa } from "./types";

// ---------------------------------------------------------------------------
// API base URLs
// ---------------------------------------------------------------------------

export const DOLARAPI_BASE = "https://dolarapi.com";
export const ARGENTINADATOS_BASE = "https://api.argentinadatos.com";
export const CRIPTOYA_BASE = "https://criptoya.com/api";
export const CRIPTOYA_RP = `${CRIPTOYA_BASE}/riesgo-pais`;

// ---------------------------------------------------------------------------
// Revalidation intervals (seconds) for server-side fetch caching
// ---------------------------------------------------------------------------

// Temporarily set to 0 to force-bypass Next.js aggressive dev cache
export const REVALIDATE_DOLLARS = 0;
export const REVALIDATE_RIESGO_PAIS = 120; // 2-minute TTL via CriptoYa (updates every ~5 min)
export const REVALIDATE_CRYPTO = 60;
export const REVALIDATE_INFLACION = 3600; // Keep at 1h as it updates monthly
export const REVALIDATE_HISTORICAL = 3600;

// ---------------------------------------------------------------------------
// Dollar types we display on the dashboard
// ---------------------------------------------------------------------------

export const DISPLAYED_CASAS: DollarCasa[] = [
  "oficial",
  "blue",
  "bolsa",
  "contadoconliqui",
  "cripto",
  "tarjeta",
  "euro",
  "euroblue",
  "eurotarjeta",
];

/** Human-readable labels for each casa */
export const CASA_LABELS: Record<DollarCasa, string> = {
  oficial: "Dolar Oficial",
  blue: "Dolar Blue",
  bolsa: "Dolar MEP",
  contadoconliqui: "Dolar CCL",
  cripto: "Dolar Cripto / USDT",
  mayorista: "Dolar Mayorista",
  tarjeta: "Dólar Tarjeta",
  euro: "Euro Oficial",
  euroblue: "Euro Blue",
  eurotarjeta: "Euro Tarjeta",
  astropay: "AstroPay",
  cocos: "Cocos Crypto",
  lemoncash: "Lemon Cash",
  belo: "Belo",
  buenbit: "Buenbit",
};

/** Brand colors for Crypto/Fintech Virtual Wallets */
export const WALLET_COLORS: Record<string, string> = {
  astropay: "#d61a21",
  cocos: "#00a2ff",
  lemoncash: "#00e550",
  belo: "#00d789",
  buenbit: "#f178b6",
};

// ---------------------------------------------------------------------------
// Bandas cambiarias
//
// These are the BCRA-published crawling band values. The dynamic formula
// was removed because BCRA no longer follows a fixed interpolation rule.
//
// UPDATE THESE VALUES when the BCRA publishes new band parameters.
// Source: https://www.bcra.gob.ar
// ---------------------------------------------------------------------------

export const BANDAS = {
  /** Lower band floor (ARS per USD) */
  piso: 855.26,
  /** Upper band ceiling (ARS per USD) */
  techo: 1632.48,
  /** Date these values were last verified */
  fechaActualizacion: "2026-03-16",
} as const;

// ---------------------------------------------------------------------------
// History window
// ---------------------------------------------------------------------------

/** Number of calendar days of historical data to fetch */
export const HISTORY_DAYS = 7;
