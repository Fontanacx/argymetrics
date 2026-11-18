// Selección del insight más destacado del día.

import type { InsightCard } from "./types";


/**
 * Selects the single most notable insight across all categories.
 * Picks the card with the highest absolute change percent.
 */
export function computeInsightOfTheDay(cards: InsightCard[]): InsightCard | null {
  const validCards = cards.filter(
    (c) => c.changePercent !== undefined && Number.isFinite(c.changePercent) && !c.id.endsWith("-empty") && c.id !== "indicator-inflacion"
  );

  let top: InsightCard;

  if (validCards.length === 0) {
    const fallbackCards = cards.filter((c) => !c.id.endsWith("-empty") && c.id !== "indicator-inflacion");
    if (fallbackCards.length === 0) return null;
    top = fallbackCards[0];
  } else {
    const sorted = [...validCards].sort(
      (a, b) => Math.abs(b.changePercent as number) - Math.abs(a.changePercent as number)
    );
    top = sorted[0];
  }

  return {
    ...top,
    id: "insight-of-the-day",
    label: "Insight del Día",
    originalLabel: top.label,
    size: "featured",
  };
}
