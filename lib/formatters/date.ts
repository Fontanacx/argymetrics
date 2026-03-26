// ---------------------------------------------------------------------------
// Date & time formatting utilities (Argentine locale)
// ---------------------------------------------------------------------------

const fullDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Argentina/Buenos_Aires",
});

const shortDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
});

/**
 * Returns a human-readable relative time string in Spanish.
 * Examples: "hace 2 min", "hace 1 hora", "hace 3 horas"
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "hace un momento";
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return `hace ${mins} min`;
  }
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return `hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
  }

  const days = Math.floor(diffSec / 86400);
  return `hace ${days} ${days === 1 ? "dia" : "dias"}`;
}

/**
 * Formats a date string as a full date/time for tooltips.
 * Example: "16/03/2026, 15:42"
 */
export function formatDateTime(dateStr: string): string {
  return fullDateFormatter.format(new Date(dateStr));
}

/**
 * Formats a date string as a short date (day/month).
 * Example: "16/03"
 */
export function formatShortDate(dateStr: string): string {
  return shortDateFormatter.format(new Date(dateStr));
}

/**
 * Formats a month-end date string as "Mes Año" in Spanish.
 * Used for inflation data where fecha represents an entire month.
 * Example: "2026-01-31" → "Enero 2026"
 */
export function formatMonthYear(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const formatter = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
  const result = formatter.format(date);
  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Formats a date string as a date-only string (no time).
 * Example: "2026-03-13" → "13/03/2026"
 */
export function formatDateOnly(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(date);
}

/**
 * Formats a date/time string as HH:MM (24-hour, es-AR, Argentine timezone).
 * Used for the 24H chart X-axis in the IndicatorDetail modal.
 * Example: "2026-03-26T14:30:00" → "14:30"
 */
export function formatTime(dateStr: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(dateStr));
}
