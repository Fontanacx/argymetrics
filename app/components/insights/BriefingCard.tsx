import { BarChart2 } from "lucide-react";

interface BriefingCardProps {
  text: string;
  date: string;
}

export function BriefingCard({ text, date }: BriefingCardProps) {
  return (
    <div 
      className="flex flex-col gap-4 rounded-xl border p-5 sm:p-6"
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--bg-card)",
        borderLeft: "4px solid var(--color-accent)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart2 size={20} style={{ color: "var(--color-accent)" }} />
          <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Análisis del Día</h2>
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {date}
        </span>
      </div>
      
      <p 
        className="text-sm sm:text-base leading-relaxed font-medium" 
        style={{ color: "var(--text-primary)" }}
      >
        {text}
      </p>
      
      <div className="pt-3 mt-1 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <p className="text-[10px] font-semibold" style={{ color: "var(--text-secondary)" }}>
          Generado algorítmicamente con los datos financieros del día en tiempo real
        </p>
      </div>
    </div>
  );
}
