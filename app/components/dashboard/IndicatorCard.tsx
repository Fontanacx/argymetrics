import type { ReactNode } from "react";
import { SparklineChart } from "@/app/components/charts";
import { InfoButton } from "@/app/components/modals";
import { IndicatorDetail } from "@/app/components/modals";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SparklineProps {
  data: { fecha: string; valor: number }[];
  positive: boolean;
  label: string;
  formatType: "riesgo" | "inflacion" | "commodity" | "dollar";
  dataKey?: string;
}

interface IndicatorCardProps {
  /** Icon element to display in the colored badge */
  icon: ReactNode;
  /** Background color for the icon badge (CSS value) */
  iconBg: string;
  /** Text/icon color for the icon badge (CSS value) */
  iconColor: string;
  /** Label shown above the value */
  label: string;
  /** Main value string to display */
  value: string;
  /** Optional subtitle/date label shown below the value */
  dateLabel?: string;
  /** Optional sparkline config */
  sparkline?: SparklineProps;
  /** Optional info modal trigger (InfoButton + IndicatorDetail) */
  infoModal?: {
    title: string;
    kind: "riesgo" | "inflacion" | "commodity" | "macro";
    data: { fecha: string; valor: number }[];
    definition: string;
    updateTime?: string;
    /** Format for macro series: percentages or ARS amounts. */
    format?: "percent" | "ars";
  };
  /** Optional content rendered below the value (e.g. commodity change badge) */
  children?: ReactNode;
  /** Fallback content when value is unavailable */
  fallback?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Reusable indicator card used in IndicatorsStrip.
 * Renders a single economic indicator with optional sparkline and info modal.
 * Server component — no client-side state.
 */
export default function IndicatorCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  dateLabel,
  sparkline,
  infoModal,
  children,
  fallback = "Sin datos disponibles",
}: IndicatorCardProps) {
  return (
    <div
      className="metric-card flex items-center gap-4 rounded-xl border p-4"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-primary)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        className="metric-card-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        {/* Label row with optional info button */}
        <div className="flex items-center gap-1">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            {label}
          </p>
          {infoModal && (
            <InfoButton title={infoModal.title}>
              {infoModal.kind === "macro" ? (
                <IndicatorDetail
                  kind="macro"
                  data={infoModal.data}
                  label={infoModal.title}
                  definition={infoModal.definition}
                  updateTime={infoModal.updateTime}
                  format={infoModal.format ?? "percent"}
                />
              ) : (
                <IndicatorDetail
                  kind={infoModal.kind}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  data={infoModal.data as any}
                  label={infoModal.title}
                  definition={infoModal.definition}
                  updateTime={infoModal.updateTime}
                />
              )}
            </InfoButton>
          )}
        </div>

        {/* Value or fallback */}
        {value ? (
          <>
            <p
              className="metric-card-value text-xl font-bold tabular-nums"
              style={{ color: "var(--text-primary)" }}
            >
              {value}
            </p>

            {dateLabel && (
              <p
                className="metric-card-subtitle text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {dateLabel}
              </p>
            )}

            {children && <div className="metric-card-extra">{children}</div>}

            {sparkline && sparkline.data.length > 0 && (
              <div className="metric-card-sparkline">
                <SparklineChart
                  data={sparkline.data.slice(-7)}
                  dataKey={sparkline.dataKey ?? "valor"}
                  positive={sparkline.positive}
                  label={sparkline.label}
                  formatType={sparkline.formatType}
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {fallback}
          </p>
        )}
      </div>
    </div>
  );
}
