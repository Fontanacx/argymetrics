// Insights de cotizaciones del dólar.

import type { DollarWithHistory } from "../../types";
import { formatARS, formatPercent } from "../../formatters/currency";
import { CASA_LABELS } from "@/lib/constants";
import type { InsightCard } from "./types";
import { buildFallbackCard } from "./helpers";


/**
 * Computes insight cards from dollar exchange rate data.
 * Requires at least Oficial and Blue rates to compute spread insights.
 */
export function computeDollarInsights(dollars: DollarWithHistory[]): InsightCard[] {
  if (dollars.length === 0) return [buildFallbackCard("dollars-empty", "Dólares", "Sin datos disponibles")];

  const cards: InsightCard[] = [];

  // --- Largest spread: Blue vs Oficial ---
  const blue = dollars.find((d) => d.rate.casa === "blue");
  const oficial = dollars.find((d) => d.rate.casa === "oficial");

  if (blue && oficial && oficial.rate.venta > 0) {
    const spreadAbs = blue.rate.venta - oficial.rate.venta;
    const spreadPct = (spreadAbs / oficial.rate.venta) * 100;
    cards.push({
      id: "dollar-brecha",
      label: "Brecha Blue–Oficial",
      value: `${spreadPct.toFixed(1)}%`,
      subtitle: `${formatARS(spreadAbs)} de diferencia · vs ayer`,
      changePercent: spreadPct,
      sentiment: spreadPct > 30 ? "negative" : spreadPct > 15 ? "neutral" : "positive",
      size: "featured",
      context: "daily",
      sparklineData: blue.history.slice(-7) as unknown[],
      sparklineDataKey: "venta",
      sparklineFormatType: "dollar",
    });
  }

  // --- Build variation-based insights ---
  const withVariation = dollars
    .filter((d) => d.variacion !== null && Number.isFinite(d.variacion))
    .map((d) => ({ dollar: d, absChange: Math.abs(d.variacion as number) }));

  // Top 3 gainers (ranked)
  const gainers = withVariation
    .filter((d) => (d.dollar.variacion as number) > 0)
    .sort((a, b) => (b.dollar.variacion as number) - (a.dollar.variacion as number));

  gainers.slice(0, 3).forEach((g, i) => {
    const rank = (i + 1) as 1 | 2 | 3;
    cards.push({
      id: `dollar-gainer-${rank}`,
      label: rank === 1 ? "Mayor Subida" : `Subida #${rank}`,
      value: CASA_LABELS[g.dollar.rate.casa] ?? g.dollar.rate.nombre,
      subtitle: `${formatPercent(g.dollar.variacion as number)} · venta ${formatARS(g.dollar.rate.venta)} · vs ayer`,
      changePercent: g.dollar.variacion as number,
      sentiment: "positive",
      size: rank === 1 ? "normal" : "normal",
      context: "daily",
      rank,
      sparklineData: g.dollar.history.slice(-7) as unknown[],
      sparklineDataKey: "venta",
      sparklineFormatType: "dollar",
    });
  });

  // Top loser
  const losers = withVariation
    .filter((d) => (d.dollar.variacion as number) < 0)
    .sort((a, b) => (a.dollar.variacion as number) - (b.dollar.variacion as number));

  if (losers.length > 0) {
    const loser = losers[0];
    cards.push({
      id: "dollar-loser",
      label: "Mayor Caída",
      value: CASA_LABELS[loser.dollar.rate.casa] ?? loser.dollar.rate.nombre,
      subtitle: `${formatPercent(loser.dollar.variacion as number)} · venta ${formatARS(loser.dollar.rate.venta)} · vs ayer`,
      changePercent: loser.dollar.variacion as number,
      sentiment: "negative",
      size: "normal",
      context: "daily",
      sparklineData: loser.dollar.history.slice(-7) as unknown[],
      sparklineDataKey: "venta",
      sparklineFormatType: "dollar",
    });
  }

  // Most stable
  if (withVariation.length > 0) {
    const stable = [...withVariation].sort((a, b) => a.absChange - b.absChange)[0];
    cards.push({
      id: "dollar-stable",
      label: "Más Estable",
      value: CASA_LABELS[stable.dollar.rate.casa] ?? stable.dollar.rate.nombre,
      subtitle: `${formatPercent(stable.dollar.variacion as number)} · sin movimiento significativo`,
      changePercent: stable.dollar.variacion as number,
      sentiment: "neutral",
      size: "normal",
      context: "daily",
      sparklineData: stable.dollar.history.slice(-7) as unknown[],
      sparklineDataKey: "venta",
      sparklineFormatType: "dollar",
    });
  }

  // Cheapest to buy
  const withBuy = dollars.filter((d) => d.rate.compra > 0);
  if (withBuy.length > 0) {
    const cheapest = [...withBuy].sort((a, b) => a.rate.compra - b.rate.compra)[0];
    cards.push({
      id: "dollar-cheapest",
      label: "Más barato para la compra",
      value: CASA_LABELS[cheapest.rate.casa] ?? cheapest.rate.nombre,
      subtitle: `Compra: ${formatARS(cheapest.rate.compra)}`,
      sentiment: "positive",
      size: "normal",
    });
  }

  // Most expensive to sell
  const withSell = dollars.filter((d) => d.rate.venta > 0);
  if (withSell.length > 0) {
    const expensive = [...withSell].sort((a, b) => b.rate.venta - a.rate.venta)[0];
    cards.push({
      id: "dollar-expensive",
      label: "Más caro para la venta",
      value: CASA_LABELS[expensive.rate.casa] ?? expensive.rate.nombre,
      subtitle: `Venta: ${formatARS(expensive.rate.venta)}`,
      sentiment: "negative",
      size: "normal",
    });
  }

  return cards.length > 0 ? cards : [buildFallbackCard("dollars-none", "Dólares", "Sin variaciones disponibles")];
}
