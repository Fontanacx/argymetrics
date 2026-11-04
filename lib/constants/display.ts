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
  belo: "Belo", buenbit: "Buenbit", ripio: "Ripio", fiwind: "Fiwind",
  satoshitango: "SatoshiTango", decrypto: "Decrypto", takenos: "Takenos",
  wallbit: "Wallbit",
  real: "Real Oficial", realblue: "Real Blue", realtarjeta: "Real Tarjeta",
};

export const WALLET_COLORS: Record<string, string> = {
  astropay: "#d61a21", cocos: "#00a2ff", lemoncash: "#00e550",
  belo: "#00d789", buenbit: "#f178b6", ripio: "#00b9ae",
  fiwind: "#7c5cff", satoshitango: "#f7931a", decrypto: "#2f80ed",
  takenos: "#00c2a8", wallbit: "#6366f1",
};

export const HISTORY_DAYS = 7;

export const STOCK_TICKERS = [
  'GGAL.BA', 'YPFD.BA', 'PAMP.BA', 'BMA.BA', 'CEPU.BA',
  'TXAR.BA', 'ALUA.BA', 'CRES.BA', 'TGSU2.BA', 'LOMA.BA',
  'MELI.BA'
];

export const STOCK_NAMES: Record<string, string> = {
  'GGAL.BA': 'Grupo Galicia', 'YPFD.BA': 'YPF', 'PAMP.BA': 'Pampa Energía',
  'BMA.BA': 'Banco Macro', 'CEPU.BA': 'Central Puerto', 'TXAR.BA': 'Ternium Argentina',
  'ALUA.BA': 'Aluar', 'CRES.BA': 'Cresud', 'TGSU2.BA': 'Transportadora Gas del Sur',
  'LOMA.BA': 'Loma Negra',
  'MELI.BA': 'Mercado Libre'
};

export const INTERNATIONAL_STOCK_TICKERS = [
  "AAPL", "NVDA", "MSFT", "005930.KS", "TSLA", "SPCX", "MU",
];

export const INTERNATIONAL_STOCK_NAMES: Record<string, string> = {
  "AAPL": "Apple Inc.",
  "NVDA": "Nvidia Corp.",
  "MSFT": "Microsoft Corp.",
  "005930.KS": "Samsung Electronics",
  "TSLA": "Tesla Inc.",
  "SPCX": "SpaceX",
  "MU": "Micron Technology",
};

export const STOCK_DISPLAY_SYMBOLS: Record<string, string> = {
  "005930.KS": "SAMSUNG",
};

export function getCompanyLogoUrl(symbol: string): string {
  return COMPANY_LOGO_SOURCES[symbol] ?? "";
}

const COMPANY_LOGO_SOURCES: Record<string, string> = {
  "AAPL": "/logos/aapl.svg",
  "NVDA": "/logos/nvda.svg",
  "MSFT": "/logos/msft.svg",
  "005930.KS": "/logos/samsung.svg",
  "TSLA": "/logos/tsla.svg",
  "SPCX": "/logos/spcx.svg",
  "MELI.BA": "/logos/meli.svg",
  "MU": "/logos/mu.png",
  "GGAL.BA": "/logos/ggal.png",
  "YPFD.BA": "/logos/ypfd.png",
  "PAMP.BA": "/logos/pamp.png",
  "BMA.BA": "/logos/bma.png",
  "CEPU.BA": "/logos/cepu.png",
  "TXAR.BA": "/logos/txar.png",
  "ALUA.BA": "/logos/alua.png",
  "CRES.BA": "/logos/cres.png",
  "TGSU2.BA": "/logos/tgsu2.png",
  "LOMA.BA": "/logos/loma.png",
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

/**
 * Regiones estadísticas del IPC del INDEC. La API no publica una apertura
 * por provincia, así que mostramos la región y las provincias que la integran.
 */
export const IPC_REGION_DISPLAY: Record<string, { label: string; provinces: string }> = {
  GBA: {
    label: "GBA",
    provinces: "CABA y partidos del conurbano bonaerense",
  },
  Pampeana: {
    label: "Pampeana",
    provinces: "Buenos Aires (sin GBA), Córdoba, Entre Ríos, La Pampa y Santa Fe",
  },
  Noreste: {
    label: "Noreste",
    provinces: "Chaco, Corrientes, Formosa y Misiones",
  },
  Noroeste: {
    label: "Noroeste",
    provinces: "Catamarca, Jujuy, La Rioja, Salta, Santiago del Estero y Tucumán",
  },
  Cuyo: {
    label: "Cuyo",
    provinces: "Mendoza, San Juan y San Luis",
  },
  Patagonia: {
    label: "Patagonia",
    provinces: "Chubut, Neuquén, Río Negro, Santa Cruz y Tierra del Fuego",
  },
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

/** Providers shown in the BRL wallet section and the converter. */
export const BRL_WALLET_PROVIDER_IDS = [
  "mercado-pago",
  "belo",
  "lemon",
  "astropay",
  "fiwind",
  "satoshitango",
  "prex",
  "decrypto",
  "cocos",
  "arq",
  "personal-pay",
] as const;

export const BRL_WALLET_NAMES: Record<string, string> = {
  "mercado-pago": "Mercado Pago",
  belo: "Belo",
  lemon: "Lemon",
  astropay: "AstroPay",
  fiwind: "Fiwind",
  satoshitango: "SatoshiTango",
  prex: "Prex",
  decrypto: "Decrypto",
  cocos: "Cocos",
  arq: "ARQ",
  "personal-pay": "Personal Pay",
};
