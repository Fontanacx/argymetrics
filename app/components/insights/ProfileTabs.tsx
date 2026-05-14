"use client";

import { useState } from "react";
import type { BriefingInput } from "@/lib/types";
import { ProfileInsight } from "./ProfileInsight";
import { Briefcase, PiggyBank, BarChart3 } from "lucide-react";

type ProfileId = "freelancer" | "ahorrista" | "inversor";

const PROFILES: { id: ProfileId; label: string; icon: React.ReactNode }[] = [
  { id: "freelancer", label: "Freelancer", icon: <Briefcase size={16} /> },
  { id: "ahorrista", label: "Ahorrista", icon: <PiggyBank size={16} /> },
  { id: "inversor", label: "Inversor", icon: <BarChart3 size={16} /> },
];

export function ProfileTabs({ briefingInput }: { briefingInput: BriefingInput }) {
  const [activeTab, setActiveTab] = useState<ProfileId>("freelancer");

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-1 border-b overflow-x-auto scrollbar-hide" style={{ borderColor: "var(--border-subtle)" }}>
        {PROFILES.map((p) => {
          const isActive = p.id === activeTab;
          return (
            <button
              key={p.id}
              onClick={() => setActiveTab(p.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors shrink-0 ${
                isActive ? "border-b-2" : ""
              }`}
              style={{
                color: isActive ? "var(--color-accent)" : "var(--text-muted)",
                borderColor: isActive ? "var(--color-accent)" : "transparent",
              }}
            >
              {p.icon}
              {p.label}
            </button>
          );
        })}
      </div>
      
      <div className="pt-2">
        <ProfileInsight profile={activeTab} data={briefingInput} />
      </div>
    </div>
  );
}
