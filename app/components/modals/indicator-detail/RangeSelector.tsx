import type { RangeOption } from "./types";

export function RangeSelector({
  ranges,
  value,
  onChange,
}: {
  ranges: RangeOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
        Historico
      </p>
      {ranges.length > 1 && (
        <div
          className="flex gap-1 rounded-lg p-1"
          style={{ background: "var(--bg-primary)" }}
        >
          {ranges.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="rounded-md px-3 py-1 text-xs font-medium transition-colors"
              style={{
                background: value === opt.value ? "var(--bg-card)" : "transparent",
                color: value === opt.value ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: value === opt.value ? "var(--shadow-card)" : "none",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
