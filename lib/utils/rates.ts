import type { DollarRate } from "@/lib/types";

/**
 * Returns the most recent `fechaActualizacion` among a list of rates,
 * or `null` when none is available.
 *
 * Used to display a single "Actualizado" timestamp for sections that
 * aggregate several rates (Divisas, Bandas, Ticker).
 */
export function getLatestUpdateTimestamp(rates: DollarRate[]): string | null {
  let latest: string | null = null;

  for (const rate of rates) {
    const ts = rate.fechaActualizacion;
    if (!ts) continue;
    if (!latest || new Date(ts).getTime() > new Date(latest).getTime()) {
      latest = ts;
    }
  }

  return latest;
}
