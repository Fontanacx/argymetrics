import type { DollarCasa } from "../types";

export const DISPLAYED_CASAS: DollarCasa[] = [
  "oficial", "mayorista", "blue", "bolsa", "contadoconliqui", "cripto",
  "tarjeta", "euro", "euroblue", "eurotarjeta",
  "real", "realblue", "realtarjeta",
];

export const CASA_LABELS: Record<DollarCasa, string> = {
  oficial: "Dolar Oficial", blue: "Dolar Blue", bolsa: "Dolar MEP",
  contadoconliqui: "Dolar CCL", cripto: "Dolar Cripto / USDT",
  mayorista: "Dolar Mayorista", tarjeta: "Dólar Tarjeta",
  euro: "Euro Oficial", euroblue: "Euro Blue", eurotarjeta: "Euro Tarjeta",
  astropay: "AstroPay", cocos: "Cocos Crypto", lemoncash: "Lemon Cash",
  belo: "Belo", buenbit: "Buenbit",
  real: "Real Oficial", realblue: "Real Blue", realtarjeta: "Real Tarjeta",
};

export const WALLET_COLORS: Record<string, string> = {
  astropay: "#d61a21", cocos: "#00a2ff", lemoncash: "#00e550",
  belo: "#00d789", buenbit: "#f178b6",
};

export const HISTORY_DAYS = 7;

export const STOCK_TICKERS = [
  'GGAL.BA', 'YPFD.BA', 'PAMP.BA', 'BMA.BA', 'CEPU.BA',
  'TXAR.BA', 'ALUA.BA', 'CRES.BA', 'TGSU2.BA', 'LOMA.BA'
];

export const STOCK_NAMES: Record<string, string> = {
  'GGAL.BA': 'Grupo Galicia', 'YPFD.BA': 'YPF', 'PAMP.BA': 'Pampa Energía',
  'BMA.BA': 'Banco Macro', 'CEPU.BA': 'Central Puerto', 'TXAR.BA': 'Ternium Argentina',
  'ALUA.BA': 'Aluar', 'CRES.BA': 'Cresud', 'TGSU2.BA': 'Transportadora Gas del Sur',
  'LOMA.BA': 'Loma Negra'
};

export const INDEX_TICKERS = ["^MERV", "^GSPC", "^IXIC", "^DJI"];

export const INDEX_NAMES: Record<string, string> = {
  "^MERV": "S&P Merval",
  "^GSPC": "S&P 500",
  "^IXIC": "Nasdaq",
  "^DJI": "Dow Jones",
};

export const INDEX_CURRENCIES: Record<string, "ARS" | "USD"> = {
  "^MERV": "ARS",
  "^GSPC": "USD",
  "^IXIC": "USD",
  "^DJI": "USD",
};

export const LATAM_LABELS: Record<string, string> = {
  MXN: "Peso Mexicano",
  COP: "Peso Colombiano",
  UYU: "Peso Uruguayo",
  PEN: "Sol Peruano",
  CLP: "Peso Chileno",
  PYG: "Guaraní Paraguayo",
};

export const LATAM_FLAGS: Record<string, string> = {
  MXN: "🇲🇽",
  COP: "🇨🇴",
  UYU: "🇺🇾",
  PEN: "🇵🇪",
  CLP: "🇨🇱",
  PYG: "🇵🇾",
};

export const LATAM_SYMBOLS: Record<string, string> = {
  MXN: "MX$",
  COP: "COL$",
  UYU: "UY$",
  PEN: "S/",
  CLP: "CLP$",
  PYG: "₲",
};
