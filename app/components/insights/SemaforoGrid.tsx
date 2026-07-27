import type { SemaforoItem } from "@/lib/types";
import { SemaforoCard } from "./SemaforoCard";

export function SemaforoGrid({ items }: { items: SemaforoItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="animate-in fade-in slide-in-from-bottom-2"
          style={{ animationDelay: `${idx * 60}ms`, animationDuration: "300ms", animationFillMode: "both" }}
        >
          <SemaforoCard item={item} />
        </div>
      ))}
    </div>
  );
}
