// ---------------------------------------------------------------------------
// Daily Insights — API pública.
// La implementación vive en `lib/utils/insights/`, dividida por categoría.
// Este archivo preserva los imports existentes de `@/lib/utils/insights`.
// ---------------------------------------------------------------------------

export type { InsightCard, InsightCategory } from "./insights/types";
export { computeDollarInsights } from "./insights/dollars";
export { computeCryptoInsights } from "./insights/crypto";
export { computeIndicatorInsights } from "./insights/indicators";
export { computeWalletInsights } from "./insights/wallets";
export { computeStockInsights } from "./insights/stocks";
export { generateNarrative } from "./insights/narrative";
export { computeInsightOfTheDay } from "./insights/insight-of-the-day";
