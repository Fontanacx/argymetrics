import type { MarketIndex } from "@/lib/types";
import { IndexCard } from "@/app/components/dashboard";

export default function IndexGrid({ indices }: { indices: MarketIndex[] }) {
  if (!indices || indices.length === 0) {
    return (
      <div
        className="flex h-32 items-center justify-center rounded-xl text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        No se pudieron cargar los índices en este momento.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {indices.map((index) => (
        <IndexCard key={index.symbol} index={index} />
      ))}
    </div>
  );
}
