import type { StockData } from "@/lib/types";
import { StockCard } from "@/app/components/dashboard";

export default function StockGrid({ stocks }: { stocks: StockData[] }) {
  if (!stocks || stocks.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl text-sm" style={{ color: "var(--text-secondary)" }}>
        No se pudieron cargar las acciones en este momento.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {stocks.map((stock) => (
        <StockCard key={stock.symbol} stock={stock} />
      ))}
    </div>
  );
}
