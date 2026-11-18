import { formatARS, formatPercent } from "@/lib/formatters/currency";

export function SpreadIndicator({
  spread,
}: {
  spread: { blueVenta: number; oficialVenta: number };
}) {
  const diff = spread.blueVenta - spread.oficialVenta;
  const pct = spread.oficialVenta !== 0 ? (diff / spread.oficialVenta) * 100 : 0;
  const isPositive = diff >= 0;

  return (
    <div
      className="metric-tile flex items-center gap-3 rounded-lg border px-4 py-3"
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
