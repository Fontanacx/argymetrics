"use client";

import type { BriefingInput, SemaforoItem } from "@/lib/types";
import { SemaforoGrid } from "./SemaforoGrid";
import { BriefingCard } from "./BriefingCard";
import { ProfileTabs } from "./ProfileTabs";
import { DatePicker } from "./DatePicker";

interface InsightsDashboardProps {
  briefingInput: BriefingInput;
  semaforoItems: SemaforoItem[];
  briefingText: string;
}

export function InsightsDashboard({ briefingInput, semaforoItems, briefingText }: InsightsDashboardProps) {
  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
         <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
           Resumen Extendido
         </h2>
         <DatePicker />
      </div>

      <SemaforoGrid items={semaforoItems} />
      <BriefingCard text={briefingText} date={briefingInput.date} />
      
      <div className="mt-4">
         <h2 className="text-xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)" }}>
           Conclusión por Perfil
         </h2>
         <ProfileTabs briefingInput={briefingInput} />
      </div>
    </div>
  );
}
