import type { SemaforoItem } from "@/lib/types";
import { SemaforoCard } from "./SemaforoCard";

export function SemaforoGrid({ items }: { items: SemaforoItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {items.map((item, idx) => (
        <SemaforoCard key={idx} item={item} />
      ))}
    </div>
  );
}
