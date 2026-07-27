import type { SemaforoItem } from "@/lib/types";

export function SemaforoCard({ item }: { item: SemaforoItem }) {
  const isVerde = item.status === "verde";
  const isAmarillo = item.status === "amarillo";

  const colorVar = isVerde
    ? "var(--color-positive)"
    : isAmarillo
      ? "#f59e0b"
      : "var(--color-negative)";

  const bgVar = isVerde
    ? "var(--color-positive-bg)"
    : isAmarillo
      ? "rgba(245, 158, 11, 0.08)"
      : "var(--color-negative-bg)";

  return (
    <div
      className="group flex flex-col gap-3 rounded-xl border p-4 transition-all duration-200"
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--bg-card)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Status header with dot and title */}
      <div className="flex items-center gap-2">
        <div
          className="relative flex h-3 w-3 items-center justify-center"
        >
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: colorVar }}
          />
          <div
            className="absolute h-2.5 w-2.5 rounded-full animate-ping opacity-40"
            style={{ background: colorVar }}
          />
        </div>
        <h3
          className="text-[11px] font-bold tracking-wider uppercase leading-tight"
          style={{ color: colorVar }}
        >
          {item.titulo}
        </h3>
      </div>

      {/* Label badge */}
      <div
        className="w-fit rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
        style={{
          background: bgVar,
          color: isAmarillo ? "#b45309" : colorVar,
        }}
      >
        {item.label}
      </div>

      {/* Description */}
      <p
        className="text-xs font-medium leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {item.descripcion}
      </p>
    </div>
  );
}
