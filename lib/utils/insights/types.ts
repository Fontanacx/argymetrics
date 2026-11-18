// Tipos públicos del módulo de insights.

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

export type InsightCategory = "dollars" | "crypto" | "indicators" | "wallets" | "stocks";
