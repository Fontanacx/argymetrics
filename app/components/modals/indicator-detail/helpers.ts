import {
  formatARS,
  formatPercent,
  formatPercentUnsigned,
  formatPoints,
} from "@/lib/formatters/currency";
import type { ChartPoint, IndicatorDetailProps, MacroFormat } from "./types";

export function buildChartData(
  props: IndicatorDetailProps,
  count: number
): ChartPoint[] {
  if (props.kind === "bandas") {
    return props.data
      .slice(-count)
      .map((d) => ({ fecha: d.fecha, range: [d.piso, d.techo], piso: d.piso, techo: d.techo, oficial: d.oficial }));
  }
  if (props.kind === "dollar") {
    return props.data
      .slice(-count)
      .map((d) => ({ fecha: d.fecha, value: d.venta }));
  }
  const points: { fecha: string; valor: number }[] = props.data;
  return points.slice(-count).map((d) => ({ fecha: d.fecha, value: d.valor }));
}

/**
 * Previous close for dollar/stock/index. While the market is open the
 * previous close is the second-to-last entry, otherwise the last one.
 */
export function getPreviousClose(
  props: IndicatorDetailProps,
  isOpen: boolean
): number | null {
  if (props.data.length < 2) return null;

  if (props.kind === "dollar") {
    const data = props.data;
    return isOpen ? data[data.length - 2].venta : data[data.length - 1].venta;
  }

  if (props.kind === "stock" || props.kind === "index") {
    const data = props.data;
    return isOpen ? data[data.length - 2].valor : data[data.length - 1].valor;
  }

  return null;
}

export function getValueFormatter(
  kind: string,
  macroFormat?: MacroFormat
): (v: number) => string {
  if (kind === "dollar" || kind === "stock") return (v) => formatARS(v);
  if (kind === "riesgo") return (v) => `${formatPoints(v)} pts`;
  if (kind === "commodity" || kind === "crypto") return (v) => `US$ ${v.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (kind === "index") return (v) => v.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (kind === "macro") {
    return macroFormat === "ars"
      ? (v) => formatARS(v)
      : (v) => formatPercentUnsigned(v);
  }
  return (v) => formatPercent(v); // inflacion
}

export function getYAxisLabel(
  kind: string,
  v: number,
  macroFormat?: MacroFormat
): string {
  if (kind === "dollar" || kind === "bandas" || kind === "stock") return `$${v.toLocaleString("es-AR")}`;
  if (kind === "inflacion") return `${v}%`;
  if (kind === "macro") {
    return macroFormat === "ars"
      ? `$${v.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`
      : `${v}%`;
  }
  if (kind === "commodity" || kind === "crypto") return `US$ ${v.toLocaleString("es-AR")}`;
  if (kind === "index") return v.toLocaleString("es-AR", { maximumFractionDigits: 0 });
  return v.toLocaleString("es-AR");
}

export function getStrokeColor(kind: string, isPositive: boolean): string {
  if (kind === "riesgo") {
    return isPositive ? "var(--color-negative)" : "var(--color-positive)";
  }
  if (kind === "inflacion" || kind === "macro") {
    return "var(--color-accent)";
  }
  if (kind === "commodity" || kind === "crypto" || kind === "stock" || kind === "index") {
    return "var(--color-accent)"; // Use neutral accent color for commodities, crypto, stocks, and indices
  }
  return isPositive ? "var(--color-positive)" : "var(--color-negative)";
}

export function getMarketStatus(kind: string): { text: string; color: string } {
  if (kind === "macro") {
    return { text: "INDEC", color: "var(--color-accent)" };
  }
  if (kind === "crypto") return { text: "Operando 24/7", color: "var(--color-positive)" };
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  // Monday = 1, Friday = 5. Hours: 10 to 16:59
  if (day >= 1 && day <= 5 && hour >= 10 && hour < 17) {
    return { text: "Operando", color: "var(--color-positive)" };
  }
  return { text: "Cerrado", color: "var(--color-negative)" };
}
