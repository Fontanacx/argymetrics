import { Clock } from "lucide-react";
import { formatARS } from "@/lib/formatters/currency";
import { formatDateTime } from "@/lib/formatters/date";
import type { IndicatorKind } from "./types";

/** Current value, optional spread and market status. */
export function CurrentValueTile({
  kind,
  valueText,
  spread,
  marketStatus,
}: {
  kind: IndicatorKind;
  valueText: string;
  /** Bid/ask spread in ARS (dollar only). */
  spread?: number;
  marketStatus: { text: string; color: string };
}) {
  return (
    <div className="metric-tile flex items-center justify-between rounded-lg border px-4 py-3" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-primary)" }}>
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Valor Actual</p>
        <p className="text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
          {valueText}
        </p>
      </div>

      {spread !== undefined && (
        <div className="text-center px-2">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Spread</p>
          <p className="text-sm font-semibold tabular-nums mt-0.5" style={{ color: "var(--text-primary)" }}>
            {formatARS(spread)}
          </p>
        </div>
      )}

      <div className="text-right">
        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          {kind === "macro" ? "Fuente" : "Mercado"}
        </p>
        <div className="flex items-center justify-end gap-1.5 mt-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: marketStatus.color }} />
          <span className="text-sm font-semibold tracking-tight" style={{ color: marketStatus.color }}>{marketStatus.text}</span>
        </div>
      </div>
    </div>
  );
}

export function PreviousCloseTile({ valueText }: { valueText: string }) {
  return (
    <div
      className="metric-tile rounded-lg border px-4 py-3 flex items-center justify-between"
      style={{ borderColor: "var(--border-subtle)", background: "var(--bg-primary)" }}
    >
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Cierre anterior</p>
        <p className="text-sm font-bold tabular-nums mt-0.5" style={{ color: "var(--text-primary)" }}>
          {valueText}
        </p>
      </div>
      <div
        className="w-8 h-px"
        style={{ borderTop: "2px dashed var(--text-muted)", opacity: 0.6 }}
      />
    </div>
  );
}

export function UpdateTime({ updateTime }: { updateTime: string }) {
  return (
    <div className="mt-2 flex items-center justify-end gap-1.5 text-xs" style={{ color: "var(--text-muted)", opacity: 0.8 }}>
      <Clock size={12} />
      <span>Actualizado: {formatDateTime(updateTime)}</span>
    </div>
  );
}
