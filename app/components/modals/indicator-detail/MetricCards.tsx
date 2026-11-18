import type { BandaHistoryEntry, HistoryMetrics } from "@/lib/types";
import { formatARS, formatPercent } from "@/lib/formatters/currency";

interface MetricTileItem {
  label: string;
  value: string;
  color?: string;
}

/** 2-column (4 on sm+) grid of small label/value tiles. */
function MetricTileGrid({ items }: { items: MetricTileItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="metric-tile rounded-lg border px-3 py-2"
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

export function MetricCards({
  metrics,
  formatValue,
  kind,
  currentValue,
}: {
  metrics: HistoryMetrics;
  formatValue: (v: number) => string;
  kind: string;
  currentValue?: number;
}) {
  const changeColor = (() => {
    if (metrics.changePercent === 0) return "var(--color-neutral)";
    if (kind === "riesgo") {
      return metrics.changePercent > 0 ? "var(--color-negative)" : "var(--color-positive)";
    }
    if (kind === "macro") {
      return "var(--color-accent)";
    }
    return metrics.changePercent > 0 ? "var(--color-positive)" : "var(--color-negative)";
  })();

  const items: MetricTileItem[] = [
    { label: "Maximo", value: formatValue(metrics.high) },
    { label: "Minimo", value: formatValue(metrics.low) },
    { label: "Promedio", value: formatValue(metrics.average) },
    kind === "macro"
      ? {
          label: "Actual",
          value:
            currentValue === undefined ? "--" : formatValue(currentValue),
          color: "var(--color-accent)",
        }
      : {
          label: "Variacion",
          value: formatPercent(metrics.changePercent),
          color: changeColor,
        },
  ];

  return <MetricTileGrid items={items} />;
}

export function BandasMetricCards({
  data,
  cotizacionActual,
}: {
  data: BandaHistoryEntry[];
  cotizacionActual?: number;
}) {
  if (data.length === 0) return null;
  const current = data[data.length - 1];
  const spread = current.techo - current.piso;
  const spreadPct = (spread / current.piso) * 100;

  let posPct: number | null = null;
  if (cotizacionActual !== undefined && spread > 0) {
    posPct = Math.max(0, Math.min(100, ((cotizacionActual - current.piso) / spread) * 100));
  }

  const items: MetricTileItem[] = [
    { label: "Piso", value: formatARS(current.piso) },
    { label: "Techo", value: formatARS(current.techo) },
    { label: "Ancho Banda", value: formatPercent(spreadPct) },
    { label: "Posicion", value: posPct !== null ? `${posPct.toFixed(1)}%` : "--", color: "var(--color-accent)" },
  ];

  return <MetricTileGrid items={items} />;
}
