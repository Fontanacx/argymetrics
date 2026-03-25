"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type {
  DollarHistoryEntry,
  RiesgoPaisHistoryEntry,
  InflacionMensual,
  BandaHistoryEntry,
  CryptoHistoryEntry,
  StockHistoryEntry,
} from "@/lib/types";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import { computeMetrics } from "@/lib/formatters/metrics";
import { formatARS, formatPercent, formatPoints } from "@/lib/formatters/currency";
import { formatShortDate, formatMonthYear, formatDateTime } from "@/lib/formatters/date";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

interface BandasDetailProps {
  kind: "bandas";
  data: BandaHistoryEntry[];
  label: string;
  definition: string;
  cotizacionActual?: number;
}

type IndicatorDetailProps = (DollarDetailProps | RiesgoDetailProps | InflacionDetailProps | CommodityDetailProps | CryptoDetailProps | BandasDetailProps | StockDetailProps) & { updateTime?: string };

// ---------------------------------------------------------------------------
// Range options — different presets for inflation (monthly data)
// ---------------------------------------------------------------------------

type RangeOption = { value: string; label: string; days: number };

const DOLLAR_RANGES: RangeOption[] = [
  { value: "7d", label: "7D", days: 7 },
  { value: "30d", label: "30D", days: 30 },
  { value: "90d", label: "90D", days: 90 },
  { value: "1y", label: "1A", days: 365 },
];

const INFLACION_RANGES: RangeOption[] = [
  { value: "12m", label: "12M", days: 12 },
  { value: "24m", label: "24M", days: 24 },
  { value: "all", label: "Todo", days: 9999 },
];

const BANDAS_RANGES: RangeOption[] = [
  { value: "3m", label: "3M", days: 90 },
  { value: "6m", label: "6M", days: 180 },
];

