"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import Modal from "./Modal";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type {
  DollarHistoryEntry,
  RiesgoPaisHistoryEntry,
  HistoryRange,
  HistoryMetrics,
} from "@/lib/types";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { RANGE_DAYS, computeMetrics } from "@/lib/formatters/metrics";
import { formatARS, formatPercent, formatPoints } from "@/lib/formatters/currency";
import { formatShortDate } from "@/lib/formatters/date";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Discriminated union for chart data kinds */
type ChartDataset =
  | { kind: "dollar"; data: DollarHistoryEntry[]; label: string }
  | { kind: "riesgo"; data: RiesgoPaisHistoryEntry[]; label: string };

interface HistorySectionProps {
  datasets: ChartDataset[];
}

// ---------------------------------------------------------------------------
// Range selector
// ---------------------------------------------------------------------------

const RANGE_OPTIONS: { value: HistoryRange; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "1y", label: "1A" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Client component combining range selector, area chart, and metric cards
 * for historical analytics. Renders one chart per dataset with tabbed navigation.
 *
 * Client component because:
 * - recharts requires browser APIs
 * - range and active tab are client-side state
 */
export default function HistorySection({ datasets }: HistorySectionProps) {
  const [range, setRange] = useState<HistoryRange>("30d");
  const [activeTab, setActiveTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const active = datasets[activeTab];
  if (!active) return null;

  // Slice data to selected range and normalize to { fecha, value }
  const days = RANGE_DAYS[range];
  const slicedRaw = active.data.slice(-days);

  const chartData = active.kind === "dollar"
    ? (slicedRaw as DollarHistoryEntry[]).map((d) => ({ fecha: d.fecha, value: d.venta }))
    : (slicedRaw as RiesgoPaisHistoryEntry[]).map((d) => ({ fecha: d.fecha, value: d.valor }));

  // Compute metrics from normalized values
  const values = chartData.map((d) => d.value);
  const metrics = computeMetrics(values);

  // Format function for values
  const formatValue = active.kind === "dollar"
    ? (v: number) => formatARS(v)
    : (v: number) => `${formatPoints(v)} pts`;

  // Determine trend color
  const isPositive = metrics ? metrics.changePercent >= 0 : true;
  const strokeColor = active.kind === "riesgo"
    ? (isPositive ? "var(--color-negative)" : "var(--color-positive)") // rising riesgo = bad
    : (isPositive ? "var(--color-positive)" : "var(--color-negative)");

  const fillColor = active.kind === "riesgo"
    ? (isPositive ? "var(--color-negative)" : "var(--color-positive)")
    : (isPositive ? "var(--color-positive)" : "var(--color-negative)");

  const handleExpand = () => setModalOpen(true);

  // Extracted chart rendering to reuse across inline and fullscreen modal
  const renderChart = (isModal = false) => (
    <AreaChart data={chartData} margin={{ top: isModal ? 16 : 4, right: isModal ? 16 : 4, bottom: 0, left: 0 }}>
      <defs>
        <linearGradient id={`gradient-${activeTab}${isModal ? '-modal' : ''}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity={0.15} />
          <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="var(--border-subtle)"
        vertical={false}
      />
      <XAxis
        dataKey="fecha"
        tickFormatter={(v) => formatShortDate(v)}
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
        width={65}
        tickFormatter={(v: number) =>
          active.kind === "dollar" ? `$${v.toLocaleString("es-AR")}` : v.toLocaleString("es-AR")
        }
      />
      <Tooltip
        contentStyle={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          borderRadius: "8px",
          fontSize: "12px",
          color: "var(--text-primary)",
        }}
        labelFormatter={(v) => formatShortDate(v as string)}
        formatter={(value: ValueType | undefined) => [formatValue(Number(value ?? 0)), active.label]}
      />
      <Area
        type="monotone"
        dataKey="value"
        stroke={strokeColor}
        strokeWidth={2}
        fill={`url(#gradient-${activeTab}${isModal ? '-modal' : ''})`}
        dot={false}
        isAnimationActive={false}
      />
    </AreaChart>
  );

  return (
    <>
      <div
        className="rounded-xl border p-4 sm:p-6"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-primary)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Tabs + Range selector */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Dataset tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {datasets.map((ds, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: i === activeTab ? "var(--color-accent)" : "transparent",
                  color: i === activeTab ? "var(--text-inverted)" : "var(--text-secondary)",
                }}
              >
                {ds.label}
              </button>
            ))}
          </div>

          {/* Range selector */}
          <div
            className="flex gap-1 rounded-lg p-1"
            style={{ background: "var(--bg-primary)" }}
          >
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className="rounded-md px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  background: range === opt.value ? "var(--bg-card)" : "transparent",
                  color: range === opt.value ? "var(--text-primary)" : "var(--text-muted)",
                  boxShadow: range === opt.value ? "var(--shadow-card)" : "none",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Metric cards */}
        {metrics && <MetricCards metrics={metrics} formatValue={formatValue} kind={active.kind} />}

        {/* Chart */}
        <div className="mt-4 relative group">
          {chartData.length >= 2 && (
            <div className="absolute top-0 right-0 z-10 flex gap-2">
              <button
                onClick={handleExpand}
                aria-label="Expand chart"
                className="flex h-7 w-7 items-center justify-center rounded-md transition-colors shadow-sm"
                style={{ color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <Maximize2 size={14} />
              </button>
            </div>
          )}
          {chartData.length < 2 ? (
            <div
              className="flex h-64 items-center justify-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Sin datos suficientes para este rango.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              {renderChart(false)}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${active.label} — ${RANGE_OPTIONS.find((o) => o.value === range)?.label ?? range}`}
        size="fullscreen"
      >
        <div style={{ height: '80vh', minHeight: 400, maxHeight: 900 }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart(true)}
          </ResponsiveContainer>
        </div>
      </Modal>
    </>
  );
}

// ---------------------------------------------------------------------------
// Metric cards sub-component
// ---------------------------------------------------------------------------

interface MetricCardsProps {
  metrics: HistoryMetrics;
  formatValue: (v: number) => string;
  kind: "dollar" | "riesgo";
}

function MetricCards({ metrics, formatValue, kind }: MetricCardsProps) {
  const changeColor = (() => {
    if (metrics.changePercent === 0) return "var(--color-neutral)";
    // For riesgo pais, rising = bad (red), falling = good (green)
    if (kind === "riesgo") {
      return metrics.changePercent > 0 ? "var(--color-negative)" : "var(--color-positive)";
    }
    return metrics.changePercent > 0 ? "var(--color-positive)" : "var(--color-negative)";
  })();

  const items = [
    { label: "Maximo", value: formatValue(metrics.high) },
    { label: "Minimo", value: formatValue(metrics.low) },
    { label: "Promedio", value: formatValue(metrics.average) },
    {
      label: "Variacion",
      value: formatPercent(metrics.changePercent),
      color: changeColor,
    },
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
