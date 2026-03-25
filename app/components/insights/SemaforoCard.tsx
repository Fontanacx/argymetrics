import type { SemaforoItem } from "@/lib/types";

export function SemaforoCard({ item }: { item: SemaforoItem }) {
  const isVerde = item.status === "verde";
  const isAmarillo = item.status === "amarillo";
  
  const colorVar = isVerde 
    ? "var(--color-positive)" 
    : isAmarillo 
      ? "#f59e0b" // amber
      : "var(--color-negative)";

  return (
    <div 
      className="flex flex-col gap-2 rounded-xl border p-4 shadow-sm"
      style={{
        borderColor: "var(--border-subtle)",
        background: `color-mix(in srgb, ${colorVar} 8%, var(--bg-card))`,
      }}
    >
      <div className="flex items-center gap-2">
        <div 
          className="h-2.5 w-2.5 rounded-full shadow-sm" 
          style={{ background: colorVar }} 
        />
        <h3 className="text-xs font-bold tracking-wider uppercase" style={{ color: colorVar }}>
          {item.titulo}
        </h3>
      </div>
      
      <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--text-secondary)" }}>
        {item.label}
      </p>
      
      <p className="text-xs font-medium leading-snug mt-auto pt-1" style={{ color: "var(--text-primary)" }}>
        {item.descripcion}
      </p>
    </div>
  );
}
