"use client";

import type { BriefingInput, SemaforoItem } from "@/lib/types";
import { SemaforoGrid } from "./SemaforoGrid";
import { BriefingCard } from "./BriefingCard";
import { ProfileTabs } from "./ProfileTabs";
import { DatePicker } from "./DatePicker";
import { Activity, Users, FileText } from "lucide-react";

interface InsightsDashboardProps {
  briefingInput: BriefingInput;
  semaforoItems: SemaforoItem[];
  briefingText: string;
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-lg"
        style={{
          background: "var(--color-accent-light)",
          color: "var(--color-accent)",
        }}
      >
        <Icon size={14} />
      </div>
      <h3
        className="text-base font-bold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h3>
    </div>
  );
}

export function InsightsDashboard({ briefingInput, semaforoItems, briefingText }: InsightsDashboardProps) {
  return (
    <div className="flex flex-col gap-8 w-full pb-12">
      {/* Header with title and date picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Resumen Extendido
          </h2>
          <p className="text-xs mt-1 font-medium" style={{ color: "var(--text-muted)" }}>
            Señales del mercado, análisis inteligente y recomendaciones por perfil
          </p>
        </div>
        <DatePicker />
      </div>

      {/* Semaforo Section */}
      <section className="flex flex-col gap-1">
        <SectionTitle icon={Activity} title="Señales del Mercado" />
        <SemaforoGrid items={semaforoItems} />
      </section>

      {/* Briefing Section */}
      <section className="flex flex-col gap-1">
        <SectionTitle icon={FileText} title="Análisis del Día" />
        <BriefingCard text={briefingText} date={briefingInput.date} />
      </section>

      {/* Profile Section */}
      <section className="flex flex-col gap-1">
        <SectionTitle icon={Users} title="Conclusión por Perfil" />
        <ProfileTabs briefingInput={briefingInput} />
      </section>
    </div>
  );
}
