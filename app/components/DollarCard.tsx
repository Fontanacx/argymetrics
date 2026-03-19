import type { DollarWithHistory, DollarHistoryEntry } from "@/lib/types";
import { formatARS, formatSpread } from "@/lib/formatters/currency";
import { CASA_LABELS, WALLET_COLORS } from "@/lib/constants";
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
  const brandColor = WALLET_COLORS[rate.casa];
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
            style={{ color: brandColor || "var(--text-primary)" }}
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
                currentRate={{ compra: rate.compra, venta: rate.venta }}
                updateTime={rate.fechaActualizacion}
              />
            </InfoButton>
          )}
        </div>
        <VariationBadge value={variacion} brandColor={brandColor} />
      </div>

      {/* 7-day sparkline */}
      <div className="mt-1 mb-2">
        <SparklineChart data={history} positive={trendPositive} strokeColor={brandColor} />
      </div>

      {/* Comprá / Vendé rows */}
      <div className="flex flex-col gap-1.5 mt-auto">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium" style={{ color: "var(--text-primary)" }}>Compra</span>
          <span className="font-bold tabular-nums tracking-tight text-base" style={{ color: "var(--text-primary)" }}>
            {formatARS(rate.venta)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium" style={{ color: "var(--text-muted)" }}>Venta</span>
          <span className="font-semibold tabular-nums tracking-tight text-base" style={{ color: "var(--text-muted)" }}>
            {formatARS(rate.compra)}
          </span>
        </div>
      </div>
    </article>
  );
}
