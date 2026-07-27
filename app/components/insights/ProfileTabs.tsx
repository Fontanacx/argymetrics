"use client";

import { useState } from "react";
import type { BriefingInput } from "@/lib/types";
import { ProfileInsight } from "./ProfileInsight";
import { Briefcase, PiggyBank, BarChart3 } from "lucide-react";

type ProfileId = "freelancer" | "ahorrista" | "inversor";

const PROFILES: { id: ProfileId; label: string; icon: React.ReactNode }[] = [
  { id: "freelancer", label: "Freelancer", icon: <Briefcase size={15} /> },
  { id: "ahorrista", label: "Ahorrista", icon: <PiggyBank size={15} /> },
  { id: "inversor", label: "Inversor", icon: <BarChart3 size={15} /> },
];

export function ProfileTabs({ briefingInput }: { briefingInput: BriefingInput }) {
  const [activeTab, setActiveTab] = useState<ProfileId>("freelancer");

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Segmented control style tabs */}
      <div
        className="flex items-center gap-1 rounded-xl border p-1 overflow-x-auto hide-scrollbar"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-primary)",
        }}
      >
        {PROFILES.map((p) => {
          const isActive = p.id === activeTab;
          return (
            <button
              key={p.id}
              onClick={() => setActiveTab(p.id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 shrink-0"
              style={{
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                background: isActive ? "var(--bg-card)" : "transparent",
                boxShadow: isActive ? "var(--shadow-card)" : "none",
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.6 }}>{p.icon}</span>
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <ProfileInsight profile={activeTab} data={briefingInput} />
      </div>
    </div>
  );
}
