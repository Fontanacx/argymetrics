// Insights de acciones argentinas (BYMA).

import type { StockData } from "../../types";
import type { InsightCard } from "./types";
import { buildFallbackCard } from "./helpers";


/**
 * Computes insight cards specifically for Argentine Stocks (BYMA).
 */
export function computeStockInsights(stocks: StockData[]): InsightCard[] {
  if (stocks.length === 0) {
    return [buildFallbackCard("stocks-empty", "Acciones", "Sin datos disponibles")];
  }

  const cards: InsightCard[] = [];
  const validStocks = stocks.filter((s) => s.variation !== null);

  if (validStocks.length === 0) {
    return [buildFallbackCard("stocks-none", "Acciones", "Sin variaciones disponibles")];
  }

  const gainers = [...validStocks]
    .filter((s) => (s.variation as number) > 0)
    .sort((a, b) => Math.abs(b.variation as number) - Math.abs(a.variation as number));

  if (gainers.length > 0) {
    const top = gainers[0];
    cards.push({
      id: "stock-top",
      label: "Mejor Rendimiento",
      value: top.symbol.replace(".BA", ""),
      subtitle: `$${top.price.toLocaleString("es-AR", { minimumFractionDigits: 2 })} · +${(top.variation as number).toFixed(2)}% · vs ayer`,
      changePercent: top.variation as number,
      sentiment: "positive",
      size: "featured",
      context: "daily",
      rank: 1,
      sparklineData: top.history.slice(-7) as unknown[],
      sparklineDataKey: "valor",
      sparklineFormatType: "dollar",
    });
  }

  const losers = [...validStocks]
    .filter((s) => (s.variation as number) < 0)
    .sort((a, b) => Math.abs(b.variation as number) - Math.abs(a.variation as number));

  if (losers.length > 0) {
    const worst = losers[0];
    cards.push({
      id: "stock-worst",
      label: "Mayor Caída",
      value: worst.symbol.replace(".BA", ""),
      subtitle: `$${worst.price.toLocaleString("es-AR", { minimumFractionDigits: 2 })} · ${(worst.variation as number).toFixed(2)}% · vs ayer`,
      changePercent: worst.variation as number,
      sentiment: "negative",
      size: "normal",
      context: "daily",
      sparklineData: worst.history.slice(-7) as unknown[],
      sparklineDataKey: "valor",
      sparklineFormatType: "dollar",
    });
  }

  const positiveCount = gainers.length;
  const totalCount = validStocks.length;
  const score = (positiveCount / totalCount) * 100;

  let sentimentLabel: string;
  let sentimentValue: "positive" | "negative" | "neutral";
  if (score >= 60) {
    sentimentLabel = "Alcista";
    sentimentValue = "positive";
  } else if (score < 40) {
    sentimentLabel = "Bajista";
    sentimentValue = "negative";
  } else {
    sentimentLabel = "Neutral";
    sentimentValue = "neutral";
  }

  cards.push({
    id: "stock-sentiment",
    label: "Tendencia del Panel (BYMA)",
    value: sentimentLabel,
    subtitle: `${positiveCount} de ${totalCount} acciones al alza`,
    sentiment: sentimentValue,
    size: "normal",
    context: "daily",
  });

  return cards.length > 0 ? cards : [buildFallbackCard("stocks-none", "Acciones", "Sin variaciones")];
}
