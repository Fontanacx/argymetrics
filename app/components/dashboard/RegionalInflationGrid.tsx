import { MapPin } from "lucide-react";
import type { IpcRegional } from "@/lib/types";
import { IPC_REGION_DISPLAY } from "@/lib/constants";
import { formatPercentUnsigned } from "@/lib/formatters/currency";
import { formatMonthYear } from "@/lib/formatters/date";

interface RegionalInflationGridProps {
  items: IpcRegional[];
}

const REGION_ORDER = ["GBA", "Pampeana", "Noreste", "Noroeste", "Cuyo", "Patagonia"];

function regionRank(region: string): number {
  const index = REGION_ORDER.indexOf(region);
  return index === -1 ? REGION_ORDER.length : index;
}

/**
 * Monthly IPC by INDEC statistical region.
 *
 * The official API does not publish province-level IPC, so each card groups
 * the provinces that make up the region. The province list is exposed through
 * the native `title` tooltip and the accessible label.
 */
export default function RegionalInflationGrid({
  items,
}: RegionalInflationGridProps) {
  if (items.length === 0) return null;

  const sortedItems = [...items].sort(
    (a, b) => regionRank(a.region) - regionRank(b.region)
  );
  const fecha = sortedItems[0]?.fecha;

  return (
    <div
      className="metric-card mt-6 rounded-xl border p-4"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-primary)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin size={16} style={{ color: "var(--color-accent)" }} />
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Inflación por región
          </h3>
        </div>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {fecha ? `IPC ${formatMonthYear(fecha)} · INDEC` : "INDEC"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {sortedItems.map((item) => {
          const display = IPC_REGION_DISPLAY[item.region] ?? {
            label: item.region,
            provinces: "Región estadística del INDEC",
          };

          return (
            <div
              key={item.region}
              className="metric-card rounded-lg border p-3"
              style={{
                borderColor: "var(--border-subtle)",
                background: "var(--bg-primary)",
              }}
              title={display.provinces}
              aria-label={`${display.label}: ${display.provinces}. IPC mensual ${formatPercentUnsigned(item.mensual)}, interanual ${formatPercentUnsigned(item.interanual)}`}
            >
              <p
                className="text-xs font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                {display.label}
              </p>
              <p
                className="metric-card-value mt-1 text-xl font-bold tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                {formatPercentUnsigned(item.mensual)}
              </p>
              <p
                className="metric-card-subtitle text-[11px]"
                style={{ color: "var(--text-muted)" }}
              >
                m/m · i/a {formatPercentUnsigned(item.interanual)}
              </p>
            </div>
          );
        })}
      </div>

      <p
        className="metric-card-extra mt-3 text-[11px] leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        Regiones estadísticas del INDEC. La API no publica apertura por
        provincia; cada tarjeta agrupa las provincias de esa región.
      </p>
    </div>
  );
}
