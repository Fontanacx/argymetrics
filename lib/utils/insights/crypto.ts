// Insights de criptomonedas.

import type { CryptoRate, CryptoHistoryEntry } from "../../types";
import { formatUSD } from "../../formatters/currency";
import type { InsightCard } from "./types";
import { buildFallbackCard } from "./helpers";


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
    subtitle: `${formatUSD(top.rate.valor)} · ${top.rate.variacion >= 0 ? "+" : ""}${top.rate.variacion.toFixed(2)}% · últimas 24h`,
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
      subtitle: `${formatUSD(worst.rate.valor)} · ${worst.rate.variacion >= 0 ? "+" : ""}${worst.rate.variacion.toFixed(2)}% · últimas 24h`,
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
    subtitle: `${formatUSD(stableCrypto.rate.valor)} · ${stableCrypto.rate.variacion >= 0 ? "+" : ""}${stableCrypto.rate.variacion.toFixed(2)}% · últimas 24h`,
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
