// Insights de indicadores económicos (Riesgo País, inflación, commodities).

import type { RiesgoPais, InflacionMensual, RiesgoPaisHistoryEntry, CommodityQuote } from "../../types";
import { formatPercent, formatPoints } from "../../formatters/currency";
import type { InsightCard } from "./types";
import { buildFallbackCard } from "./helpers";


/**
 * Computes insight cards from economic indicators and commodities.
 */
export function computeIndicatorInsights(
  riesgoPais: RiesgoPais | null,
  inflacion: InflacionMensual | null,
  commodities: CommodityQuote[],
  indicatorHistory?: {
    riesgoPais?: RiesgoPaisHistoryEntry[];
    inflacion?: InflacionMensual[];
    gold?: { fecha: string; valor: number }[];
    brent?: { fecha: string; valor: number }[];
  }
): InsightCard[] {
  const cards: InsightCard[] = [];

  // Riesgo País
  if (riesgoPais) {
    const isHigh = riesgoPais.valor > 700;
    const isMedium = riesgoPais.valor > 400;
    cards.push({
      id: "indicator-riesgo",
      label: "Riesgo País",
      value: `${formatPoints(riesgoPais.valor)} pts`,
      subtitle: isHigh
        ? "Nivel elevado · riesgo alto para inversores"
        : isMedium
          ? "Nivel moderado · seguimiento recomendado"
          : "Nivel controlado · señal positiva",
      sentiment: isHigh ? "negative" : isMedium ? "neutral" : "positive",
      size: "featured",
      context: "daily",
      sparklineData: indicatorHistory?.riesgoPais?.slice(-7) as unknown[],
      sparklineDataKey: "valor",
      sparklineFormatType: "riesgo",
    });
  } else {
    cards.push(buildFallbackCard("indicator-riesgo-empty", "Riesgo País", "Sin datos disponibles"));
  }

  // Inflación
  if (inflacion) {
    const isLow = inflacion.valor < 3;
    const isModerate = inflacion.valor < 6;
    cards.push({
      id: "indicator-inflacion",
      label: "Inflación Mensual (IPC)",
      value: formatPercent(inflacion.valor),
      subtitle: "Último dato oficial publicado",
      changePercent: inflacion.valor,
      sentiment: isLow ? "positive" : isModerate ? "neutral" : "negative",
      size: "normal",
      context: "monthly",
      sparklineData: indicatorHistory?.inflacion?.slice(-7) as unknown[],
      sparklineDataKey: "valor",
      sparklineFormatType: "inflacion",
    });
  } else {
    cards.push(buildFallbackCard("indicator-inflacion-empty", "Inflación", "Sin datos disponibles"));
  }

  // Gold
  const gold = commodities.find((c) => c.name === "ORO");
  if (gold) {
    cards.push({
      id: "indicator-gold",
      label: "Oro (Gold Futures)",
      value: `US$ ${gold.price.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${gold.changePercent >= 0 ? "+" : ""}${gold.changePercent.toFixed(2)}% · últimas 24h`,
      changePercent: gold.changePercent,
      sentiment: gold.changePercent > 0 ? "positive" : gold.changePercent < 0 ? "negative" : "neutral",
      size: "normal",
      context: "24h",
      sparklineData: indicatorHistory?.gold?.slice(-7) as unknown[],
      sparklineDataKey: "valor",
      sparklineFormatType: "commodity",
    });
  }

  // Brent Oil
  const brent = commodities.find((c) => c.name === "PETROLEO BRENT");
  if (brent) {
    cards.push({
      id: "indicator-brent",
      label: "Petróleo Brent",
      value: `US$ ${brent.price.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${brent.changePercent >= 0 ? "+" : ""}${brent.changePercent.toFixed(2)}% · últimas 24h`,
      changePercent: brent.changePercent,
      sentiment: brent.changePercent > 0 ? "positive" : brent.changePercent < 0 ? "negative" : "neutral",
      size: "normal",
      context: "24h",
      sparklineData: indicatorHistory?.brent?.slice(-7) as unknown[],
      sparklineDataKey: "valor",
      sparklineFormatType: "commodity",
    });
  }

  return cards.length > 0 ? cards : [buildFallbackCard("indicators-empty", "Indicadores", "Sin datos disponibles")];
}
