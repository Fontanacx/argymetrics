import type { DollarWithHistory, DollarHistoryEntry } from "@/lib/types";
import DollarCard from "./DollarCard";

interface DollarGridProps {
  dollars: DollarWithHistory[];
  /** Full histories keyed by casa for info modals */
  histories?: Record<string, DollarHistoryEntry[]>;
}

/**
 * Responsive grid that renders a DollarCard for each dollar type.
 * 1 column on mobile, 2 on tablet, 3 on desktop, up to 5 on wide screens.
 */
export default function DollarGrid({ dollars, histories }: DollarGridProps) {
  if (dollars.length === 0) {
    return (
      <div
        className="rounded-xl border p-8 text-center text-sm"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-primary)",
          color: "var(--text-muted)",
        }}
      >
        No se pudieron cargar las cotizaciones. Intente nuevamente en unos minutos.
      </div>
    );
  }

  // Compute spread data for the Blue card
  const blueRate = dollars.find((d) => d.rate.casa === "blue");
  const oficialRate = dollars.find((d) => d.rate.casa === "oficial");
  const spread = blueRate && oficialRate
    ? { blueVenta: blueRate.rate.venta, oficialVenta: oficialRate.rate.venta }
    : undefined;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {dollars.map((dollar) => (
        <DollarCard
          key={dollar.rate.casa}
          dollar={dollar}
          fullHistory={histories?.[dollar.rate.casa]}
          spread={dollar.rate.casa === "blue" ? spread : undefined}
        />
      ))}
    </div>
  );
}
