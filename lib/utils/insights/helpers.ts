// Helpers internos compartidos por los módulos de insights.

import type { InsightCard } from "./types";

export function buildFallbackCard(id: string, label: string, subtitle: string): InsightCard {
  return {
    id,
    label,
    value: "—",
    subtitle,
    sentiment: "neutral",
    size: "normal",
  };
}
