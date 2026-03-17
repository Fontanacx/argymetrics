import type { DollarWithHistory, DollarHistoryEntry } from "@/lib/types";
import { formatARS, formatSpread } from "@/lib/formatters/currency";
import { CASA_LABELS } from "@/lib/constants";
import { INDICATOR_DEFINITIONS } from "@/lib/constants/definitions";
import VariationBadge from "./VariationBadge";
import SparklineChart from "./SparklineChart";
import InfoButton from "./InfoButton";
import IndicatorDetail from "./IndicatorDetail";

interface DollarCardProps {
  dollar: DollarWithHistory;
  /** Full history (up to 365 days) for the info modal chart */
  fullHistory?: DollarHistoryEntry[];
  /** Optional spread data for Blue modal */
  spread?: {
    blueVenta: number;
    oficialVenta: number;
  };
}

/**
 * Card displaying a single dollar type with:
 * - Name, info button, and daily variation badge
 * - Buy (compra) and sell (venta) prices
 * - Spread between buy/sell
 * - 7-day sparkline chart
 */
export default function DollarCard({ dollar, fullHistory, spread }: DollarCardProps) {
  const { rate, history, variacion } = dollar;
  const label = CASA_LABELS[rate.casa] ?? rate.nombre;
  const trendPositive = variacion !== null ? variacion >= 0 : true;
  const definition = INDICATOR_DEFINITIONS[rate.casa] ?? "";

  return (
    <article
      className="flex flex-col gap-3 rounded-xl border p-4 transition-shadow"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-primary)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header: name + info + variation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h3
            className="text-sm font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {label}
          </h3>
          {fullHistory && fullHistory.length > 0 && (
            <InfoButton title={label}>
              <IndicatorDetail
                kind="dollar"
                data={fullHistory}
                label={label}
                definition={definition}
                spread={spread}
                updateTime={rate.fechaActualizacion}
              />
            </InfoButton>
          )}
        </div>
        <VariationBadge value={variacion} />
      </div>

      {/* Sell price (primary) */}
      <div>
        <p
          className="text-2xl font-bold tabular-nums tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {formatARS(rate.venta)}
        </p>
      </div>

      {/* Buy / Sell / Spread row */}
      <div
        className="grid grid-cols-3 gap-2 text-xs"
        style={{ color: "var(--text-secondary)" }}
      >
        <div>
          <span className="block font-medium" style={{ color: "var(--text-muted)" }}>
            Compra
          </span>
          <span className="tabular-nums">{formatARS(rate.compra)}</span>
        </div>
        <div>
          <span className="block font-medium" style={{ color: "var(--text-muted)" }}>
            Venta
          </span>
          <span className="tabular-nums">{formatARS(rate.venta)}</span>
        </div>
        <div>
          <span className="block font-medium" style={{ color: "var(--text-muted)" }}>
            Spread
          </span>
          <span className="tabular-nums">{formatSpread(rate.compra, rate.venta)}</span>
        </div>
      </div>

      {/* 7-day sparkline */}
      <div className="mt-1">
        <SparklineChart data={history} positive={trendPositive} />
      </div>
    </article>
  );
}
