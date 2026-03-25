// ---------------------------------------------------------------------------
// Currency & number formatting utilities (Argentine locale)
// ---------------------------------------------------------------------------

const arsFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("es-AR", {
  style: "decimal",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: "always",
});

const pointsFormatter = new Intl.NumberFormat("es-AR", {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Formats a number as Argentine Pesos with 2 decimals.
 * Example: 1415.5 → "$ 1.415,50"
 */
export function formatARS(value: number): string {
  return arsFormatter.format(value).replace(/[\u00A0\u202F]/g, ' ');
}

/**
 * Formats a number as Argentine Pesos with no decimals.
 * Example: 1415.5 → "$ 1.416"
 */
export function formatCompact(value: number): string {
  return compactFormatter.format(value).replace(/[\u00A0\u202F]/g, ' ');
}

/**
 * Formats a number as a signed percentage string.
 * Example: 2.45 → "+2,5%", -1.1 → "-1,1%"
 */
export function formatPercent(value: number): string {
  return `${percentFormatter.format(value)}%`.replace(/[\u00A0\u202F]/g, ' ');
}

/**
 * Formats an integer value (e.g. riesgo pais points).
 * Example: 574 → "574"
 */
export function formatPoints(value: number): string {
  return pointsFormatter.format(value).replace(/[\u00A0\u202F]/g, ' ');
}

/**
 * Formats a spread between buy and sell prices.
 * Example: (1405, 1425) → "$ 20,00"
 */
export function formatSpread(compra: number, venta: number): string {
  return arsFormatter.format(Math.abs(venta - compra)).replace(/[\u00A0\u202F]/g, ' ');
}
