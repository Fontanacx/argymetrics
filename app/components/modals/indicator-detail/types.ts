import type {
  DollarHistoryEntry,
  RiesgoPaisHistoryEntry,
  InflacionMensual,
  BandaHistoryEntry,
  CryptoHistoryEntry,
  StockHistoryEntry,
  MarketIndexHistoryEntry,
} from "@/lib/types";

interface DollarDetailProps {
  kind: "dollar";
  data: DollarHistoryEntry[];
  label: string;
  definition: string;
  spread?: { blueVenta: number; oficialVenta: number };
  currentRate?: { compra: number; venta: number };
}

interface RiesgoDetailProps {
  kind: "riesgo";
  data: RiesgoPaisHistoryEntry[];
  label: string;
  definition: string;
}

interface InflacionDetailProps {
  kind: "inflacion";
  data: InflacionMensual[];
  label: string;
  definition: string;
}

interface CommodityDetailProps {
  kind: "commodity";
  // We can reuse the same shape as RiesgoPais for simple date/value pairs
  data: RiesgoPaisHistoryEntry[];
  label: string;
  definition: string;
}

export type MacroFormat = "percent" | "ars";

interface MacroDetailProps {
  kind: "macro";
  data: { fecha: string; valor: number }[];
  label: string;
  definition: string;
  /** Percentages for salaries/activity/poverty, ARS for baskets. */
  format: MacroFormat;
}

interface CryptoDetailProps {
  kind: "crypto";
  data: CryptoHistoryEntry[];
  label: string;
  definition: string;
}

interface StockDetailProps {
  kind: "stock";
  data: StockHistoryEntry[];
  label: string;
  definition: string;
}

interface IndexDetailProps {
  kind: "index";
  data: MarketIndexHistoryEntry[];
  label: string;
  definition: string;
  updateTime?: string;
}

interface BandasDetailProps {
  kind: "bandas";
  data: BandaHistoryEntry[];
  label: string;
  definition: string;
  cotizacionActual?: number;
}

export type IndicatorDetailProps = (
  | DollarDetailProps
  | RiesgoDetailProps
  | InflacionDetailProps
  | CommodityDetailProps
  | CryptoDetailProps
  | BandasDetailProps
  | StockDetailProps
  | IndexDetailProps
  | MacroDetailProps
) & { updateTime?: string };

export type IndicatorKind = IndicatorDetailProps["kind"];

export type RangeOption = { value: string; label: string; days: number };

export interface ChartPoint {
  fecha: string;
  value?: number;
  range?: number[];
  piso?: number;
  techo?: number;
  oficial?: number;
}
