import { BarChart2, Sparkles } from "lucide-react";

interface BriefingCardProps {
  text: string;
  date: string;
}

export function BriefingCard({ text, date }: BriefingCardProps) {
  return (
    <div
      className="group relative flex flex-col gap-5 rounded-2xl border p-6 sm:p-7"
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--bg-card)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Subtle left gradient accent */}
      <div
        className="absolute left-0 top-4 bottom-4 w-1 rounded-full opacity-80"
        style={{
          background: "linear-gradient(180deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 40%, transparent) 100%)",
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              background: "var(--color-accent-light)",
              color: "var(--color-accent)",
            }}
          >
            <Sparkles size={16} />
          </div>
          <h2 className="font-bold text-lg tracking-tight" style={{ color: "var(--text-primary)" }}>
            Análisis del Día
          </h2>
        </div>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full w-fit"
          style={{
            color: "var(--text-muted)",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {date}
        </span>
      </div>

      {/* Content */}
      <p
        className="pl-3 text-sm sm:text-[15px] leading-[1.75] font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {text}
      </p>

      {/* Footer */}
      <div
        className="flex items-center gap-2 pl-3 pt-4 mt-1 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <BarChart2 size={13} style={{ color: "var(--text-muted)", opacity: 0.6 }} />
        <p className="text-[10px] font-semibold tracking-wide" style={{ color: "var(--text-muted)", opacity: 0.8 }}>
          Generado algorítmicamente con los datos financieros del día en tiempo real
        </p>
      </div>
    </div>
  );
}
