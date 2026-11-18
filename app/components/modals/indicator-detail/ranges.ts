import type { IndicatorKind, RangeOption } from "./types";

const DOLLAR_RANGES: RangeOption[] = [
  { value: "24h", label: "24H", days: 2 },
  { value: "7d", label: "7D", days: 7 },
  { value: "30d", label: "30D", days: 30 },
  { value: "90d", label: "90D", days: 90 },
  { value: "1y", label: "1A", days: 365 },
];

const INFLACION_RANGES: RangeOption[] = [
  { value: "12m", label: "12M", days: 12 },
  { value: "24m", label: "24M", days: 24 },
  { value: "all", label: "Todo", days: 9999 },
];

const BANDAS_RANGES: RangeOption[] = [
  { value: "3m", label: "3M", days: 90 },
  { value: "6m", label: "6M", days: 180 },
];

const STOCK_RANGES: RangeOption[] = [
  { value: "1m", label: "1M", days: 30 },
  { value: "3m", label: "3M", days: 90 },
  { value: "6m", label: "6M", days: 180 },
  { value: "1y", label: "1A", days: 365 },
];

/** Range presets for each indicator kind (inflation/macro use monthly data). */
export function getRanges(kind: IndicatorKind): RangeOption[] {
  if (kind === "inflacion" || kind === "macro") return INFLACION_RANGES;
  if (kind === "bandas") return BANDAS_RANGES;
  if (kind === "stock" || kind === "index") return STOCK_RANGES;
  return DOLLAR_RANGES;
}

/** Dollar charts default to the first tab; all others to the second option. */
export function getDefaultRange(kind: IndicatorKind, ranges: RangeOption[]): string {
  return kind === "dollar" ? ranges[0].value : (ranges[1]?.value ?? ranges[0].value);
}
