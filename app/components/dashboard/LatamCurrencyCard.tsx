import type { LatamCurrencyRate } from "@/lib/types";
import { LATAM_FLAGS, LATAM_SYMBOLS } from "@/lib/constants";
import { formatARS } from "@/lib/formatters/currency";
import { formatTime } from "@/lib/formatters/date";

interface LatamCurrencyCardProps {
  rate: LatamCurrencyRate;
}

/**
 * Cross-rate card for a LATAM currency, expressed in ARS per 1 foreign unit.
 */
export default function LatamCurrencyCard({ rate }: LatamCurrencyCardProps) {
  const flag = LATAM_FLAGS[rate.moneda] ?? "🌎";
  const symbol = LATAM_SYMBOLS[rate.moneda] ?? rate.moneda;

  return (
    <article
      className="metric-card flex flex-col gap-3 rounded-xl border p-4 transition-shadow"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-primary)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="metric-card-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--color-accent-light)" }}
            aria-hidden="true"
          >
            <span className="text-lg leading-none">{flag}</span>
          </div>
          <div className="min-w-0">
            <h3
              className="truncate text-sm font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
              title={rate.nombre}
            >
              {rate.nombre}
            </h3>
            <p
              className="metric-card-subtitle text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              ARS por 1 {rate.moneda} · {symbol}
            </p>
          </div>
        </div>
        <span
          className="shrink-0 text-xs font-bold tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          {rate.moneda}
        </span>
      </div>

      <div className="mt-auto pt-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            Venta
          </span>
          <span
            className="metric-card-value text-xl font-bold tabular-nums tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {formatARS(rate.venta)}
          </span>
        </div>

        <div className="metric-card-extra mt-1 flex items-baseline justify-between gap-2 text-xs">
          <span style={{ color: "var(--text-muted)" }}>Compra</span>
          <span
            className="font-semibold tabular-nums"
            style={{ color: "var(--text-secondary)" }}
          >
            {formatARS(rate.compra)}
          </span>
        </div>

        <p
          className="metric-card-extra mt-1 text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          Actualizado {formatTime(rate.fechaActualizacion)}
        </p>
      </div>
    </article>
  );
}
