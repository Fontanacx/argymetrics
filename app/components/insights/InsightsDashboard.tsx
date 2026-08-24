"use client";

import type { BriefingInput, SemaforoItem } from "@/lib/types";
import { SemaforoGrid } from "./SemaforoGrid";
import { BriefingCard } from "./BriefingCard";
import { ProfileTabs } from "./ProfileTabs";
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
      {/* Internal dashboard heading; the page-level hero owns the date control. */}
      <div className="insights-dashboard-heading">
        <div>
          <p className="insights-dashboard-kicker">Panel de lectura</p>
          <h2>Señales que importan hoy</h2>
          <p>Señales del mercado, contexto y recomendaciones según tu perfil.</p>
        </div>
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
