import { ArrowDownUp, Clock } from "lucide-react";
import type { BandaCambiaria, BandaHistoryEntry } from "@/lib/types";
import { formatARS } from "@/lib/formatters/currency";
import { formatDateOnly } from "@/lib/formatters/date";
import { INDICATOR_DEFINITIONS } from "@/lib/constants/definitions";
import InfoButton from "./InfoButton";
import IndicatorDetail from "./IndicatorDetail";

interface BandasIndicatorProps {
  bandas: BandaCambiaria;
  /** Current official dollar sell rate, used to show position within bands */
  cotizacionActual?: number;
  history?: BandaHistoryEntry[];
  updateTime?: string;
}

/**
 * Displays the BCRA crawling-band floor and ceiling with an optional
 * visual marker showing where the current exchange rate sits.
 */
export default function BandasIndicator({ bandas, cotizacionActual, history, updateTime }: BandasIndicatorProps) {
  const { piso, techo, fecha } = bandas;
  const range = techo - piso;

  // Position of current rate as a percentage within the band (0% = floor, 100% = ceiling)
  let positionPercent: number | null = null;
  if (cotizacionActual !== undefined && range > 0) {
    positionPercent = Math.max(0, Math.min(100, ((cotizacionActual - piso) / range) * 100));
  }

  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-primary)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: "var(--color-neutral-bg)", color: "var(--color-neutral)" }}
        >
          <ArrowDownUp size={16} />
        </div>
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Bandas Cambiarias
          </h3>
          {history && history.length > 0 && (
            <InfoButton title="Bandas Cambiarias">
              <IndicatorDetail
                kind="bandas"
                data={history}
                label="Bandas Cambiarias"
                definition={INDICATOR_DEFINITIONS.bandas}
                cotizacionActual={cotizacionActual}
                updateTime={updateTime}
              />
            </InfoButton>
          )}
        </div>
      </div>

      {/* Floor / Ceiling values */}
      <div className="mb-3 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            Piso
          </p>
          <p className="text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
            {formatARS(piso)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            Techo
          </p>
          <p className="text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
            {formatARS(techo)}
          </p>
        </div>
      </div>

      {/* Visual band bar */}
      <div
        className="relative h-2 w-full overflow-hidden rounded-full"
        style={{ background: "var(--border-subtle)" }}
      >
        {positionPercent !== null && (
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${positionPercent}%`,
              background: "var(--color-accent)",
              transition: "width var(--transition-normal)",
            }}
          />
        )}
      </div>

      {/* Current rate label */}
      {cotizacionActual !== undefined && (
        <p className="mt-2 text-center text-xs" style={{ color: "var(--text-muted)" }}>
          Cotizacion actual: {formatARS(cotizacionActual)}
        </p>
      )}

      {/* Last updated */}
      <div
        className="mt-2 flex items-center justify-center gap-1 text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        <Clock size={10} />
        <span>Actualizado {formatDateOnly(fecha)}</span>
      </div>
    </div>
  );
}
