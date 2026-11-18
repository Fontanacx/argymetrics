// Insights de billeteras virtuales (dólar cripto).

import type { DollarWithHistory } from "../../types";
import { formatARS, formatPercentUnsigned } from "../../formatters/currency";
import { CASA_LABELS } from "@/lib/constants";
import type { InsightCard } from "./types";
import { buildFallbackCard } from "./helpers";


/**
 * Computes insight cards specifically for virtual wallets (Crypto Dollars).
 */
export function computeWalletInsights(wallets: DollarWithHistory[]): InsightCard[] {
  if (wallets.length === 0) return [buildFallbackCard("wallets-empty", "Billeteras", "Sin datos disponibles")];

  const cards: InsightCard[] = [];

  // Cheapest to buy
  const withBuy = wallets.filter((w) => w.rate.compra > 0);
  if (withBuy.length > 0) {
    const cheapest = [...withBuy].sort((a, b) => a.rate.compra - b.rate.compra)[0];
    cards.push({
      id: "wallet-cheapest",
      label: "Más barato (Cambiar ARS a USDT)",
      value: CASA_LABELS[cheapest.rate.casa] ?? cheapest.rate.nombre,
      subtitle: `Cotización: ${formatARS(cheapest.rate.compra)}`,
      sentiment: "positive",
      size: "normal",
      sparklineData: cheapest.history?.slice(-7) as unknown[],
      sparklineDataKey: "venta",
      sparklineFormatType: "dollar",
    });
  }

  // Most Expensive to Sell
  const withSell = wallets.filter((w) => w.rate.venta > 0);
  if (withSell.length > 0) {
    const expensive = [...withSell].sort((a, b) => b.rate.venta - a.rate.venta)[0];
    cards.push({
      id: "wallet-expensive",
      label: "Más alto (Cambiar USDT a ARS)",
      value: CASA_LABELS[expensive.rate.casa] ?? expensive.rate.nombre,
      subtitle: `Cotización: ${formatARS(expensive.rate.venta)}`,
      sentiment: "positive",
      size: "normal",
      sparklineData: expensive.history?.slice(-7) as unknown[],
      sparklineDataKey: "venta",
      sparklineFormatType: "dollar",
    });
  }

  // Lowest Spread
  const withSpread = wallets.filter((w) => w.rate.compra > 0 && w.rate.venta > 0);
  if (withSpread.length > 0) {
    const lowestSpread = [...withSpread].sort(
      (a, b) => (a.rate.venta - a.rate.compra) - (b.rate.venta - b.rate.compra)
    )[0];
    const spreadVal = lowestSpread.rate.venta - lowestSpread.rate.compra;
    const spreadPct = (spreadVal / lowestSpread.rate.venta) * 100;
    
    cards.push({
      id: "wallet-spread",
      label: "Menor Margen (Spread)",
      value: CASA_LABELS[lowestSpread.rate.casa] ?? lowestSpread.rate.nombre,
      subtitle: `Dif. Compra-Venta: ${formatARS(spreadVal)} (${formatPercentUnsigned(spreadPct)})`,
      sentiment: "neutral",
      size: "normal",
      sparklineData: lowestSpread.history?.slice(-7) as unknown[],
      sparklineDataKey: "venta",
      sparklineFormatType: "dollar",
    });
  }

  return cards.length > 0 ? cards : [buildFallbackCard("wallets-empty", "Billeteras", "Sin cotizaciones actuales")];
}