const STOCK_RANGES: RangeOption[] = [
  { value: "1m", label: "1M", days: 30 },
  { value: "3m", label: "3M", days: 90 },
  { value: "6m", label: "6M", days: 180 },
  { value: "1y", label: "1A", days: 365 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Modal content for indicator detail: definition, spread, chart, and metrics.
 */
export default function IndicatorDetail(props: IndicatorDetailProps) {
  const ranges = props.kind === "inflacion" ? INFLACION_RANGES : (props.kind === "bandas" ? BANDAS_RANGES : (props.kind === "stock" ? STOCK_RANGES : DOLLAR_RANGES));
  const [rangeValue, setRangeValue] = useState(ranges[1]?.value ?? ranges[0].value);

  const activeRange = ranges.find((r) => r.value === rangeValue) ?? ranges[1];

  // Build normalized chart data
  const chartData = buildChartData(props, activeRange.days);
  const values = props.kind !== "bandas" ? chartData.map((d) => d.value as number) : [];
  const metrics = props.kind !== "bandas" ? computeMetrics(values) : null;

  const formatValue = getValueFormatter(props.kind);
  const formatLabel = props.kind === "inflacion"
    ? (v: string) => formatMonthYear(v)
    : (v: string) => formatShortDate(v);

  // Color logic
  const isPositive = metrics ? metrics.changePercent >= 0 : true;
  const strokeColor = props.kind === "bandas" ? "var(--color-accent)" : getStrokeColor(props.kind, isPositive);
  const marketStatus = getMarketStatus(props.kind);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Definition */}
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {props.definition}
      </p>

      {/* Current Value, Spread & Market Status */}
      <div className="flex items-center justify-between rounded-lg border px-4 py-3" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-primary)" }}>
        <div>
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Valor Actual</p>
          <p className="text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
            {props.kind === "dollar" && props.currentRate 
              ? formatARS(props.currentRate.venta) 
              : props.kind === "bandas" && props.cotizacionActual 
                ? formatARS(props.cotizacionActual) 
                : formatValue(values[values.length - 1] ?? 0)}
          </p>
        </div>
        
        {props.kind === "dollar" && props.currentRate && (
          <div className="text-center px-2">
             <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Spread</p>
             <p className="text-sm font-semibold tabular-nums mt-0.5" style={{ color: "var(--text-primary)" }}>
               {formatARS(props.currentRate.venta - props.currentRate.compra)}
             </p>
          </div>
        )}

        <div className="text-right">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Mercado</p>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <div className="w-2 h-2 rounded-full" style={{ background: marketStatus.color }} />
            <span className="text-sm font-semibold tracking-tight" style={{ color: marketStatus.color }}>{marketStatus.text}</span>
          </div>
        </div>
      </div>

      {/* Spread indicator (dollar only) */}
      {props.kind === "dollar" && props.spread && <SpreadIndicator spread={props.spread} />}

      {/* Range selector */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          Historico
        </p>
        {ranges.length > 1 && (
          <div
            className="flex gap-1 rounded-lg p-1"
            style={{ background: "var(--bg-primary)" }}
          >
            {ranges.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRangeValue(opt.value)}
                className="rounded-md px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  background: rangeValue === opt.value ? "var(--bg-card)" : "transparent",
                  color: rangeValue === opt.value ? "var(--text-primary)" : "var(--text-muted)",
                  boxShadow: rangeValue === opt.value ? "var(--shadow-card)" : "none",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Metric cards */}
      {props.kind === "bandas" ? (
        <BandasMetricCards data={props.data as BandaHistoryEntry[]} cotizacionActual={props.cotizacionActual} />
      ) : metrics ? (
        <MetricCards metrics={metrics} formatValue={formatValue} kind={props.kind} />
      ) : null}

      {/* Chart */}
      {chartData.length < 2 ? (
        <div
          className="flex h-48 items-center justify-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Sin datos suficientes para este rango.
        </div>
      ) : (
        <div className="flex-1 w-full mt-2 relative min-h-[220px]">
          <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="modal-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-subtle)"
                vertical={false}
              />
              <XAxis
                dataKey="fecha"
                tickFormatter={formatLabel}
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                width={55}
                tickFormatter={(v: number) => getYAxisLabel(props.kind, v)}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                }}
                labelFormatter={(v) => formatLabel(v as string)}
                formatter={(value: ValueType | undefined, name: string | number | undefined) => {
                  if (props.kind === "bandas") {
                    if (name === "range") return []; // Hide range area from tooltip
                    const labelName = name === "techo" ? "Techo" : name === "piso" ? "Piso" : "Oficial";
                    return [formatARS(Number(value ?? 0)), labelName];
                  }
                  return [
                    formatValue(Number(value ?? 0)),
                    props.label,
                  ];
                }}
              />
              {props.kind === "bandas" ? (
                <>
                  <Area dataKey="range" stroke="none" fill="var(--color-accent)" fillOpacity={0.15} isAnimationActive={false} />
                  <Line type="monotone" dataKey="techo" stroke="var(--color-accent)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="piso" stroke="var(--color-accent)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="oficial" stroke="var(--text-primary)" strokeWidth={2} dot={false} isAnimationActive={false} />
                </>
              ) : (
                <Area
                  type={props.kind === "inflacion" ? "stepAfter" : "monotone"}
                  dataKey="value"
                  stroke={strokeColor}
                  strokeWidth={2}
                  fill="url(#modal-gradient)"
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Update Time */}
      {props.updateTime && (
        <div className="mt-2 flex items-center justify-end gap-1.5 text-xs" style={{ color: "var(--text-muted)", opacity: 0.8 }}>
          <Clock size={12} />
          <span>Actualizado: {formatDateTime(props.updateTime)}</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildChartData(
  props: IndicatorDetailProps,
  count: number
): any[] {
  if (props.kind === "bandas") {
    return (props.data as BandaHistoryEntry[])
      .slice(-count)
      .map((d) => ({ fecha: d.fecha, range: [d.piso, d.techo], piso: d.piso, techo: d.techo, oficial: d.oficial }));
  }
  if (props.kind === "dollar") {
    return (props.data as DollarHistoryEntry[])
      .slice(-count)
      .map((d) => ({ fecha: d.fecha, value: d.venta }));
  }
  if (props.kind === "riesgo" || props.kind === "commodity" || props.kind === "crypto" || props.kind === "stock") {
    return (props.data as RiesgoPaisHistoryEntry[] | CryptoHistoryEntry[] | StockHistoryEntry[])
      .slice(-count)
      .map((d) => ({ fecha: d.fecha, value: d.valor }));
  }
  // inflacion
  return (props.data as InflacionMensual[])
    .slice(-count)
    .map((d) => ({ fecha: d.fecha, value: d.valor }));
}

function getValueFormatter(kind: string): (v: number) => string {
  if (kind === "dollar" || kind === "stock") return (v) => formatARS(v);
  if (kind === "riesgo") return (v) => `${formatPoints(v)} pts`;
  if (kind === "commodity" || kind === "crypto") return (v) => `US$ ${v.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return (v) => formatPercent(v); // inflacion
}

function getYAxisLabel(kind: string, v: number): string {
  if (kind === "dollar" || kind === "bandas" || kind === "stock") return `$${v.toLocaleString("es-AR")}`;
  if (kind === "inflacion") return `${v}%`;
  if (kind === "commodity" || kind === "crypto") return `US$ ${v.toLocaleString("es-AR")}`;
  return v.toLocaleString("es-AR");
}

function getStrokeColor(kind: string, isPositive: boolean): string {
  if (kind === "riesgo") {
    return isPositive ? "var(--color-negative)" : "var(--color-positive)";
  }
  if (kind === "inflacion") {
    return "var(--color-accent)";
  }
  if (kind === "commodity" || kind === "crypto" || kind === "stock") {
    return "var(--color-accent)"; // Use neutral accent color for commodities, crypto, and stocks
  }
  return isPositive ? "var(--color-positive)" : "var(--color-negative)";
}

function getMarketStatus(kind: string): { text: string; color: string } {
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

// ---------------------------------------------------------------------------
// MetricCards sub-component
// ---------------------------------------------------------------------------

import type { HistoryMetrics } from "@/lib/types";

function MetricCards({
  metrics,
  formatValue,
  kind,
}: {
  metrics: HistoryMetrics;
  formatValue: (v: number) => string;
  kind: string;
}) {
  const changeColor = (() => {
    if (metrics.changePercent === 0) return "var(--color-neutral)";
    if (kind === "riesgo") {
      return metrics.changePercent > 0 ? "var(--color-negative)" : "var(--color-positive)";
    }
    return metrics.changePercent > 0 ? "var(--color-positive)" : "var(--color-negative)";
  })();

  const items = [
    { label: "Maximo", value: formatValue(metrics.high) },
    { label: "Minimo", value: formatValue(metrics.low) },
    { label: "Promedio", value: formatValue(metrics.average) },
    { label: "Variacion", value: formatPercent(metrics.changePercent), color: changeColor },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border px-3 py-2"
          style={{
            borderColor: "var(--border-subtle)",
            background: "var(--bg-primary)",
          }}
        >
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            {item.label}
          </p>
          <p
            className="text-sm font-bold tabular-nums"
            style={{ color: item.color ?? "var(--text-primary)" }}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Spread sub-component
// ---------------------------------------------------------------------------

function SpreadIndicator({
  spread,
}: {
  spread: { blueVenta: number; oficialVenta: number };
}) {
  const diff = spread.blueVenta - spread.oficialVenta;
  const pct = spread.oficialVenta !== 0 ? (diff / spread.oficialVenta) * 100 : 0;
  const isPositive = diff >= 0;

  return (
    <div
      className="flex items-center gap-3 rounded-lg border px-4 py-3"
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--bg-primary)",
      }}
    >
      <div className="flex-1">
        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          Brecha Blue vs Oficial
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span
            className="text-base font-bold tabular-nums"
            style={{
              color: isPositive ? "var(--color-negative)" : "var(--color-positive)",
            }}
          >
            {isPositive ? "+" : ""}
            {formatARS(diff)}
          </span>
          <span
            className="text-sm font-semibold tabular-nums"
            style={{
              color: isPositive ? "var(--color-negative)" : "var(--color-positive)",
            }}
          >
            ({isPositive ? "+" : ""}
            {formatPercent(Math.round(pct * 100) / 100)})
          </span>
        </div>
      </div>
      <div className="text-right text-xs" style={{ color: "var(--text-muted)" }}>
        <p>Blue: {formatARS(spread.blueVenta)}</p>
        <p>Oficial: {formatARS(spread.oficialVenta)}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BandasMetricCards sub-component
// ---------------------------------------------------------------------------

function BandasMetricCards({ data, cotizacionActual }: { data: BandaHistoryEntry[]; cotizacionActual?: number }) {
  if (data.length === 0) return null;
  const current = data[data.length - 1];
  const spread = current.techo - current.piso;
  const spreadPct = (spread / current.piso) * 100;
  
  let posPct: number | null = null;
  if (cotizacionActual !== undefined && spread > 0) {
    posPct = Math.max(0, Math.min(100, ((cotizacionActual - current.piso) / spread) * 100));
  }
  
  const items = [
    { label: "Piso", value: formatARS(current.piso) },
    { label: "Techo", value: formatARS(current.techo) },
    { label: "Ancho Banda", value: formatPercent(spreadPct) },
    { label: "Posicion", value: posPct !== null ? `${posPct.toFixed(1)}%` : "--", color: "var(--color-accent)" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border px-3 py-2"
          style={{
            borderColor: "var(--border-subtle)",
            background: "var(--bg-primary)",
          }}
        >
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            {item.label}
          </p>
          <p
            className="text-sm font-bold tabular-nums"
            style={{ color: item.color ?? "var(--text-primary)" }}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
