// Capa narrativa: resumen de una línea por categoría.

import type { InsightCard, InsightCategory } from "./types";

/**
 * Generates a short, human-readable one-line summary for a category.
 */
export function generateNarrative(category: InsightCategory, cards: InsightCard[]): string {
  if (cards.length === 0 || cards[0].id.endsWith("-empty")) {
    return "No hay suficientes datos para generar un resumen.";
  }

  if (category === "dollars") {
    const gainer = cards.find((c) => c.id === "dollar-gainer-1");
    const loser = cards.find((c) => c.id === "dollar-loser");
    const brecha = cards.find((c) => c.id === "dollar-brecha");

    const parts: string[] = [];
    if (brecha) parts.push(`La brecha Blue–Oficial se ubica en ${brecha.value}`);
    if (gainer) parts.push(`${gainer.value} lidera las subidas`);
    if (loser) parts.push(`${loser.value} registra la mayor caída`);

    return parts.length > 0
      ? `${parts.join(". ")}.`
      : "Mercado cambiario sin movimientos significativos.";
  }

  if (category === "crypto") {
    const sentiment = cards.find((c) => c.id === "crypto-sentiment");
    const top = cards.find((c) => c.id === "crypto-top");

    if (sentiment && top) {
      const direction = sentiment.sentiment === "positive"
        ? "tendencia alcista"
        : sentiment.sentiment === "negative"
          ? "tendencia bajista"
          : "comportamiento mixto";
      return `Mercado crypto con ${direction}. ${top.value} es el mejor activo del día.`;
    }
    return "Mercado crypto sin movimientos significativos.";
  }

  if (category === "stocks") {
    const top = cards.find((c) => c.id === "stock-top");
    const sentiment = cards.find((c) => c.id === "stock-sentiment");

    const parts: string[] = [];
    if (sentiment) parts.push(`Panel de acciones con tendencia ${sentiment.value.toLowerCase()}`);
    if (top) parts.push(`${top.value} lidera las subidas del día`);

    return parts.length > 0
      ? `${parts.join(". ")}.`
      : "Panel de acciones sin movimientos destacables.";
  }

  // indicators
  const riesgo = cards.find((c) => c.id === "indicator-riesgo");
  const inflacion = cards.find((c) => c.id === "indicator-inflacion");

  const parts: string[] = [];
  if (riesgo) parts.push(`Riesgo País en ${riesgo.value}`);
  if (inflacion) parts.push(`inflación mensual en ${inflacion.value}`);

  return parts.length > 0
    ? `${parts.join(", ")}.`
    : "Indicadores económicos sin datos actualizados.";
}
