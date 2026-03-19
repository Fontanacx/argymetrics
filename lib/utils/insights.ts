// ---------------------------------------------------------------------------
// Daily Insights — Category-specific pure computation functions
// Computes financial insights from server-provided data for the dashboard.
// ---------------------------------------------------------------------------

import type { DollarWithHistory, RiesgoPais, InflacionMensual, CryptoRate, CryptoHistoryEntry } from "../types";
import type { CommodityQuote } from "../api/commodities";
import { formatARS, formatPercent, formatPoints } from "../formatters/currency";
import { CASA_LABELS } from "../constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InsightCard {
  id: string;
  label: string;
  value: string;
  subtitle?: string;
  changePercent?: number;
  sentiment: "positive" | "negative" | "neutral";
  size: "normal" | "featured";
  context?: "24h" | "daily" | "monthly";
  rank?: 1 | 2 | 3;
  /** Original label preserved for Insight of the Day context */
  originalLabel?: string;
  /** Optional sparkline history data for mini chart rendering */
  sparklineData?: unknown[];
  sparklineDataKey?: string;
  sparklineFormatType?: "dollar" | "crypto" | "riesgo" | "inflacion" | "commodity";
}

export type InsightCategory = "dollars" | "crypto" | "indicators";

// ---------------------------------------------------------------------------
// Dollar Insights
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Crypto Insights
// ---------------------------------------------------------------------------

/**
 * Computes insight cards from cryptocurrency data.
 */
export function computeCryptoInsights(
  cryptos: Record<string, CryptoRate | null>,
  cryptoHistory?: Record<string, CryptoHistoryEntry[]>
): InsightCard[] {
  const entries = Object.entries(cryptos)
    .filter((entry): entry is [string, CryptoRate] => entry[1] !== null)
    .map(([key, rate]) => ({ key, rate }));

  if (entries.length === 0) {
    return [buildFallbackCard("crypto-empty", "Criptomonedas", "Sin datos disponibles")];
  }

  const cards: InsightCard[] = [];

  // Sort by variation for top/worst
  const sorted = [...entries].sort((a, b) => b.rate.variacion - a.rate.variacion);
  const nameMap: Record<string, string> = { btc: "Bitcoin (BTC)", eth: "Ethereum (ETH)" };

  // Top performer
  const top = sorted[0];
  cards.push({
    id: "crypto-top",
    label: "Top Performer",
    value: nameMap[top.key] ?? top.key.toUpperCase(),
    subtitle: `${formatCryptoUSD(top.rate.valor)} · ${top.rate.variacion >= 0 ? "+" : ""}${top.rate.variacion.toFixed(2)}% · últimas 24h`,
    changePercent: top.rate.variacion,
    sentiment: top.rate.variacion >= 0 ? "positive" : "negative",
    size: "featured",
    context: "24h",
    rank: 1,
    sparklineData: cryptoHistory?.[top.key]?.slice(-7) as unknown[],
    sparklineDataKey: "valor",
    sparklineFormatType: "crypto",
  });

  // Worst performer (only if more than 1 crypto)
  if (sorted.length > 1) {
    const worst = sorted[sorted.length - 1];
    cards.push({
      id: "crypto-worst",
      label: "Mayor Caída",
      value: nameMap[worst.key] ?? worst.key.toUpperCase(),
      subtitle: `${formatCryptoUSD(worst.rate.valor)} · ${worst.rate.variacion >= 0 ? "+" : ""}${worst.rate.variacion.toFixed(2)}% · últimas 24h`,
      changePercent: worst.rate.variacion,
      sentiment: worst.rate.variacion < 0 ? "negative" : "neutral",
      size: "normal",
      context: "24h",
      sparklineData: cryptoHistory?.[worst.key]?.slice(-7) as unknown[],
      sparklineDataKey: "valor",
      sparklineFormatType: "crypto",
    });
  }

  // Most stable
  const byStability = [...entries].sort(
    (a, b) => Math.abs(a.rate.variacion) - Math.abs(b.rate.variacion)
  );
  const stableCrypto = byStability[0];
  cards.push({
    id: "crypto-stable",
    label: "Más Estable",
    value: nameMap[stableCrypto.key] ?? stableCrypto.key.toUpperCase(),
    subtitle: `${formatCryptoUSD(stableCrypto.rate.valor)} · ${stableCrypto.rate.variacion >= 0 ? "+" : ""}${stableCrypto.rate.variacion.toFixed(2)}% · últimas 24h`,
    changePercent: stableCrypto.rate.variacion,
    sentiment: "neutral",
    size: "normal",
    context: "24h",
    sparklineData: cryptoHistory?.[stableCrypto.key]?.slice(-7) as unknown[],
    sparklineDataKey: "valor",
    sparklineFormatType: "crypto",
  });

  // Market sentiment
  const totalAssets = entries.length;
  const positiveCount = entries.filter((e) => e.rate.variacion > 0).length;
  const score = (positiveCount / totalAssets) * 100;

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
    id: "crypto-sentiment",
    label: "Sentimiento del Mercado",
    value: sentimentLabel,
    subtitle: `${positiveCount} de ${totalAssets} activos al alza`,
    sentiment: sentimentValue,
    size: "normal",
    context: "24h",
  });

  return cards;
}

// ---------------------------------------------------------------------------
// Indicator Insights
// ---------------------------------------------------------------------------

/**
 * Computes insight cards from economic indicators and commodities.
 */
export function computeIndicatorInsights(
  riesgoPais: RiesgoPais | null,
  inflacion: InflacionMensual | null,
  commodities: CommodityQuote[]
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
      subtitle: isLow
        ? "Inflación baja · tendencia favorable"
        : isModerate
          ? "Inflación moderada · presión sobre precios"
          : "Inflación alta · impacto significativo en poder adquisitivo",
      changePercent: inflacion.valor,
      sentiment: isLow ? "positive" : isModerate ? "neutral" : "negative",
      size: "normal",
      context: "monthly",
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
    });
  }

  return cards.length > 0 ? cards : [buildFallbackCard("indicators-empty", "Indicadores", "Sin datos disponibles")];
}

// ---------------------------------------------------------------------------
// Narrative Layer
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Insight of the Day
// ---------------------------------------------------------------------------

/**
 * Selects the single most notable insight across all categories.
 * Picks the card with the highest absolute change percent.
 */
export function computeInsightOfTheDay(
  dollarCards: InsightCard[],
  cryptoCards: InsightCard[],
  indicatorCards: InsightCard[]
): InsightCard | null {
  const allCards = [...dollarCards, ...cryptoCards, ...indicatorCards].filter(
    (c) => c.changePercent !== undefined && Number.isFinite(c.changePercent) && !c.id.endsWith("-empty")
  );

  if (allCards.length === 0) return null;

  const sorted = [...allCards].sort(
    (a, b) => Math.abs(b.changePercent as number) - Math.abs(a.changePercent as number)
  );

  const top = sorted[0];

  return {
    ...top,
    id: "insight-of-the-day",
    label: "Insight del Día",
    originalLabel: top.label,
    size: "featured",
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildFallbackCard(id: string, label: string, subtitle: string): InsightCard {
  return {
    id,
    label,
    value: "—",
    subtitle,
    sentiment: "neutral",
    size: "normal",
  };
}

function formatCryptoUSD(value: number): string {
  return `US$ ${value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
